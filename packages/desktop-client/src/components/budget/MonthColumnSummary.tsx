import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgCheveronDown } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { NotesButton } from '#components/NotesButton';
import { usePanels } from '#components/panels/PanelProvider';
import { useLocale } from '#hooks/useLocale';
import { SheetNameProvider } from '#hooks/useSheetName';

import { TotalsList } from './envelope/budgetsummary/TotalsList';
import { useEnvelopeBudget } from './envelope/EnvelopeBudgetContext';
import { MonthToolsMenu } from './MonthToolsMenu';
import { OverflowMenuIcon } from './OverflowMenuIcon';
import { MonthSummaryPanel } from './panels/MonthSummaryPanel';
import { BUDGET_PANEL_KEYS } from './panels/panelKeys';
import { PlanActualLists } from './rail/PlanActualLists';
import { SavingsHeadline } from './rail/SavingsHeadline';
import { ToBudgetHeadline } from './rail/ToBudgetHeadline';

type MonthColumnSummaryProps = {
  month: string;
  budgetType: 'envelope' | 'tracking';
  isFocused: boolean;
  isDetailsOpen: boolean;
  onFocus: (month: string) => void;
  onToggleDetails: () => void;
};

const ACCENT_UNDERLINE = 2;

/**
 * A compare-mode column header: the month's headline figure, its Details,
 * and Month tools that act on this column's month. Clicking it focuses the
 * month for ⇧T and the header Month tools.
 */
export function MonthColumnSummary({
  month,
  budgetType,
  isFocused,
  isDetailsOpen,
  onFocus,
  onToggleDetails,
}: MonthColumnSummaryProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { open } = usePanels();
  const { onBudgetAction } = useEnvelopeBudget();
  const isCurrentMonth = month === monthUtils.currentMonth();

  return (
    <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
      <View
        data-testid="budget-summary"
        data-month={month}
        aria-description={isCurrentMonth ? t('Current month') : undefined}
        onClick={() => onFocus(month)}
        style={{
          flex: 1,
          minWidth: 0,
          gap: spacing.sm,
          padding: `${spacing.md}px ${spacing.md}px ${spacing.sm}px`,
          borderRadius: radius.md,
          backgroundColor: isFocused
            ? theme.tableRowBackgroundHover
            : 'transparent',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <Button
            variant="bare"
            aria-pressed={isFocused}
            onPress={() => onFocus(month)}
            style={{
              padding: '2px 0',
              borderRadius: 0,
              fontSize: 13,
              fontWeight: 600,
              color: theme.pageTextDark,
              borderBottom: `${ACCENT_UNDERLINE}px solid ${isCurrentMonth ? theme.accent : 'transparent'}`,
            }}
          >
            {monthUtils.format(month, 'MMMM', locale)}
          </Button>
          <Text style={{ ...styles.monoLabel, color: theme.pageTextSubdued }}>
            {monthUtils.format(month, 'yyyy', locale)}
          </Text>
          <View style={{ flex: 1 }} />
          <NotesButton
            id={`budget-${month}`}
            width={13}
            height={13}
            tooltipPosition="bottom right"
            defaultColor={theme.pageTextLight}
          />
          <MonthToolsMenu
            month={month}
            ariaLabel={t('Month tools for {{month}}', {
              month: monthUtils.format(month, 'MMMM yyyy', locale),
            })}
            triggerStyle={{ width: 26, height: 26, padding: 0 }}
            extraItems={[
              {
                name: 'month-summary',
                text: t('Month summary'),
                onSelect: () =>
                  open({
                    key: BUDGET_PANEL_KEYS.monthSummary,
                    element: (
                      <MonthSummaryPanel
                        key={month}
                        month={month}
                        onBudgetAction={onBudgetAction}
                      />
                    ),
                  }),
              },
            ]}
          >
            <OverflowMenuIcon />
          </MonthToolsMenu>
        </View>
        {budgetType === 'tracking' ? (
          <SavingsHeadline month={month} fontSize={22} />
        ) : (
          <ToBudgetHeadline month={month} fontSize={22} />
        )}
        <Button
          variant="bare"
          aria-expanded={isDetailsOpen}
          onPress={onToggleDetails}
          style={{
            alignSelf: 'flex-start',
            gap: spacing.xs,
            padding: '2px 0',
            fontSize: 12,
            color: theme.pageTextLight,
          }}
        >
          <Trans>Details</Trans>
          <SvgCheveronDown
            width={9}
            height={9}
            style={{ transform: isDetailsOpen ? 'rotate(180deg)' : undefined }}
          />
        </Button>
        {isDetailsOpen &&
          (budgetType === 'tracking' ? (
            <PlanActualLists month={month} />
          ) : (
            <TotalsList
              prevMonthName={monthUtils.format(
                monthUtils.prevMonth(month),
                'MMM',
                locale,
              )}
            />
          ))}
      </View>
    </SheetNameProvider>
  );
}
