import { useTranslation } from 'react-i18next';

import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';
import type { ScheduleStatuses } from '@actual-app/core/shared/schedules';
import type { AccountEntity } from '@actual-app/core/types/models';
import type { TFunction } from 'i18next';

import { isAccountFailedSync } from '#accounts/syncStatus';
import { useAccounts } from '#hooks/useAccounts';
import { useLocale } from '#hooks/useLocale';
import { useOptionalFeature } from '#hooks/useOptionalFeature';
import { useOverspentCategories } from '#hooks/useOverspentCategories';
import { useSchedules } from '#hooks/useSchedules';
import { useSheetValue } from '#hooks/useSheetValue';
import * as bindings from '#spreadsheet/bindings';

export type AttentionItemId =
  | 'uncategorized'
  | 'overspent'
  | 'missed-schedules'
  | 'sync-failed';

export type AttentionItem = {
  id: AttentionItemId;
  severity: 'signal' | 'notice';
  count: number;
  /** Cents, signed; null when an amount is not meaningful. */
  amount: number | null;
  /** Translated and count-aware. */
  label: string;
  /** Route to open when the item is activated. */
  to: string;
  /** Router state passed along with `to` (e.g. `{ focusOverspent: true }`). */
  state?: Record<string, unknown>;
  /** `sync-failed` only. */
  accountId?: string;
};

type AttentionItems = {
  items: AttentionItem[];
  isLoading: boolean;
};

const OPEN_SCHEDULES_QUERY = q('schedules')
  .filter({ completed: false })
  .select('*');

/**
 * Everything that needs the user, in display order. The titlebar Attention
 * control owns these; other surfaces (Overview strip, budget rail, mobile
 * banners) read the same list.
 */
export function useAttentionItems(): AttentionItems {
  const { t } = useTranslation();
  const locale = useLocale();
  const [isBankSyncOn] = useOptionalFeature('bankSync');

  const uncategorizedCount: number | null = useSheetValue(
    bindings.uncategorizedCount(),
  );
  const uncategorizedAmount: number | null = useSheetValue(
    bindings.uncategorizedBalance(),
  );

  const month = monthUtils.currentMonth();
  const overspent = useOverspentCategories({ month });
  const { statuses, isLoading: isLoadingSchedules } = useSchedules({
    query: OPEN_SCHEDULES_QUERY,
  });
  const { data: accounts = [] } = useAccounts();

  const items = [
    getUncategorizedItem(t, uncategorizedCount ?? 0, uncategorizedAmount),
    getOverspentItem(t, {
      count: overspent.amountsByCategory.size,
      amount: overspent.totalAmount,
      monthName: monthUtils.format(month, 'MMMM', locale),
    }),
    getMissedSchedulesItem(t, statuses),
    ...(isBankSyncOn ? getSyncFailedItems(t, accounts) : []),
  ].filter(item => item !== null);

  return {
    items,
    isLoading: uncategorizedCount === null || isLoadingSchedules,
  };
}

function getUncategorizedItem(
  t: TFunction,
  count: number,
  amount: number | null,
): AttentionItem | null {
  if (count <= 0) {
    return null;
  }
  return {
    id: 'uncategorized',
    severity: 'notice',
    count,
    amount,
    label:
      count === 1
        ? t('1 uncategorized transaction')
        : t('{{count}} uncategorized transactions', { count }),
    to: '/categories/uncategorized',
  };
}

function getOverspentItem(
  t: TFunction,
  {
    count,
    amount,
    monthName,
  }: { count: number; amount: number; monthName: string },
): AttentionItem | null {
  if (count <= 0) {
    return null;
  }
  return {
    id: 'overspent',
    severity: 'signal',
    count,
    amount,
    label:
      count === 1
        ? t('1 category overspent in {{month}}', { month: monthName })
        : t('{{count}} categories overspent in {{month}}', {
            count,
            month: monthName,
          }),
    to: '/budget',
    state: { focusOverspent: true },
  };
}

function getMissedSchedulesItem(
  t: TFunction,
  statuses: ScheduleStatuses,
): AttentionItem | null {
  const count = [...statuses.values()].filter(
    status => status === 'missed',
  ).length;
  if (count <= 0) {
    return null;
  }
  return {
    id: 'missed-schedules',
    severity: 'notice',
    count,
    amount: null,
    label:
      count === 1
        ? t('1 scheduled payment missed')
        : t('{{count}} scheduled payments missed', { count }),
    to: '/schedules',
  };
}

function getSyncFailedItems(
  t: TFunction,
  accounts: readonly AccountEntity[],
): AttentionItem[] {
  return accounts
    .filter(
      account =>
        !account.closed && !account.tombstone && isAccountFailedSync(account),
    )
    .map(account => ({
      id: 'sync-failed',
      severity: 'signal',
      count: 1,
      amount: null,
      label: t("{{account}} couldn't sync", { account: account.name }),
      to: `/accounts/${account.id}`,
      accountId: account.id,
    }));
}
