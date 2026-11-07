import { Fragment } from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';

import { Amount } from '#components/budget/Amount';

export type BalancePreviewEntry = {
  name: string;
  /** Cents after the move, or `null` while the balance is unknown. */
  balance: number | null;
};

type BalancePreviewProps = {
  entries: readonly BalancePreviewEntry[];
};

/** "Food 0.00 · Savings 1,196.54": the balances a move would leave. */
export function BalancePreview({ entries }: BalancePreviewProps) {
  return (
    <Text aria-live="polite" style={{ color: theme.pageText }}>
      {entries.map((entry, index) => (
        <Fragment key={entry.name}>
          {index > 0 && (
            <Text aria-hidden style={{ color: theme.pageTextSubdued }}>
              {' · '}
            </Text>
          )}
          {entry.name}{' '}
          <Amount
            value={entry.balance}
            style={{
              color:
                entry.balance !== null && entry.balance < 0
                  ? theme.numberNegative
                  : theme.pageTextDark,
            }}
          />
        </Fragment>
      ))}
    </Text>
  );
}
