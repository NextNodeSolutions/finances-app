import React, { useMemo } from 'react';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { amountToInteger } from '@actual-app/core/shared/util';

import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

import { ReportCardValueSkeleton } from './ReportCardValueSkeleton';

// Matches SummaryNumber: about two thirds of the card width, capped.
const FONT_SIZE_SCALE_FACTOR = 1.15;
const MIN_SIZED_LENGTH = 8;
const MAX_FONT_SIZE = 44;
const CONTAINER_MARGIN = 8;

type FormulaResultProps = {
  value: number | string | null;
  loading?: boolean;
  error?: string | null;
  fontSizeMode?: 'dynamic' | 'static';
  staticFontSize?: number;
  customColor?: string | null;
};

export function FormulaResult({
  value,
  loading = true,
  error = null,
  fontSizeMode = 'dynamic',
  staticFontSize = 32,
  customColor = null,
}: FormulaResultProps) {
  const format = useFormat();

  // Format the display value - just show what we got
  const displayValue = useMemo(() => {
    if (error) {
      return error;
    } else if (value === null || value === undefined) {
      return '';
    } else if (typeof value === 'number') {
      return format(
        amountToInteger(value, format.currency.decimalPlaces),
        'financial',
      );
    } else {
      return String(value);
    }
  }, [error, value, format]);

  const lines = displayValue.split(/\r?\n/);
  const lineCount = lines.length;
  const longestLineLength = Math.max(
    ...lines.map(line => line.length),
    MIN_SIZED_LENGTH,
  );
  const fontSize =
    fontSizeMode === 'static'
      ? `${staticFontSize}px`
      : `min(${(FONT_SIZE_SCALE_FACTOR * 100) / longestLineLength}cqi, calc((100cqb - ${CONTAINER_MARGIN * 2}px) / ${lineCount}), ${MAX_FONT_SIZE}px)`;

  // Determine color
  const color = customColor
    ? customColor
    : error
      ? theme.errorText
      : theme.pageText;

  return (
    <View style={{ flex: 1, width: '100%', containerType: 'size' }}>
      {loading && <ReportCardValueSkeleton />}
      {!loading && (
        <View
          aria-label={displayValue}
          style={{
            alignItems: 'center',
            flexGrow: 1,
            flexShrink: 1,
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            ...styles.display,
            fontWeight: 300,
            letterSpacing: '-0.015em',
            fontSize,
            lineHeight: 1,
            margin: `${CONTAINER_MARGIN}px 0`,
            justifyContent: 'center',
            color,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              whiteSpace: 'pre-wrap',
              textAlign: 'center',
              wordBreak: 'break-word',
            }}
          >
            <PrivacyFilter>{displayValue}</PrivacyFilter>
          </span>
        </View>
      )}
    </View>
  );
}
