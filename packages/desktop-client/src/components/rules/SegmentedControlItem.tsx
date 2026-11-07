import type { ReactNode } from 'react';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { elevation, motion, radius } from '@actual-app/components/tokens';
import { css } from '@emotion/css';

const ITEM_HEIGHT = 26;

const transition = ['background-color', 'color', 'border-color', 'box-shadow']
  .map(property => `${property} ${motion.base} ${motion.ease}`)
  .join(', ');

type SegmentedControlItemProps = {
  isSelected: boolean;
  onPress: () => void;
  children: ReactNode;
};

export function SegmentedControlItem({
  isSelected,
  onPress,
  children,
}: SegmentedControlItemProps) {
  return (
    <Button
      variant="bare"
      onPress={onPress}
      className={css({
        height: ITEM_HEIGHT,
        paddingBlock: 0,
        paddingInline: 10,
        fontSize: 13,
        fontWeight: 500,
        borderRadius: radius.md,
        border: '1px solid transparent',
        transition,
        color: theme.pageTextLight,
        ...(isSelected && {
          color: theme.pageText,
          backgroundColor: theme.cardBackground,
          borderColor: theme.hairline,
          boxShadow: elevation.xs,
        }),
        '&[data-hovered]': {
          color: theme.pageText,
          backgroundColor: isSelected
            ? theme.cardBackground
            : theme.buttonBareBackgroundHover,
        },
      })}
    >
      {children}
    </Button>
  );
}
