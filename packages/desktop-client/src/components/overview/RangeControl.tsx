import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { ModeButtonGroup } from '@actual-app/components/mode-button';
import { theme } from '@actual-app/components/theme';
import { elevation, radius } from '@actual-app/components/tokens';
import { css } from '@emotion/css';

import type { NetWorthRange } from '#hooks/useNetWorthHistory';

type RangeControlProps = {
  range: NetWorthRange;
  onChange: (range: NetWorthRange) => void;
};

const RANGES: readonly NetWorthRange[] = ['6M', '1Y', 'All'];

const optionClassName = css({
  padding: '3px 10px',
  borderRadius: radius.sm,
  border: '1px solid transparent',
  backgroundColor: 'transparent',
  color: theme.pageTextLight,
  fontSize: 12,
  fontWeight: 500,
  '&[data-hovered]': { backgroundColor: 'transparent', color: theme.pageText },
});

const selectedClassName = css(optionClassName, {
  borderColor: theme.hairline,
  backgroundColor: theme.buttonNormalBackground,
  boxShadow: elevation.xs,
  color: theme.pageText,
  '&[data-hovered]': { backgroundColor: theme.buttonNormalBackground },
});

/** Segmented control for the trend's span: a tray with a white pill. */
export function RangeControl({ range, onChange }: RangeControlProps) {
  const { t } = useTranslation();
  const labels: Record<NetWorthRange, string> = {
    '6M': t('6M'),
    '1Y': t('1Y'),
    All: t('All'),
  };

  return (
    <ModeButtonGroup style={{ alignSelf: 'center' }}>
      <span
        role="group"
        aria-label={t('Trend range')}
        style={{ display: 'contents' }}
      >
        {RANGES.map(option => {
          const isSelected = option === range;
          return (
            <Button
              key={option}
              variant="bare"
              aria-pressed={isSelected}
              onPress={() => onChange(option)}
              className={isSelected ? selectedClassName : optionClassName}
            >
              {labels[option]}
            </Button>
          );
        })}
      </span>
    </ModeButtonGroup>
  );
}
