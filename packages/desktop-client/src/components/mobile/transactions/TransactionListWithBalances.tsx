import React, { useState } from 'react';
import type { ComponentProps } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { SvgFilter } from '@actual-app/components/icons/v1';
import { Label } from '@actual-app/components/label';
import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { IntegerAmount } from '@actual-app/core/shared/util';
import type { TransactionEntity } from '@actual-app/core/types/models';

import { Search } from '#components/common/Search';
import { PullToRefresh } from '#components/mobile/PullToRefresh';
import {
  mobileFigureLabelStyle,
  mobileSearchBarStyle,
  mobileSearchInputStyle,
} from '#components/mobile/utils';
import { CellValue, CellValueText } from '#components/spreadsheet/CellValue';
import { DisplayPayeeProvider } from '#hooks/useDisplayPayee';
import { SelectedProvider, useSelected } from '#hooks/useSelected';
import { useSheetValue } from '#hooks/useSheetValue';
import type { Binding, SheetFields, SheetNames } from '#spreadsheet';

import { TransactionList } from './TransactionList';

const secondaryLabelStyle: CSSProperties = {
  ...mobileFigureLabelStyle,
  textAlign: 'center',
  marginBottom: 2,
};

const secondaryFigureStyle: CSSProperties = {
  ...styles.tnum,
  fontSize: 12.5,
  textAlign: 'center',
  fontWeight: 500,
  color: theme.pageTextLight,
};

type TransactionSearchInputProps = {
  placeholder: string;
  onSearch: TransactionListWithBalancesProps['onSearch'];
};

function TransactionSearchInput({
  placeholder,
  onSearch,
}: TransactionSearchInputProps) {
  const [text, setText] = useState('');

  return (
    <View style={{ ...mobileSearchBarStyle, borderBottom: 'none' }}>
      <Search
        value={text}
        onChange={text => {
          setText(text);
          onSearch(text);
        }}
        placeholder={placeholder}
        width="100%"
        height={styles.mobileMinHeight}
        style={mobileSearchInputStyle}
      />
    </View>
  );
}

type TransactionListWithBalancesProps = {
  isLoading: boolean;
  transactions: readonly TransactionEntity[];
  balance:
    | Binding<'account', 'onbudget-accounts-balance'>
    | Binding<'account', 'offbudget-accounts-balance'>
    | Binding<'account', 'closed-accounts-balance'>
    | Binding<SheetNames, 'uncategorized-balance'>
    | Binding<'category', 'balance'>
    | Binding<'account', 'balance'>
    | Binding<'account', 'accounts-balance'>;
  balanceCleared?:
    | Binding<'category', 'balanceCleared'>
    | Binding<'account', 'balanceCleared'>;
  balanceUncleared?:
    | Binding<'category', 'balanceUncleared'>
    | Binding<'account', 'balanceUncleared'>;
  showRunningBalances?: boolean;
  runningBalances?: Map<TransactionEntity['id'], IntegerAmount>;
  searchPlaceholder: string;
  onSearch: (searchText: string) => void;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onOpenTransaction: (transaction: TransactionEntity) => void;
  onRefresh?: () => void;
  showMakeTransfer?: boolean;
  isReconciling?: boolean;
  onToggleTransactionCleared?: (transaction: TransactionEntity) => void;
  filtered?: boolean;
};

export function TransactionListWithBalances({
  isLoading,
  transactions,
  balance,
  balanceCleared,
  balanceUncleared,
  showRunningBalances,
  runningBalances,
  searchPlaceholder = 'Search...',
  onSearch,
  isLoadingMore,
  onLoadMore,
  onOpenTransaction,
  onRefresh,
  showMakeTransfer = false,
  isReconciling = false,
  onToggleTransactionCleared,
  filtered = false,
}: TransactionListWithBalancesProps) {
  const selectedInst = useSelected('transactions', [...transactions], []);

  return (
    <DisplayPayeeProvider transactions={transactions}>
      <SelectedProvider instance={selectedInst}>
        <View
          style={{
            flexShrink: 0,
            paddingTop: 18,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              rowGap: 6,
              padding: '0 16px',
            }}
          >
            {balanceCleared && balanceUncleared ? (
              <BalanceWithCleared
                balance={balance}
                balanceCleared={balanceCleared}
                balanceUncleared={balanceUncleared}
                alwaysShowCleared={isReconciling}
              />
            ) : (
              <>
                <Balance balance={balance} />
                {filtered && (
                  <View style={{ flexBasis: '100%', alignItems: 'center' }}>
                    <AppliedFiltersChip />
                  </View>
                )}
              </>
            )}
          </View>
          <TransactionSearchInput
            placeholder={searchPlaceholder}
            onSearch={onSearch}
          />
        </View>
        <PullToRefresh
          isPullable={!isLoading && !!onRefresh}
          onRefresh={async () => onRefresh?.()}
          style={{
            '& .ptr__children': {
              display: 'flex',
            },
          }}
        >
          <TransactionList
            isLoading={isLoading}
            transactions={transactions}
            showRunningBalances={showRunningBalances}
            runningBalances={runningBalances}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMore}
            onOpenTransaction={onOpenTransaction}
            showMakeTransfer={showMakeTransfer}
            isReconciling={isReconciling}
            onToggleTransactionCleared={onToggleTransactionCleared}
          />
        </PullToRefresh>
      </SelectedProvider>
    </DisplayPayeeProvider>
  );
}

function AppliedFiltersChip() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.pillBackgroundSelected,
        color: theme.pillTextSelected,
        borderRadius: radius.sm,
        padding: '3px 8px',
      }}
    >
      <SvgFilter width={12} height={12} style={{ flexShrink: 0 }} />
      <Text size="small" style={{ fontWeight: 500 }}>
        <Trans>Filters applied</Trans>
      </Text>
    </View>
  );
}

const TransactionListBalanceCellValue = <
  FieldName extends SheetFields<'account'> | SheetFields<'category'>,
>(
  props: ComponentProps<
    typeof CellValue<
      FieldName extends SheetFields<'account'> ? 'account' : 'category',
      FieldName
    >
  >,
) => {
  return <CellValue {...props} />;
};

type BalanceWithClearedProps = {
  balanceUncleared: NonNullable<
    TransactionListWithBalancesProps['balanceUncleared']
  >;
  balanceCleared: NonNullable<
    TransactionListWithBalancesProps['balanceCleared']
  >;
  balance: TransactionListWithBalancesProps['balance'];
  alwaysShowCleared?: boolean;
};

function BalanceWithCleared({
  balanceUncleared,
  balanceCleared,
  balance,
  alwaysShowCleared = false,
}: BalanceWithClearedProps) {
  const { t } = useTranslation();
  const unclearedAmount = useSheetValue<
    'account' | 'category',
    'balanceUncleared'
  >(balanceUncleared);
  const showCleared = !!unclearedAmount || alwaysShowCleared;

  return (
    <>
      <View
        style={{
          display: !showCleared ? 'none' : undefined,
          order: 1,
          padding: '0 14px',
        }}
      >
        <Label title={t('Cleared')} style={secondaryLabelStyle} />
        <TransactionListBalanceCellValue
          binding={balanceCleared}
          type="financial"
        >
          {props => (
            <CellValueText
              {...props}
              style={secondaryFigureStyle}
              data-testid="transactions-balance-cleared"
            />
          )}
        </TransactionListBalanceCellValue>
      </View>
      <Balance balance={balance} />
      <View
        style={{
          display: !showCleared ? 'none' : undefined,
          order: 1,
          padding: '0 14px',
        }}
      >
        <Label title={t('Uncleared')} style={secondaryLabelStyle} />
        <TransactionListBalanceCellValue
          binding={balanceUncleared}
          type="financial"
        >
          {props => (
            <CellValueText
              {...props}
              style={secondaryFigureStyle}
              data-testid="transactions-balance-uncleared"
            />
          )}
        </TransactionListBalanceCellValue>
      </View>
    </>
  );
}

type BalanceProps = {
  balance: TransactionListWithBalancesProps['balance'];
};

function Balance({ balance }: BalanceProps) {
  const { t } = useTranslation();
  return (
    // The headline balance always leads; the cleared figures sit beneath it.
    <View style={{ flexBasis: '100%', order: 0, alignItems: 'center' }}>
      <Label
        title={t('Balance')}
        style={{ ...secondaryLabelStyle, marginBottom: 4 }}
      />
      <TransactionListBalanceCellValue binding={balance} type="financial">
        {props => (
          <CellValueText
            {...props}
            style={{
              ...styles.display,
              fontSize: 32,
              lineHeight: '38px',
              fontWeight: 300,
              whiteSpace: 'nowrap',
              textAlign: 'center',
              color:
                props.value < 0
                  ? theme.numberNegative
                  : props.value > 0
                    ? theme.pageText
                    : theme.numberNeutral,
            }}
            data-testid="transactions-balance"
          />
        )}
      </TransactionListBalanceCellValue>
    </View>
  );
}
