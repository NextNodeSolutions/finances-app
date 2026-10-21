import { useState } from 'react';

import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import type { IntegerAmount } from '@actual-app/core/shared/util';

import { useFormat } from '#hooks/useFormat';

const INPUT_WIDTH = 132;

type PanelAmountInputProps = {
  id?: string;
  /** The figure to show, in cents (not signed by direction). */
  amount: IntegerAmount;
  onChangeAmount: (amount: IntegerAmount) => void;
  'aria-label'?: string;
  autoFocus?: boolean;
  isDisabled?: boolean;
};

/**
 * A figure typed in the user's number format. It reports every keystroke,
 * so a split's remainder updates live and Cmd+Enter saves what is typed.
 */
export function PanelAmountInput({
  id,
  amount,
  onChangeAmount,
  'aria-label': ariaLabel,
  autoFocus,
  isDisabled,
}: PanelAmountInputProps) {
  const format = useFormat();
  const toText = (value: IntegerAmount) =>
    value === 0 ? '' : format.forEdit(value);

  const [text, setText] = useState(() => toText(amount));
  const [shownAmount, setShownAmount] = useState(amount);
  // The amount changed from outside (reset, direction flip): show it,
  // unless it is what the typed text already says.
  if (amount !== shownAmount) {
    setShownAmount(amount);
    if (format.fromEdit(text, 0) !== amount) {
      setText(toText(amount));
    }
  }

  return (
    <Input
      id={id}
      aria-label={ariaLabel}
      inputMode="decimal"
      autoComplete="off"
      autoFocus={autoFocus}
      disabled={isDisabled}
      placeholder={format.forEdit(0)}
      value={text}
      onChangeValue={value => {
        setText(value);
        const parsed = format.fromEdit(value, 0) ?? 0;
        setShownAmount(parsed);
        onChangeAmount(parsed);
      }}
      onBlur={() => setText(toText(amount))}
      style={{ ...styles.tnum, width: INPUT_WIDTH, textAlign: 'right' }}
    />
  );
}
