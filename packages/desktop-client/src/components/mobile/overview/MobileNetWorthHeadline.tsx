import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Amount } from '#components/overview/Amount';
import { ChangeLine } from '#components/overview/ChangeLine';
import type { Statement } from '#components/overview/statement';

const HEADLINE_SIZE = 30;
const HEADLINE_LINE_HEIGHT = 36;

type MobileNetWorthHeadlineProps = {
  statement: Statement;
};

/** The page's one headline figure: net worth, then its change. */
export function MobileNetWorthHeadline({
  statement,
}: MobileNetWorthHeadlineProps) {
  const { netWorth } = statement;

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
        <Trans>Net worth</Trans>
      </Text>
      <Amount
        value={netWorth}
        testId="overview-net-worth"
        style={{
          ...styles.display,
          fontSize: HEADLINE_SIZE,
          lineHeight: `${HEADLINE_LINE_HEIGHT}px`,
          color:
            netWorth !== null && netWorth < 0
              ? theme.numberNegative
              : theme.pageTextDark,
        }}
      />
      <ChangeLine statement={statement} />
    </View>
  );
}
