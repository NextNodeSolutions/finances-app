import { usePanelFocusRequest } from '#components/panels/PanelProvider';

import { NewTransactionForm } from './NewTransactionForm';
import type { NewTransactionPrefill } from './useTransactionPanels';

type NewTransactionPanelProps = {
  prefill?: NewTransactionPrefill;
};

/**
 * The `new-transaction` side panel. Every open starts a fresh entry, so a
 * second open (the palette with another amount) applies its own prefill.
 */
export function NewTransactionPanel({
  prefill = {},
}: NewTransactionPanelProps) {
  const openRequest = usePanelFocusRequest();
  return <NewTransactionForm key={openRequest ?? 0} prefill={prefill} />;
}
