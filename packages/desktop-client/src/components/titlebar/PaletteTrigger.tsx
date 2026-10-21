import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgSearch } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, radius, spacing } from '@actual-app/components/tokens';
import * as Platform from '@actual-app/core/shared/platform';
import { css } from '@emotion/css';

import { openCommandBar } from '#components/CommandBar';

import {
  TITLEBAR_COMPACT_QUERY,
  TITLEBAR_ICON_BUTTON_SIZE,
  TITLEBAR_MEDIUM_QUERY,
} from './titlebarStyles';

const WIDE_WIDTH = 320;
const MEDIUM_WIDTH = 240;

const hideWhenCompact = { [TITLEBAR_COMPACT_QUERY]: { display: 'none' } };

/**
 * Looks like a search field and opens the command palette: the visible way
 * into ⌘K.
 */
export function PaletteTrigger() {
  const { t } = useTranslation();
  const shortcut = Platform.OS === 'mac' ? '⌘K' : 'Ctrl K';

  return (
    <Button
      variant="bare"
      aria-label={t('Search or jump to')}
      aria-keyshortcuts={Platform.OS === 'mac' ? 'Meta+K' : 'Control+K'}
      data-testid="palette-trigger"
      onPress={openCommandBar}
      className={css({
        justifyContent: 'flex-start',
        gap: spacing.sm,
        width: WIDE_WIDTH,
        height: TITLEBAR_ICON_BUTTON_SIZE,
        padding: '0 6px 0 10px',
        borderRadius: radius.md,
        border: `1px solid ${theme.formInputBorder}`,
        backgroundColor: theme.formInputBackground,
        color: theme.formInputTextPlaceholder,
        transition: `border-color ${motion.base} ${motion.ease}, background-color ${motion.base} ${motion.ease}`,
        '&[data-hovered]': {
          borderColor: theme.hairlineStrong,
          backgroundColor: theme.formInputBackground,
          color: theme.pageTextLight,
        },
        '&[data-pressed]': { backgroundColor: theme.formInputBackground },
        [TITLEBAR_MEDIUM_QUERY]: { width: MEDIUM_WIDTH },
        [TITLEBAR_COMPACT_QUERY]: {
          width: TITLEBAR_ICON_BUTTON_SIZE,
          padding: 0,
          justifyContent: 'center',
          border: 'none',
          backgroundColor: 'transparent',
          color: theme.pageTextLight,
        },
      })}
    >
      <SvgSearch width={13} height={13} style={{ flexShrink: 0 }} />
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          textAlign: 'left',
          ...styles.ellipsisText,
          ...hideWhenCompact,
        }}
      >
        <Trans>Search or jump to…</Trans>
      </Text>
      <Text
        aria-hidden
        style={{
          ...styles.tnum,
          flexShrink: 0,
          fontSize: 11,
          lineHeight: '16px',
          padding: '0 5px',
          borderRadius: radius.xs,
          border: `1px solid ${theme.hairline}`,
          color: theme.pageTextSubdued,
          ...hideWhenCompact,
        }}
      >
        {shortcut}
      </Text>
    </Button>
  );
}
