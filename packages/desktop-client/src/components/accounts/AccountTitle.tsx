import { Trans } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { AccountEntity } from '@actual-app/core/types/models';

import { isAccountFailedSync } from '#accounts/syncStatus';
import { useOptionalFeature } from '#hooks/useOptionalFeature';

import { AccountNameField } from './AccountNameField';
import type { AccountNameFieldProps } from './AccountNameField';
import { AccountStatusPill } from './AccountStatusPill';

type AccountTitleProps = AccountNameFieldProps & {
  accountsSyncing: string[];
};

/** The title row's left side: sync dot, name, then status pills. */
export function AccountTitle({
  accountsSyncing,
  ...nameFieldProps
}: AccountTitleProps) {
  const { account } = nameFieldProps;
  const [isBankSyncOn] = useOptionalFeature('bankSync');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minWidth: 0,
      }}
    >
      {isBankSyncOn && !!account?.bank && (
        <SyncStatusDot account={account} accountsSyncing={accountsSyncing} />
      )}
      <AccountNameField
        {...nameFieldProps}
        trailing={
          (!!account?.offbudget || !!account?.closed) && (
            <View
              style={{
                flexDirection: 'row',
                gap: spacing.xs,
                marginRight: spacing.xs,
              }}
            >
              {!!account?.offbudget && (
                <AccountStatusPill testId="account-off-budget-pill">
                  <Trans>Off budget</Trans>
                </AccountStatusPill>
              )}
              {!!account?.closed && (
                <AccountStatusPill testId="account-closed-pill">
                  <Trans>Closed</Trans>
                </AccountStatusPill>
              )}
            </View>
          )
        }
      />
    </View>
  );
}

type SyncStatusDotProps = {
  account: AccountEntity;
  accountsSyncing: string[];
};

function SyncStatusDot({ account, accountsSyncing }: SyncStatusDotProps) {
  return (
    <View
      aria-hidden
      style={{
        backgroundColor: accountsSyncing.includes(account.id)
          ? theme.sidebarItemBackgroundPending
          : isAccountFailedSync(account)
            ? theme.sidebarItemBackgroundFailed
            : theme.sidebarItemBackgroundPositive,
        width: 7,
        height: 7,
        borderRadius: radius.pill,
        flexShrink: 0,
      }}
    />
  );
}
