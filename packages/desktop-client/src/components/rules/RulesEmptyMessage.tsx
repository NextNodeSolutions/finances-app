import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type RulesEmptyMessageProps = {
  isLoading: boolean;
  hasRules: boolean;
  onCreateRule: () => void;
};

/** Says why the rules table is empty: no rules yet, or none match. */
export function RulesEmptyMessage({
  isLoading,
  hasRules,
  onCreateRule,
}: RulesEmptyMessageProps) {
  if (isLoading) {
    return null;
  }

  return (
    <View
      style={{
        alignItems: 'center',
        gap: spacing.md,
        padding: `${spacing.xl}px ${spacing.lg}px`,
        textAlign: 'center',
        color: theme.pageTextLight,
        fontSize: 13,
      }}
    >
      {hasRules ? (
        <Text>
          <Trans>No rules match this filter.</Trans>
        </Text>
      ) : (
        <>
          <Text>
            <Trans>
              No rules yet. Rules can rename payees and set categories
              automatically.
            </Trans>
          </Text>
          <Button onPress={onCreateRule}>
            <Trans>Create new rule</Trans>
          </Button>
        </>
      )}
    </View>
  );
}
