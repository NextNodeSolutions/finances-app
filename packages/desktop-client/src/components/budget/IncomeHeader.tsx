import React from 'react';
import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgAdd } from '@actual-app/components/icons/v0';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { useGlobalPref } from '#hooks/useGlobalPref';

import { RenderMonths } from './RenderMonths';

import { useBudgetComponents } from '.';

type IncomeHeaderProps = {
  onShowNewGroup: () => void;
};

export function IncomeHeader({ onShowNewGroup }: IncomeHeaderProps) {
  const [categoryExpandedStatePref] = useGlobalPref('categoryExpandedState');
  const categoryExpandedState = categoryExpandedStatePref ?? 0;
  const { IncomeHeaderComponent: MonthComponent } = useBudgetComponents();
  return (
    <View style={{ flexDirection: 'row', flex: 1 }}>
      <View
        style={{
          width: 200 + 100 * categoryExpandedState,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
      >
        <Button
          variant="bare"
          onPress={onShowNewGroup}
          style={{
            gap: 6,
            margin: '12px 0 0 14px',
            padding: '5px 9px',
            fontSize: 12,
            fontWeight: 500,
            borderRadius: radius.md,
            color: theme.pageTextLight,
          }}
        >
          <SvgAdd style={{ width: 9, height: 9, flexShrink: 0 }} />
          <Trans>Add group</Trans>
        </Button>
      </View>
      <RenderMonths style={{ border: 0, justifyContent: 'flex-end' }}>
        <MonthComponent />
      </RenderMonths>
    </View>
  );
}
