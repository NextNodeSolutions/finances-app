import { styles } from '@actual-app/components/styles';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';
import { useSheetValue } from '#hooks/useSheetValue';

import { getBalanceColor } from './StripReading';
import type { BalanceQuery } from './useClearedBalances';

type HeadlineBalanceProps = {
  balanceQuery: BalanceQuery;
};

/** The register's one headline figure, set in the display serif. */
export function HeadlineBalance({ balanceQuery }: HeadlineBalanceProps) {
  const format = useFormat();
  const balance =
    useSheetValue<'balance', `balance-query-${string}`>(balanceQuery) ?? 0;

  return (
    <View data-testid="account-balance">
      <PrivacyFilter>
        <FinancialText
          style={{
            ...styles.display,
            fontSize: 34,
            lineHeight: '40px',
            fontWeight: 300,
            letterSpacing: '-0.015em',
            color: getBalanceColor(balance),
          }}
        >
          {format(balance, 'financial')}
        </FinancialText>
      </PrivacyFilter>
    </View>
  );
}
