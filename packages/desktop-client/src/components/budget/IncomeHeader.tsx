import React from 'react';

import { View } from '@actual-app/components/view';

import { useGlobalPref } from '#hooks/useGlobalPref';

import { RenderMonths } from './RenderMonths';

import { useBudgetComponents } from '.';

/** The band above the income group, carrying each month's column labels. */
export function IncomeHeader() {
  const [categoryExpandedStatePref] = useGlobalPref('categoryExpandedState');
  const categoryExpandedState = categoryExpandedStatePref ?? 0;
  const { IncomeHeaderComponent: MonthComponent } = useBudgetComponents();
  return (
    <View style={{ flexDirection: 'row', flex: 1 }}>
      <View style={{ width: 200 + 100 * categoryExpandedState }} />
      <RenderMonths style={{ border: 0, justifyContent: 'flex-end' }}>
        <MonthComponent />
      </RenderMonths>
    </View>
  );
}
