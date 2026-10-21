import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { PanelField } from './PanelField';

type PendingPayeeFieldProps = {
  /** A payee name typed elsewhere (the command palette) that is not saved. */
  name: string;
  onChange: () => void;
};

/**
 * A payee that does not exist yet. It is created only when the transaction
 * is saved, so closing the panel leaves nothing behind.
 */
export function PendingPayeeField({ name, onChange }: PendingPayeeFieldProps) {
  const { t } = useTranslation();

  return (
    <PanelField label={t('Payee')} caption={t('New payee')}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
      >
        <Text
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            color: theme.pageText,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Text>
        <Button variant="bare" onPress={onChange}>
          <Trans>Change</Trans>
        </Button>
      </View>
    </PanelField>
  );
}
