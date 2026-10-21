import * as monthUtils from '@actual-app/core/shared/months';
import type { AccountEntity } from '@actual-app/core/types/models';

import type { NetWorthPoint, NetWorthRange } from '#hooks/useNetWorthHistory';

/** One month-end on the trend, with its change from the month-end before. */
export type TrendPoint = { month: string; netWorth: number; change: number };

/**
 * The statement the Overview reads: today's live figures, or the figures
 * at a past month-end when rewound. Amounts are cents; null is unknown yet.
 */
export type Statement = {
  /** `YYYY-MM` when rewound, null for today. */
  asOfMonth: string | null;
  /** The month-end the changes are measured from (`YYYY-MM`). */
  sinceMonth: string;
  netWorth: number | null;
  change: number | null;
  /** Sum of positive account balances. */
  assets: number | null;
  /** Sum of negative account balances (≤ 0). */
  liabilities: number | null;
  balances: Record<AccountEntity['id'], number | null>;
  changes: Record<AccountEntity['id'], number | null>;
};

type Balances = Record<AccountEntity['id'], number | null>;

// How many month-ends each range shows, ending with the current month.
const RANGE_LENGTH: Record<Exclude<NetWorthRange, 'All'>, number> = {
  '6M': 6,
  '1Y': 12,
};

/** The month-ends a range shows, oldest first, each with its change. */
export function getTrendPoints(
  points: readonly NetWorthPoint[],
  range: NetWorthRange,
): TrendPoint[] {
  const shown = range === 'All' ? points : points.slice(-RANGE_LENGTH[range]);
  return shown.map(point => ({
    month: point.month,
    netWorth: point.netWorth,
    change:
      point.netWorth -
      (getNetWorthAt(points, monthUtils.prevMonth(point.month)) ?? 0),
  }));
}

/** First month a range shows; '' for All, which starts with the data. */
export function getRangeStartMonth(range: NetWorthRange): string {
  if (range === 'All') {
    return '';
  }
  return monthUtils.subMonths(
    monthUtils.currentMonth(),
    RANGE_LENGTH[range] - 1,
  );
}

const RANGE_ORDER: readonly NetWorthRange[] = ['6M', '1Y', 'All'];

/** The longer of two ranges. */
export function getWiderRange(
  range: NetWorthRange,
  other: NetWorthRange,
): NetWorthRange {
  return RANGE_ORDER.indexOf(other) > RANGE_ORDER.indexOf(range)
    ? other
    : range;
}

/** The shortest range whose chart still shows `month`. */
export function getRangeCovering(month: string | null): NetWorthRange {
  if (month === null || month >= getRangeStartMonth('6M')) {
    return '6M';
  }
  return month >= getRangeStartMonth('1Y') ? '1Y' : 'All';
}

export function getTodayStatement({
  netWorth,
  balances,
  points,
}: {
  netWorth: number | null;
  balances: Balances;
  points: readonly NetWorthPoint[];
}): Statement {
  const sinceMonth = monthUtils.prevMonth(monthUtils.currentMonth());
  const previousNetWorth = getNetWorthAt(points, sinceMonth);
  return {
    asOfMonth: null,
    sinceMonth,
    netWorth,
    change: subtract(netWorth, previousNetWorth),
    ...splitAssets(Object.values(balances)),
    balances,
    changes: getChanges(balances, points, sinceMonth),
  };
}

export function getMonthEndStatement({
  asOfMonth,
  points,
  accountIds,
}: {
  asOfMonth: string;
  points: readonly NetWorthPoint[];
  accountIds: readonly AccountEntity['id'][];
}): Statement {
  const sinceMonth = monthUtils.prevMonth(asOfMonth);
  if (findPoint(points, asOfMonth) === null) {
    // The history for that month is still loading (a wider range).
    const unknown = Object.fromEntries(accountIds.map(id => [id, null]));
    return {
      asOfMonth,
      sinceMonth,
      netWorth: null,
      change: null,
      assets: null,
      liabilities: null,
      balances: unknown,
      changes: unknown,
    };
  }
  const balances = Object.fromEntries(
    accountIds.map(id => [id, getBalanceAt(points, asOfMonth, id)]),
  );
  const netWorth = getNetWorthAt(points, asOfMonth);
  return {
    asOfMonth,
    sinceMonth,
    netWorth,
    change: subtract(netWorth, getNetWorthAt(points, sinceMonth)),
    ...splitAssets(Object.values(balances)),
    balances,
    changes: getChanges(balances, points, sinceMonth),
  };
}

/** Sum of the amounts, or null while any of them is still unknown. */
export function sumKnown(amounts: readonly (number | null)[]): number | null {
  let total = 0;
  for (const amount of amounts) {
    if (amount === null) {
      return null;
    }
    total += amount;
  }
  return total;
}

function findPoint(
  points: readonly NetWorthPoint[],
  month: string,
): NetWorthPoint | null {
  return points.find(point => point.month === month) ?? null;
}

// Before the first month-end of the history nothing had been recorded yet,
// so the month-end value is zero. After the last one it is unknown.
function isBeforeHistory(
  points: readonly NetWorthPoint[],
  month: string,
): boolean {
  const first = points[0];
  return first !== undefined && month < first.month;
}

function getNetWorthAt(
  points: readonly NetWorthPoint[],
  month: string,
): number | null {
  if (isBeforeHistory(points, month)) {
    return 0;
  }
  return findPoint(points, month)?.netWorth ?? null;
}

function getBalanceAt(
  points: readonly NetWorthPoint[],
  month: string,
  accountId: AccountEntity['id'],
): number | null {
  if (isBeforeHistory(points, month)) {
    return 0;
  }
  const point = findPoint(points, month);
  return point === null ? null : (point.balances[accountId] ?? 0);
}

function getChanges(
  balances: Balances,
  points: readonly NetWorthPoint[],
  sinceMonth: string,
): Balances {
  return Object.fromEntries(
    Object.entries(balances).map(([id, balance]) => [
      id,
      subtract(balance, getBalanceAt(points, sinceMonth, id)),
    ]),
  );
}

function splitAssets(
  balances: readonly (number | null)[],
): Pick<Statement, 'assets' | 'liabilities'> {
  const known = balances.filter(balance => balance !== null);
  if (known.length < balances.length) {
    return { assets: null, liabilities: null };
  }
  return {
    assets: known.filter(amount => amount > 0).reduce(add, 0),
    liabilities: known.filter(amount => amount < 0).reduce(add, 0),
  };
}

function subtract(
  amount: number | null,
  previous: number | null,
): number | null {
  return amount === null || previous === null ? null : amount - previous;
}

function add(total: number, amount: number): number {
  return total + amount;
}
