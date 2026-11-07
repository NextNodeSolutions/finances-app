import { AccountField } from './AccountField';
import { AmountField } from './AmountField';
import { CategoryField } from './CategoryField';
import { ClearedField } from './ClearedField';
import { DateField } from './DateField';
import { NotesField } from './NotesField';
import { PanelGroup } from './PanelGroup';
import { PayeeField } from './PayeeField';
import type { TransactionDraft } from './useTransactionDraft';
import type { TransactionLookups } from './useTransactionLookups';

type TransactionDetailFieldsProps = {
  draft: TransactionDraft;
  lookups: TransactionLookups;
};

/**
 * A saved transaction's fields, payee first since the date and account
 * already head the panel. A reconciled transaction is read-only until
 * unlocked.
 */
export function TransactionDetailFields({
  draft,
  lookups,
}: TransactionDetailFieldsProps) {
  const { parent } = draft;
  const isLocked = parent.reconciled === true;

  return (
    <PanelGroup>
      <PayeeField
        payeeId={parent.payee}
        onChange={draft.setPayee}
        isDisabled={isLocked}
      />
      {!lookups.hidesCategory && draft.remaining === null && (
        <CategoryField
          categoryId={parent.category}
          onChange={category => draft.setFields({ category })}
          isFromRule={draft.isCategoryFromRule}
          isDisabled={isLocked}
        />
      )}
      <AmountField
        amount={parent.amount}
        direction={draft.direction}
        onChangeDirection={draft.setDirection}
        onChangeFigure={draft.setAmount}
        isDisabled={isLocked}
      />
      <DateField
        date={parent.date}
        onChange={date => draft.setFields({ date })}
        isDisabled={isLocked}
      />
      <AccountField
        accountId={parent.account}
        includeClosedAccounts
        onChange={account => draft.setFields({ account })}
        isDisabled={isLocked}
      />
      <NotesField
        notes={parent.notes}
        onChange={notes => draft.setFields({ notes })}
        isDisabled={isLocked}
      />
      <ClearedField
        isCleared={parent.cleared === true}
        onChange={cleared => draft.setFields({ cleared })}
        isDisabled={isLocked}
      />
    </PanelGroup>
  );
}
