import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { tsToRelativeTime } from '@actual-app/core/shared/util';
import type { AccountEntity } from '@actual-app/core/types/models';
import { format as formatDate } from 'date-fns';

import { useDateFormat } from '#hooks/useDateFormat';
import { useLocale } from '#hooks/useLocale';

type ReconcileButtonProps = {
  account: AccountEntity;
  /** True while the reconcile strip is open. */
  isPressed: boolean;
  onPress: () => void;
};

/**
 * Opens the reconcile strip. Off-budget accounts read `Update value` and
 * open its valuation mode instead.
 */
export function ReconcileButton({
  account,
  isPressed,
  onPress,
}: ReconcileButtonProps) {
  const { t } = useTranslation();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const locale = useLocale();

  // The strip is open: the button reads as held down.
  const pressedStyle = isPressed
    ? { backgroundColor: theme.buttonNormalBackgroundActive }
    : undefined;

  if (account.offbudget) {
    return (
      <Button aria-pressed={isPressed} onPress={onPress} style={pressedStyle}>
        <Trans>Update value</Trans>
      </Button>
    );
  }

  const lastReconciled = account.last_reconciled
    ? t('Reconciled {{ relativeTimeAgo }} ({{ absoluteDate }})', {
        relativeTimeAgo: tsToRelativeTime(account.last_reconciled, locale),
        absoluteDate: formatDate(
          new Date(parseInt(account.last_reconciled, 10)),
          dateFormat,
          { locale },
        ),
      })
    : t('Not yet reconciled');

  return (
    <Tooltip
      style={{ ...styles.tooltip, marginBottom: 10 }}
      content={lastReconciled}
      placement="top"
      triggerProps={{ isDisabled: isPressed }}
    >
      <Button aria-pressed={isPressed} onPress={onPress} style={pressedStyle}>
        <Trans>Reconcile</Trans>
      </Button>
    </Tooltip>
  );
}
