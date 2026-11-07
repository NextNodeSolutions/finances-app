import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { SpendingWidget } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import {
  cardChartInset,
  cardHeaderStyle,
  cardHeadlineStyle,
} from '#components/reports/chart-theme';
import { DateRange } from '#components/reports/DateRange';
import { DeltaLine } from '#components/reports/DeltaLine';
import { SpendingGraph } from '#components/reports/graphs/SpendingGraph';
import { LoadingIndicator } from '#components/reports/LoadingIndicator';
import { ReportCard } from '#components/reports/ReportCard';
import { ReportCardName } from '#components/reports/ReportCardName';
import { calculateSpendingReportTimeRange } from '#components/reports/reportRanges';
import {
  getSpendingAverageRangeLabel,
  normalizeSpendingAverageRange,
} from '#components/reports/spendingAverageRange';
import { createSpendingSpreadsheet } from '#components/reports/spreadsheets/spending-spreadsheet';
import { useReport } from '#components/reports/useReport';
import { useFormat } from '#hooks/useFormat';
import { useSyncedPref } from '#hooks/useSyncedPref';

type SpendingCardProps = {
  widgetId: string;
  isEditing?: boolean;
  meta?: SpendingWidget['meta'];
  onMetaChange: (newMeta: SpendingWidget['meta']) => void;
};

export function SpendingCard({
  widgetId,
  isEditing,
  meta = {},
  onMetaChange,
}: SpendingCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const [budgetTypePref] = useSyncedPref('budgetType');
  const budgetType: 'envelope' | 'tracking' =
    budgetTypePref === 'tracking' ? 'tracking' : 'envelope';

  const [isCardHovered, setIsCardHovered] = useState(false);
  const [nameMenuOpen, setNameMenuOpen] = useState(false);

  const spendingReportMode = meta?.mode ?? 'single-month';
  const averageRange = normalizeSpendingAverageRange(meta?.averageRange);
  const averageRangeLabel = getSpendingAverageRangeLabel(averageRange, t);

  const [compare, compareTo] = calculateSpendingReportTimeRange(meta ?? {});

  const selection =
    spendingReportMode === 'single-month' ? 'compareTo' : spendingReportMode;
  const getGraphData = useMemo(() => {
    return createSpendingSpreadsheet({
      conditions: meta?.conditions,
      conditionsOp: meta?.conditionsOp,
      compare,
      compareTo,
      averageRange,
      budgetType,
    });
  }, [
    meta?.conditions,
    meta?.conditionsOp,
    compare,
    compareTo,
    averageRange,
    budgetType,
  ]);

  const data = useReport('default', getGraphData);
  const todayDay =
    compare !== monthUtils.currentMonth()
      ? 27
      : monthUtils.getDay(monthUtils.currentDay()) - 1 >= 28
        ? 27
        : monthUtils.getDay(monthUtils.currentDay()) - 1;
  const difference =
    data &&
    Math.round(
      data.intervalData[todayDay][selection] -
        data.intervalData[todayDay].compare,
    );
  // How far this month's spending sits from the comparison, as a share of
  // the comparison. Spending more is the bad side.
  const isSpendingMore = (difference ?? 0) > 0;
  const comparisonSpent =
    data && Math.abs(data.intervalData[todayDay][selection]);
  const differenceShare =
    difference && comparisonSpent
      ? Math.round((Math.abs(difference) / comparisonSpent) * 100)
      : null;

  return (
    <ReportCard
      widgetId={widgetId}
      isEditing={isEditing}
      disableClick={nameMenuOpen}
      to={`/reports/spending/${widgetId}`}
      onRename={() => setNameMenuOpen(true)}
    >
      <View
        style={{ flex: 1 }}
        onPointerEnter={() => setIsCardHovered(true)}
        onPointerLeave={() => setIsCardHovered(false)}
      >
        <View style={cardHeaderStyle}>
          <View style={{ flex: 1 }}>
            <ReportCardName
              name={meta?.name || t('Monthly Spending')}
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
            <DateRange
              start={compare}
              end={compareTo}
              type={spendingReportMode}
              comparisonLabel={
                spendingReportMode === 'average' ? averageRangeLabel : undefined
              }
            />
          </View>
          {data && (
            <View style={{ alignItems: 'flex-end' }}>
              <PrivacyFilter activationFilters={[!isCardHovered]}>
                <FinancialText style={cardHeadlineStyle}>
                  {(difference && difference > 0 ? '+' : '') +
                    format(difference || 0, 'financial')}
                </FinancialText>
              </PrivacyFilter>
              {differenceShare !== null && (
                <PrivacyFilter activationFilters={[!isCardHovered]}>
                  <DeltaLine
                    direction={isSpendingMore ? 'up' : 'down'}
                    color={
                      isSpendingMore
                        ? theme.reportsNumberNegative
                        : theme.reportsNumberPositive
                    }
                    style={{ marginTop: 2 }}
                  >
                    {format(differenceShare, 'percentage')}
                  </DeltaLine>
                </PrivacyFilter>
              )}
            </View>
          )}
        </View>
        {data ? (
          <SpendingGraph
            style={{ flex: 1, ...cardChartInset }}
            compact
            data={data}
            mode={spendingReportMode}
            compare={compare}
            compareTo={compareTo}
          />
        ) : (
          <LoadingIndicator />
        )}
      </View>
    </ReportCard>
  );
}
