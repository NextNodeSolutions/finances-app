import { useEffect, useEffectEvent, useMemo, useState } from 'react';

import { listen, send } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';
import type { AccountEntity } from '@actual-app/core/types/models';
import type { Locale } from 'date-fns';

import { createSpreadsheet } from '#components/reports/spreadsheets/net-worth-spreadsheet';
import { useReport } from '#components/reports/useReport';
import { useAccounts } from '#hooks/useAccounts';
import { useFormat } from '#hooks/useFormat';
import type { FormatType } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import { useSyncedPref } from '#hooks/useSyncedPref';

export type NetWorthRange = '6M' | '1Y' | 'All';

export type NetWorthPoint = {
  /** Month the point closes, `YYYY-MM`. */
  month: string;
  /** Short axis label from the report, localised (e.g. `Oct '26`). */
  label: string;
  netWorth: number;
  /** Sum of positive account balances. */
  assets: number;
  /** Sum of negative account balances (≤ 0). */
  liabilities: number;
  /** Month-end balance of every account, keyed by account id. */
  balances: Record<AccountEntity['id'], number>;
};

export type NetWorthHistory = {
  /**
   * One point per month-end, oldest first. Usually starts one month before
   * the range so the first month has a previous month-end to compare with.
   */
  points: NetWorthPoint[];
  hasNegative: boolean;
};

type NetWorthHistoryResult = {
  /** The latest history; kept while a recompute runs so charts never blank. */
  data: NetWorthHistory | null;
  /** No history has loaded yet. */
  isLoading: boolean;
  /** `data` predates the latest change and a recompute is running. */
  isStale: boolean;
  error: Error | null;
  retry: () => void;
};

type NetWorthLoader = ReturnType<typeof createSpreadsheet>;
type NetWorthReport = Parameters<Parameters<NetWorthLoader>[1]>[0];

/** A history plus the recompute revision that produced it. */
type ComputedHistory = { history: NetWorthHistory; revision: number };

type HistoryLoader = (
  spreadsheet: Parameters<NetWorthLoader>[0],
  setData: (computed: ComputedHistory) => void,
) => Promise<void>;

type HistoryLoaderInputs = {
  range: NetWorthRange;
  accounts: readonly AccountEntity[];
  locale: Locale;
  firstDayOfWeekIdx: string;
  format: (value: unknown, type?: FormatType) => string;
  revision: number;
  onError: (error: Error, loader: HistoryLoader) => void;
};

const RECOMPUTE_DEBOUNCE_MS = 1500;
const HISTORY_TABLES = new Set(['transactions', 'accounts']);
const MONTHS_BEFORE_CURRENT: Record<Exclude<NetWorthRange, 'All'>, number> = {
  '6M': 5,
  '1Y': 11,
};

/**
 * Month-end net worth history for the Overview, from the net-worth report
 * spreadsheet over every account (closed ones included). Recomputes after
 * synced changes and undo, debounced, and holds the previous result while
 * it does.
 */
export function useNetWorthHistory({
  range,
}: {
  range: NetWorthRange;
}): NetWorthHistoryResult {
  const locale = useLocale();
  const format = useFormat();
  const [firstDayOfWeekIdx = '0'] = useSyncedPref('firstDayOfWeekIdx');
  const { data: accounts = [], isPlaceholderData } = useAccounts();
  const [revision, setRevision] = useState(0);
  const [failure, setFailure] = useState<{
    loader: HistoryLoader;
    error: Error;
  } | null>(null);
  const requestRecompute = () => setRevision(current => current + 1);

  useOnHistoryChange(requestRecompute);

  // useReport re-runs whenever the loader's identity changes, so it is
  // memoised on exactly the inputs that call for a recompute.
  const loader = useMemo(
    () =>
      isPlaceholderData
        ? null
        : createHistoryLoader({
            range,
            accounts,
            locale,
            firstDayOfWeekIdx,
            format,
            revision,
            onError: (error, failedLoader) =>
              setFailure({ loader: failedLoader, error }),
          }),
    [
      range,
      accounts,
      isPlaceholderData,
      locale,
      firstDayOfWeekIdx,
      format,
      revision,
    ],
  );

  const latest = useReport<ComputedHistory>(
    'net_worth_history',
    loader ?? waitForAccounts,
  );
  const [held, setHeld] = useState<ComputedHistory | null>(null);
  if (latest !== null && latest !== held) {
    setHeld(latest);
  }

  const data = (latest ?? held)?.history ?? null;
  const error =
    failure !== null && failure.loader === loader ? failure.error : null;

  return {
    data,
    isLoading: data === null && error === null,
    isStale: latest === null && held !== null && error === null,
    error,
    retry: requestRecompute,
  };
}

// Stands in for the loader until the account list has loaded, so the
// history never computes (and holds) a net worth of zero.
function waitForAccounts(): Promise<void> {
  return Promise.resolve();
}

function createHistoryLoader({
  range,
  accounts,
  locale,
  firstDayOfWeekIdx,
  format,
  revision,
  onError,
}: HistoryLoaderInputs): HistoryLoader {
  const load: HistoryLoader = async (spreadsheet, setData) => {
    try {
      const loadReport = createSpreadsheet(
        await getRangeStart(range),
        monthUtils.currentMonth(),
        [...accounts],
        [],
        'and',
        locale,
        'Monthly',
        firstDayOfWeekIdx,
        format,
      );
      await loadReport(spreadsheet, report =>
        setData({ history: toHistory(report, accounts), revision }),
      );
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)), load);
    }
  };
  return load;
}

async function getRangeStart(range: NetWorthRange): Promise<string> {
  const current = monthUtils.currentMonth();
  if (range !== 'All') {
    return monthUtils.subMonths(current, MONTHS_BEFORE_CURRENT[range]);
  }
  const earliest = await send('get-earliest-transaction');
  return earliest ? monthUtils.getMonth(earliest.date) : current;
}

/**
 * Calls `onChange` once things settle after synced changes to transactions
 * or accounts, and after undo.
 */
function useOnHistoryChange(onChange: () => void): void {
  const handleChange = useEffectEvent(onChange);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleChange = () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(handleChange, RECOMPUTE_DEBOUNCE_MS);
    };

    const unlistenSync = listen('sync-event', event => {
      if (
        event.type === 'applied' &&
        event.tables.some(table => HISTORY_TABLES.has(table))
      ) {
        scheduleChange();
      }
    });
    const unlistenUndo = listen('undo-event', scheduleChange);

    return () => {
      unlistenSync();
      unlistenUndo();
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, []);
}

function toHistory(
  report: NetWorthReport,
  accounts: readonly AccountEntity[],
): NetWorthHistory {
  const { data: graphPoints, start, end, hasNegative } = report.graphData;
  const months = monthUtils.rangeInclusive(
    monthUtils.getMonth(start),
    monthUtils.getMonth(end),
  );

  const points = months.flatMap((month, index) => {
    const graphPoint = graphPoints[index];
    if (!graphPoint) {
      return [];
    }
    const balances = readAccountBalances(graphPoint, accounts);
    const amounts = Object.values(balances);
    return [
      {
        month,
        label: graphPoint.x,
        netWorth: graphPoint.y,
        assets: sum(amounts.filter(amount => amount > 0)),
        liabilities: sum(amounts.filter(amount => amount < 0)),
        balances,
      },
    ];
  });

  return { points, hasNegative };
}

// The spreadsheet spreads each account's balance onto the point under its
// id, outside the point's declared type, so those keys are read defensively.
function readAccountBalances(
  graphPoint: object,
  accounts: readonly AccountEntity[],
): Record<AccountEntity['id'], number> {
  const balances: Record<AccountEntity['id'], number> = {};
  for (const account of accounts) {
    const balance: unknown = Reflect.get(graphPoint, account.id);
    if (typeof balance === 'number') {
      balances[account.id] = balance;
    }
  }
  return balances;
}

function sum(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0);
}
