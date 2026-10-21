import type { AccountEntity } from '@actual-app/core/types/models';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TestProviders } from '#mocks';

import { useNetWorthHistory } from './useNetWorthHistory';

type Loader = (
  spreadsheet: unknown,
  setData: (value: unknown) => void,
) => Promise<void>;

const report = vi.hoisted(() => ({
  value: null as unknown,
  loaders: [] as Loader[],
}));
const connection = vi.hoisted(() => ({
  listeners: new Map<string, Array<(event: unknown) => void>>(),
}));

vi.mock('#components/reports/useReport', () => ({
  useReport: (_sheetName: string, loader: Loader) => {
    if (report.loaders.at(-1) !== loader) {
      report.loaders.push(loader);
    }
    return report.value;
  },
}));

vi.mock('#components/reports/spreadsheets/net-worth-spreadsheet', () => ({
  createSpreadsheet:
    () => async (_spreadsheet: unknown, setData: (value: unknown) => void) =>
      setData({
        graphData: {
          start: '2026-09-01',
          end: '2026-10-31',
          hasNegative: false,
          data: [
            { x: "Sep '26", y: 150, checking: 200, mortgage: -50 },
            { x: "Oct '26", y: 175, checking: 230, mortgage: -55 },
          ],
        },
      }),
}));

vi.mock('@actual-app/core/platform/client/connection', () => ({
  send: vi.fn(),
  listen: (name: string, listener: (event: unknown) => void) => {
    connection.listeners.set(name, [
      ...(connection.listeners.get(name) ?? []),
      listener,
    ]);
    return () => {
      connection.listeners.set(
        name,
        (connection.listeners.get(name) ?? []).filter(
          other => other !== listener,
        ),
      );
    };
  },
}));

vi.mock('#hooks/useAccounts', () => ({
  useAccounts: () => ({
    data: [
      { id: 'checking', name: 'Checking', closed: 0 },
      { id: 'mortgage', name: 'Mortgage', closed: 1 },
    ] satisfies Array<Pick<AccountEntity, 'id' | 'name' | 'closed'>>,
    isPlaceholderData: false,
  }),
}));

function emit(name: string, event: unknown) {
  for (const listener of connection.listeners.get(name) ?? []) {
    listener(event);
  }
}

async function runLatestLoader() {
  const loader = report.loaders.at(-1);
  if (!loader) {
    throw new Error('useReport was never given a loader');
  }
  await loader({}, value => {
    report.value = value;
  });
}

function renderHistory() {
  return renderHook(() => useNetWorthHistory({ range: '6M' }), {
    wrapper: TestProviders,
  });
}

beforeEach(() => {
  report.value = null;
  report.loaders = [];
  connection.listeners.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useNetWorthHistory', () => {
  it('returns every month-end with the balance of each account', async () => {
    const { result, rerender } = renderHistory();
    expect(result.current.isLoading).toBe(true);

    await runLatestLoader();
    rerender();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.points).toEqual([
      {
        month: '2026-09',
        label: "Sep '26",
        netWorth: 150,
        assets: 200,
        liabilities: -50,
        balances: { checking: 200, mortgage: -50 },
      },
      {
        month: '2026-10',
        label: "Oct '26",
        netWorth: 175,
        assets: 230,
        liabilities: -55,
        balances: { checking: 230, mortgage: -55 },
      },
    ]);
  });

  it('keeps the last history while a recompute runs', async () => {
    const { result, rerender } = renderHistory();
    await runLatestLoader();
    rerender();
    const loaded = result.current.data;

    // useReport drops its result to null whenever it gets a new loader.
    report.value = null;
    rerender();

    expect(result.current.data).toBe(loaded);
    expect(result.current.isStale).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('recomputes once, 1.5 s after a burst of transaction changes', () => {
    vi.useFakeTimers();
    renderHistory();
    const loaderCount = report.loaders.length;

    act(() => {
      emit('sync-event', { type: 'applied', tables: ['transactions'] });
      vi.advanceTimersByTime(1000);
      emit('sync-event', { type: 'applied', tables: ['transactions'] });
      vi.advanceTimersByTime(1499);
    });
    expect(report.loaders).toHaveLength(loaderCount);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(report.loaders).toHaveLength(loaderCount + 1);
  });

  it('ignores changes that cannot move net worth', () => {
    vi.useFakeTimers();
    renderHistory();
    const loaderCount = report.loaders.length;

    act(() => {
      emit('sync-event', { type: 'applied', tables: ['payees'] });
      vi.advanceTimersByTime(2000);
    });

    expect(report.loaders).toHaveLength(loaderCount);
  });

  it('recomputes after undo', () => {
    vi.useFakeTimers();
    renderHistory();
    const loaderCount = report.loaders.length;

    act(() => {
      emit('undo-event', {});
      vi.advanceTimersByTime(1500);
    });

    expect(report.loaders).toHaveLength(loaderCount + 1);
  });
});
