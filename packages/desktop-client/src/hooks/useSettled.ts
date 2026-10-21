import { useState } from 'react';

type SettledState = {
  /** The value is exactly zero. */
  isSettled: boolean;
  /**
   * The value moved from a known non-zero amount to zero while mounted.
   * Stays true until the value changes again; a value that is already zero
   * on mount (or arrives from `null`) never counts as a transition.
   */
  hasJustSettled: boolean;
};

/**
 * Tracks a difference that should reach zero (To budget, reconcile
 * difference, split remainder) so the Settle rule can mark the moment it
 * balances.
 */
export function useSettled(value: number | null): SettledState {
  const [previousValue, setPreviousValue] = useState(value);
  const [hasJustSettled, setHasJustSettled] = useState(false);

  if (value !== previousValue) {
    setPreviousValue(value);
    setHasJustSettled(
      value === 0 && previousValue !== null && previousValue !== 0,
    );
  }

  return { isSettled: value === 0, hasJustSettled };
}
