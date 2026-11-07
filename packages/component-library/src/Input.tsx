import React from 'react';
import type {
  ChangeEvent,
  ComponentPropsWithRef,
  FocusEvent,
  KeyboardEvent,
} from 'react';
import { Input as ReactAriaInput } from 'react-aria-components';

import { css, cx } from '@emotion/css';

import { useResponsive } from './hooks/useResponsive';
import { styles } from './styles';
import { theme } from './theme';
import {
  componentSizeControl,
  componentSizeText,
  elevation,
  motion,
  radius,
  sizeResponsiveStyles,
  type ComponentSize,
} from './tokens';

// Inputs inset their text 2px less than buttons so a value lines up with
// the label of the button beside it while the field still reads as wider.
const INPUT_PADDING_X_OFFSET = 2;

const mediumControl = componentSizeControl.medium.wide;

export const baseInputStyle = {
  outline: 0,
  backgroundColor: theme.formInputBackground,
  color: theme.formInputText,
  margin: 0,
  padding: `${mediumControl.paddingY}px ${mediumControl.paddingX - INPUT_PADDING_X_OFFSET}px`,
  borderRadius: radius.md,
  border: '1px solid ' + theme.formInputBorder,
  transition: ['border-color', 'box-shadow', 'background-color']
    .map(property => `${property} ${motion.base} ${motion.ease}`)
    .join(', '),
};

// The focused field: sky border plus a soft 3px halo outside it.
export const focusedInputStyle = {
  borderColor: theme.formInputBorderSelected,
  boxShadow: '0 0 0 3px ' + theme.formInputShadowSelected,
};

// Builds the padding/typography overrides for an explicit `size`,
// varying by breakpoint via media queries (no hooks). Medium matches the
// default (size omitted) look.
const getInputSizeStyles = (size: ComponentSize): Record<string, unknown> => {
  const control = componentSizeControl[size];
  const text = componentSizeText[size];

  const getGroupStyles = (group: keyof typeof control) => {
    const { paddingY, paddingX, minHeight } = control[group];
    const { fontSize, lineHeight } = text[group];

    return {
      padding: `${paddingY}px ${paddingX - INPUT_PADDING_X_OFFSET}px`,
      ...(minHeight != null ? { minHeight } : null),
      fontSize,
      // Medium matches today's default look, which inherits line-height;
      // only the other sizes force their scale line-height.
      ...(size === 'medium' ? {} : { lineHeight }),
    };
  };

  return sizeResponsiveStyles({
    narrow: getGroupStyles('narrow'),
    small: getGroupStyles('small'),
    medium: getGroupStyles('medium'),
    wide: getGroupStyles('wide'),
  });
};

const inputSizeStyles = {
  small: getInputSizeStyles('small'),
  medium: getInputSizeStyles('medium'),
  large: getInputSizeStyles('large'),
  'extra-large': getInputSizeStyles('extra-large'),
} satisfies Record<ComponentSize, Record<string, unknown>>;

// Single source of truth for input class composition: base chrome, then
// either the default typography (styles.smallText) or the explicit size
// overrides, then any extra overrides — all in one css() call so there
// is never a cross-class specificity race.
const buildInputClassName = (
  size?: ComponentSize,
  overrides?: Record<string, unknown>,
) =>
  css({
    ...baseInputStyle,
    color: theme.formInputText,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    flexShrink: 0,
    '&[data-hovered]': { borderColor: theme.hairlineStrong },
    '&[data-focused]': focusedInputStyle,
    '&[data-disabled]': {
      color: theme.formInputTextPlaceholder,
      backgroundColor: theme.buttonNormalDisabledBackground,
      borderColor: theme.buttonNormalDisabledBorder,
    },
    '::placeholder': { color: theme.formInputTextPlaceholder },
    ...(size ? inputSizeStyles[size] : styles.smallText),
    ...overrides,
  });

export const defaultInputClassName = buildInputClassName();

const inputSizeClassNames = {
  small: buildInputClassName('small'),
  medium: buildInputClassName('medium'),
  large: buildInputClassName('large'),
  'extra-large': buildInputClassName('extra-large'),
} satisfies Record<ComponentSize, string>;

export type InputProps = Omit<
  ComponentPropsWithRef<typeof ReactAriaInput>,
  'size'
> & {
  size?: ComponentSize;
  onEnter?: (value: string, event: KeyboardEvent<HTMLInputElement>) => void;
  onEscape?: (value: string, event: KeyboardEvent<HTMLInputElement>) => void;
  onChangeValue?: (
    newValue: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  onUpdate?: (newValue: string, event: FocusEvent<HTMLInputElement>) => void;
};

export function Input({
  ref,
  onEnter,
  onEscape,
  onChangeValue,
  onUpdate,
  className,
  size,
  ...props
}: InputProps) {
  const baseClassName = size
    ? inputSizeClassNames[size]
    : defaultInputClassName;

  return (
    <ReactAriaInput
      ref={ref}
      className={
        typeof className === 'function'
          ? renderProps => cx(baseClassName, className(renderProps))
          : cx(baseClassName, className)
      }
      {...props}
      onKeyUp={e => {
        props.onKeyUp?.(e);

        if (e.key === 'Enter' && onEnter) {
          onEnter(e.currentTarget.value, e);
        }

        if (e.key === 'Escape' && onEscape) {
          onEscape(e.currentTarget.value, e);
        }
      }}
      onBlur={e => {
        onUpdate?.(e.currentTarget.value, e);
        props.onBlur?.(e);
      }}
      onChange={e => {
        onChangeValue?.(e.currentTarget.value, e);
        props.onChange?.(e);
      }}
    />
  );
}

// BigInput chrome: the regular hairline field resting on a faint shadow.
// The legacy scale (size omitted) keeps padding 10 and fontSize 15; an
// explicit size swaps in the size tokens.
const bigInputChrome: Record<string, unknown> = {
  boxShadow: elevation.xs,
  '&[data-focused]': focusedInputStyle,
};

const defaultBigInputClassName = buildInputClassName(undefined, {
  padding: 10,
  fontSize: 15,
  ...bigInputChrome,
});

const bigInputSizeClassNames = {
  small: buildInputClassName('small', bigInputChrome),
  medium: buildInputClassName('medium', bigInputChrome),
  large: buildInputClassName('large', bigInputChrome),
  'extra-large': buildInputClassName('extra-large', bigInputChrome),
} satisfies Record<ComponentSize, string>;

export function BigInput({ size, className, ...props }: InputProps) {
  const baseClassName = size
    ? bigInputSizeClassNames[size]
    : defaultBigInputClassName;

  return (
    <Input
      {...props}
      className={
        typeof className === 'function'
          ? renderProps => cx(baseClassName, className(renderProps))
          : cx(baseClassName, className)
      }
    />
  );
}

export function ResponsiveInput(props: InputProps) {
  const { isNarrowWidth } = useResponsive();

  return isNarrowWidth ? <BigInput {...props} /> : <Input {...props} />;
}
