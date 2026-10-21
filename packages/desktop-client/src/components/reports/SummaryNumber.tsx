import React from 'react';
import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

import { ReportCardValueSkeleton } from './ReportCardValueSkeleton';

// The figure sits bottom-left in ink and fills at most about three quarters
// of the card width; short values are sized as if they had MIN_SIZED_LENGTH
// characters so sibling cards keep a common scale.
const FONT_SIZE_SCALE_FACTOR = 1.3;
const MIN_SIZED_LENGTH = 8;
const MAX_FONT_SIZE = 32;
const LINE_HEIGHT = 38 / 32;
const CONTAINER_MARGIN = 8;

type SummaryNumberProps = {
  value: number;
  contentType: string;
  suffix?: string;
  loading?: boolean;
};

export function SummaryNumber({
  value,
  contentType,
  suffix = '',
  loading = true,
}: SummaryNumberProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const isNumericValue = Number.isFinite(value);

  let displayAmount =
    contentType === 'percentage'
      ? format(Math.abs(value), 'number')
      : format(Math.abs(Math.round(value)), 'financial');

  displayAmount += suffix;

  // Keep the sign in the figure itself, not only in its color.
  const signedAmount =
    isNumericValue && value < 0 ? `-${displayAmount}` : displayAmount;
  const sizedLength = Math.max(signedAmount.length, MIN_SIZED_LENGTH);

  const fontSize = `min(${(FONT_SIZE_SCALE_FACTOR * 100) / sizedLength}cqi, calc(100cqb - ${CONTAINER_MARGIN * 2}px), ${MAX_FONT_SIZE}px)`;

  return (
    <>
      {loading && <ReportCardValueSkeleton />}
      {!loading && (
        <View
          aria-label={
            !isNumericValue
              ? t('Unknown amount')
              : value === 0
                ? t('Zero amount')
                : value < 0
                  ? t('Negative amount: {{amount}}', { amount: displayAmount })
                  : t('Positive amount: {{amount}}', { amount: displayAmount })
          }
          style={{
            alignItems: 'flex-start',
            flexGrow: 1,
            flexShrink: 1,
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            containerType: 'size',
            margin: `${CONTAINER_MARGIN}px 0`,
            justifyContent: 'flex-end',
            color: theme.pageText,
          }}
        >
          <FinancialText
            aria-hidden="true"
            style={{
              ...styles.display,
              fontSize,
              fontWeight: 300,
              lineHeight: LINE_HEIGHT,
              letterSpacing: '-0.015em',
              whiteSpace: 'nowrap',
            }}
          >
            <PrivacyFilter>{signedAmount}</PrivacyFilter>
          </FinancialText>
        </View>
      )}
    </>
  );
}
