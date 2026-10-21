import { Trans } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

export type PayeeView = 'all' | 'unused';

type PayeesEmptyMessageProps = {
  isLoading: boolean;
  hasPayees: boolean;
  view: PayeeView;
};

/** Says why the payee table is empty: no payees yet, or none match. */
export function PayeesEmptyMessage({
  isLoading,
  hasPayees,
  view,
}: PayeesEmptyMessageProps) {
  if (isLoading) {
    return null;
  }

  return (
    <View
      style={{
        textAlign: 'center',
        color: theme.pageTextLight,
        fontSize: 13,
        padding: '20px 0',
      }}
    >
      {!hasPayees ? (
        <Trans>Payees appear here as you add transactions.</Trans>
      ) : view === 'unused' ? (
        <Trans>No payees are unused.</Trans>
      ) : (
        <Trans>No payees match this filter.</Trans>
      )}
    </View>
  );
}
