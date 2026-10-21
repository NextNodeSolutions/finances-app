import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import {
  SvgCheveronDown,
  SvgCheveronLeft,
  SvgCheveronRight,
} from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { NotesButton } from '#components/NotesButton';
import { useGlobalPref } from '#hooks/useGlobalPref';

import { BudgetMethodPill } from './BudgetMethodPill';
import { getCurrentMonthStart, getVisibleMonths } from './budgetMonths';
import { BudgetMonthTitle } from './BudgetMonthTitle';
import { MonthCountSelector } from './MonthCountSelector';
import type { MonthBounds } from './MonthsContext';
import { MonthToolsMenu } from './MonthToolsMenu';

type BudgetHeaderProps = {
  startMonth: string;
  numMonths: number;
  monthBounds: MonthBounds;
  /** The month Month tools and the notes act on. */
  focusedMonth: string;
  budgetType: 'envelope' | 'tracking';
  onMonthSelect: (month: string) => void;
};

const navButtonStyle = {
  width: 28,
  height: 28,
  padding: 0,
  color: theme.pageTextLight,
};

/**
 * Month title and navigation, the budgeting method, how many months show,
 * and the tools for the focused month.
 */
export function BudgetHeader({
  startMonth,
  numMonths,
  monthBounds,
  focusedMonth,
  budgetType,
  onMonthSelect,
}: BudgetHeaderProps) {
  const { t } = useTranslation();
  const [maxMonthsPref, setMaxMonthsPref] = useGlobalPref('maxMonths');
  const isCurrentMonthVisible = getVisibleMonths(
    startMonth,
    numMonths,
  ).includes(monthUtils.currentMonth());

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.sm,
        rowGap: spacing.xs,
        paddingBottom: spacing.md,
        flexShrink: 0,
      }}
    >
      <BudgetMonthTitle
        startMonth={startMonth}
        numMonths={numMonths}
        monthBounds={monthBounds}
        onMonthSelect={onMonthSelect}
      />
      <Button
        variant="bare"
        title={t('Previous month')}
        aria-label={t('Previous month')}
        onPress={() => onMonthSelect(monthUtils.prevMonth(startMonth))}
        style={navButtonStyle}
      >
        <SvgCheveronLeft width={14} height={14} />
      </Button>
      <Button
        variant="bare"
        title={t('Next month')}
        aria-label={t('Next month')}
        onPress={() => onMonthSelect(monthUtils.nextMonth(startMonth))}
        style={navButtonStyle}
      >
        <SvgCheveronRight width={14} height={14} />
      </Button>
      {!isCurrentMonthVisible && (
        <Button
          variant="bare"
          onPress={() =>
            onMonthSelect(getCurrentMonthStart(budgetType, numMonths))
          }
          style={{ color: theme.pageTextLink, fontWeight: 500 }}
        >
          <Trans>This month</Trans>
        </Button>
      )}
      <View style={{ marginLeft: spacing.sm }}>
        <BudgetMethodPill budgetType={budgetType} />
      </View>
      <View style={{ flex: 1 }} />
      <MonthCountSelector
        maxMonths={maxMonthsPref || 1}
        onChange={value => setMaxMonthsPref(value)}
      />
      <NotesButton
        id={`budget-${focusedMonth}`}
        width={14}
        height={14}
        tooltipPosition="bottom right"
        defaultColor={theme.pageTextLight}
      />
      <MonthToolsMenu
        month={focusedMonth}
        ariaLabel={t('Month tools')}
        triggerStyle={{
          gap: spacing.xs,
          fontWeight: 500,
          color: theme.pageText,
        }}
      >
        <Trans>Month tools</Trans>
        <SvgCheveronDown width={10} height={10} />
      </MonthToolsMenu>
    </View>
  );
}
