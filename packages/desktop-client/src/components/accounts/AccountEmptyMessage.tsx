import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type AccountEmptyMessageProps = {
  onAdd: () => void;
};

export function AccountEmptyMessage({ onAdd }: AccountEmptyMessageProps) {
  return (
    <View
      style={{
        color: theme.tableText,
        backgroundColor: theme.tableBackground,
        flex: 1,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: theme.hairline,
      }}
    >
      <View
        style={{
          maxWidth: 520,
          marginTop: 80,
          paddingInline: 16,
          fontSize: 14,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            lineHeight: '22px',
            textWrap: 'pretty',
            '& strong': { fontWeight: 600, color: theme.pageText },
          }}
        >
          <Trans>
            <strong>Let's add your first account.</strong> Accounts hold your
            transactions, like everyday spending, savings, credit cards, or
            cash. You can connect to your bank to import transactions
            automatically, or add them yourself.
          </Trans>
        </Text>

        <Button
          variant="primary"
          style={{ marginTop: 24 }}
          autoFocus
          onPress={onAdd}
        >
          <Trans>Add account</Trans>
        </Button>

        <View
          style={{ marginTop: 16, fontSize: 12.5, color: theme.tableTextLight }}
        >
          <Trans>You can add more accounts at any time from the sidebar.</Trans>
        </View>
      </View>
    </View>
  );
}
