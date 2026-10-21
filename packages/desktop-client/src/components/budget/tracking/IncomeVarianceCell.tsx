import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import * as monthUtils from '@actual-app/core/shared/months';

import { Amount } from '#components/budget/Amount';
import { useSheetValues } from '#components/budget/useSheetValues';
import { Field } from '#components/table';

type IncomeVarianceCellProps = {
  /** The income category, or the income group when `isGroup`. */
  id: string;
  month: string;
  isGroup?: boolean;
};

/**
 * Received minus expected for one income line: signed, jade when the
 * income met the plan, garnet when it fell short, `—` when nothing was
 * expected and nothing came in.
 */
export function IncomeVarianceCell({
  id,
  month,
  isGroup = false,
}: IncomeVarianceCellProps) {
  const sheetName = monthUtils.sheetForMonth(month);
  const values = useSheetValues([
    {
      key: 'received',
      sheetName,
      name: isGroup ? `group-sum-amount-${id}` : `sum-amount-${id}`,
    },
    {
      key: 'expected',
      sheetName,
      name: isGroup ? `group-budget-${id}` : `budget-${id}`,
    },
  ]);
  const { received, expected } = values;
  const isLoaded = received !== undefined && expected !== undefined;
  const variance =
    isLoaded && (received !== 0 || expected !== 0) ? received - expected : null;

  return (
    <Field
      name="variance"
      width="flex"
      truncate={false}
      style={{ paddingRight: styles.monthRightPadding, textAlign: 'right' }}
    >
      <Amount
        value={variance}
        isSigned
        style={{
          fontWeight: isGroup ? 600 : undefined,
          color:
            variance === null
              ? theme.tableTextSubdued
              : variance >= 0
                ? theme.numberPositive
                : theme.numberNegative,
        }}
      />
    </Field>
  );
}
