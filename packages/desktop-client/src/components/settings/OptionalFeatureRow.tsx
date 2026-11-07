import { useState } from 'react';
import type { ReactNode } from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { Toggle } from '@actual-app/components/toggle';
import type { OptionalFeature } from '@actual-app/core/types/prefs';

import { useOptionalFeature } from '#hooks/useOptionalFeature';

import { SettingsRow } from './SettingsRow';

type OptionalFeatureRowProps = {
  feature: OptionalFeature;
  title: string;
  description: ReactNode;
  /** What switching off leaves behind; null when nothing is affected. */
  consequence: ReactNode;
  /** Rows that only matter while the feature is on. */
  children?: ReactNode;
};

/**
 * One switchable feature. Switching off applies at once; the consequence
 * line then says what is kept, since the same switch brings it all back.
 */
export function OptionalFeatureRow({
  feature,
  title,
  description,
  consequence,
  children,
}: OptionalFeatureRowProps) {
  const [isOn, setOn] = useOptionalFeature(feature);
  const [hasSwitchedOff, setHasSwitchedOff] = useState(false);
  const id = `settings-feature-${feature}`;

  const onToggle = (nextIsOn: boolean) => {
    setHasSwitchedOff(!nextIsOn);
    setOn(nextIsOn);
  };

  return (
    <SettingsRow
      title={title}
      description={
        <>
          {description}
          <Text
            role="status"
            style={{ display: 'block', color: theme.settingsCardText }}
          >
            {!isOn && hasSwitchedOff && consequence}
          </Text>
        </>
      }
      control={
        <Toggle id={id} isOn={isOn} onToggle={onToggle} aria-label={title} />
      }
    >
      {isOn && children}
    </SettingsRow>
  );
}
