import type { ReactNode } from 'react';

import type { FeatureFlag } from '@actual-app/core/types/prefs';

import { Checkbox } from '#components/forms';
import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useSyncedPref } from '#hooks/useSyncedPref';

import { FeatureControl } from './FeatureControl';
import { FeatureDetails } from './FeatureDetails';
import { SettingsRow } from './SettingsRow';

type FeatureFlagToggleProps = {
  flag: FeatureFlag;
  disableToggle?: boolean;
  error?: ReactNode;
  children: ReactNode;
  feedbackLink?: string;
  note?: ReactNode;
  isSubFeature?: boolean;
  subFeatures?: ReactNode;
  onDisable?: () => void;
};

/** A settings row that switches one feature flag of the budget. */
export function FeatureFlagToggle({
  flag: flagName,
  disableToggle = false,
  feedbackLink,
  error,
  children,
  note,
  isSubFeature = false,
  subFeatures,
  onDisable,
}: FeatureFlagToggleProps) {
  const enabled = useFeatureFlag(flagName);
  const [_, setFlagPref] = useSyncedPref(`flags.${flagName}`);
  const id = `settings-flag-${flagName}`;

  return (
    <SettingsRow
      htmlFor={id}
      title={children}
      isNested={isSubFeature}
      description={
        (note || (disableToggle && error)) && (
          <FeatureDetails note={note} error={disableToggle ? error : null} />
        )
      }
      control={
        <FeatureControl feedbackLink={feedbackLink}>
          <Checkbox
            id={id}
            checked={enabled}
            onChange={() => {
              setFlagPref(String(!enabled));
              if (enabled) {
                onDisable?.();
              }
            }}
            disabled={disableToggle}
            style={{ marginRight: 0 }}
          />
        </FeatureControl>
      }
    >
      {subFeatures}
    </SettingsRow>
  );
}
