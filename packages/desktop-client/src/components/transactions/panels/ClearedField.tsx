import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Toggle } from '@actual-app/components/toggle';

import { PanelField } from './PanelField';

type ClearedFieldProps = {
  isCleared: boolean;
  onChange: (isCleared: boolean) => void;
  isDisabled?: boolean;
};

export function ClearedField({
  isCleared,
  onChange,
  isDisabled,
}: ClearedFieldProps) {
  const { t } = useTranslation();
  const id = useId();

  return (
    <PanelField label={t('Cleared')} htmlFor={id}>
      <Toggle
        id={id}
        isOn={isCleared}
        isDisabled={isDisabled}
        onToggle={onChange}
      />
    </PanelField>
  );
}
