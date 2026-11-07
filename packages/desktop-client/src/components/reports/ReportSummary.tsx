import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type {
  balanceTypeOpType,
  DataEntity,
} from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useDateFormat } from '#hooks/useDateFormat';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';

import { getIntervalFormat, ReportOptions } from './ReportOptions';

type ReportSummaryProps = {
  startDate: string;
  endDate: string;
  data: DataEntity;
  balanceTypeOp: balanceTypeOpType;
  interval: string;
  intervalsCount: number;
};

const summaryBlockStyle: CSSProperties = {
  paddingTop: 14,
  paddingBottom: 14,
  borderTop: `1px solid ${theme.hairlineSubtle}`,
};

const summaryLabelStyle: CSSProperties = {
  ...styles.monoLabel,
  color: theme.pageTextSubdued,
  marginBottom: 6,
};

const summaryCaptionStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: '16px',
  color: theme.pageTextSubdued,
  marginTop: 2,
};

export function ReportSummary({
  startDate,
  endDate,
  data,
  balanceTypeOp,
  interval,
  intervalsCount,
}: ReportSummaryProps) {
  const locale = useLocale();
  const { t } = useTranslation();
  const format = useFormat();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const intervalFormat = getIntervalFormat(interval, dateFormat);

  const net =
    balanceTypeOp === 'netAssets'
      ? t('DEPOSIT')
      : balanceTypeOp === 'netDebts'
        ? t('PAYMENT')
        : Math.abs(data.totalDebts) > Math.abs(data.totalAssets)
          ? t('PAYMENT')
          : t('DEPOSIT');
  const average = Math.round(data[balanceTypeOp] / intervalsCount);
  return (
    <View
      style={{
        flexDirection: 'column',
        marginBottom: 16,
      }}
    >
      <View style={{ paddingBottom: 14 }}>
        <Text
          style={{
            fontSize: 13,
            lineHeight: '18px',
            fontWeight: 600,
            color: theme.pageText,
          }}
        >
          {monthUtils.format(startDate, intervalFormat, locale)}
          {monthUtils.format(startDate, intervalFormat, locale) !==
            monthUtils.format(endDate, intervalFormat, locale) &&
            ` ${t('to')} ` + monthUtils.format(endDate, intervalFormat, locale)}
        </Text>
      </View>
      <View style={summaryBlockStyle}>
        <Text style={summaryLabelStyle}>
          {balanceTypeOp === 'totalDebts'
            ? t('TOTAL SPENDING')
            : balanceTypeOp === 'totalAssets'
              ? t('TOTAL DEPOSITS')
              : balanceTypeOp === 'totalBudgeted'
                ? t('TOTAL BUDGETED')
                : t('NET {{net}}', { net })}
        </Text>
        <FinancialText
          style={{
            ...styles.display,
            fontSize: 30,
            lineHeight: '36px',
            fontWeight: 300,
            letterSpacing: '-0.015em',
          }}
        >
          <PrivacyFilter>
            {format(data[balanceTypeOp], 'financial')}
          </PrivacyFilter>
        </FinancialText>
        <Text style={summaryCaptionStyle}>
          <Trans>For this time period</Trans>
        </Text>
      </View>
      <View style={summaryBlockStyle}>
        <Text style={summaryLabelStyle}>
          {balanceTypeOp === 'totalDebts'
            ? t('AVERAGE SPENDING')
            : balanceTypeOp === 'totalAssets'
              ? t('AVERAGE DEPOSIT')
              : balanceTypeOp === 'totalBudgeted'
                ? t('AVERAGE BUDGETED')
                : t('AVERAGE NET')}
        </Text>
        <FinancialText
          style={{ fontSize: 18, lineHeight: '26px', fontWeight: 500 }}
        >
          <PrivacyFilter>
            {!isNaN(average) && format(average, 'financial')}
          </PrivacyFilter>
        </FinancialText>
        <Text style={summaryCaptionStyle}>
          <Trans>
            Per{' '}
            {{
              interval: (
                ReportOptions.intervalMap.get(interval) || ''
              ).toLowerCase(),
            }}
          </Trans>
        </Text>
      </View>
    </View>
  );
}
