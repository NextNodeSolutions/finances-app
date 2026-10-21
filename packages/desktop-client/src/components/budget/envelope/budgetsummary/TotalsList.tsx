import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Trans } from 'react-i18next';

import { AlignedText } from '@actual-app/components/aligned-text';
import { Block } from '@actual-app/components/block';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';

import { EnvelopeCellValue } from '#components/budget/envelope/EnvelopeBudgetComponents';
import { summaryLedgerStyle } from '#components/budget/SummaryCard';
import { CellValueText } from '#components/spreadsheet/CellValue';
import { useFormat } from '#hooks/useFormat';
import type { FormatType } from '#hooks/useFormat';
import { envelopeBudget } from '#spreadsheet/bindings';

/**
 * Creates a formatter that displays values with explicit +/- signs.
 * Uses Math.abs to avoid double-negative display (e.g., "--$0.00").
 *
 * @param format - The format function from useFormat hook
 * @param invert - If true, shows '-' for positive and '+' for negative
 */
function makeSignedFormatter(
  format: ReturnType<typeof useFormat>,
  invert = false,
) {
  return (value: number, type?: FormatType) => {
    const v = format(Math.abs(value), type);
    // Zero carries no sign: a statement never prints "-0.00".
    if (value === 0) {
      return v;
    }
    const isPositive = value > 0;
    return invert
      ? isPositive
        ? '-' + v
        : '+' + v
      : isPositive
        ? '+' + v
        : '-' + v;
  };
}

// One ruled stat line: label on the left, its figure on the right.
function TotalsRow({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        minHeight: 28,
      }}
    >
      <Block style={{ color: theme.pageTextLight }}>{label}</Block>
      <View style={{ textAlign: 'right', flexShrink: 0 }}>{children}</View>
    </View>
  );
}

// Zero recedes, as it does in the budget table.
function getFigureStyle(value: unknown): CSSProperties {
  return {
    fontWeight: 500,
    color: value === 0 ? theme.tableTextSubdued : theme.pageText,
  };
}

type TotalsListProps = {
  prevMonthName: string;
  style?: CSSProperties;
};

export function TotalsList({ prevMonthName, style }: TotalsListProps) {
  const format = useFormat();
  const signedFormatter = makeSignedFormatter(format);
  const invertedSignedFormatter = makeSignedFormatter(format, true);
  return (
    <View
      style={{
        lineHeight: 1.5,
        ...styles.smallText,
        ...summaryLedgerStyle,
        ...style,
      }}
    >
      <TotalsRow label={<Trans>Available funds</Trans>}>
        <Tooltip
          style={{ ...styles.tooltip, lineHeight: 1.5 }}
          content={
            <>
              <AlignedText
                left="Income:"
                right={
                  <EnvelopeCellValue
                    binding={envelopeBudget.totalIncome}
                    type="financial"
                  />
                }
              />
              <AlignedText
                left="From Last Month:"
                right={
                  <EnvelopeCellValue
                    binding={envelopeBudget.fromLastMonth}
                    type="financial"
                  />
                }
              />
            </>
          }
          placement="bottom end"
        >
          <EnvelopeCellValue
            binding={envelopeBudget.incomeAvailable}
            type="financial"
          >
            {props => (
              <CellValueText {...props} style={getFigureStyle(props.value)} />
            )}
          </EnvelopeCellValue>
        </Tooltip>
      </TotalsRow>

      <TotalsRow label={<Trans>Overspent in {{ prevMonthName }}</Trans>}>
        <EnvelopeCellValue
          binding={envelopeBudget.lastMonthOverspent}
          type="financial"
        >
          {props => (
            <CellValueText
              {...props}
              style={getFigureStyle(props.value)}
              formatter={signedFormatter}
            />
          )}
        </EnvelopeCellValue>
      </TotalsRow>

      <TotalsRow label={<Trans>Budgeted</Trans>}>
        <EnvelopeCellValue
          binding={envelopeBudget.totalBudgeted}
          type="financial"
        >
          {props => (
            <CellValueText
              {...props}
              style={getFigureStyle(props.value)}
              formatter={signedFormatter}
            />
          )}
        </EnvelopeCellValue>
      </TotalsRow>

      <TotalsRow label={<Trans>For next month</Trans>}>
        <EnvelopeCellValue
          binding={envelopeBudget.forNextMonth}
          type="financial"
        >
          {props => (
            <CellValueText
              {...props}
              style={getFigureStyle(props.value)}
              formatter={invertedSignedFormatter}
            />
          )}
        </EnvelopeCellValue>
      </TotalsRow>
    </View>
  );
}
