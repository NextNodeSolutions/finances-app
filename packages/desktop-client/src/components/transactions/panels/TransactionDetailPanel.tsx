import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import type { TransactionEntity } from '@actual-app/core/types/models';

import { SidePanel } from '#components/common/SidePanel';
import { usePanels } from '#components/panels/PanelProvider';

import { PanelGroup } from './PanelGroup';
import { TransactionDetailForm } from './TransactionDetailForm';
import { TransactionPanelSkeleton } from './TransactionPanelSkeleton';
import { useLiveTransaction } from './useLiveTransaction';

const TEST_ID = 'transaction-detail-panel';

type TransactionDetailPanelProps = {
  /** A split line's id shows its whole split. */
  transactionId: TransactionEntity['id'];
};

/** The `transaction-detail` side panel. */
export function TransactionDetailPanel({
  transactionId,
}: TransactionDetailPanelProps) {
  const { t } = useTranslation();
  const { close } = usePanels();
  const live = useLiveTransaction(transactionId);

  if (live.status === 'loading') {
    return <TransactionPanelSkeleton testId={TEST_ID} onClose={close} />;
  }

  if (live.status === 'missing') {
    return (
      <SidePanel
        title={t('Transaction')}
        testId={TEST_ID}
        onClose={close}
        footer={
          <Button variant="primary" onPress={close}>
            <Trans>Close</Trans>
          </Button>
        }
      >
        <PanelGroup>
          <Text
            style={{
              paddingBlock: spacing.sm,
              fontSize: 13,
              color: theme.pageText,
            }}
          >
            <Trans>This transaction no longer exists.</Trans>
          </Text>
        </PanelGroup>
      </SidePanel>
    );
  }

  const [parent] = live.transactions;
  // Keyed by the parent so another transaction starts a clean draft.
  return <TransactionDetailForm key={parent.id} base={live.transactions} />;
}
