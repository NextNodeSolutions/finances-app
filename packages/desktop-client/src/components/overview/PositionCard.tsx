import type { ReactNode } from 'react';
import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Amount } from './Amount';
import { ChangeLine } from './ChangeLine';
import { LabelledFigure } from './LabelledFigure';
import type { Statement } from './statement';

type PositionCardProps = {
  statement: Statement;
  /** Controls aligned right of the Assets/Liabilities line (the range). */
  controls?: ReactNode;
  /** The trend area under the hairline. */
  children: ReactNode;
};

const GUTTER = 24;

/**
 * The headline of the statement: net worth in the display serif, its change
 * since the previous month-end, assets and liabilities, and the trend.
 */
export function PositionCard({
  statement,
  controls,
  children,
}: PositionCardProps) {
  const { netWorth, assets, liabilities } = statement;

  return (
    <View
      data-testid="overview-position"
      style={{ ...styles.tableContainer, flex: 'none' }}
    >
      <View
        style={{
          gap: spacing.sm,
          padding: `${GUTTER - 2}px ${GUTTER}px ${spacing.lg}px`,
        }}
      >
        <Text style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
          <Trans>Net worth</Trans>
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            columnGap: spacing.lg,
            rowGap: spacing.xs,
          }}
        >
          <Amount
            value={netWorth}
            testId="overview-net-worth"
            style={{
              ...styles.display,
              fontSize: 36,
              lineHeight: '42px',
              color:
                netWorth !== null && netWorth < 0
                  ? theme.numberNegative
                  : theme.pageTextDark,
            }}
          />
          <ChangeLine statement={statement} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            columnGap: spacing.xl,
            rowGap: spacing.sm,
            marginTop: spacing.xs,
          }}
        >
          <LabelledFigure label={<Trans>Assets</Trans>} value={assets} />
          <LabelledFigure
            label={<Trans>Liabilities</Trans>}
            value={liabilities}
          />
          <View style={{ flex: 1 }} />
          {controls}
        </View>
      </View>
      <View
        style={{
          borderTop: `1px solid ${theme.hairline}`,
          padding: `${spacing.md}px ${GUTTER - spacing.sm}px ${spacing.lg}px ${GUTTER - spacing.md}px`,
        }}
      >
        {children}
      </View>
    </View>
  );
}
