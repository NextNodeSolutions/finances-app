import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';

type OptionFieldProps = {
  htmlFor: string;
  label: ReactNode;
  children: ReactNode;
};

/** A label set inline before the control it names. */
export function OptionField({ htmlFor, label, children }: OptionFieldProps) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        color: theme.formLabelText,
        fontWeight: 500,
      }}
    >
      {label}
      {children}
    </label>
  );
}
