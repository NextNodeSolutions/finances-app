import type { Dispatch } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { FormError } from '@actual-app/components/form-error';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { IntegerAmount } from '@actual-app/core/shared/util';

import { Amount } from '#components/budget/Amount';
import { BalancePreview } from '#components/budget/panels/BalancePreview';
import { PanelField } from '#components/budget/panels/PanelField';
import { FinancialInput } from '#components/util/FinancialInput';

import type { CoverStepperAction } from './coverStepperReducer';
import type { CoverStep } from './describeCoverStep';
import type { CoverCategory } from './getCoverPlan';
import { SourcePicker } from './SourcePicker';

type CoverStepBodyProps = {
  step: CoverStep;
  sources: readonly CoverCategory[];
  error: string | null;
  dispatch: Dispatch<CoverStepperAction>;
  onSubmit: (amount: IntegerAmount) => void;
};

/** One overspent category: where the money comes from, and how much. */
export function CoverStepBody({
  step,
  sources,
  error,
  dispatch,
  onSubmit,
}: CoverStepBodyProps) {
  const { t } = useTranslation();
  const { category, source, amount, reuseSource } = step;

  return (
    <View style={{ gap: spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: spacing.xs,
        }}
      >
        <Text
          style={{ fontSize: 15, fontWeight: 600, color: theme.pageTextDark }}
        >
          {category.name}
        </Text>
        <Amount
          value={category.balance}
          style={{ fontSize: 15, color: theme.numberNegative }}
        />
      </View>
      <PanelField label={t('From')}>
        {sources.length > 0 ? (
          <SourcePicker
            sources={sources}
            value={source?.id ?? null}
            isInvalid={error !== null && source === null}
            onChange={sourceId => dispatch({ type: 'source_chosen', sourceId })}
          />
        ) : (
          <Text style={{ color: theme.pageTextSubdued }}>
            <Trans>No category has money to spare.</Trans>
          </Text>
        )}
      </PanelField>
      <PanelField label={t('Amount')}>
        <FinancialInput
          aria-label={t('Amount to cover')}
          value={amount}
          onChangeValue={value =>
            dispatch({ type: 'amount_typed', amount: value })
          }
          onEnter={onSubmit}
        />
      </PanelField>
      {source && (
        <PanelField label={t('After')}>
          <BalancePreview
            entries={[
              { name: category.name, balance: category.balance + amount },
              { name: source.name, balance: source.balance - amount },
            ]}
          />
        </PanelField>
      )}
      {reuseSource && (
        <View style={{ alignItems: 'flex-start' }}>
          <Button
            variant="bare"
            onPress={() =>
              dispatch({ type: 'source_chosen', sourceId: reuseSource.id })
            }
            style={{ color: theme.pageTextLink }}
          >
            <Trans>Use {{ name: reuseSource.name }} again</Trans>
          </Button>
        </View>
      )}
      {error && <FormError>{error}</FormError>}
    </View>
  );
}
