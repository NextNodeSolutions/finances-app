import React from 'react';
import type { ComponentProps } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Input } from '@actual-app/components/input';
import { View } from '@actual-app/components/view';

import { LabeledCheckbox } from '#components/forms/LabeledCheckbox';

type MultiplierOptionProps = {
  multiplierEnabled: boolean;
  multiplierAmount: string;
  onToggle: ComponentProps<typeof LabeledCheckbox>['onChange'];
  onChangeAmount: (newValue: string) => void;
};

export function MultiplierOption({
  multiplierEnabled,
  multiplierAmount,
  onToggle,
  onChangeAmount,
}: MultiplierOptionProps) {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 28,
      }}
    >
      <LabeledCheckbox
        id="add_multiplier"
        // The input follows its label instead of the far edge of the column.
        style={{ flex: '0 1 auto' }}
        checked={multiplierEnabled}
        onChange={onToggle}
      >
        <Trans>Multiply amount</Trans>
      </LabeledCheckbox>
      <Input
        type="text"
        style={{ display: multiplierEnabled ? 'inherit' : 'none' }}
        value={multiplierAmount}
        placeholder={t('Multiplier')}
        onChangeValue={onChangeAmount}
      />
    </View>
  );
}
