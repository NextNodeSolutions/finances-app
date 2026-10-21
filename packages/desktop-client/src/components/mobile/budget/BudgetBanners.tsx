import { GridList } from 'react-aria-components';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import * as monthUtils from '@actual-app/core/shared/months';
import type { TFunction } from 'i18next';

import { useAttentionItems } from '#hooks/useAttentionItems';
import type { AttentionItem, AttentionItemId } from '#hooks/useAttentionItems';
import { useNavigate } from '#hooks/useNavigate';
import { SheetNameProvider } from '#hooks/useSheetName';

import { BUDGET_BANNER_ACTION_STYLE, BudgetBanner } from './BudgetBanner';
import { OverbudgetedBanner } from './OverbudgetedBanner';
import { OverspentBanner } from './OverspentBanner';

type BudgetBannersProps = {
  month: string;
  budgetType: 'envelope' | 'tracking';
  onBudgetAction: (month: string, action: string, args: unknown) => void;
};

/**
 * What needs the user, above the budget: the shared attention items, plus
 * the viewed month's overbudgeting. Overspending is an item of the current
 * month, so it shows only there.
 */
export function BudgetBanners({
  month,
  budgetType,
  onBudgetAction,
}: BudgetBannersProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items } = useAttentionItems();
  const isCurrentMonth = monthUtils.isCurrentMonth(month);

  const openItem = (item: AttentionItem) => {
    void navigate(item.to, { state: item.state });
  };

  return (
    <GridList
      aria-label={t('Banners')}
      style={{ backgroundColor: theme.mobilePageBackground }}
    >
      {items.map(item => {
        const key = `${item.id}-${item.accountId ?? ''}`;
        if (item.id === 'overspent') {
          return (
            isCurrentMonth && (
              <OverspentBanner
                key={key}
                label={item.label}
                amount={item.amount}
                month={month}
                budgetType={budgetType}
                onBudgetAction={onBudgetAction}
              />
            )
          );
        }
        return (
          <BudgetBanner
            key={key}
            severity={item.severity}
            label={item.label}
            amount={item.amount}
            action={
              <Button
                onPress={() => openItem(item)}
                style={BUDGET_BANNER_ACTION_STYLE}
              >
                {getActionLabel(t, item.id)}
              </Button>
            }
          />
        );
      })}
      {budgetType === 'envelope' && (
        <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
          <OverbudgetedBanner month={month} onBudgetAction={onBudgetAction} />
        </SheetNameProvider>
      )}
    </GridList>
  );
}

function getActionLabel(
  t: TFunction,
  id: Exclude<AttentionItemId, 'overspent'>,
): string {
  switch (id) {
    case 'uncategorized':
      return t('Categorize');
    case 'missed-schedules':
      return t('Review');
    case 'sync-failed':
      return t('Open');
    default:
      throw new Error(`Unknown attention item: ${String(id satisfies never)}`);
  }
}
