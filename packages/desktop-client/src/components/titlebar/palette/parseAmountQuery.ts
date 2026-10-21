import {
  amountToInteger,
  currencyToAmount,
} from '@actual-app/core/shared/util';
import type { IntegerAmount } from '@actual-app/core/shared/util';

/** A palette query read as "amount, then payee". */
export type AmountQuery = {
  /** Signed integer amount: negative (a payment) unless typed with `+`. */
  amount: IntegerAmount;
  payeeName: string;
};

const AMOUNT_FIRST_PATTERN = /^\s*([+-]?\d[\d.,\s]*)\s+(.+)$/;

/**
 * Reads `42.18 Kroger`, `+1.234,56 Salary` or `-42 Rent` as a new
 * transaction. The amount follows the user's number format (the thousands
 * separator is told apart from the decimal one), and `decimalPlaces` is the
 * currency's. Returns null when the query does not start with an amount.
 */
export function parseAmountQuery(
  query: string,
  decimalPlaces = 2,
): AmountQuery | null {
  const match = AMOUNT_FIRST_PATTERN.exec(query);
  if (!match) {
    return null;
  }
  const [, amountText = '', payeeText = ''] = match;
  const typedAmount = amountText.trim();
  const amount = currencyToAmount(typedAmount.replace(/^[+-]/, ''));
  const payeeName = payeeText.trim();
  if (amount === null || amount === 0 || payeeName === '') {
    return null;
  }
  const magnitude = Math.abs(amountToInteger(amount, decimalPlaces));
  return {
    amount: typedAmount.startsWith('+') ? magnitude : -magnitude,
    payeeName,
  };
}
