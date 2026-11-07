import React, { lazy, Suspense } from 'react';

import { theme } from '@actual-app/components/theme';
import { motion, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

const FormulaEditor = lazy(() =>
  import('#components/formula/FormulaEditor').then(module => ({
    default: module.FormulaEditor,
  })),
);

type FormulaActionEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function FormulaActionEditor({
  value,
  onChange,
  disabled = false,
}: FormulaActionEditorProps) {
  // Enforce single-line: replace newlines with spaces
  const handleChange = (newValue: string) => {
    const singleLineValue = newValue.replace(/[\r\n]+/g, ' ');
    onChange(singleLineValue);
  };

  return (
    <View
      style={{
        flex: 1,
        border: `1px solid ${theme.formInputBorder}`,
        borderRadius: radius.md,
        overflow: 'visible',
        paddingInline: spacing.xs,
        backgroundColor: disabled
          ? theme.formInputBackgroundSelection
          : theme.formInputBackground,
        opacity: disabled ? 0.6 : 1,
        transition: `border-color ${motion.base} ${motion.ease}, box-shadow ${motion.base} ${motion.ease}`,
        ':hover': { borderColor: theme.hairlineStrong },
        ':focus-within': {
          borderColor: theme.formInputBorderSelected,
          boxShadow: `0 0 0 3px ${theme.formInputShadowSelected}`,
        },
      }}
    >
      <Suspense fallback={<div style={{ height: 32 }} />}>
        <FormulaEditor
          value={value}
          onChange={handleChange}
          mode="transaction"
          disabled={disabled}
          singleLine
          showLineNumbers={false}
        />
      </Suspense>
    </View>
  );
}
