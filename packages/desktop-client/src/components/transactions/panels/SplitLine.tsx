import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDelete } from '@actual-app/components/icons/v0';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { TransactionEntity } from '@actual-app/core/types/models';

import { CategoryAutocomplete } from '#components/autocomplete/CategoryAutocomplete';

import { PanelAmountInput } from './PanelAmountInput';
import { signAmount } from './transactionDraft';
import type { AmountDirection } from './transactionDraft';

type SplitLineProps = {
  line: TransactionEntity;
  /** 1-based, to name the line's controls. */
  position: number;
  direction: AmountDirection;
  isDisabled: boolean;
  onChange: (patch: Partial<TransactionEntity>) => void;
  onRemove: () => void;
};

/**
 * One split line: a category and its share. The share reads in the
 * transaction's direction, so a payment's lines are typed as positives.
 */
export function SplitLine({
  line,
  position,
  direction,
  isDisabled,
  onChange,
  onRemove,
}: SplitLineProps) {
  const { t } = useTranslation();

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <CategoryAutocomplete
          value={line.category ?? null}
          showBalances
          onSelect={selected => onChange({ category: selected || undefined })}
          inputProps={{
            'aria-label': t('Category for line {{position}}', { position }),
            disabled: isDisabled,
          }}
        />
      </View>
      <PanelAmountInput
        aria-label={t('Amount for line {{position}}', { position })}
        amount={signAmount(line.amount, direction)}
        onChangeAmount={figure =>
          onChange({ amount: signAmount(figure, direction) })
        }
        isDisabled={isDisabled}
      />
      <Button
        variant="bare"
        aria-label={t('Remove line {{position}}', { position })}
        isDisabled={isDisabled}
        onPress={onRemove}
        style={{ padding: 8, color: theme.pageTextLight }}
      >
        <SvgDelete width={8} height={8} />
      </Button>
    </View>
  );
}
