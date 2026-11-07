import type { ReactNode } from 'react';
import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Link } from '#components/common/Link';

type BudgetTypeCardProps = {
  title: ReactNode;
  description: ReactNode;
  learnMoreUrl: string;
  isCurrent: boolean;
  /** What the card offers when it is not the current method. */
  action: ReactNode;
};

/** One budgeting method, drawn as a card in the method tray. */
export function BudgetTypeCard({
  title,
  description,
  learnMoreUrl,
  isCurrent,
  action,
}: BudgetTypeCardProps) {
  return (
    <View
      style={{
        flex: '1 1 220px',
        gap: spacing.sm,
        padding: spacing.lg,
        borderRadius: radius.lg,
        border: `1px solid ${isCurrent ? theme.buttonPrimaryBackground : 'transparent'}`,
        backgroundColor: isCurrent
          ? theme.settingsCardBackground
          : 'transparent',
        color: theme.settingsCardText,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
          minHeight: 22,
        }}
      >
        <Text style={{ ...styles.smallText, fontWeight: 600 }}>{title}</Text>
        {isCurrent && (
          <Text
            style={{
              ...styles.smallText,
              fontSize: 12,
              paddingInline: spacing.sm - spacing.xxs,
              paddingBlock: spacing.xxs,
              borderRadius: radius.sm,
              backgroundColor: theme.pillBackground,
              color: theme.pillText,
            }}
          >
            <Trans>Current</Trans>
          </Text>
        )}
      </View>
      <Text
        style={{
          ...styles.smallText,
          lineHeight: '18px',
          color: theme.settingsCardTextSubdued,
        }}
      >
        {description}{' '}
        <Link variant="external" to={learnMoreUrl} linkColor="purple">
          <Trans>Learn more</Trans>
        </Link>
      </Text>
      {!isCurrent && (
        <View style={{ alignItems: 'flex-start', marginTop: 'auto' }}>
          {action}
        </View>
      )}
    </View>
  );
}
