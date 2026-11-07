import type { AccountEntity } from '@actual-app/core/types/models';

import type {
  SidebarAccountSide,
  SidebarAccountTree,
} from '#components/sidebar/redesign/useSidebarAccountTree';

import { sumKnown } from './statement';
import type { Statement } from './statement';

export type SubtotalRow = {
  kind: 'subtotal';
  key: string;
  /** A side (On budget, Off budget, Closed) or a user account group in it. */
  level: 'side' | 'group';
  label: string;
  balance: number | null;
  change: number | null;
};

export type AccountRow = {
  kind: 'account';
  key: string;
  account: AccountEntity;
  /** 1 under a side, 2 under a group. */
  depth: 1 | 2;
  balance: number | null;
  change: number | null;
};

export type BalanceSheetRow = SubtotalRow | AccountRow;

type SideLabels = { onBudget: string; offBudget: string; closed: string };

/**
 * The balance sheet's rows in the sidebar's order: each side with its
 * subtotal, the user's account groups inside it, then their accounts.
 * Closed accounts appear only when they held money at the statement date.
 */
export function buildBalanceSheetRows(
  tree: SidebarAccountTree,
  statement: Statement,
  labels: SideLabels,
): BalanceSheetRow[] {
  const closedWithBalance = tree.closed.filter(account => {
    const balance = statement.balances[account.id];
    return balance !== undefined && balance !== null && balance !== 0;
  });

  return [
    ...getSideRows('on', labels.onBudget, tree.onBudget, statement),
    ...getSideRows('off', labels.offBudget, tree.offBudget, statement),
    ...getAccountGroupRows(
      { key: 'closed', level: 'side', label: labels.closed },
      closedWithBalance,
      1,
      statement,
    ),
  ];
}

function getSideRows(
  side: 'on' | 'off',
  label: string,
  { buckets }: SidebarAccountSide,
  statement: Statement,
): BalanceSheetRow[] {
  const accounts = buckets.flatMap(bucket => bucket.accounts);
  if (accounts.length === 0) {
    return [];
  }

  return [
    getSubtotal({ key: side, level: 'side', label }, accounts, statement),
    ...buckets.flatMap(({ group, accounts: members }) =>
      group === null
        ? members.map(account => getAccountRow(account, 1, statement))
        : getAccountGroupRows(
            { key: `${side}-${group.id}`, level: 'group', label: group.name },
            members,
            2,
            statement,
          ),
    ),
  ];
}

function getAccountGroupRows(
  heading: Pick<SubtotalRow, 'key' | 'level' | 'label'>,
  accounts: readonly AccountEntity[],
  depth: AccountRow['depth'],
  statement: Statement,
): BalanceSheetRow[] {
  if (accounts.length === 0) {
    return [];
  }
  return [
    getSubtotal(heading, accounts, statement),
    ...accounts.map(account => getAccountRow(account, depth, statement)),
  ];
}

function getSubtotal(
  heading: Pick<SubtotalRow, 'key' | 'level' | 'label'>,
  accounts: readonly AccountEntity[],
  statement: Statement,
): SubtotalRow {
  return {
    kind: 'subtotal',
    ...heading,
    balance: sumKnown(accounts.map(({ id }) => statement.balances[id] ?? null)),
    change: sumKnown(accounts.map(({ id }) => statement.changes[id] ?? null)),
  };
}

function getAccountRow(
  account: AccountEntity,
  depth: AccountRow['depth'],
  statement: Statement,
): AccountRow {
  return {
    kind: 'account',
    key: account.id,
    account,
    depth,
    balance: statement.balances[account.id] ?? null,
    change: statement.changes[account.id] ?? null,
  };
}
