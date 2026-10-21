import { describe, expect, it } from 'vitest';

import { parseAmountQuery } from './parseAmountQuery';

describe('parseAmountQuery', () => {
  it('reads a dot-thousands, comma-decimal amount as a payment', () => {
    expect(parseAmountQuery('1.234,56 Kroger')).toEqual({
      amount: -123456,
      payeeName: 'Kroger',
    });
  });

  it('reads a comma-thousands, dot-decimal amount as a payment', () => {
    expect(parseAmountQuery('1,234.56 Kroger')).toEqual({
      amount: -123456,
      payeeName: 'Kroger',
    });
  });

  it('keeps an explicit minus as a payment', () => {
    expect(parseAmountQuery('-42 Rent')).toEqual({
      amount: -4200,
      payeeName: 'Rent',
    });
  });

  it('reads a leading plus as a deposit', () => {
    expect(parseAmountQuery('+42 Salary')?.amount).toBe(4200);
  });

  it('keeps a payee name of several words', () => {
    expect(parseAmountQuery('  12.5  Corner shop  ')).toEqual({
      amount: -1250,
      payeeName: 'Corner shop',
    });
  });

  it('uses the currency decimal places', () => {
    expect(parseAmountQuery('1,500 Ramen', 0)?.amount).toBe(-1500);
  });

  it('ignores a query that does not start with an amount', () => {
    expect(parseAmountQuery('reports')).toBeNull();
    expect(parseAmountQuery('Kroger 42')).toBeNull();
  });

  it('ignores an amount with no payee', () => {
    expect(parseAmountQuery('42')).toBeNull();
    expect(parseAmountQuery('42   ')).toBeNull();
  });

  it('ignores a zero amount', () => {
    expect(parseAmountQuery('0 Kroger')).toBeNull();
  });
});
