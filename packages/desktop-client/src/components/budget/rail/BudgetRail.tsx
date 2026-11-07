import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';
import { elevation, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { SheetNameProvider } from '#hooks/useSheetName';

export const BUDGET_RAIL_WIDTH = 320;

type BudgetRailProps = {
  month: string;
  /** `budget-summary` on the page, `month-summary-panel` content elsewhere. */
  testId?: string;
  children: ReactNode;
};

/** The paper card beside a one-month budget, bound to that month's sheet. */
export function BudgetRail({
  month,
  testId = 'budget-summary',
  children,
}: BudgetRailProps) {
  return (
    <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
      <View
        data-testid={testId}
        data-month={month}
        style={{
          width: BUDGET_RAIL_WIDTH,
          flexShrink: 0,
          alignSelf: 'flex-start',
          maxHeight: '100%',
          overflowY: 'auto',
          gap: spacing.lg,
          padding: 20,
          backgroundColor: theme.cardBackground,
          border: `1px solid ${theme.hairline}`,
          borderRadius: radius.lg,
          boxShadow: elevation.card,
        }}
      >
        {children}
      </View>
    </SheetNameProvider>
  );
}
