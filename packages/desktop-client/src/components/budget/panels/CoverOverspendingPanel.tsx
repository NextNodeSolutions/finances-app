import { useReducer } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import * as monthUtils from '@actual-app/core/shared/months';
import type { IntegerAmount } from '@actual-app/core/shared/util';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { SidePanel } from '#components/common/SidePanel';
import { usePanels } from '#components/panels/PanelProvider';
import { useCategories } from '#hooks/useCategories';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';

import { CoverDone } from './cover/CoverDone';
import { CoverStepBody } from './cover/CoverStepBody';
import {
  coverStepperReducer,
  initialCoverStepperState,
} from './cover/coverStepperReducer';
import {
  describeCoverStep,
  getUncoveredTotal,
} from './cover/describeCoverStep';
import type { CoverStep } from './cover/describeCoverStep';
import { getCoverPlan } from './cover/getCoverPlan';
import { useEnvelopeBalances } from './cover/useEnvelopeBalances';
import { useBudgetActionWithUndo } from './useBudgetActionWithUndo';

type CoverOverspendingPanelProps = {
  /** Cover this one category; walk every overspent one when absent. */
  categoryId?: CategoryEntity['id'];
  month: string;
};

/**
 * Walks through overspent categories in table order, one cover at a time.
 * Each cover is the user's explicit choice of source; there is no "cover
 * all".
 */
export function CoverOverspendingPanel({
  categoryId,
  month,
}: CoverOverspendingPanelProps) {
  const { t } = useTranslation();
  const { close } = usePanels();
  const format = useFormat();
  const locale = useLocale();
  const runWithUndo = useBudgetActionWithUndo();
  const [state, dispatch] = useReducer(
    coverStepperReducer,
    initialCoverStepperState,
  );

  const { data: { grouped } = { grouped: [] } } = useCategories();
  const expenseCategories = grouped
    .filter(group => !group.is_income)
    .flatMap(group =>
      (group.categories ?? []).map(category => ({
        ...category,
        hidden: Boolean(category.hidden || group.hidden),
      })),
    );
  const balances = useEnvelopeBalances(
    month,
    expenseCategories.map(category => category.id),
  );
  const plan = getCoverPlan(expenseCategories, balances, t('To budget'));
  const step = describeCoverStep(plan, state, categoryId);

  const cover = (current: CoverStep, amount: IntegerAmount) => {
    const { category, source } = current;
    if (!source) {
      dispatch({
        type: 'error_shown',
        error: t('Choose where the money comes from.'),
      });
      return;
    }
    if (amount <= 0) {
      dispatch({
        type: 'error_shown',
        error: t('Enter an amount above zero.'),
      });
      return;
    }
    if (amount > source.balance) {
      dispatch({
        type: 'error_shown',
        error: t('{{source}} has only {{amount}} available.', {
          source: source.name,
          amount: format(source.balance, 'financial'),
        }),
      });
      return;
    }
    runWithUndo(
      {
        month,
        type: 'cover-overspending',
        args: {
          to: category.id,
          from: source.id,
          amount,
          currencyCode: format.currency.code,
        },
      },
      t('Covered {{amount}} of {{category}} from {{source}}', {
        amount: format(amount, 'financial'),
        category: category.name,
        source: source.name,
      }),
    );
    dispatch({
      type: 'covered',
      categoryId: category.id,
      sourceId: source.id,
      isPartial: amount < -category.balance,
    });
  };

  const monthName = monthUtils.format(month, 'MMMM yyyy', locale);

  return (
    <SidePanel
      testId="cover-overspending-panel"
      title={t('Cover overspending')}
      subtitle={
        step
          ? t('{{position}} of {{total}} · {{month}}', {
              position: step.position,
              total: step.total,
              month: monthName,
            })
          : monthName
      }
      onClose={close}
      onPrimaryAction={() => (step ? cover(step, step.amount) : close())}
      footer={
        step ? (
          <>
            <Button
              variant="bare"
              onPress={() =>
                categoryId
                  ? close()
                  : dispatch({ type: 'skipped', categoryId: step.category.id })
              }
            >
              {categoryId ? <Trans>Cancel</Trans> : <Trans>Skip</Trans>}
            </Button>
            <Button variant="primary" onPress={() => cover(step, step.amount)}>
              <Trans>Cover</Trans>
            </Button>
          </>
        ) : (
          balances.isLoaded && (
            <Button variant="primary" onPress={close}>
              <Trans>Done</Trans>
            </Button>
          )
        )
      }
    >
      {!balances.isLoaded ? (
        <Text style={{ color: theme.pageTextSubdued }}>
          <Trans>Loading…</Trans>
        </Text>
      ) : step ? (
        <CoverStepBody
          key={step.category.id}
          step={step}
          sources={plan.sources}
          error={state.error}
          dispatch={dispatch}
          onSubmit={amount => cover(step, amount)}
        />
      ) : (
        <CoverDone
          uncoveredTotal={getUncoveredTotal(plan, categoryId)}
          hasLeftOverspending={state.hasLeftOverspending}
        />
      )}
    </SidePanel>
  );
}
