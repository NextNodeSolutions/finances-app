// @ts-strict-ignore
import React, { useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDotsHorizontalTriple } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { format as monthUtilFormat } from '@actual-app/core/shared/months';
import { getNormalisedString } from '@actual-app/core/shared/normalisation';
import { getScheduledAmount } from '@actual-app/core/shared/schedules';
import type { ScheduleStatuses } from '@actual-app/core/shared/schedules';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { Cell, Field, Row, Table, TableHeader } from '#components/table';
import { DisplayId } from '#components/util/DisplayId';
import { useAccounts } from '#hooks/useAccounts';
import { useContextMenu } from '#hooks/useContextMenu';
import { useDateFormat } from '#hooks/useDateFormat';
import { useFormat } from '#hooks/useFormat';
import { usePayees } from '#hooks/usePayees';

import { getRepeatsLabel } from './getRepeatsLabel';
import type { ScheduleItemAction } from './panels/runScheduleAction';
import { ScheduleSkeletonRows } from './ScheduleSkeletonRows';
import { StatusBadge } from './StatusBadge';

export type { ScheduleItemAction } from './panels/runScheduleAction';

type SchedulesTableProps = {
  isLoading?: boolean;
  schedules: readonly ScheduleEntity[];
  statuses: ScheduleStatuses;
  filter: string;
  /** Show completed schedules too; callers choose which ones to pass. */
  allowCompleted: boolean;
  onSelect: (id: ScheduleEntity['id']) => void;
  /** The schedule whose details are open, highlighted in the table. */
  selectedId?: ScheduleEntity['id'] | null;
  /** Shown when no schedule passes the filters. */
  emptyMessage?: string;
  style: CSSProperties;
  tableStyle?: CSSProperties;
} & (
  | {
      minimal: true;
      onAction?: never;
    }
  | {
      minimal?: false;
      onAction: (
        actionName: ScheduleItemAction,
        id: ScheduleEntity['id'],
      ) => void;
    }
);

export const ROW_HEIGHT = 43;

const amountQualifierStyle = {
  ...styles.tnum,
  textAlign: 'left',
  color: theme.pageTextSubdued,
  lineHeight: '1em',
  marginRight: 6,
} as const;

export function ScheduleAmountCell({
  amount,
  op,
}: {
  amount: ScheduleEntity['_amount'];
  op: ScheduleEntity['_amountOp'];
}) {
  const { t } = useTranslation();
  const format = useFormat();

  const num = getScheduledAmount(amount);
  const currencyAmount = format(Math.abs(num || 0), 'financial');
  const isApprox = op === 'isapprox';
  const isBetween = op === 'isbetween';
  let cellText = '';
  if (isApprox) {
    cellText = t('Approximately {{currencyAmount}}', {
      currencyAmount,
    });
  } else if (isBetween && typeof amount != 'number') {
    cellText = t('{{currency1}} to {{currency2}}', {
      currency1: format(Math.abs(amount.num1 || 0), 'financial'),
      currency2: format(Math.abs(amount.num2 || 0), 'financial'),
    });
  } else {
    cellText = currencyAmount;
  }
  return (
    <Cell
      width={100}
      plain
      style={{
        textAlign: 'right',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 5px',
      }}
      name="amount"
    >
      {isApprox && (
        <View style={amountQualifierStyle} title={cellText}>
          ~
        </View>
      )}
      {isBetween && (
        <View style={amountQualifierStyle} title={cellText}>
          ±
        </View>
      )}
      <FinancialText
        style={{
          minWidth: 0,
          color: num > 0 ? theme.numberPositive : theme.tableText,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={cellText}
      >
        <PrivacyFilter>
          {num > 0 ? `+${currencyAmount}` : `${currencyAmount}`}
        </PrivacyFilter>
      </FinancialText>
    </Cell>
  );
}

function ScheduleRow({
  schedule,
  onAction,
  onSelect,
  minimal,
  statuses,
  dateFormat,
  isSelected,
}: {
  schedule: ScheduleEntity;
  dateFormat: string;
  isSelected: boolean;
} & Pick<
  SchedulesTableProps,
  'onSelect' | 'onAction' | 'minimal' | 'statuses'
>) {
  const { t } = useTranslation();

  const rowRef = useRef(null);
  const buttonRef = useRef(null);

  const status = statuses.get(schedule.id);
  useContextMenu({
    triggerRef: rowRef,
    items: !minimal
      ? [
          {
            name: 'post-transaction',
            text: t('Post transaction'),
            onClick: () => onAction('post-transaction', schedule.id),
          },
          {
            name: 'post-transaction-today',
            text: t('Post transaction today'),
            onClick: () => onAction('post-transaction-today', schedule.id),
          },
          {
            name: 'restart',
            text: t('Restart'),
            onClick: () => onAction('restart', schedule.id),
            hidden: status !== 'completed',
          },
          {
            name: 'skip',
            text: t('Skip next scheduled date'),
            onClick: () => onAction('skip', schedule.id),
            hidden: status === 'completed',
          },
          {
            name: 'complete',
            text: t('Complete'),
            onClick: () => onAction('complete', schedule.id),
            hidden: status === 'completed',
          },
          {
            name: 'delete',
            text: t('Delete'),
            onClick: () => onAction('delete', schedule.id),
          },
        ]
      : [],
  });

  return (
    <Row
      ref={rowRef}
      height={ROW_HEIGHT}
      inset={15}
      onClick={() => onSelect(schedule.id)}
      aria-current={isSelected || undefined}
      style={{
        cursor: 'pointer',
        backgroundColor: isSelected
          ? theme.tableRowBackgroundHighlight
          : theme.tableBackground,
        color: theme.tableText,
        ':hover': {
          backgroundColor: isSelected
            ? theme.tableRowBackgroundHighlight
            : theme.tableRowBackgroundHover,
        },
      }}
    >
      <Field width="flex" name="name">
        <Text
          style={
            schedule.name == null
              ? { color: theme.tableTextLight }
              : { color: theme.pageText }
          }
          title={schedule.name ? schedule.name : ''}
        >
          {schedule.name ? schedule.name : t('None')}
        </Text>
      </Field>
      <Field width="flex" name="payee">
        <DisplayId type="payees" id={schedule._payee} />
      </Field>
      <Field width="flex" name="account">
        <DisplayId type="accounts" id={schedule._account} />
      </Field>
      <Field width={110} name="date" style={styles.tnum}>
        {schedule.next_date
          ? monthUtilFormat(schedule.next_date, dateFormat)
          : null}
      </Field>
      <Field width={120} name="status" style={{ alignItems: 'flex-start' }}>
        <StatusBadge status={statuses.get(schedule.id)} />
      </Field>
      <ScheduleAmountCell amount={schedule._amount} op={schedule._amountOp} />
      {!minimal && (
        <Field
          width={110}
          name="repeats"
          style={{ color: theme.tableTextLight }}
        >
          {getRepeatsLabel(schedule._date, t) ?? '—'}
        </Field>
      )}
      {!minimal && (
        <Field width={40} name="actions">
          <View>
            <Button
              ref={buttonRef}
              variant="bare"
              aria-label={t('Menu')}
              style={{ color: theme.pageTextLight }}
              onPress={() => {
                if (rowRef.current) {
                  const rect = buttonRef.current?.getBoundingClientRect();
                  const clientX = rect ? rect.left : 0;
                  const clientY = rect ? rect.bottom : 0;
                  (rowRef.current as HTMLElement).dispatchEvent(
                    new MouseEvent('contextmenu', {
                      bubbles: true,
                      clientX,
                      clientY,
                    }),
                  );
                }
              }}
            >
              <SvgDotsHorizontalTriple
                width={15}
                height={15}
                style={{ transform: 'rotateZ(90deg)' }}
              />
            </Button>
          </View>
        </Field>
      )}
    </Row>
  );
}

export function SchedulesTable({
  isLoading,
  schedules,
  statuses,
  filter,
  minimal,
  allowCompleted,
  selectedId,
  emptyMessage,
  style,
  onSelect,
  onAction,
  tableStyle,
}: SchedulesTableProps) {
  const { t } = useTranslation();
  const format = useFormat();

  const dateFormat = useDateFormat() || 'MM/dd/yyyy';

  const { data: payees } = usePayees();
  const { data: accounts = [] } = useAccounts();

  const filteredSchedules = useMemo(() => {
    if (!filter) {
      return schedules;
    }
    const filterIncludes = (str: string) =>
      str
        ? getNormalisedString(str).includes(getNormalisedString(filter)) ||
          getNormalisedString(filter).includes(getNormalisedString(str))
        : false;

    return schedules.filter(schedule => {
      const payee = payees.find(p => schedule._payee === p.id);
      const account = accounts.find(a => schedule._account === a.id);
      const amount = getScheduledAmount(schedule._amount);
      let amountStr = '';
      if (schedule._amountOp === 'isbetween') {
        amountStr = '±';
      } else if (schedule._amountOp === 'isapprox') {
        amountStr = '~';
      }
      amountStr +=
        (amount > 0 ? '+' : '') + format(Math.abs(amount || 0), 'financial');
      const dateStr = schedule.next_date
        ? monthUtilFormat(schedule.next_date, dateFormat)
        : null;

      return (
        filterIncludes(schedule.name) ||
        filterIncludes(payee && payee.name) ||
        filterIncludes(account && account.name) ||
        filterIncludes(amountStr) ||
        filterIncludes(statuses.get(schedule.id)) ||
        filterIncludes(dateStr)
      );
    });
  }, [payees, accounts, schedules, filter, statuses, format, dateFormat]);

  const items = allowCompleted
    ? filteredSchedules
    : filteredSchedules.filter(schedule => !schedule.completed);

  function renderItem({ item }: { item: ScheduleEntity }) {
    return (
      <ScheduleRow
        schedule={item}
        isSelected={item.id === selectedId}
        {...{ statuses, dateFormat, onSelect, onAction, minimal }}
      />
    );
  }

  return (
    <View style={{ ...styles.tableContainer, ...tableStyle }}>
      <TableHeader inset={15}>
        <Field width="flex">
          <Trans>Name</Trans>
        </Field>
        <Field width="flex">
          <Trans>Payee</Trans>
        </Field>
        <Field width="flex">
          <Trans>Account</Trans>
        </Field>
        <Field width={110}>
          <Trans>Next date</Trans>
        </Field>
        <Field width={120}>
          <Trans>Status</Trans>
        </Field>
        <Field width={100} style={{ textAlign: 'right' }}>
          <Trans>Amount</Trans>
        </Field>
        {!minimal && (
          <Field width={110}>
            <Trans>Repeats</Trans>
          </Field>
        )}
        {!minimal && <Field width={40} />}
      </TableHeader>
      <Table
        rowHeight={ROW_HEIGHT}
        backgroundColor="transparent"
        style={{ flex: 1, backgroundColor: 'transparent', ...style }}
        items={isLoading ? [] : [...items]}
        renderItem={renderItem}
        renderEmpty={
          isLoading
            ? () => <ScheduleSkeletonRows rowHeight={ROW_HEIGHT} />
            : (emptyMessage ??
              (filter ? t('No matching schedules') : t('No schedules')))
        }
      />
    </View>
  );
}
