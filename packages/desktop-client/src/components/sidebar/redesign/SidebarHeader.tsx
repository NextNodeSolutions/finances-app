import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgLogo } from '@actual-app/components/icons/logo';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion, radius, spacing } from '@actual-app/components/tokens';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { closeBudget } from '#budgetfiles/budgetfilesSlice';
import { hasMacOSWindowButtons } from '#components/sidebar/SidebarShell';
import { TITLEBAR_HEIGHT } from '#components/Titlebar';
import { useDispatch } from '#redux';

import { SidebarBudgetName } from './SidebarBudgetName';
import { SyncStatusLine } from './SyncStatusLine';

const MAC_WINDOW_BUTTONS_INSET = spacing.xl + spacing.md;
const LOGO_TILE_SIZE = 26;
const LOGO_GLYPH_SIZE = 14;

type SidebarHeaderProps = {
  children?: ReactNode;
};

export function SidebarHeader({ children }: SidebarHeaderProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isEditingName, setIsEditingName] = useState(false);
  const hasWindowButtons = hasMacOSWindowButtons();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        // Same height as the titlebar so both bottom hairlines line up.
        height: hasWindowButtons ? undefined : TITLEBAR_HEIGHT,
        padding: `0 ${spacing.sm}px 0 ${spacing.md}px`,
        paddingTop: hasWindowButtons ? MAC_WINDOW_BUTTONS_INSET : 0,
        paddingBottom: hasWindowButtons ? spacing.sm : 0,
        borderBottom: `1px solid ${theme.sidebarBorder}`,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <Tooltip
        content={t('Switch file')}
        placement="bottom start"
        style={styles.tooltip}
        triggerProps={{ delay: 500 }}
      >
        <Button
          variant="bare"
          aria-label={t('Switch file')}
          className={css({
            padding: 0,
            borderRadius: radius.md,
            backgroundColor: 'transparent',
            flexShrink: 0,
            transition: `opacity ${motion.base} ${motion.ease}`,
            '&[data-hovered]': {
              backgroundColor: 'transparent',
              opacity: 0.82,
            },
            '&[data-pressed]': { backgroundColor: 'transparent' },
            '&[data-focus-visible]': {
              outline: `2px solid ${theme.focusRing}`,
              outlineOffset: 2,
            },
          })}
          onPress={() => void dispatch(closeBudget())}
        >
          <View
            style={{
              width: LOGO_TILE_SIZE,
              height: LOGO_TILE_SIZE,
              borderRadius: radius.md - 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.sidebarBrand,
              color: theme.sidebarBackground,
            }}
          >
            <SvgLogo width={LOGO_GLYPH_SIZE} height={LOGO_GLYPH_SIZE} />
          </View>
        </Button>
      </Tooltip>
      <View style={{ position: 'relative', minWidth: 0, flex: 1 }}>
        <SidebarBudgetName
          isEditing={isEditingName}
          onEditingChange={setIsEditingName}
        />
        <View style={{ visibility: isEditingName ? 'hidden' : undefined }}>
          <SyncStatusLine />
        </View>
      </View>
      {!isEditingName && children}
    </View>
  );
}
