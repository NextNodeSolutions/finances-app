import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { PayeeEntity } from '@actual-app/core/types/models';

import { PayeeAutocomplete } from '#components/autocomplete/PayeeAutocomplete';
import { usePayees } from '#hooks/usePayees';

type PayeeMergePickerProps = {
  payeeId: PayeeEntity['id'];
  onPick: (targetId: PayeeEntity['id']) => void;
  onCancel: () => void;
};

/**
 * Asks which payee this one should be merged into. Nothing is chosen for
 * the user; the merge itself still goes through its confirmation.
 */
export function PayeeMergePicker({
  payeeId,
  onPick,
  onCancel,
}: PayeeMergePickerProps) {
  const { t } = useTranslation();
  const { data: payees = [] } = usePayees();
  const targets = payees.filter(
    payee => payee.id !== payeeId && payee.transfer_acct == null,
  );

  return (
    <View
      style={{
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.lg,
        border: `1px solid ${theme.trayBorder}`,
        backgroundColor: theme.trayBackground,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: 500 }}>
        <Trans>Merge into another payee</Trans>
      </Text>
      <PayeeAutocomplete
        value={null}
        payees={targets}
        showMakeTransfer={false}
        showManagePayees={false}
        openOnFocus
        inputProps={{
          autoFocus: true,
          placeholder: t('Choose a payee'),
          'aria-label': t('Merge into'),
        }}
        // Suggestions also come from the common payees, which can include
        // this payee or a transfer; only a listed target can be picked.
        onSelect={targetId => {
          if (targets.some(payee => payee.id === targetId)) {
            onPick(targetId);
          }
        }}
      />
      <Button
        variant="bare"
        style={{ alignSelf: 'flex-start' }}
        onPress={onCancel}
      >
        <Trans>Cancel</Trans>
      </Button>
    </View>
  );
}
