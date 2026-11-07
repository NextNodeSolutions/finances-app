import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type DiscardChangesConfirmProps = {
  onKeepEditing: () => void;
  onDiscard: () => void;
};

/**
 * Asks before closing a panel with unsaved edits, in place of the footer
 * actions. Inline, because no existing confirm modal says "Discard".
 */
export function DiscardChangesConfirm({
  onKeepEditing,
  onDiscard,
}: DiscardChangesConfirmProps) {
  const { t } = useTranslation();

  return (
    <View
      role="group"
      aria-label={t('Discard changes?')}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
      }}
    >
      <Text style={{ flex: 1, fontSize: 13, color: theme.pageText }}>
        <Trans>Discard changes?</Trans>
      </Text>
      <Button autoFocus onPress={onKeepEditing}>
        <Trans>Keep editing</Trans>
      </Button>
      <Button variant="primary" onPress={onDiscard}>
        <Trans>Discard</Trans>
      </Button>
    </View>
  );
}
