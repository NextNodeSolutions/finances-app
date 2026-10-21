import React, { Fragment, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';

import { Button } from '@actual-app/components/button';
import { SvgCheveronDown } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';
import type { AccountEntity } from '@actual-app/core/types/models';

import { useReopenAccountMutation, useUpdateAccountMutation } from '#accounts';
import { isAccountFailedSync } from '#accounts/syncStatus';
import { MobileBackButton } from '#components/mobile/MobileBackButton';
import { AddTransactionButton } from '#components/mobile/transactions/AddTransactionButton';
import {
  MOBILE_HEADER_TITLE_CHEVRON_SIZE,
  mobileHeaderTitleChevronStyle,
  mobileHeaderTitleStyle,
} from '#components/mobile/utils';
import { MobilePageHeader, Page } from '#components/Page';
import { useAccount } from '#hooks/useAccount';
import { useOptionalFeature } from '#hooks/useOptionalFeature';
import { useSyncedPref } from '#hooks/useSyncedPref';
import {
  collapseModals,
  openAccountCloseModal,
  pushModal,
} from '#modals/modalsSlice';
import { useDispatch, useSelector } from '#redux';

import { AccountTransactions } from './AccountTransactions';
import { AllAccountTransactions } from './AllAccountTransactions';
import { OffBudgetAccountTransactions } from './OffBudgetAccountTransactions';
import { OnBudgetAccountTransactions } from './OnBudgetAccountTransactions';

export function AccountPage() {
  const { t } = useTranslation();
  const [_numberFormat] = useSyncedPref('numberFormat');
  const numberFormat = _numberFormat || 'comma-dot';
  const [hideFraction] = useSyncedPref('hideFraction');

  const { id: accountIdParam } = useParams();

  const account = useAccount(accountIdParam || '');

  const nameFromId = useCallback(
    (id: string | undefined) => {
      switch (id) {
        case 'onbudget':
          return t('On Budget Accounts');
        case 'offbudget':
          return t('Off Budget Accounts');
        case 'uncategorized':
          return t('Uncategorized');
        case 'closed':
          return t('Closed Accounts');
        default:
          return t('All Accounts');
      }
    },
    [t],
  );

  return (
    <Page
      header={
        <MobilePageHeader
          title={
            account ? (
              <AccountHeader account={account} />
            ) : (
              <NameOnlyHeader name={nameFromId(accountIdParam)} />
            )
          }
          leftContent={<MobileBackButton />}
          rightContent={<AddTransactionButton accountId={account?.id} />}
        />
      }
      padding={0}
    >
      {/* This key forces the whole table rerender when the number format changes */}
      <Fragment key={numberFormat + hideFraction}>
        {account ? (
          <AccountTransactions account={account} />
        ) : accountIdParam === 'onbudget' ? (
          <OnBudgetAccountTransactions />
        ) : accountIdParam === 'offbudget' ? (
          <OffBudgetAccountTransactions />
        ) : (
          <AllAccountTransactions />
        )}
      </Fragment>
    </Page>
  );
}

function AccountHeader({ account }: { readonly account: AccountEntity }) {
  const { t } = useTranslation();
  const syncingAccountIds = useSelector(state => state.account.accountsSyncing);
  const pending = syncingAccountIds.includes(account.id);
  const failed = isAccountFailedSync(account);
  // With bank sync off, the header shows no connection or sync state.
  const [isBankSyncOn] = useOptionalFeature('bankSync');

  const dispatch = useDispatch();
  const { mutate: updateAccount } = useUpdateAccountMutation();

  const onSave = useCallback(
    (account: AccountEntity) => {
      updateAccount({ account });
    },
    [updateAccount],
  );

  const onSaveNotes = useCallback(async (id: string, notes: string) => {
    await send('notes-save', { id, note: notes });
  }, []);

  const onEditNotes = useCallback(
    (id: string) => {
      dispatch(
        pushModal({
          modal: {
            name: 'notes',
            options: {
              id: `account-${id}`,
              name: account.name,
              onSave: onSaveNotes,
            },
          },
        }),
      );
    },
    [account.name, dispatch, onSaveNotes],
  );

  const onCloseAccount = useCallback(() => {
    void dispatch(openAccountCloseModal({ accountId: account.id }));
  }, [account.id, dispatch]);

  const { mutate: reopenAccount } = useReopenAccountMutation();

  const onReopenAccount = useCallback(() => {
    reopenAccount({ id: account.id });
  }, [account.id, reopenAccount]);

  const [, setSearchParams] = useSearchParams();

  const onReconcile = useCallback(() => {
    dispatch(
      pushModal({
        modal: {
          name: 'account-reconcile',
          options: {
            accountId: account.id,
            onReconcile: (amount: number) => {
              setSearchParams(prev => {
                prev.set('reconcile', String(amount));
                return prev;
              });
              dispatch(
                collapseModals({
                  rootModalName: 'account-menu',
                }),
              );
            },
          },
        },
      }),
    );
  }, [account.id, dispatch, setSearchParams]);

  const onClick = useCallback(() => {
    dispatch(
      pushModal({
        modal: {
          name: 'account-menu',
          options: {
            accountId: account.id,
            onSave,
            onEditNotes,
            onCloseAccount,
            onReopenAccount,
            onReconcile,
          },
        },
      }),
    );
  }, [
    account.id,
    dispatch,
    onCloseAccount,
    onEditNotes,
    onReconcile,
    onReopenAccount,
    onSave,
  ]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {isBankSyncOn && account.bank && (
        <View
          style={{
            marginRight: 2,
            width: 6,
            height: 6,
            borderRadius: 6,
            flexShrink: 0,
            backgroundColor: pending
              ? theme.sidebarItemBackgroundPending
              : failed
                ? theme.sidebarItemBackgroundFailed
                : theme.sidebarItemBackgroundPositive,
            transition: 'transform .3s',
          }}
        />
      )}
      <Button
        variant="bare"
        onPress={onClick}
        style={{ padding: '4px 8px', borderRadius: 8 }}
      >
        <Text
          style={{
            ...mobileHeaderTitleStyle,
            ...(styles.lineClamp(1) as CSSProperties),
          }}
        >
          {account.closed
            ? t('Closed: {{accountName}}', { accountName: account.name })
            : account.name}
        </Text>
        <SvgCheveronDown
          width={MOBILE_HEADER_TITLE_CHEVRON_SIZE}
          height={MOBILE_HEADER_TITLE_CHEVRON_SIZE}
          style={mobileHeaderTitleChevronStyle}
        />
      </Button>
    </View>
  );
}

function NameOnlyHeader({ name }: { readonly name: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
      }}
    >
      <Text
        style={{
          ...mobileHeaderTitleStyle,
          ...(styles.lineClamp(1) as CSSProperties),
        }}
      >
        {name}
      </Text>
    </View>
  );
}
