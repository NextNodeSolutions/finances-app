import type { ComponentProps, ComponentType, SVGProps } from 'react';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { Tooltip } from '@actual-app/components/tooltip';
import { css } from '@emotion/css';

const BUTTON_SIZE = 22;
const ICON_SIZE = 12;

type SidebarIconButtonProps = {
  Icon:
    | ComponentType<SVGProps<SVGElement>>
    | ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  isToggledOn?: boolean;
  isDisabled?: boolean;
  onPress: ComponentProps<typeof Button>['onPress'];
  testId?: string;
};

export function SidebarIconButton({
  Icon,
  label,
  isToggledOn,
  isDisabled,
  onPress,
  testId,
}: SidebarIconButtonProps) {
  return (
    <Tooltip
      content={label}
      placement="bottom"
      style={styles.tooltip}
      triggerProps={{ delay: 500 }}
    >
      <Button
        variant="bare"
        aria-label={label}
        aria-pressed={isToggledOn}
        data-testid={testId}
        isDisabled={isDisabled}
        onPress={onPress}
        className={css({
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          padding: 0,
          borderRadius: radius.sm,
          color: isToggledOn
            ? theme.sidebarItemTextSelected
            : theme.sidebarTextMuted,
          backgroundColor: isToggledOn
            ? theme.sidebarItemBackgroundSelected
            : 'transparent',
          transition: `background-color ${motion.base} ${motion.ease}, color ${motion.base} ${motion.ease}`,
          '&[data-hovered]': {
            backgroundColor: isToggledOn
              ? theme.sidebarItemBackgroundSelected
              : theme.sidebarItemBackgroundHover,
            color: theme.sidebarItemTextSelected,
          },
          '&[data-focus-visible]': {
            outline: `2px solid ${theme.focusRing}`,
            outlineOffset: 1,
          },
        })}
      >
        <Icon width={ICON_SIZE} height={ICON_SIZE} style={{ flexShrink: 0 }} />
      </Button>
    </Tooltip>
  );
}
