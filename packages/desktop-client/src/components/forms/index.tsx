import React from 'react';
import type { ComponentProps, ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

// The check is drawn as a mask so it takes the theme's checkbox text color
// (white on ink in light, ink on ivory in dark).
const checkMark =
  'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>\') center / contain no-repeat';

type SectionLabelProps = {
  title?: string;
  style?: CSSProperties;
};

export const SectionLabel = ({ title, style }: SectionLabelProps) => {
  return (
    <View
      style={{
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: theme.formLabelText,
        marginBottom: 8,
        lineHeight: '1em',
        ...style,
      }}
    >
      {title}
    </View>
  );
};

type FormLabelProps = {
  title: string;
  id?: string;
  htmlFor?: string;
  style?: CSSProperties;
};

const defaultLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 6,
  color: theme.tableText,
};

export const FormLabel = ({ style, title, id, htmlFor }: FormLabelProps) => {
  return (
    <Text
      style={{
        ...defaultLabelStyle,
        ...style,
      }}
    >
      <label htmlFor={htmlFor} id={id}>
        {title}
      </label>
    </Text>
  );
};

export const FormTextLabel = ({
  style,
  title,
  id,
}: Omit<FormLabelProps, 'htmlFor'>) => {
  return (
    <Text
      style={{
        ...defaultLabelStyle,
        cursor: 'default',
        ...style,
      }}
    >
      <span id={id}>{title}</span>
    </Text>
  );
};

type FormFieldProps = {
  style?: CSSProperties;
  children: ReactNode;
};

export const FormField = ({ style, children }: FormFieldProps) => {
  return <View style={style}>{children}</View>;
};

// Custom inputs

type CheckboxProps = Omit<ComponentProps<'input'>, 'style'> & {
  style?: CSSProperties;
};

export const Checkbox = (props: CheckboxProps) => {
  return (
    <input
      type="checkbox"
      {...props}
      className={css([
        {
          position: 'relative',
          margin: 0,
          flexShrink: 0,
          marginRight: 6,
          width: 15,
          height: 15,
          appearance: 'none',
          outline: 0,
          border: '1px solid ' + theme.formInputBorder,
          borderRadius: radius.xs,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.checkboxText,
          backgroundColor: theme.formInputBackground,
          transition: `background-color ${motion.fast} ${motion.ease}, border-color ${motion.fast} ${motion.ease}`,
          ':hover:not(:disabled)': {
            borderColor: theme.pillBorderDark,
          },
          ':checked': {
            border: '1px solid ' + theme.checkboxBorderSelected,
            backgroundColor: theme.checkboxBackgroundSelected,
            '::after': {
              display: 'block',
              width: 9,
              height: 9,
              backgroundColor: theme.checkboxText,
              mask: checkMark,
              WebkitMask: checkMark,

              content: '" "',
            },
          },
          ':disabled': {
            border: '1px solid ' + theme.buttonNormalDisabledBorder,
            backgroundColor: theme.buttonNormalDisabledBackground,
          },
          ':checked:disabled': {
            border: '1px solid ' + theme.buttonNormalDisabledBorder,
            backgroundColor: theme.buttonNormalDisabledBorder,
            '::after': {
              backgroundColor: theme.buttonNormalDisabledText,
            },
          },
          '&:focus-visible': styles.focusRing,
        },
        props.style,
      ])}
    />
  );
};
