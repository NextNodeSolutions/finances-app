import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';

import { Cell } from '#components/table';

import { TRANSACTIONS_COLUMN_WIDTH } from './payeeTableColumns';

type PayeeTransactionCountCellProps = {
  /** Null while the counts load. */
  count: number | null;
};

/**
 * How many transactions use the payee: `…` while the counts load, `—` when
 * none do.
 */
export function PayeeTransactionCountCell({
  count,
}: PayeeTransactionCountCellProps) {
  const label = count == null ? '…' : count > 0 ? String(count) : '—';

  return (
    <Cell
      name="transactions"
      width={TRANSACTIONS_COLUMN_WIDTH}
      plain
      style={{ alignItems: 'flex-end', paddingRight: 10 }}
    >
      <Text
        style={{
          ...styles.tnum,
          fontSize: 12.5,
          color: count ? theme.tableText : theme.tableTextSubdued,
        }}
      >
        {label}
      </Text>
    </Cell>
  );
}
