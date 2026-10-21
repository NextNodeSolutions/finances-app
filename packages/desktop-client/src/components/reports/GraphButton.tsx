import React from 'react';
import type { CSSProperties, HTMLProps } from 'react';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { Tooltip } from '@actual-app/components/tooltip';
import { css } from '@emotion/css';

import { getSegmentStyle } from './chart-theme';

type GraphButtonProps = HTMLProps<HTMLButtonElement> & {
  selected?: boolean;
  style?: CSSProperties;
  onSelect?: () => void;
  title?: string;
  disabled?: boolean;
};

export const GraphButton = ({
  selected,
  children,
  onSelect,
  title,
  style,
  disabled,
}: GraphButtonProps) => {
  return (
    <Tooltip
      placement="bottom start"
      content={<Text>{title}</Text>}
      style={{ ...styles.tooltip, lineHeight: 1.5, padding: '6px 10px' }}
    >
      <Button
        variant="bare"
        className={css({
          ...getSegmentStyle(Boolean(selected)),
          width: 30,
          height: 26,
          padding: 0,
          ...style,
        })}
        onPress={onSelect}
        isDisabled={disabled}
        aria-label={title}
      >
        {children}
      </Button>
    </Tooltip>
  );
};
