import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { getScheduledAmount } from '@actual-app/core/shared/schedules';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

type ScheduleAmountHeadlineProps = {
  amount: ScheduleEntity['_amount'];
  op: ScheduleEntity['_amountOp'];
};

/**
 * The schedule's amount as the panel's one display figure, written as the
 * schedules table writes it: unsigned, with `~` for an approximate amount.
 */
export function ScheduleAmountHeadline({
  amount,
  op,
}: ScheduleAmountHeadlineProps) {
  const { t } = useTranslation();
  const format = useFormat();

  const figure =
    op === 'isbetween' && typeof amount !== 'number'
      ? t('{{currency1}} to {{currency2}}', {
          currency1: format(Math.abs(amount.num1), 'financial'),
          currency2: format(Math.abs(amount.num2), 'financial'),
        })
      : `${op === 'isapprox' ? '~ ' : ''}${format(Math.abs(getScheduledAmount(amount)), 'financial')}`;

  return (
    <FinancialText
      style={{
        ...styles.display,
        fontSize: 28,
        lineHeight: '34px',
        fontWeight: 300,
        color: theme.pageTextDark,
      }}
    >
      <PrivacyFilter>{figure}</PrivacyFilter>
    </FinancialText>
  );
}
