import React, { useRef } from 'react';
import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgArrowButtonRight1 } from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { q } from '@actual-app/core/shared/query';
import type { Query } from '@actual-app/core/shared/query';
import { getScheduledAmount } from '@actual-app/core/shared/schedules';
import { isPreviewId } from '@actual-app/core/shared/transactions';
import type { AccountEntity } from '@actual-app/core/types/models';
import { useHover } from 'usehooks-ts';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { CellValue, CellValueText } from '#components/spreadsheet/CellValue';
import { useCachedSchedules } from '#hooks/useCachedSchedules';
import { useFormat } from '#hooks/useFormat';
import { useSelectedItems } from '#hooks/useSelected';
import { useSheetValue } from '#hooks/useSheetValue';
import type { Binding } from '#spreadsheet';

type DetailedBalanceProps = {
  name: string;
  balance: number;
  isExactBalance?: boolean;
  valueColor?: string;
};

// One reading on the instrument strip beside the headline balance: a small
// mono label over a hairline divider, then the figure.
function DetailedBalance({
  name,
  balance,
  isExactBalance = true,
  valueColor = theme.pageText,
}: DetailedBalanceProps) {
  const format = useFormat();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        paddingLeft: 16,
        borderLeft: '1px solid ' + theme.hairline,
      }}
    >
      <Text style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
        {name}
      </Text>
      <PrivacyFilter>
        <FinancialText
          style={{ fontSize: 13, fontWeight: 500, color: valueColor }}
        >
          {!isExactBalance && '~ '}
          {format(balance, 'financial')}
        </FinancialText>
      </PrivacyFilter>
    </View>
  );
}

type SelectedBalanceProps = {
  selectedItems: Set<string>;
  account?: AccountEntity;
};

export function SelectedBalance({
  selectedItems,
  account,
}: SelectedBalanceProps) {
  const { t } = useTranslation();

  const name = `selected-balance-${[...selectedItems].join('-')}`;

  const rows = useSheetValue<'balance', `selected-transactions-${string}`>({
    name: name as `selected-transactions-${string}`,
    query: q('transactions')
      .filter({
        id: { $oneof: [...selectedItems] },
        parent_id: { $oneof: [...selectedItems] },
      })
      .select('id'),
  });
  const ids = new Set((rows || []).map((r: { id: string }) => r.id));

  const finalIds = [...selectedItems].filter(id => !ids.has(id));
  let balance = useSheetValue<'balance', `selected-balance-${string}`>({
    name: (name + '-sum') as `selected-balance-${string}`,
    query: q('transactions')
      .filter({ id: { $oneof: finalIds } })
      .options({ splits: 'all' })
      .calculate({ $sum: '$amount' }),
  });

  let scheduleBalance = 0;

  const { isLoading, schedules = [] } = useCachedSchedules();

  if (isLoading) {
    return null;
  }

  let isExactBalance = true;

  for (const id of [...selectedItems].filter(isPreviewId)) {
    // Preview IDs are in the format `preview/<schedule_id>/<date>`
    const scheduleId = id.slice(8).split('/')[0];
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      // If a schedule is `between X and Y` then we calculate the average
      if (schedule._amountOp === 'isbetween') {
        isExactBalance = false;
      }

      if (!account || account.id === schedule._account) {
        scheduleBalance += getScheduledAmount(schedule._amount);
      } else {
        scheduleBalance -= getScheduledAmount(schedule._amount);
      }
    }
  }

  if (typeof balance !== 'number' && !scheduleBalance) {
    return null;
  } else {
    balance = (balance ?? 0) + scheduleBalance;
  }

  return (
    <DetailedBalance
      name={t('Selected balance:')}
      balance={balance}
      isExactBalance={isExactBalance}
      valueColor={theme.accentText}
    />
  );
}

type FilteredBalanceProps = {
  filteredAmount?: number | null;
};

function FilteredBalance({ filteredAmount }: FilteredBalanceProps) {
  const { t } = useTranslation();

  return (
    <DetailedBalance
      name={t('Filtered balance:')}
      balance={filteredAmount ?? 0}
      isExactBalance
    />
  );
}

type MoreBalancesProps = {
  balanceQuery: { name: `balance-query-${string}`; query: Query };
};

function MoreBalances({ balanceQuery }: MoreBalancesProps) {
  const { t } = useTranslation();

  const cleared = useSheetValue<'balance', `balance-query-${string}-cleared`>({
    name: (balanceQuery.name + '-cleared') as `balance-query-${string}-cleared`,
    query: balanceQuery.query.filter({ cleared: true }),
  });
  const uncleared = useSheetValue<
    'balance',
    `balance-query-${string}-uncleared`
  >({
    name: (balanceQuery.name +
      '-uncleared') as `balance-query-${string}-uncleared`,
    query: balanceQuery.query.filter({ cleared: false }),
  });

  return (
    <>
      <DetailedBalance name={t('Cleared total:')} balance={cleared ?? 0} />
      <DetailedBalance name={t('Uncleared total:')} balance={uncleared ?? 0} />
    </>
  );
}

type BalancesProps = {
  balanceQuery: { name: `balance-query-${string}`; query: Query };
  showExtraBalances: boolean;
  onToggleExtraBalances: () => void;
  account?: AccountEntity;
  isFiltered: boolean;
  filteredAmount?: number | null;
};

export function Balances({
  balanceQuery,
  showExtraBalances,
  onToggleExtraBalances,
  account,
  isFiltered,
  filteredAmount,
}: BalancesProps) {
  const selectedItems = useSelectedItems();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isButtonHovered = useHover(buttonRef as RefObject<HTMLButtonElement>);

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginLeft: -8,
        rowGap: 6,
        columnGap: 16,
      }}
    >
      <Button
        ref={buttonRef}
        data-testid="account-balance"
        variant="bare"
        onPress={onToggleExtraBalances}
        style={{
          padding: '0 8px',
          borderRadius: radius.md,
        }}
      >
        <CellValue
          binding={
            { ...balanceQuery, value: 0 } as Binding<
              'balance',
              `balance-query-${string}`
            >
          }
          type="financial"
        >
          {props => (
            <CellValueText
              {...props}
              style={{
                ...styles.display,
                fontSize: 30,
                lineHeight: '36px',
                fontWeight: 300,
                letterSpacing: '-0.015em',
                // A balance is a stock, not a gain: ink unless it is owed.
                color:
                  props.value < 0
                    ? theme.numberNegative
                    : props.value === 0
                      ? theme.pageTextSubdued
                      : theme.pageText,
              }}
            />
          )}
        </CellValue>

        <SvgArrowButtonRight1
          style={{
            width: 9,
            height: 9,
            marginLeft: 10,
            color: theme.pageTextSubdued,
            transform: showExtraBalances ? 'rotateZ(180deg)' : 'rotateZ(0)',
            transition: `opacity ${motion.base} ${motion.ease}`,
            opacity:
              isButtonHovered || selectedItems.size > 0 || showExtraBalances
                ? 1
                : 0,
          }}
        />
      </Button>

      {showExtraBalances && <MoreBalances balanceQuery={balanceQuery} />}

      {selectedItems.size > 0 && (
        <SelectedBalance selectedItems={selectedItems} account={account} />
      )}
      {isFiltered && <FilteredBalance filteredAmount={filteredAmount} />}
    </View>
  );
}
