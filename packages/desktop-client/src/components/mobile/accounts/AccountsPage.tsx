import { forwardRef, useCallback, useRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import type { DragItem } from 'react-aria';
import {
  DropIndicator,
  ListBox,
  ListBoxItem,
  useDragAndDrop,
} from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router';

import { Button } from '@actual-app/components/button';
import {
  SvgAdd,
  SvgCheveronDown,
  SvgCheveronRight,
  SvgPiggyBank,
} from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { TextOneLine } from '@actual-app/components/text-one-line';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { AccountEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { useMoveAccountMutation, useSyncAndDownloadMutation } from '#accounts';
import { isAccountFailedSync } from '#accounts/syncStatus';
import { makeAmountFullStyle } from '#components/budget/util';
import { MOBILE_NAV_HEIGHT } from '#components/mobile/MobileNavTabs';
import { PullToRefresh } from '#components/mobile/PullToRefresh';
import {
  mobileCardStyle,
  mobileFigureLabelStyle,
  mobileHeaderIconButtonStyle,
} from '#components/mobile/utils';
import { MobilePageHeader, Page } from '#components/Page';
import { CellValue, CellValueText } from '#components/spreadsheet/CellValue';
import { useAccounts } from '#hooks/useAccounts';
import { useLocalPref } from '#hooks/useLocalPref';
import { useNavigate } from '#hooks/useNavigate';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { replaceModal } from '#modals/modalsSlice';
import { useDispatch, useSelector } from '#redux';
import type { Binding, SheetFields } from '#spreadsheet';
import * as bindings from '#spreadsheet/bindings';

const ROW_HEIGHT = 56;
const SECTION_HEADER_HEIGHT = 44;
const HEADLINE_HEADER_HEIGHT = 76;
// Section labels sit on the same verticals as the account names and balances
// in the card beneath them: card inset 12 + border 1 + row padding (8 + the
// 12px sync dot slot on the left, 16 on the right).
const SECTION_HEADER_PADDING = '12px 29px 0 33px';

// "All accounts" leads the page as its one headline figure; the budget
// sections read as quiet labels over their cards.
type AccountHeaderVariant = 'headline' | 'section';

// Virtual account id for the all-accounts transaction list (/accounts/all)
export const ALL_ACCOUNTS_ID = 'all';

type AccountHeaderProps<SheetFieldName extends SheetFields<'account'>> = {
  id: string;
  name: string;
  amount: Binding<'account', SheetFieldName>;
  style?: CSSProperties;
  showCheveronDown?: boolean;
  variant?: AccountHeaderVariant;
  onPress?: () => void;
};

function AccountHeader<SheetFieldName extends SheetFields<'account'>>({
  id,
  name,
  amount,
  style = {},
  showCheveronDown = false,
  variant = 'section',
  onPress,
}: AccountHeaderProps<SheetFieldName>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const Cheveron = showCheveronDown ? SvgCheveronDown : SvgCheveronRight;

  return (
    <Button
      variant="bare"
      aria-label={t('View {{name}} transactions', { name })}
      onPress={onPress ? onPress : () => navigate(`/accounts/${id}`)}
      style={{
        height:
          variant === 'headline'
            ? HEADLINE_HEADER_HEIGHT
            : SECTION_HEADER_HEIGHT,
        width: '100%',
        padding: variant === 'headline' ? '0 20px' : SECTION_HEADER_PADDING,
        alignItems: variant === 'headline' ? 'center' : 'flex-end',
        color: theme.pageTextLight,
        ...style,
      }}
      className={css([
        {
          '&[data-pressed], &[data-hovered]': {
            backgroundColor: 'transparent',
          },
          '&[data-pressed]': {
            opacity: 0.7,
          },
        },
      ])}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          flexDirection: 'row',
          paddingBottom: variant === 'headline' ? 0 : 6,
        }}
      >
        <Text
          style={
            variant === 'headline'
              ? { fontSize: 15, fontWeight: 500, color: theme.pageText }
              : mobileFigureLabelStyle
          }
          data-testid="name"
        >
          {name}
        </Text>
        <Cheveron
          style={{
            flexShrink: 0,
            color: theme.tableTextSubdued,
            marginLeft: 4,
          }}
          width={variant === 'headline' ? 13 : 11}
          height={variant === 'headline' ? 13 : 11}
        />
      </View>
      <CellValue binding={amount} type="financial">
        {props => (
          <CellValueText<'account', SheetFieldName>
            {...props}
            style={
              variant === 'headline'
                ? {
                    ...styles.display,
                    fontSize: 30,
                    lineHeight: '36px',
                    fontWeight: 300,
                    color: theme.pageText,
                  }
                : {
                    fontSize: 12.5,
                    fontWeight: 500,
                    paddingBottom: 6,
                    color: theme.pageTextLight,
                  }
            }
          />
        )}
      </CellValue>
    </Button>
  );
}

type AccountListItemProps = ComponentPropsWithoutRef<
  typeof ListBoxItem<AccountEntity>
> & {
  isUpdated: boolean;
  isConnected: boolean;
  isPending: boolean;
  isFailed: boolean;
  getBalanceQuery: (
    accountId: AccountEntity['id'],
  ) => Binding<'account', 'balance'>;
  onSelect: (account: AccountEntity) => void;
};

function AccountListItem({
  isUpdated,
  isConnected,
  isPending,
  isFailed,
  getBalanceQuery,
  onSelect,
  ...props
}: AccountListItemProps) {
  const { value: account } = props;

  if (!account) {
    return null;
  }

  return (
    <ListBoxItem
      textValue={account.name}
      className={css({
        borderBottom: `1px solid ${theme.tableBorder}`,
        '&:last-child': {
          borderBottom: 'none',
        },
      })}
      {...props}
    >
      {itemProps => (
        <Button
          {...itemProps}
          style={{
            height: ROW_HEIGHT,
            width: '100%',
            backgroundColor: theme.tableBackground,
            border: 'none',
            borderRadius: 0,
            boxShadow: 'none',
            padding: '0 16px 0 8px',
          }}
          data-testid="account-list-item"
          onPress={() => onSelect(account)}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <View
              style={{
                backgroundColor: isPending
                  ? theme.sidebarItemBackgroundPending
                  : isFailed
                    ? theme.sidebarItemBackgroundFailed
                    : theme.sidebarItemBackgroundPositive,
                marginRight: 6,
                width: 6,
                flexShrink: 0,
                height: 6,
                borderRadius: 6,
                opacity: isConnected ? 1 : 0,
              }}
            />
            <TextOneLine
              style={{
                ...styles.text,
                fontSize: 15,
                fontWeight: isUpdated ? 600 : 500,
                color: isUpdated ? theme.mobileAccountText : theme.pageText,
              }}
              data-testid="account-name"
            >
              {account.name}
            </TextOneLine>
          </View>
          <CellValue binding={getBalanceQuery(account.id)} type="financial">
            {props => (
              <CellValueText<'account', 'balance'>
                {...props}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  ...makeAmountFullStyle(props.value, {
                    // A balance in credit is the normal state, set in ink;
                    // only a negative balance takes a colour.
                    positiveColor: theme.pageText,
                    negativeColor: theme.numberNegative,
                    zeroColor: theme.numberNeutral,
                  }),
                }}
                data-testid="account-balance"
              />
            )}
          </CellValue>
        </Button>
      )}
    </ListBoxItem>
  );
}

function EmptyMessage({ onAddAccount }: { onAddAccount: () => void }) {
  return (
    <View
      style={{
        minHeight: `calc(100vh - ${MOBILE_NAV_HEIGHT}px - 140px)`,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        gap: 15,
      }}
    >
      <SvgPiggyBank
        width={44}
        height={44}
        style={{ color: theme.tableTextSubdued }}
      />
      <Text
        style={{
          ...styles.display,
          fontSize: 26,
          lineHeight: '32px',
          color: theme.pageText,
          textAlign: 'center',
        }}
      >
        <Trans>Add your first account</Trans>
      </Text>
      <Text
        style={{
          ...styles.text,
          textAlign: 'center',
          color: theme.pageTextLight,
          lineHeight: 1.5,
          maxWidth: 340,
        }}
      >
        <Trans>
          Accounts hold your transactions, like everyday spending, savings,
          credit cards, or cash. Add one to start tracking your money.
        </Trans>
      </Text>
      <Button
        variant="primary"
        style={{
          padding: '0 20px',
          fontSize: 15,
          fontWeight: 500,
          minHeight: 44,
          borderRadius: 8,
          marginTop: 10,
        }}
        onPress={onAddAccount}
      >
        <Trans>Add account</Trans>
      </Button>
    </View>
  );
}

type AllAccountListProps = {
  accounts: AccountEntity[];
  getAccountBalance: (
    accountId: AccountEntity['id'],
  ) => Binding<'account', 'balance'>;
  getAllAccountsBalance: () => Binding<'account', 'accounts-balance'>;
  getOnBudgetBalance: () => Binding<'account', 'onbudget-accounts-balance'>;
  getOffBudgetBalance: () => Binding<'account', 'offbudget-accounts-balance'>;
  getClosedAccountsBalance: () => Binding<'account', 'closed-accounts-balance'>;
  onAddAccount: () => void;
  onOpenAccount: (account: AccountEntity) => void;
  onSync: () => Promise<void>;
};

function AllAccountList({
  accounts,
  getAccountBalance,
  getAllAccountsBalance,
  getOnBudgetBalance,
  getOffBudgetBalance,
  getClosedAccountsBalance,
  onAddAccount,
  onOpenAccount,
  onSync,
}: AllAccountListProps) {
  const { t } = useTranslation();
  const onBudgetAccounts = accounts.filter(
    account => account.offbudget === 0 && account.closed === 0,
  );
  const offBudgetAccounts = accounts.filter(
    account => account.offbudget === 1 && account.closed === 0,
  );
  const closedAccounts = accounts.filter(account => account.closed === 1);

  const closedAccountsRef = useRef<HTMLDivElement | null>(null);
  const [showClosedAccounts, setShowClosedAccountsPref] = useLocalPref(
    'ui.showClosedAccounts',
  );

  const onToggleClosedAccounts = () => {
    const toggledState = !showClosedAccounts;
    setShowClosedAccountsPref(toggledState);
    if (toggledState) {
      // Make sure to scroll to the closed accounts when the user presses
      // on the account header, otherwise it's not clear that the accounts are there.
      // Delay the scroll until the component is rendered, otherwise the scroll
      // won't work.
      setTimeout(() => {
        closedAccountsRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  };

  return (
    <Page
      header={
        <MobilePageHeader
          title={t('Accounts')}
          rightContent={
            <Button
              variant="bare"
              aria-label={t('Add account')}
              style={mobileHeaderIconButtonStyle}
              onPress={onAddAccount}
            >
              <SvgAdd width={18} height={18} />
            </Button>
          }
        />
      }
      padding={0}
    >
      {accounts.length === 0 ? (
        <EmptyMessage onAddAccount={onAddAccount} />
      ) : (
        <PullToRefresh onRefresh={onSync}>
          <View
            aria-label={t('Account list')}
            style={{ paddingBottom: MOBILE_NAV_HEIGHT }}
          >
            <AccountHeader
              id={ALL_ACCOUNTS_ID}
              name={t('All accounts')}
              amount={getAllAccountsBalance()}
              variant="headline"
              style={{
                borderRadius: 0,
                borderBottom: `1px solid ${theme.hairline}`,
                backgroundColor: theme.titlebarBackground,
              }}
            />
            {onBudgetAccounts.length > 0 && (
              <AccountHeader
                id="onbudget"
                name={t('On budget')}
                amount={getOnBudgetBalance()}
              />
            )}
            <AccountList
              aria-label={t('On budget accounts')}
              accounts={onBudgetAccounts}
              getAccountBalance={getAccountBalance}
              onOpenAccount={onOpenAccount}
            />
            {offBudgetAccounts.length > 0 && (
              <AccountHeader
                id="offbudget"
                name={t('Off budget')}
                amount={getOffBudgetBalance()}
              />
            )}
            <AccountList
              aria-label={t('Off budget accounts')}
              accounts={offBudgetAccounts}
              getAccountBalance={getAccountBalance}
              onOpenAccount={onOpenAccount}
            />
            {closedAccounts.length > 0 && (
              <AccountHeader
                id="closed"
                name={t('Closed')}
                onPress={onToggleClosedAccounts}
                amount={getClosedAccountsBalance()}
                style={{ marginTop: 16 }}
                showCheveronDown={showClosedAccounts}
              />
            )}
            {showClosedAccounts && (
              <AccountList
                aria-label={t('Closed accounts')}
                accounts={closedAccounts}
                getAccountBalance={getAccountBalance}
                onOpenAccount={onOpenAccount}
                ref={el => {
                  if (el) closedAccountsRef.current = el;
                }}
              />
            )}
          </View>
        </PullToRefresh>
      )}
    </Page>
  );
}

type AccountListProps = {
  'aria-label': string;
  accounts: AccountEntity[];
  getAccountBalance: (
    accountId: AccountEntity['id'],
  ) => Binding<'account', 'balance'>;
  onOpenAccount: (account: AccountEntity) => void;
};

const AccountList = forwardRef<HTMLDivElement, AccountListProps>(
  (
    {
      'aria-label': ariaLabel,
      accounts,
      getAccountBalance: getBalanceBinding,
      onOpenAccount,
    }: AccountListProps,
    ref,
  ) => {
    const syncingAccountIds = useSelector(
      state => state.account.accountsSyncing,
    );
    const updatedAccounts = useSelector(state => state.account.updatedAccounts);

    const moveAccount = useMoveAccountMutation();

    const { dragAndDropHooks } = useDragAndDrop({
      getItems: keys =>
        [...keys].map(
          key =>
            ({
              'text/plain': key as AccountEntity['id'],
            }) as DragItem,
        ),
      renderDropIndicator: target => {
        return (
          <DropIndicator
            target={target}
            className={css({
              '&[data-drop-target]': {
                height: 2,
                margin: '0 12px',
                backgroundColor: theme.accent,
                opacity: 1,
                borderRadius: 2,
              },
            })}
          />
        );
      },
      onReorder: e => {
        const [key] = e.keys;
        const accountIdToMove = key as AccountEntity['id'];
        const targetAccountId = e.target.key as AccountEntity['id'];

        if (e.target.dropPosition === 'before') {
          moveAccount.mutate({
            id: accountIdToMove,
            targetId: targetAccountId,
          });
        } else if (e.target.dropPosition === 'after') {
          const targetAccountIndex = accounts.findIndex(
            account => account.id === e.target.key,
          );
          if (targetAccountIndex === -1) {
            throw new Error(
              `Internal error: account with ID ${targetAccountId} not found.`,
            );
          }

          const nextToTargetAccount = accounts[targetAccountIndex + 1];

          moveAccount.mutate({
            id: accountIdToMove,
            // Due to the way `moveAccount` works, we use the account next to the
            // actual target account here because `moveAccount` always shoves the
            // account *before* the target account.
            // On the other hand, using `null` as `targetId`moves the account
            // to the end of the list.
            targetId: nextToTargetAccount?.id || null,
          });
        }
      },
    });
    return (
      <ListBox
        aria-label={ariaLabel}
        items={accounts}
        dependencies={[syncingAccountIds, updatedAccounts]}
        dragAndDropHooks={dragAndDropHooks}
        ref={ref}
        style={{
          ...mobileCardStyle,
          display: 'flex',
          flexDirection: 'column',
          margin: '0 12px',
        }}
      >
        {account => (
          <AccountListItem
            key={account.id}
            id={account.id}
            value={account}
            isUpdated={updatedAccounts && updatedAccounts.includes(account.id)}
            isConnected={!!account.bank}
            isPending={syncingAccountIds.includes(account.id)}
            isFailed={isAccountFailedSync(account)}
            getBalanceQuery={getBalanceBinding}
            onSelect={onOpenAccount}
          />
        )}
      </ListBox>
    );
  },
);

AccountList.displayName = 'AccountList';

export function AccountsPage() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { data: accounts = [] } = useAccounts();
  const [_numberFormat] = useSyncedPref('numberFormat');
  const numberFormat = _numberFormat || 'comma-dot';
  const [hideFraction] = useSyncedPref('hideFraction');

  const navigate = useNavigate();

  const onOpenAccount = useCallback(
    (account: AccountEntity) => {
      void navigate(`/accounts/${account.id}`);
    },
    [navigate],
  );

  const onAddAccount = useCallback(() => {
    dispatch(replaceModal({ modal: { name: 'add-account', options: {} } }));
  }, [dispatch]);

  const syncAndDownload = useSyncAndDownloadMutation();
  const onSync = useCallback(async () => {
    syncAndDownload.mutate({});
  }, [syncAndDownload]);

  // Drill-downs (e.g. report activity) land on /accounts with filter
  // conditions in the location state; show them as filtered transactions.
  const filterConditions = location?.state?.filterConditions || [];
  if (filterConditions.length > 0) {
    return (
      <Navigate
        to={`/accounts/${ALL_ACCOUNTS_ID}`}
        state={location.state}
        replace
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AllAccountList
        // This key forces the whole table rerender when the number
        // format changes
        key={numberFormat + hideFraction}
        accounts={accounts}
        getAccountBalance={bindings.accountBalance}
        getAllAccountsBalance={bindings.allAccountBalance}
        getOnBudgetBalance={bindings.onBudgetAccountBalance}
        getOffBudgetBalance={bindings.offBudgetAccountBalance}
        getClosedAccountsBalance={bindings.closedAccountBalance}
        onAddAccount={onAddAccount}
        onOpenAccount={onOpenAccount}
        onSync={onSync}
      />
    </View>
  );
}
