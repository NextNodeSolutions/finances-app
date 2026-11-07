import type { ReactNode } from 'react';

import { css } from '@emotion/css';

import { Button } from '#Button';
import type { CSSProperties } from '#styles';
import { theme } from '#theme';
import { elevation, radius } from '#tokens';

export { ModeButtonGroup } from './ModeButtonGroup';

type ModeButtonProps = {
  selected: boolean;
  children: ReactNode;
  style?: CSSProperties;
  onSelect: () => void;
};

// One segment of a segmented control: quiet text on the tray, and a white
// pill lifted off it for the active choice. Group segments with
// ModeButtonGroup to get the tray.
export function ModeButton({
  selected,
  children,
  style,
  onSelect,
}: ModeButtonProps) {
  return (
    <Button
      variant="bare"
      className={css({
        padding: '4px 12px',
        borderRadius: radius.sm,
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        color: theme.pageTextLight,
        fontSize: 'inherit',
        fontWeight: 500,
        '&[data-hovered]': { color: theme.pageText },
        ...style,
        ...(selected && {
          backgroundColor: theme.buttonNormalBackground,
          borderColor: theme.hairline,
          boxShadow: elevation.xs,
          color: theme.pageText,
          '&[data-hovered]': {
            backgroundColor: theme.buttonNormalBackground,
            color: theme.pageText,
          },
        }),
      })}
      onPress={onSelect}
    >
      {children}
    </Button>
  );
}
