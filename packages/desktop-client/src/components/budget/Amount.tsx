import type { CSSProperties } from '@actual-app/components/styles';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

type AmountProps = {
  /** Cents. `null` reads as unknown and renders `—`. */
  value: number | null;
  /** Prefix positive amounts with `+` (variances, differences). */
  isSigned?: boolean;
  style?: CSSProperties;
  testId?: string;
};

/** One money figure: mono, tabular, privacy-aware, minus sign kept. */
export function Amount({
  value,
  isSigned = false,
  style,
  testId,
}: AmountProps) {
  const format = useFormat();
  const text =
    value === null
      ? '—'
      : format(
          value,
          isSigned && value !== 0 ? 'financial-with-sign' : 'financial',
        );

  return (
    <FinancialText
      data-testid={testId}
      style={{ whiteSpace: 'nowrap', ...style }}
    >
      <PrivacyFilter>{text}</PrivacyFilter>
    </FinancialText>
  );
}
