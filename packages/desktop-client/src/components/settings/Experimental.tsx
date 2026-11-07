import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { ServerPrefs } from '@actual-app/core/types/prefs';

import { useAuth } from '#auth/AuthProvider';
import { Permissions } from '#auth/types';
import { Checkbox } from '#components/forms';
import { useLoginMethod, useMultiuserEnabled } from '#components/ServerContext';
import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useServerPref } from '#hooks/useServerPref';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { useSyncServerStatus } from '#hooks/useSyncServerStatus';

import { FeatureControl } from './FeatureControl';
import { FeatureDetails } from './FeatureDetails';
import { FeatureFlagToggle } from './FeatureFlagToggle';
import { SettingsGroup } from './SettingsGroup';
import { SettingsRow } from './SettingsRow';

type ServerFeatureToggleProps = {
  prefName: keyof ServerPrefs;
  disableToggle?: boolean;
  error?: ReactNode;
  children: ReactNode;
  feedbackLink?: string;
};

function ServerFeatureToggle({
  prefName,
  disableToggle = false,
  feedbackLink,
  error,
  children,
}: ServerFeatureToggleProps) {
  const [enabled, setEnabled] = useServerPref(prefName);

  const syncServerStatus = useSyncServerStatus();
  const isUsingServer = syncServerStatus !== 'no-server';
  const isServerOffline = syncServerStatus === 'offline';
  const { hasPermission } = useAuth();
  const loginMethod = useLoginMethod();
  const multiuserEnabled = useMultiuserEnabled();

  if (!isUsingServer || isServerOffline) {
    return null;
  }

  // Show to admins if OIDC is enabled, or to everyone if multi-user is not enabled
  const isAdmin = hasPermission(Permissions.ADMINISTRATOR);
  const oidcEnabled = loginMethod === 'openid';
  const shouldShow = (oidcEnabled && isAdmin) || !multiuserEnabled;

  if (!shouldShow) {
    return null;
  }

  const id = `settings-flag-${prefName}`;

  return (
    <SettingsRow
      htmlFor={id}
      title={children}
      description={disableToggle && error && <FeatureDetails error={error} />}
      control={
        <FeatureControl feedbackLink={feedbackLink}>
          <Checkbox
            id={id}
            checked={enabled === 'true'}
            onChange={() => {
              setEnabled(enabled === 'true' ? 'false' : 'true');
            }}
            disabled={disableToggle}
            style={{ marginRight: 0 }}
          />
        </FeatureControl>
      }
    />
  );
}

export function ExperimentalFeatures() {
  const { t } = useTranslation();
  const goalTemplatesEnabled = useFeatureFlag('goalTemplatesEnabled');
  const [, setGoalTemplatesUIPref] = useSyncedPref(
    'flags.goalTemplatesUIEnabled',
  );

  const showServerPrefs =
    localStorage.getItem('devEnableServerPrefs') === 'true';

  return (
    <SettingsGroup
      title={t('Experimental features')}
      description={t(
        'These features are not fully tested and may not work as expected. THEY MAY CAUSE IRRECOVERABLE DATA LOSS. They may do nothing at all. Only enable them if you know what you are doing.',
      )}
    >
      <FeatureFlagToggle
        flag="goalTemplatesEnabled"
        onDisable={() => setGoalTemplatesUIPref('false')}
        subFeatures={
          goalTemplatesEnabled && (
            <FeatureFlagToggle
              flag="goalTemplatesUIEnabled"
              feedbackLink="https://github.com/actualbudget/actual/issues/7692"
              isSubFeature
            >
              <Trans>Budget automations UI</Trans>
            </FeatureFlagToggle>
          )
        }
      >
        <Trans>Goal templates</Trans>
      </FeatureFlagToggle>
      <FeatureFlagToggle
        flag="actionTemplating"
        feedbackLink="https://github.com/actualbudget/actual/issues/3606"
        note={
          <Trans>
            Deprecated: this feature will be removed in a future release. Use
            Excel formula mode (Rule formulae) instead.
          </Trans>
        }
      >
        <Trans>Rule action templating</Trans>
      </FeatureFlagToggle>
      <FeatureFlagToggle
        flag="formulaMode"
        feedbackLink="https://github.com/actualbudget/actual/issues/5949"
      >
        <Trans>Excel formula mode (Formula cards & Rule formulas)</Trans>
      </FeatureFlagToggle>
      <FeatureFlagToggle
        flag="currency"
        feedbackLink="https://github.com/actualbudget/actual/issues/5191"
      >
        <Trans>Currency support</Trans>
      </FeatureFlagToggle>
      <FeatureFlagToggle
        flag="mobileCalculator"
        feedbackLink="https://github.com/actualbudget/actual/issues/8255"
      >
        <Trans>Mobile calculator</Trans>
      </FeatureFlagToggle>
      <FeatureFlagToggle
        flag="newSidebarUI"
        feedbackLink="https://github.com/actualbudget/actual/issues/9007"
      >
        <Trans>Redesigned sidebar</Trans>
      </FeatureFlagToggle>
      <FeatureFlagToggle
        flag="sankeyReport"
        feedbackLink="https://github.com/actualbudget/actual/issues/1919"
      >
        <Trans>Sankey report</Trans>
      </FeatureFlagToggle>
      <FeatureFlagToggle
        flag="balanceForecastReport"
        feedbackLink="https://github.com/actualbudget/actual/issues/7669"
      >
        <Trans>Balance Forecast Report</Trans>
      </FeatureFlagToggle>
      <FeatureFlagToggle
        flag="budgetAnalysisReport"
        feedbackLink="https://github.com/actualbudget/actual/issues/6742"
      >
        <Trans>Budget Analysis Report</Trans>
      </FeatureFlagToggle>
      <FeatureFlagToggle
        flag="monteCarloReport"
        feedbackLink="https://github.com/actualbudget/actual/issues/8571"
      >
        <Trans>Monte Carlo Analysis Report</Trans>
      </FeatureFlagToggle>
      {showServerPrefs && (
        <ServerFeatureToggle
          prefName="flags.plugins"
          disableToggle
          feedbackLink="https://github.com/actualbudget/actual/issues/5950"
        >
          <Trans>Client-Side plugins (soon)</Trans>
        </ServerFeatureToggle>
      )}
    </SettingsGroup>
  );
}
