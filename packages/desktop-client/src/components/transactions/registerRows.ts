import { isPreviewId } from '@actual-app/core/shared/transactions';
import type { TransactionEntity } from '@actual-app/core/types/models';

export type RegisterSection = 'upcoming' | 'posted';

/** A separator row; never selectable, focusable or draggable. */
export type SectionRow = {
  id: `section/${RegisterSection}`;
  kind: 'section';
  section: RegisterSection;
};

export type RegisterRow = TransactionEntity | SectionRow;

export type RegisterRows = {
  rows: RegisterRow[];
  /** Maps a row index back to the index of its transaction. */
  getTransactionIndex: (rowIndex: number) => number;
};

const UPCOMING_ROW: SectionRow = {
  id: 'section/upcoming',
  kind: 'section',
  section: 'upcoming',
};
const POSTED_ROW: SectionRow = {
  id: 'section/posted',
  kind: 'section',
  section: 'posted',
};

export function isSectionRow(row: RegisterRow): row is SectionRow {
  return 'kind' in row && row.kind === 'section';
}

/**
 * The rows a register renders: when it starts with upcoming (preview)
 * transactions, an `UPCOMING` separator leads them and a `POSTED` one
 * follows them. Without previews the transactions are the rows.
 */
export function getRegisterRows(
  transactions: readonly TransactionEntity[],
): RegisterRows {
  const [firstTransaction] = transactions;
  if (!firstTransaction || !isPreviewId(firstTransaction.id)) {
    return { rows: [...transactions], getTransactionIndex: index => index };
  }

  const postedIndex = transactions.findIndex(
    transaction => !isPreviewId(transaction.id),
  );
  if (postedIndex === -1) {
    return {
      rows: [UPCOMING_ROW, ...transactions],
      getTransactionIndex: index => index - 1,
    };
  }

  // The POSTED row sits after the UPCOMING row and every preview.
  const postedRowIndex = postedIndex + 1;
  return {
    rows: [
      UPCOMING_ROW,
      ...transactions.slice(0, postedIndex),
      POSTED_ROW,
      ...transactions.slice(postedIndex),
    ],
    getTransactionIndex: index =>
      index > postedRowIndex ? index - 2 : index - 1,
  };
}
