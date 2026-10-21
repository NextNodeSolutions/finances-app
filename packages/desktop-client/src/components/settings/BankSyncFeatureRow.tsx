import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';

import { useAccounts } from '#hooks/useAccounts';
import { useSyncServerStatus } from '#hooks/useSyncServerStatus';

import { FeatureFlagToggle } from './FeatureFlagToggle';
import { OptionalFeatureRow } from './OptionalFeatureRow';

/** The bank sync switch, with the experimental bank providers under it. */
export function BankSyncFeatureRow() {
  const { t } = useTranslation();
  const { data: accounts = [] } = useAccounts();
  const isUsingServer = useSyncServerStatus() !== 'no-server';
  const linkedCount = accounts.filter(
    account =>
      !account.closed &&
      !account.tombstone &&
      account.account_sync_source != null,
  ).length;

  return (
    <OptionalFeatureRow
      feature="bankSync"
      title={t('Bank sync')}
      description={
        <>
          <Trans>
            Download transactions from your bank (GoCardless, SimpleFIN, Enable
            Banking, Akahu).
          </Trans>
          {!isUsingServer && (
            <Text style={{ display: 'block' }}>
              <Trans>Requires a sync server.</Trans>
            </Text>
          )}
        </>
      }
      consequence={
        linkedCount > 0 &&
        t(
          '{{count}} linked accounts will stop downloading. Their links are kept, and turning this back on resumes them.',
          { count: linkedCount },
        )
      }
    >
      {isUsingServer && (
        <>
          <FeatureFlagToggle
            flag="enableBanking"
            feedbackLink="https://github.com/actualbudget/actual/issues/7799"
            isSubFeature
          >
            <Trans>Enable Banking (experimental)</Trans>
          </FeatureFlagToggle>
          <FeatureFlagToggle
            flag="akahuBankSync"
            feedbackLink="https://github.com/actualbudget/actual/issues/8020"
            isSubFeature
          >
            <Trans>Akahu (experimental)</Trans>
          </FeatureFlagToggle>
        </>
      )}
    </OptionalFeatureRow>
  );
}
