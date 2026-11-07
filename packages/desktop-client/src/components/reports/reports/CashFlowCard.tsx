import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';
import type { CashFlowWidget } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import {
  cardChartInset,
  cardHeaderStyle,
  cardHeadlineStyle,
  chartBarRadius,
  chartBaselineColor,
} from '#components/reports/chart-theme';
import { DateRange } from '#components/reports/DateRange';
import { LoadingIndicator } from '#components/reports/LoadingIndicator';
import { ReportCard } from '#components/reports/ReportCard';
import { ReportCardName } from '#components/reports/ReportCardName';
import { calculateTimeRange } from '#components/reports/reportRanges';
import { simpleCashFlow } from '#components/reports/spreadsheets/cash-flow-spreadsheet';
import { useReport } from '#components/reports/useReport';
import { useFormat } from '#hooks/useFormat';

import { defaultTimeFrame } from './CashFlow';
import { CashFlowLegendRow } from './CashFlowLegendRow';
import type { CashFlowEntry } from './CashFlowLegendRow';

const BAR_WIDTH = 28;
const BAR_OPACITY = 0.85;
const barRadius = chartBarRadius.map(corner => `${corner}px`).join(' ');

// Bars share one scale; a negative flow (refunds above spending) draws none.
function getBarHeightPercent(value: number, largestFlow: number): number {
  if (largestFlow <= 0) {
    return 0;
  }
  return (Math.max(value, 0) / largestFlow) * 100;
}

type CashFlowCardProps = {
  widgetId: string;
  isEditing?: boolean;
  meta?: CashFlowWidget['meta'];
  onMetaChange: (newMeta: CashFlowWidget['meta']) => void;
};

export function CashFlowCard({
  widgetId,
  isEditing,
  meta = {},
  onMetaChange,
}: CashFlowCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const [latestTransaction, setLatestTransaction] = useState<string>('');
  const [nameMenuOpen, setNameMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchLatestTransaction() {
      const latestTrans = await send('get-latest-transaction');
      setLatestTransaction(
        latestTrans ? latestTrans.date : monthUtils.currentDay(),
      );
    }
    void fetchLatestTransaction();
  }, []);

  const [start, end] = calculateTimeRange(
    meta?.timeFrame,
    defaultTimeFrame,
    latestTransaction,
  );

  const params = useMemo(
    () => simpleCashFlow(start, end, meta?.conditions, meta?.conditionsOp),
    [start, end, meta?.conditions, meta?.conditionsOp],
  );
  const data = useReport('cash_flow_simple', params);

  const [isCardHovered, setIsCardHovered] = useState(false);
  const onCardHover = useCallback(() => setIsCardHovered(true), []);
  const onCardHoverEnd = useCallback(() => setIsCardHovered(false), []);

  const { graphData } = data || {};
  const expenses = -(graphData?.expense || 0);
  const income = graphData?.income || 0;

  const flows: CashFlowEntry[] = [
    {
      key: 'income',
      label: t('Income'),
      value: income,
      color: theme.reportsNumberPositive,
    },
    {
      key: 'expenses',
      label: t('Expenses'),
      value: expenses,
      color: theme.reportsNumberNegative,
    },
  ];
  const largestFlow = Math.max(income, expenses);

  return (
    <ReportCard
      widgetId={widgetId}
      isEditing={isEditing}
      disableClick={nameMenuOpen}
      to={`/reports/cash-flow/${widgetId}`}
      onRename={() => setNameMenuOpen(true)}
    >
      <View
        style={{ flex: 1 }}
        onPointerEnter={onCardHover}
        onPointerLeave={onCardHoverEnd}
      >
        <View style={cardHeaderStyle}>
          <View style={{ flex: 1 }}>
            <ReportCardName
              name={meta?.name || t('Cash Flow')}
              isEditing={nameMenuOpen}
              onChange={newName => {
                onMetaChange({
                  ...meta,
                  name: newName,
                });
                setNameMenuOpen(false);
              }}
              onClose={() => setNameMenuOpen(false)}
            />
            <DateRange start={start} end={end} />
          </View>
          {data && (
            <View style={{ textAlign: 'right' }}>
              <PrivacyFilter activationFilters={[!isCardHovered]}>
                <FinancialText style={cardHeadlineStyle}>
                  {format(income - expenses, 'financial-with-sign')}
                </FinancialText>
              </PrivacyFilter>
            </View>
          )}
        </View>

        {data ? (
          <View
            style={{
              flex: 1,
              minHeight: 0,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 24,
              ...cardChartInset,
            }}
          >
            <View
              aria-hidden="true"
              style={{
                alignSelf: 'stretch',
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 8,
                borderBottom: `1px solid ${chartBaselineColor}`,
              }}
            >
              {flows.map(flow => (
                <View
                  key={flow.key}
                  style={{
                    width: BAR_WIDTH,
                    height: `${getBarHeightPercent(flow.value, largestFlow)}%`,
                    borderRadius: barRadius,
                    backgroundColor: flow.color,
                    opacity: BAR_OPACITY,
                  }}
                />
              ))}
            </View>
            <View
              style={{ flexBasis: 200, flexShrink: 1, minWidth: 0, gap: 6 }}
            >
              {flows.map(flow => (
                <CashFlowLegendRow
                  key={flow.key}
                  entry={flow}
                  swatchOpacity={BAR_OPACITY}
                />
              ))}
            </View>
          </View>
        ) : (
          <LoadingIndicator />
        )}
      </View>
    </ReportCard>
  );
}
