import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { FormError } from '@actual-app/components/form-error';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { IntegerAmount } from '@actual-app/core/shared/util';
import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';

import { CategoryAutocomplete } from '#components/autocomplete/CategoryAutocomplete';
import { Amount } from '#components/budget/Amount';
import { useSheetValues } from '#components/budget/useSheetValues';
import {
  addToBeBudgetedGroup,
  removeCategoriesFromGroups,
} from '#components/budget/util';
import { SidePanel } from '#components/common/SidePanel';
import { usePanels } from '#components/panels/PanelProvider';
import { FinancialInput } from '#components/util/FinancialInput';
import { useCategories } from '#hooks/useCategories';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import { SheetNameProvider } from '#hooks/useSheetName';

import { getBalanceCellName, TO_BUDGET_ID } from './balanceCell';
import { BalancePreview } from './BalancePreview';
import { PanelField } from './PanelField';
import { useBudgetActionWithUndo } from './useBudgetActionWithUndo';

type MoveMoneyPanelProps = {
  /** The category the money leaves; To budget when absent. */
  from?: CategoryEntity['id'];
  month: string;
};

/**
 * Moves money from one envelope to another (or out of To budget). FROM is
 * the user's explicit choice and stays read-only; TO starts empty.
 */
export function MoveMoneyPanel({
  from = TO_BUDGET_ID,
  month,
}: MoveMoneyPanelProps) {
  const { t } = useTranslation();
  const { close } = usePanels();
  const format = useFormat();
  const locale = useLocale();
  const runWithUndo = useBudgetActionWithUndo();
  const { data: { list: categories, grouped } = { list: [], grouped: [] } } =
    useCategories();
  const [to, setTo] = useState<CategoryEntity['id'] | null>(null);
  const [typedAmount, setTypedAmount] = useState<IntegerAmount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFromToBudget = from === TO_BUDGET_ID;
  const sheetName = monthUtils.sheetForMonth(month);
  const balances = useSheetValues([
    { key: from, sheetName, name: getBalanceCellName(from) },
    ...(to ? [{ key: to, sheetName, name: getBalanceCellName(to) }] : []),
  ]);
  const fromBalance = balances[from] ?? null;
  const toBalance = to ? (balances[to] ?? null) : null;
  const amount = typedAmount ?? Math.max(fromBalance ?? 0, 0);

  const nameOf = (id: CategoryEntity['id']) =>
    id === TO_BUDGET_ID
      ? t('To budget')
      : (categories.find(category => category.id === id)?.name ?? '');

  const transfer = (amountToMove: IntegerAmount) => {
    if (!to) {
      setError(t('Choose a category to move the money to.'));
      return;
    }
    if (amountToMove <= 0) {
      setError(t('Enter an amount above zero.'));
      return;
    }
    const message = t('Moved {{amount}} from {{from}} to {{to}}', {
      amount: format(amountToMove, 'financial'),
      from: nameOf(from),
      to: nameOf(to),
    });
    runWithUndo(
      isFromToBudget
        ? {
            month,
            type: 'transfer-available',
            args: { amount: amountToMove, category: to },
          }
        : {
            month,
            type: 'transfer-category',
            args: {
              amount: amountToMove,
              from,
              to,
              currencyCode: format.currency.code,
            },
          },
      message,
    );
    close();
  };

  return (
    <SheetNameProvider name={sheetName}>
      <SidePanel
        testId="move-money-panel"
        title={
          isFromToBudget
            ? t('Move to a category')
            : t('Transfer to another category')
        }
        subtitle={monthUtils.format(month, 'MMMM yyyy', locale)}
        onClose={close}
        onPrimaryAction={() => transfer(amount)}
        footer={
          <>
            <Button variant="bare" onPress={close}>
              <Trans>Cancel</Trans>
            </Button>
            <Button variant="primary" onPress={() => transfer(amount)}>
              <Trans>Transfer</Trans>
            </Button>
          </>
        }
      >
        <View style={{ gap: spacing.sm }}>
          <PanelField label={t('From')}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: spacing.sm,
              }}
            >
              <Text style={{ color: theme.pageTextDark, fontWeight: 600 }}>
                {nameOf(from)}
              </Text>
              <Amount value={fromBalance} />
            </View>
          </PanelField>
          <PanelField label={t('To')}>
            <CategoryAutocomplete
              categoryGroups={getDestinationGroups(grouped, from)}
              value={to}
              openOnFocus
              showHiddenCategories
              onSelect={(id: string | undefined) => {
                setTo(id || null);
                setError(null);
              }}
              inputProps={{
                placeholder: t('(none)'),
                'aria-label': t('Destination category'),
              }}
            />
          </PanelField>
          <PanelField label={t('Amount')}>
            <FinancialInput
              aria-label={t('Amount to move')}
              value={amount}
              onChangeValue={value => {
                setTypedAmount(value);
                setError(null);
              }}
              onUpdate={setTypedAmount}
              onEnter={value => {
                setTypedAmount(value);
                transfer(value);
              }}
            />
          </PanelField>
          {to && (
            <PanelField label={t('After')}>
              <BalancePreview
                entries={[
                  {
                    name: nameOf(from),
                    balance: fromBalance === null ? null : fromBalance - amount,
                  },
                  {
                    name: nameOf(to),
                    balance: toBalance === null ? null : toBalance + amount,
                  },
                ]}
              />
            </PanelField>
          )}
          {error && <FormError>{error}</FormError>}
        </View>
      </SidePanel>
    </SheetNameProvider>
  );
}

/** Expense envelopes the money can go to, plus To budget from a category. */
function getDestinationGroups(
  groups: readonly CategoryGroupEntity[],
  from: CategoryEntity['id'],
): CategoryGroupEntity[] {
  const expenseGroups = groups.filter(group => !group.is_income);
  if (from === TO_BUDGET_ID) {
    return expenseGroups;
  }
  return removeCategoriesFromGroups(addToBeBudgetedGroup(expenseGroups), from);
}
