import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { replaceModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

/**
 * The position before there is anything to add up. Add account opens the
 * same flow as the sidebar's +, which goes straight to the local-account
 * form when bank sync is off.
 */
export function NoAccountsCard() {
  const dispatch = useDispatch();

  return (
    <View
      data-testid="overview-position"
      style={{
        ...styles.tableContainer,
        flex: 'none',
        alignItems: 'flex-start',
        gap: spacing.lg,
        padding: 24,
      }}
    >
      <Text style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
        <Trans>Net worth</Trans>
      </Text>
      <Text style={{ fontSize: 15, color: theme.pageTextDark }}>
        <Trans>Add your first account to see your position.</Trans>
      </Text>
      <Button
        variant="primary"
        onPress={() =>
          dispatch(
            replaceModal({ modal: { name: 'add-account', options: {} } }),
          )
        }
      >
        <Trans>Add account</Trans>
      </Button>
    </View>
  );
}
