import React from 'react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import {
  SvgCalculator,
  SvgCamera,
  SvgChart,
  SvgChartArea,
  SvgChartBar,
  SvgChartPie,
  SvgListBullet,
  SvgQueue,
  SvgTag,
} from '@actual-app/components/icons/v1';
import { ModeButtonGroup } from '@actual-app/components/mode-button';
import { SpaceBetween } from '@actual-app/components/space-between';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type {
  CustomReportEntity,
  RuleConditionEntity,
} from '@actual-app/core/types/models';
import { toPng } from 'html-to-image';

import { FilterButton } from '#components/filters/FiltersMenu';

import { GraphButton } from './GraphButton';
import { SaveReportWrapper } from './SaveReport';
import type { SavedStatus } from './SaveReportMenu';
import { setSessionReport } from './setSessionReport';
import { SnapshotButton } from './SnapshotButton';

type ReportTopbarProps = {
  customReportItems: CustomReportEntity;
  report: CustomReportEntity;
  savedStatus: SavedStatus;
  setGraphType: (value: string) => void;
  viewLegend: boolean;
  viewSummary: boolean;
  viewLabels: boolean;
  onApplyFilter: (newFilter: RuleConditionEntity) => void;
  onChangeViews: (viewType: string) => void;
  onReportChange: ComponentProps<typeof SaveReportWrapper>['onReportChange'];
  isItemDisabled: (type: string) => boolean;
  defaultItems: (item: string) => void;
};

export function ReportTopbar({
  customReportItems,
  report,
  savedStatus,
  setGraphType,
  viewLegend,
  viewSummary,
  viewLabels,
  onApplyFilter,
  onChangeViews,
  onReportChange,
  isItemDisabled,
  defaultItems,
}: ReportTopbarProps) {
  const { t } = useTranslation();
  const onChangeGraph = (cond: string) => {
    setSessionReport('graphType', cond);
    onReportChange({ type: 'modify' });
    setGraphType(cond);
    defaultItems(cond);
  };

  const downloadSnapshot = async () => {
    const reportElement = document.getElementById('custom-report-content');
    const title = report.name;
    if (reportElement) {
      const dataUrl = await toPng(reportElement);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${monthUtils.currentDay()} - ${title}.png`;
      link.click();
    } else {
      console.error('Report container not found.');
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
        paddingRight: 20,
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      <ModeButtonGroup style={{ alignSelf: 'center' }}>
        <GraphButton
          selected={customReportItems.graphType === 'TableGraph'}
          title={t('Data Table')}
          onSelect={() => {
            onChangeGraph('TableGraph');
          }}
          disabled={isItemDisabled('TableGraph')}
        >
          <SvgQueue width={14} height={14} />
        </GraphButton>
        <GraphButton
          title={
            customReportItems.mode === 'total'
              ? t('Bar Graph')
              : t('Stacked Bar Graph')
          }
          selected={
            customReportItems.graphType === 'BarGraph' ||
            customReportItems.graphType === 'StackedBarGraph'
          }
          onSelect={() => {
            onChangeGraph(
              customReportItems.mode === 'total'
                ? 'BarGraph'
                : 'StackedBarGraph',
            );
          }}
          disabled={isItemDisabled(
            customReportItems.mode === 'total' ? 'BarGraph' : 'StackedBarGraph',
          )}
        >
          <SvgChartBar width={14} height={14} />
        </GraphButton>
        <GraphButton
          title={t('Line Graph')}
          selected={customReportItems.graphType === 'LineGraph'}
          onSelect={() => {
            onChangeGraph('LineGraph');
          }}
          disabled={isItemDisabled('LineGraph')}
        >
          <SvgChart width={14} height={14} />
        </GraphButton>
        <GraphButton
          title={t('Area Graph')}
          selected={customReportItems.graphType === 'AreaGraph'}
          onSelect={() => {
            onChangeGraph('AreaGraph');
          }}
          disabled={isItemDisabled('AreaGraph')}
        >
          <SvgChartArea width={14} height={14} />
        </GraphButton>
        <GraphButton
          title={t('Donut Graph')}
          selected={customReportItems.graphType === 'DonutGraph'}
          onSelect={() => {
            onChangeGraph('DonutGraph');
          }}
          disabled={isItemDisabled('DonutGraph')}
        >
          <SvgChartPie width={14} height={14} />
        </GraphButton>
      </ModeButtonGroup>
      <View
        style={{
          width: 1,
          height: 18,
          backgroundColor: theme.hairlineStrong,
          flexShrink: 0,
        }}
      />
      <ModeButtonGroup style={{ alignSelf: 'center' }}>
        <GraphButton
          selected={viewLegend}
          onSelect={() => {
            onChangeViews('viewLegend');
          }}
          title={t('Show Legend')}
          disabled={isItemDisabled('ShowLegend')}
        >
          <SvgListBullet width={14} height={14} />
        </GraphButton>
        <GraphButton
          selected={viewSummary}
          onSelect={() => {
            onChangeViews('viewSummary');
          }}
          title={t('Show Summary')}
        >
          <SvgCalculator width={14} height={14} />
        </GraphButton>
        <GraphButton
          selected={viewLabels}
          onSelect={() => {
            onChangeViews('viewLabels');
          }}
          title={t('Show Labels')}
          disabled={isItemDisabled('ShowLabels')}
        >
          <SvgTag width={14} height={14} />
        </GraphButton>
      </ModeButtonGroup>
      <View
        style={{
          width: 1,
          height: 18,
          backgroundColor: theme.hairlineStrong,
          flexShrink: 0,
        }}
      />
      <SnapshotButton
        title={t('Download Snapshot')}
        onSelect={downloadSnapshot}
      >
        <SvgCamera width={14} height={14} />
      </SnapshotButton>
      <View
        style={{
          width: 1,
          height: 18,
          backgroundColor: theme.hairlineStrong,
          flexShrink: 0,
        }}
      />
      <SpaceBetween
        style={{
          flexWrap: 'nowrap',
          justifyContent: 'space-between',
          flex: 1,
        }}
      >
        <FilterButton
          compact
          hover
          onApply={(e: RuleConditionEntity) => {
            setSessionReport('conditions', [
              ...(customReportItems.conditions ?? []),
              e,
            ]);
            onApplyFilter(e);
            onReportChange({ type: 'modify' });
          }}
          exclude={
            customReportItems.balanceType === 'Budgeted'
              ? [
                  'date',
                  'account',
                  'payee',
                  'notes',
                  'amount',
                  'cleared',
                  'reconciled',
                  'transfer',
                  'saved',
                ]
              : []
          }
        />
        <SaveReportWrapper
          customReportItems={customReportItems}
          report={report}
          savedStatus={savedStatus}
          onReportChange={onReportChange}
        />
      </SpaceBetween>
    </View>
  );
}
