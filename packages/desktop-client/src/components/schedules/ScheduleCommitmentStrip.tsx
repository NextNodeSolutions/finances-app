import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

type ScheduleCommitmentStripProps = {
  committed: number;
  missedCount: number;
};

const labelStyle = { ...styles.monoLabel, color: theme.tableHeaderText };
const figureStyle = { fontSize: 13, fontWeight: 500, color: theme.pageText };

/** Instrument strip: what the next 30 days commit, and what was missed. */
export function ScheduleCommitmentStrip({
  committed,
  missedCount,
}: ScheduleCommitmentStripProps) {
  const format = useFormat();
  const hasMissed = missedCount > 0;

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        columnGap: spacing.xl,
        rowGap: spacing.xs,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: spacing.sm,
        }}
      >
        <Text style={labelStyle}>
          <Trans>Committed · next 30 days</Trans>
        </Text>
        <FinancialText style={figureStyle}>
          <PrivacyFilter>{format(committed, 'financial')}</PrivacyFilter>
        </FinancialText>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: spacing.sm,
        }}
      >
        <Text
          style={{
            ...labelStyle,
            ...(hasMissed && { color: theme.signalText }),
          }}
        >
          <Trans>Missed</Trans>
        </Text>
        <FinancialText
          style={{
            ...figureStyle,
            ...(hasMissed && { color: theme.signalText }),
          }}
        >
          {missedCount}
        </FinancialText>
      </View>
    </View>
  );
}
