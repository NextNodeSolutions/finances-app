import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useLocale } from '#hooks/useLocale';

type MobileAsOfBarProps = {
  /** The rewound month (`YYYY-MM`). */
  asOfMonth: string;
  onToday: () => void;
};

/**
 * Says the statement reads as of a past month-end (opened from the
 * Statements list) and returns it to today.
 */
export function MobileAsOfBar({ asOfMonth, onToday }: MobileAsOfBarProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const asOfDate = monthUtils.format(
    monthUtils.lastDayOfMonth(asOfMonth),
    'd MMM yyyy',
    locale,
  );

  return (
    <View
      aria-live="polite"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
        minHeight: 44,
        padding: `${spacing.xs}px ${spacing.xs}px ${spacing.xs}px ${spacing.md}px`,
        borderRadius: radius.md,
        border: `1px solid ${theme.hairline}`,
        backgroundColor: theme.trayBackground,
      }}
    >
      <Text
        data-testid="overview-as-of"
        style={{ fontSize: 13, fontWeight: 500, color: theme.pageTextDark }}
      >
        {t('As of {{date}}', { date: asOfDate })}
      </Text>
      <Button onPress={onToday} style={{ minHeight: 36 }}>
        <Trans>Today</Trans>
      </Button>
    </View>
  );
}
