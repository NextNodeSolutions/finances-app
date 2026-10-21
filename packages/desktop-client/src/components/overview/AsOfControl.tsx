import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDelete } from '@actual-app/components/icons/v0';
import {
  SvgCheveronLeft,
  SvgCheveronRight,
} from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useLocale } from '#hooks/useLocale';

import type { Rewind } from './useRewind';

type AsOfControlProps = {
  rewind: Rewind;
};

const ICON_SIZE = 12;

/**
 * The statement's date in the page header, and the keyboard path through
 * Rewind: ‹ and › step one month-end, Today (or the pill's ✕) clears it.
 */
export function AsOfControl({ rewind }: AsOfControlProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { asOfMonth, setAsOf } = rewind;
  const asOfDay =
    asOfMonth === null
      ? monthUtils.currentDay()
      : monthUtils.lastDayOfMonth(asOfMonth);
  const asOfLabel = t('As of {{date}}', {
    date: monthUtils.format(asOfDay, 'd MMM yyyy', locale),
  });
  const announcement =
    asOfMonth === null
      ? t('Showing today')
      : t('Showing {{date}}', {
          date: monthUtils.format(asOfDay, 'd MMMM yyyy', locale),
        });

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}
    >
      {asOfMonth === null ? (
        <Text
          data-testid="overview-as-of"
          style={{
            fontSize: 12.5,
            color: theme.pageTextSubdued,
            marginRight: spacing.sm,
          }}
        >
          {asOfLabel}
        </Text>
      ) : (
        <View
          data-testid="overview-as-of-pill"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xxs,
            marginRight: spacing.sm,
            padding: '2px 2px 2px 8px',
            borderRadius: radius.sm,
            backgroundColor: theme.accentSubtle,
            color: theme.accentText,
            fontSize: 12.5,
            fontWeight: 500,
          }}
        >
          <Text data-testid="overview-as-of">{asOfLabel}</Text>
          <Button
            variant="bare"
            aria-label={t('Back to today')}
            onPress={() => setAsOf(null)}
            style={{ padding: 5, color: theme.accentText }}
          >
            <SvgDelete width={8} height={8} />
          </Button>
        </View>
      )}
      <Button
        variant="bare"
        aria-label={t('Previous month-end')}
        isDisabled={!rewind.canStepBack}
        onPress={rewind.stepBack}
        style={{ padding: 7 }}
      >
        <SvgCheveronLeft width={ICON_SIZE} height={ICON_SIZE} />
      </Button>
      <Button
        variant="bare"
        isDisabled={asOfMonth === null}
        onPress={() => setAsOf(null)}
        style={{ padding: '4px 8px', fontSize: 12.5, fontWeight: 500 }}
      >
        <Trans>Today</Trans>
      </Button>
      <Button
        variant="bare"
        aria-label={t('Next month-end')}
        isDisabled={!rewind.canStepForward}
        onPress={rewind.stepForward}
        style={{ padding: 7 }}
      >
        <SvgCheveronRight width={ICON_SIZE} height={ICON_SIZE} />
      </Button>
      <View aria-live="polite" style={styles.visuallyHidden}>
        {announcement}
      </View>
    </View>
  );
}
