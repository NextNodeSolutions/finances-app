import type { ReactNode } from 'react';

import { FormError } from '@actual-app/components/form-error';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

const LABEL_WIDTH = 96;
// Matches a medium input, so the label sits on the control's text line.
const CONTROL_LINE_HEIGHT = 30;

type PanelFieldProps = {
  /** Sentence case; the mono label style sets it in capitals. */
  label: string;
  /** The control the label names. Without it the row is read-only. */
  htmlFor?: string;
  /** A subdued note under the control (e.g. "Set by a rule"). */
  caption?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
};

/** One row of a transaction panel: mono label left, control right. */
export function PanelField({
  label,
  htmlFor,
  caption,
  error,
  children,
}: PanelFieldProps) {
  const labelStyle = {
    ...styles.monoLabel,
    color: theme.tableHeaderText,
    width: LABEL_WIDTH,
    flexShrink: 0,
    lineHeight: `${CONTROL_LINE_HEIGHT}px`,
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        paddingBlock: spacing.xs,
      }}
    >
      {htmlFor ? (
        <label htmlFor={htmlFor} style={labelStyle}>
          {label}
        </label>
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
      <View
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: CONTROL_LINE_HEIGHT,
          justifyContent: 'center',
        }}
      >
        {children}
        {caption && (
          <Text
            style={{
              marginTop: spacing.xs,
              fontSize: 12,
              color: theme.pageTextSubdued,
            }}
          >
            {caption}
          </Text>
        )}
        {error && <FormError>{error}</FormError>}
      </View>
    </View>
  );
}
