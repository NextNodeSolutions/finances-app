import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { integerToAmount } from '@actual-app/core/shared/util';
import type { IntegerAmount } from '@actual-app/core/shared/util';
import type {
  AccountEntity,
  CategoryEntity,
  PayeeEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';

import { usePanels } from '#components/panels/PanelProvider';
import { useNavigate } from '#hooks/useNavigate';

import { NewTransactionPanel } from './NewTransactionPanel';
import { TransactionDetailPanel } from './TransactionDetailPanel';

export const NEW_TRANSACTION_PANEL_KEY = 'new-transaction';
export const TRANSACTION_DETAIL_PANEL_KEY = 'transaction-detail';

/** What a caller already knows about the transaction it wants to add. */
export type NewTransactionPrefill = {
  accountId?: AccountEntity['id'];
  categoryId?: CategoryEntity['id'];
  /** An existing payee. Takes precedence over `payeeName`. */
  payeeId?: PayeeEntity['id'];
  /** A payee typed by the user that may not exist yet. */
  payeeName?: string;
  /** Signed cents: negative for a payment, positive for a deposit. */
  amount?: IntegerAmount;
  /** `YYYY-MM-DD`; today when omitted. */
  date?: string;
  notes?: string;
};

export type TransactionPanelsOpener = {
  /** Starts a new transaction beside the current page. */
  openNew: (prefill?: NewTransactionPrefill) => void;
  /** Shows one transaction's details beside the current page. */
  openDetail: (id: TransactionEntity['id']) => void;
};

/**
 * Opens the transaction panels. Narrow screens have no side panel, so they go
 * to the existing mobile transaction pages instead.
 */
export function useTransactionPanels(): TransactionPanelsOpener {
  const { isNarrowWidth } = useResponsive();
  const navigate = useNavigate();
  const panels = usePanels();

  const openNew = (prefill: NewTransactionPrefill = {}) => {
    if (isNarrowWidth) {
      void navigate(`/transactions/new${getMobileNewSearch(prefill)}`, {
        state: {
          accountId: prefill.accountId,
          categoryId: prefill.categoryId,
        },
      });
      return;
    }
    panels.open({
      key: NEW_TRANSACTION_PANEL_KEY,
      Component: NewTransactionPanel,
      props: { prefill },
    });
  };

  const openDetail = (id: TransactionEntity['id']) => {
    if (isNarrowWidth) {
      void navigate(`/transactions/${id}`);
      return;
    }
    panels.open({
      key: TRANSACTION_DETAIL_PANEL_KEY,
      Component: TransactionDetailPanel,
      props: { transactionId: id },
    });
  };

  return { openNew, openDetail };
}

/**
 * The mobile new-transaction page reads the payee by name and the amount as a
 * payment in decimal units from its search params.
 */
function getMobileNewSearch(prefill: NewTransactionPrefill): string {
  const params = new URLSearchParams();
  if (prefill.payeeName && !prefill.payeeId) {
    params.set('payee', prefill.payeeName);
  }
  if (prefill.amount != null) {
    params.set('amount', String(integerToAmount(-prefill.amount)));
  }
  if (prefill.date) {
    params.set('date', prefill.date);
  }
  if (prefill.notes) {
    params.set('notes', prefill.notes);
  }
  const search = params.toString();
  return search === '' ? '' : `?${search}`;
}
