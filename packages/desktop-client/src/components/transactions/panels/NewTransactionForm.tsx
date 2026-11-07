import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { monthFromDate, sheetForMonth } from '@actual-app/core/shared/months';

import { SidePanel } from '#components/common/SidePanel';
import { usePanels } from '#components/panels/PanelProvider';
import { SheetNameProvider } from '#hooks/useSheetName';

import { AccountField } from './AccountField';
import { AmountField } from './AmountField';
import { CategoryField } from './CategoryField';
import { ClearedField } from './ClearedField';
import { DateField } from './DateField';
import { NotesField } from './NotesField';
import { PanelGroup } from './PanelGroup';
import { PayeeField } from './PayeeField';
import { PendingPayeeField } from './PendingPayeeField';
import { SplitEditor } from './SplitEditor';
import { useNewTransactionEntry } from './useNewTransactionEntry';
import { useSaveNewTransaction } from './useSaveNewTransaction';
import { useTransactionLookups } from './useTransactionLookups';
import type { NewTransactionPrefill } from './useTransactionPanels';

type NewTransactionFormProps = {
  prefill: NewTransactionPrefill;
};

/** Enters one transaction; nothing is saved until Save. */
export function NewTransactionForm({ prefill }: NewTransactionFormProps) {
  const { t } = useTranslation();
  const { close } = usePanels();
  const entry = useNewTransactionEntry(prefill);
  const saveNewTransaction = useSaveNewTransaction();
  const { draft } = entry;
  const { parent } = draft;
  const { account, hidesCategory } = useTransactionLookups(parent);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPayeeAutoFocused, setIsPayeeAutoFocused] = useState(false);
  const payeeInputRef = useRef<HTMLInputElement>(null);

  const isSplit = draft.remaining !== null;
  const canSubmit =
    (draft.remaining === null || draft.remaining === 0) && !isSaving;

  const commit = async () => {
    if (!account) {
      setHasAttemptedSave(true);
      return false;
    }
    setIsSaving(true);
    const isSaved = await saveNewTransaction(
      draft.transactions,
      account,
      entry.pendingPayeeName,
    );
    setIsSaving(false);
    return isSaved;
  };

  const onSave = async () => {
    if (await commit()) {
      close();
    }
  };

  const onSaveAndAddAnother = async () => {
    if (await commit()) {
      setHasAttemptedSave(false);
      entry.startAnother();
      payeeInputRef.current?.focus();
    }
  };

  return (
    <SidePanel
      title={t('New transaction')}
      testId="new-transaction-panel"
      onClose={close}
      onPrimaryAction={canSubmit ? () => void onSave() : undefined}
      footer={
        <>
          <Button
            isDisabled={!canSubmit}
            onPress={() => void onSaveAndAddAnother()}
          >
            <Trans>Save and add another</Trans>
          </Button>
          <Button
            variant="primary"
            isDisabled={!canSubmit}
            onPress={() => void onSave()}
          >
            <Trans>Save</Trans>
          </Button>
        </>
      }
    >
      <SheetNameProvider name={sheetForMonth(monthFromDate(parent.date))}>
        <PanelGroup>
          <AccountField
            accountId={parent.account}
            includeClosedAccounts={false}
            onChange={accountId => draft.setFields({ account: accountId })}
            error={
              hasAttemptedSave && !account
                ? t('Choose an account for this transaction.')
                : undefined
            }
          />
          <DateField
            date={parent.date}
            onChange={date => draft.setFields({ date })}
          />
          {entry.pendingPayeeName === null ? (
            <PayeeField
              payeeId={parent.payee}
              onChange={draft.setPayee}
              inputRef={payeeInputRef}
              autoFocus={isPayeeAutoFocused}
            />
          ) : (
            <PendingPayeeField
              name={entry.pendingPayeeName}
              onChange={() => {
                entry.clearPendingPayee();
                setIsPayeeAutoFocused(true);
              }}
            />
          )}
          {!hidesCategory && !isSplit && (
            <CategoryField
              categoryId={parent.category}
              onChange={category => draft.setFields({ category })}
              isFromRule={draft.isCategoryFromRule}
            />
          )}
          <AmountField
            amount={parent.amount}
            direction={draft.direction}
            onChangeDirection={draft.setDirection}
            onChangeFigure={draft.setAmount}
            autoFocus={entry.hasPrefilledPayee}
          />
          <NotesField
            notes={parent.notes}
            onChange={notes => draft.setFields({ notes })}
          />
          <ClearedField
            isCleared={parent.cleared === true}
            onChange={cleared => draft.setFields({ cleared })}
          />
        </PanelGroup>
        {(isSplit || !hidesCategory) && (
          <PanelGroup>
            <SplitEditor draft={draft} isDisabled={false} />
          </PanelGroup>
        )}
      </SheetNameProvider>
    </SidePanel>
  );
}
