import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import {
  format as formatDate,
  monthFromDate,
  sheetForMonth,
} from '@actual-app/core/shared/months';

import { SidePanel } from '#components/common/SidePanel';
import { FinancialText } from '#components/FinancialText';
import { usePanels } from '#components/panels/PanelProvider';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useDateFormat } from '#hooks/useDateFormat';
import { useFormat } from '#hooks/useFormat';
import { SheetNameProvider } from '#hooks/useSheetName';

import { DiscardChangesConfirm } from './DiscardChangesConfirm';
import { PanelGroup } from './PanelGroup';
import { SplitEditor } from './SplitEditor';
import { TransactionDetailFields } from './TransactionDetailFields';
import type { DraftTransactions } from './transactionDraft';
import { TransactionMetadata } from './TransactionMetadata';
import { useTransactionDetailActions } from './useTransactionDetailActions';
import { useTransactionDraft } from './useTransactionDraft';
import { useTransactionLookups } from './useTransactionLookups';

const HEADLINE_SIZE = 28;

type TransactionDetailFormProps = {
  /** The saved transaction, kept live. */
  base: DraftTransactions;
};

/** Reads and edits one saved transaction beside the page. */
export function TransactionDetailForm({ base }: TransactionDetailFormProps) {
  const { t } = useTranslation();
  const { close } = usePanels();
  const format = useFormat();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const draft = useTransactionDraft(base, 'category');
  const { parent } = draft;
  const lookups = useTransactionLookups(parent);
  const actions = useTransactionDetailActions(draft, lookups.account);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  const canSave =
    draft.isDirty &&
    (draft.remaining === null || draft.remaining === 0) &&
    !actions.isSaving;
  const payeeName = lookups.transferAccount?.name || lookups.payee?.name;

  const onClose = () => {
    if (isConfirmingDiscard) {
      setIsConfirmingDiscard(false);
    } else if (draft.isDirty) {
      setIsConfirmingDiscard(true);
    } else {
      close();
    }
  };

  return (
    <SidePanel
      testId="transaction-detail-panel"
      title={payeeName || t('No payee')}
      subtitle={[formatDate(parent.date, dateFormat), lookups.account?.name]
        .filter(Boolean)
        .join(' · ')}
      headline={
        <PrivacyFilter>
          <FinancialText
            style={{
              ...styles.display,
              fontSize: HEADLINE_SIZE,
              lineHeight: `${HEADLINE_SIZE + 6}px`,
              color: theme.pageTextDark,
            }}
          >
            {format(parent.amount, 'financial')}
          </FinancialText>
        </PrivacyFilter>
      }
      onClose={onClose}
      onPrimaryAction={canSave ? () => void actions.save() : undefined}
      footer={
        isConfirmingDiscard ? (
          <DiscardChangesConfirm
            onKeepEditing={() => setIsConfirmingDiscard(false)}
            onDiscard={close}
          />
        ) : (
          <>
            <Button onPress={actions.remove}>
              <Trans>Delete</Trans>
            </Button>
            <Button isDisabled={draft.isDirty} onPress={actions.duplicate}>
              <Trans>Duplicate</Trans>
            </Button>
            <View style={{ flex: 1 }} />
            <Button
              variant="primary"
              isDisabled={!canSave}
              onPress={() => void actions.save()}
            >
              <Trans>Save</Trans>
            </Button>
          </>
        )
      }
    >
      <SheetNameProvider name={sheetForMonth(monthFromDate(parent.date))}>
        <TransactionDetailFields draft={draft} lookups={lookups} />
        <PanelGroup>
          {(draft.remaining !== null || !lookups.hidesCategory) && (
            <SplitEditor
              draft={draft}
              isDisabled={parent.reconciled === true}
            />
          )}
          <TransactionMetadata
            transaction={parent}
            transferAccount={lookups.transferAccount}
            onLinkSchedule={actions.linkSchedule}
            onUnlock={actions.unlock}
          />
        </PanelGroup>
      </SheetNameProvider>
    </SidePanel>
  );
}
