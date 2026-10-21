import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import type {
  AccountEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';

import { Link } from '#components/common/Link';

import { PanelField } from './PanelField';
import { TransactionScheduleField } from './TransactionScheduleField';

type TransactionMetadataProps = {
  transaction: TransactionEntity;
  transferAccount: AccountEntity | undefined;
  onLinkSchedule: () => void;
  onUnlock: () => void;
};

/** Read-only facts about a saved transaction, under its fields. */
export function TransactionMetadata({
  transaction,
  transferAccount,
  onLinkSchedule,
  onUnlock,
}: TransactionMetadataProps) {
  const { t } = useTranslation();

  return (
    <>
      {transaction.imported_payee && (
        <PanelField label={t('Imported as')}>
          <Text style={{ fontSize: 13, color: theme.pageText }}>
            {transaction.imported_payee}
          </Text>
        </PanelField>
      )}
      {transferAccount && (
        <PanelField label={t('Transfer')}>
          <Link
            variant="internal"
            to={`/accounts/${transferAccount.id}`}
            style={{
              fontSize: 13,
              color: theme.pageTextLink,
              textDecorationThickness: '1px',
              textUnderlineOffset: '0.2em',
            }}
          >
            {transaction.amount > 0 ? (
              <Trans>Transfer from {{ account: transferAccount.name }}</Trans>
            ) : (
              <Trans>Transfer to {{ account: transferAccount.name }}</Trans>
            )}
          </Link>
        </PanelField>
      )}
      <TransactionScheduleField
        scheduleId={transaction.schedule}
        onLinkSchedule={onLinkSchedule}
      />
      {transaction.reconciled && (
        <PanelField label={t('Reconciled')}>
          <Button style={{ alignSelf: 'flex-start' }} onPress={onUnlock}>
            <Trans>Unlock</Trans>
          </Button>
        </PanelField>
      )}
    </>
  );
}
