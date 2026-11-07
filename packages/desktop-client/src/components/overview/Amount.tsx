import type { CSSProperties } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

type AmountProps = {
  /** Cents; null while unknown (shows a dash). */
  value: number | null;
  /**
   * `balance` marks negatives in garnet; `change` also signs the figure
   * and marks rises in jade. The sign is always written out.
   */
  tone?: 'plain' | 'balance' | 'change';
  style?: CSSProperties;
  testId?: string;
};

/** One figure of the statement: mono, tabular, private in privacy mode. */
export function Amount({ value, tone = 'plain', style, testId }: AmountProps) {
  const format = useFormat();

  if (value === null) {
    return (
      <Text
        data-testid={testId}
        style={{ color: theme.tableTextSubdued, ...style }}
      >
        —
      </Text>
    );
  }

  return (
    <PrivacyFilter>
      <FinancialText
        data-testid={testId}
        style={{ color: getToneColor(value, tone), ...style }}
      >
        {format(value, tone === 'change' ? 'financial-with-sign' : 'financial')}
      </FinancialText>
    </PrivacyFilter>
  );
}

function getToneColor(
  value: number,
  tone: NonNullable<AmountProps['tone']>,
): string | undefined {
  if (tone === 'plain') {
    return undefined;
  }
  if (value < 0) {
    return theme.numberNegative;
  }
  if (value === 0) {
    return theme.tableTextSubdued;
  }
  return tone === 'change' ? theme.numberPositive : undefined;
}
