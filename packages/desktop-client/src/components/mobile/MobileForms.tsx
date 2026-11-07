import React from 'react';
import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  CSSProperties,
  ReactNode,
} from 'react';

import { Button } from '@actual-app/components/button';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { Toggle } from '@actual-app/components/toggle';
import { motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css, cx } from '@emotion/css';

type FieldLabelProps = {
  title: string;
  flush?: boolean;
  style?: CSSProperties;
};

export function FieldLabel({ title, flush, style }: FieldLabelProps) {
  return (
    <Text
      style={{
        marginBottom: 6,
        marginTop: flush ? 0 : 20,
        fontSize: 12.5,
        fontWeight: 500,
        lineHeight: '16px',
        color: theme.pageTextLight,
        padding: `0 ${styles.mobileEditingPadding + 2}px`,
        userSelect: 'none',
        ...style,
      }}
    >
      {title}
    </Text>
  );
}

/** Height of every mobile form field; desktop inputs placed beside one match it. */
export const MOBILE_FIELD_HEIGHT = 44;

const valueStyle = {
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: theme.formInputBorder,
  borderRadius: radius.md,
  marginLeft: styles.mobileEditingPadding,
  marginRight: styles.mobileEditingPadding,
  height: MOBILE_FIELD_HEIGHT,
  transition: `border-color ${motion.base} ${motion.ease}, box-shadow ${motion.base} ${motion.ease}, background-color ${motion.base} ${motion.ease}`,
};

const focusedFieldStyle = {
  borderColor: theme.formInputBorderSelected,
  boxShadow: `0 0 0 3px ${theme.formInputShadowSelected}`,
};

export const hideNativeDateIconClassName = css({
  '&::-webkit-calendar-picker-indicator': {
    display: 'none',
  },
  '&::-webkit-date-and-time-value': {
    textAlign: 'left',
  },
});

const nativePickerInputTypes = new Set([
  'date',
  'month',
  'time',
  'week',
  'datetime-local',
]);

// browsers don't reliably open the native picker when the field itself is
// tapped (chromium only opens it from the indicator, which can be hidden)
function showNativePicker(input: HTMLInputElement) {
  try {
    input.showPicker();
  } catch {
    // unsupported or blocked; the browser's default tap behavior still applies
  }
}

const iconFieldWrapperClassName = css({
  ...valueStyle,
  flexDirection: 'row',
  alignItems: 'center',
  paddingLeft: 12,
  paddingRight: 10,
  gap: 10,
  '&:focus-within': focusedFieldStyle,
});

type InputFieldProps = ComponentPropsWithRef<typeof Input> & {
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
};

const iconStyle: CSSProperties = {
  color: theme.pageTextSubdued,
  flexShrink: 0,
  alignSelf: 'stretch',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 0,
};

export function InputField({
  disabled,
  style,
  onUpdate,
  iconStart,
  iconEnd,
  className,
  type,
  onClick,
  ref,
  ...props
}: InputFieldProps) {
  const onClickInner: InputFieldProps['onClick'] = event => {
    onClick?.(event);
    if (type && nativePickerInputTypes.has(type) && !event.defaultPrevented) {
      showNativePicker(event.currentTarget);
    }
  };

  if (iconStart || iconEnd) {
    return (
      <View
        className={iconFieldWrapperClassName}
        nativeStyle={{
          backgroundColor: disabled
            ? theme.formInputTextReadOnlySelection
            : theme.formInputBackground,
        }}
      >
        {iconStart && <View style={iconStyle}>{iconStart}</View>}
        <Input
          ref={ref}
          type={type}
          autoCorrect="false"
          autoCapitalize="none"
          disabled={disabled}
          onUpdate={onUpdate}
          onClick={onClickInner}
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            height: '100%',
            padding: 0,
            fontSize: 15,
            textAlign: 'left',
            color: disabled ? theme.tableTextInactive : theme.formInputText,
            ...style,
            borderRadius: 0,
            boxShadow: 'none',
          }}
          {...props}
          className={renderProps =>
            cx(
              hideNativeDateIconClassName,
              typeof className === 'function'
                ? className(renderProps)
                : className,
            )
          }
        />
        {iconEnd && <View style={iconStyle}>{iconEnd}</View>}
      </View>
    );
  }

  return (
    <Input
      ref={ref}
      type={type}
      autoCorrect="false"
      autoCapitalize="none"
      disabled={disabled}
      onUpdate={onUpdate}
      onClick={onClickInner}
      className={className}
      style={{
        ...valueStyle,
        padding: '0 12px',
        fontSize: 15,
        ...style,
        color: disabled ? theme.tableTextInactive : theme.formInputText,
        backgroundColor: disabled
          ? theme.formInputTextReadOnlySelection
          : theme.formInputBackground,
      }}
      {...props}
    />
  );
}

InputField.displayName = 'InputField';

type TapFieldProps = ComponentPropsWithRef<typeof Button> & {
  icon?: ReactNode;
  placeholder?: string;
  rightContent?: ReactNode;
  alwaysShowRightContent?: boolean;
  textStyle?: CSSProperties;
};

const defaultTapFieldClassName = () =>
  css({
    ...valueStyle,
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 10px 0 12px',
    fontSize: 15,
    fontWeight: 400,
    color: theme.formInputText,
    backgroundColor: theme.formInputBackground,
    boxShadow: 'none',
    '&[data-disabled]': {
      backgroundColor: theme.formInputTextReadOnlySelection,
    },
    '&[data-pressed]': {
      backgroundColor: theme.tableRowBackgroundHover,
      boxShadow: 'none',
    },
    '&[data-hovered]': {
      borderColor: theme.hairlineStrong,
      boxShadow: 'none',
    },
    '&[data-focus-visible]': focusedFieldStyle,
  });

export function TapField({
  value,
  children,
  className,
  icon,
  placeholder,
  rightContent,
  alwaysShowRightContent,
  textStyle,
  ref,
  ...props
}: TapFieldProps) {
  const showPlaceholder = !value && !!placeholder;
  return (
    <Button
      ref={ref}
      bounce={false}
      className={renderProps =>
        cx(
          defaultTapFieldClassName(),
          typeof className === 'function' ? className(renderProps) : className,
        )
      }
      {...props}
    >
      {children ? (
        children
      ) : (
        <>
          {icon && (
            <View
              style={{
                color: theme.pageTextSubdued,
                marginRight: 10,
                flexShrink: 0,
              }}
            >
              {icon}
            </View>
          )}
          <Text
            style={{
              flex: 1,
              userSelect: 'none',
              textAlign: 'left',
              color: showPlaceholder
                ? theme.formInputTextPlaceholder
                : undefined,
              ...textStyle,
            }}
          >
            {showPlaceholder ? placeholder : value}
          </Text>
        </>
      )}
      {(!props.isDisabled || alwaysShowRightContent) && rightContent}
    </Button>
  );
}

TapField.displayName = 'TapField';

type ToggleFieldProps = ComponentPropsWithoutRef<typeof Toggle>;

export function ToggleField({
  id,
  isOn,
  onToggle,
  style,
  className,
  isDisabled = false,
}: ToggleFieldProps) {
  return (
    <Toggle
      id={id}
      isOn={isOn}
      isDisabled={isDisabled}
      onToggle={onToggle}
      style={style}
      className={String(
        css([
          {
            '& [data-toggle-container]': {
              width: 50,
              height: 24,
            },
            '& [data-toggle]': {
              width: 20,
              height: 20,
            },
          },
          className,
        ]),
      )}
    />
  );
}
