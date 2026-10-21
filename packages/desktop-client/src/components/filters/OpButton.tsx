import React from 'react';
import type { CSSProperties } from 'react';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { css } from '@emotion/css';

import { friendlyOp } from '#util/rule';

type OpButtonProps = {
  op: string;
  isSelected: boolean;
  onPress: () => void;
  style?: CSSProperties;
};

export function OpButton({ op, isSelected, style, onPress }: OpButtonProps) {
  return (
    <Button
      variant="bare"
      style={style}
      className={css({
        backgroundColor: theme.pillBackground,
        color: theme.pillText,
        borderRadius: radius.sm,
        padding: '4px 9px',
        fontSize: 12.5,
        transition: `background-color ${motion.base} ${motion.ease}, color ${motion.base} ${motion.ease}`,
        '&[data-hovered]': {
          backgroundColor: theme.pillBorder,
          color: theme.pageText,
        },
        ...(isSelected && {
          color: theme.buttonNormalSelectedText,
          '&,:hover,:active': {
            backgroundColor: theme.buttonNormalSelectedBackground,
            color: theme.buttonNormalSelectedText,
          },
        }),
      })}
      onPress={onPress}
    >
      {friendlyOp(op)}
    </Button>
  );
}
