import React from 'react';
import type { CSSProperties } from 'react';

import { css } from '@emotion/css';

import { styles } from './styles';
import { theme } from './theme';
import { elevation, motion, radius } from './tokens';
import { View } from './View';

const TRACK_WIDTH = 30;
const TRACK_HEIGHT = 18;
const KNOB_INSET = 2;
const KNOB_SIZE = TRACK_HEIGHT - KNOB_INSET * 2;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2;

type ToggleProps = {
  id: string;
  isOn: boolean;
  isDisabled?: boolean;
  onToggle?: (isOn: boolean) => void;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
};

export const Toggle = ({
  id,
  isOn,
  isDisabled = false,
  onToggle,
  className,
  style,
  'aria-label': ariaLabel,
}: ToggleProps) => {
  return (
    <View style={style} className={className}>
      <input
        id={id}
        aria-label={ariaLabel}
        checked={isOn}
        disabled={isDisabled}
        onChange={e => onToggle?.(e.target.checked)}
        className={css({
          height: 0,
          width: 0,
          opacity: 0,
          '&:focus-visible + label': styles.focusRing,
        })}
        type="checkbox"
      />
      {/* oxlint-disable-next-line eslint-plugin-jsx-a11y(label-has-associated-control) */}
      <label
        data-toggle-container
        data-on={isOn}
        className={String(
          css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: isDisabled ? 'default' : 'pointer',
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
            borderRadius: radius.pill,
            position: 'relative',
            transition: `background-color ${motion.base} ${motion.ease}`,
            backgroundColor: isOn
              ? theme.checkboxToggleBackgroundSelected
              : theme.checkboxToggleBackground,
          }),
        )}
        htmlFor={id}
      >
        <span
          data-toggle
          data-on={isOn}
          className={css(
            {
              content: '" "',
              position: 'absolute',
              top: KNOB_INSET,
              left: KNOB_INSET,
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              borderRadius: radius.pill,
              transition: `transform ${motion.base} ${motion.ease}, background-color ${motion.base} ${motion.ease}`,
              boxShadow: elevation.xs,
              backgroundColor: isDisabled
                ? theme.checkboxToggleDisabled
                : isOn
                  ? theme.checkboxText
                  : theme.checkboxToggleKnob,
            },
            isOn && {
              transform: `translateX(${KNOB_TRAVEL}px)`,
            },
          )}
        />
      </label>
    </View>
  );
};
