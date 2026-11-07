import React, { useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';

import type { DropPosition } from '#components/sort';
import { useCategories } from '#hooks/useCategories';
import { useGlobalPref } from '#hooks/useGlobalPref';
import { useLocalPref } from '#hooks/useLocalPref';
import type { useOverspentCategories } from '#hooks/useOverspentCategories';

import { BudgetCategories } from './BudgetCategories';
import type { NewBudgetItem } from './BudgetCategories';
import { getCategoryColumnWidth } from './budgetMonths';
import { BudgetToolbar } from './BudgetToolbar';
import { BudgetTotals } from './BudgetTotals';
import { MonthColumnSummaries } from './MonthColumnSummaries';
import { MonthsContext, MonthsProvider } from './MonthsContext';
import type { MonthBounds } from './MonthsContext';
import { useBudgetPanels } from './panels/useBudgetPanels';
import { useMonthCrossfade } from './useMonthCrossfade';
import {
  findSortDown,
  findSortUp,
  getScrollbarWidth,
  separateGroups,
} from './util';

type BudgetTableProps = {
  type: string;
  startMonth: string;
  numMonths: number;
  monthBounds: MonthBounds;
  onSaveCategory: (category: CategoryEntity) => void;
  onDeleteCategory: (id: CategoryEntity['id']) => void;
  onSaveGroup: (group: CategoryGroupEntity) => void;
  onDeleteGroup: (id: CategoryGroupEntity['id']) => void;
  onApplyBudgetTemplatesInGroup: (
    categoryIds: Array<CategoryEntity['id']>,
  ) => void;
  onSortCategories?: (
    groupId: CategoryGroupEntity['id'],
    direction: 'asc' | 'desc',
  ) => void;
  onReorderCategory: (params: {
    id: CategoryEntity['id'];
    groupId: CategoryGroupEntity['id'];
    targetId: CategoryEntity['id'] | null;
  }) => void;
  onReorderGroup: (params: {
    id: CategoryGroupEntity['id'];
    targetId: CategoryEntity['id'] | null;
  }) => void;
  onShowActivity: (id: CategoryEntity['id'], month?: string) => void;
  onBudgetAction: (month: string, type: string, args: unknown) => void;
  /** The month details, the Over budget filter and ⇧T act on. */
  focusedMonth: string;
  onFocusMonth: (month: string) => void;
  /** The focused month's overspent categories, for the filter. */
  overspent: ReturnType<typeof useOverspentCategories>;
  /** Compact per-month summaries above the columns (no rail beside). */
  hasColumnSummaries: boolean;
  /** Shown beside the table, under the toolbar: the month rail. */
  aside?: ReactNode;
};

export function BudgetTable(props: BudgetTableProps) {
  const {
    type,
    startMonth,
    numMonths,
    monthBounds,
    onSaveCategory,
    onDeleteCategory,
    onSaveGroup,
    onDeleteGroup,
    onApplyBudgetTemplatesInGroup,
    onSortCategories,
    onReorderCategory,
    onReorderGroup,
    onShowActivity,
    onBudgetAction,
    focusedMonth,
    onFocusMonth,
    overspent,
    hasColumnSummaries,
    aside,
  } = props;
  const { openCategory } = useBudgetPanels();
  const crossfadeRef = useMonthCrossfade(startMonth);
  const [newItem, setNewItem] = useState<NewBudgetItem>(null);
  const [isOverBudgetOnly, setIsOverBudgetOnly] = useState(false);

  const { data: { grouped: categoryGroups } = { grouped: [] } } =
    useCategories();
  const [collapsedGroupIds = [], setCollapsedGroupIdsPref] =
    useLocalPref('budget.collapsed');
  const [showHiddenCategories] = useLocalPref('budget.showHiddenCategories');
  const [categoryExpandedStatePref] = useGlobalPref('categoryExpandedState');
  const categoryWidth = getCategoryColumnWidth(categoryExpandedStatePref ?? 0);
  const overBudgetIds = new Set(
    overspent.categories
      .filter(
        category =>
          showHiddenCategories ||
          !(
            category.hidden ||
            categoryGroups.find(group => group.id === category.group)?.hidden
          ),
      )
      .map(category => category.id),
  );
  const [editing, setEditing] = useState<{ id: string; cell: string } | null>(
    null,
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(
      'budget-scroll-position',
    );
    if (savedScrollPosition != null && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = Number(savedScrollPosition);
      sessionStorage.removeItem('budget-scroll-position');
    }
  }, []);

  const onEditMonth = (id: string, month: string) => {
    setEditing(id ? { id, cell: month } : null);
  };

  const onEditName = (id: string) => {
    setEditing(id ? { id, cell: 'name' } : null);
  };

  const _onReorderCategory = (
    id: string,
    dropPos: DropPosition | null,
    targetId: string,
  ) => {
    const isGroup = !!categoryGroups.find(g => g.id === targetId);

    if (isGroup) {
      const { targetId: groupId } = findSortUp(
        categoryGroups,
        dropPos,
        targetId,
      );
      const group = categoryGroups.find(g => g.id === groupId);

      if (group) {
        const { categories = [] } = group;
        onReorderCategory({
          id,
          groupId: group.id,
          targetId:
            categories.length === 0 || dropPos === 'top'
              ? null
              : categories[0].id,
        });
      }
    } else {
      const group = categoryGroups.find(({ categories = [] }) =>
        categories.some(cat => cat.id === targetId),
      );

      if (group) {
        onReorderCategory({
          id,
          groupId: group.id,
          ...findSortDown(group.categories || [], dropPos, targetId),
        });
      }
    }
  };

  const _onReorderGroup = (
    id: string,
    dropPos: DropPosition | null,
    targetId: string,
  ) => {
    const [expenseGroups] = separateGroups(categoryGroups); // exclude Income group from sortable groups to fix off-by-one error
    onReorderGroup({
      id,
      ...findSortDown(expenseGroups, dropPos, targetId),
    });
  };

  const moveVertically = (dir: 1 | -1) => {
    const flattened = categoryGroups.reduce(
      (all, group) => {
        if (collapsedGroupIds.includes(group.id)) {
          return all.concat({ id: group.id, isGroup: true });
        }
        return all.concat([
          { id: group.id, isGroup: true },
          ...(group?.categories || []),
        ]);
      },
      [] as Array<
        { id: CategoryGroupEntity['id']; isGroup: boolean } | CategoryEntity
      >,
    );

    if (editing) {
      const idx = flattened.findIndex(item => item.id === editing.id);
      let nextIdx = idx + dir;

      while (nextIdx >= 0 && nextIdx < flattened.length) {
        const next = flattened[nextIdx];

        if ('isGroup' in next && next.isGroup) {
          nextIdx += dir;
          continue;
        } else if (
          type === 'tracking' ||
          ('is_income' in next && !next.is_income)
        ) {
          onEditMonth(next.id, editing.cell);
          return;
        } else {
          break;
        }
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!editing) {
      return null;
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      moveVertically(e.shiftKey ? -1 : 1);
    }
  };

  const onAddCategory = (groupId: CategoryGroupEntity['id']) => {
    setCollapsedGroupIdsPref(collapsedGroupIds.filter(id => id !== groupId));
    setNewItem({ type: 'category', groupId });
  };

  const _onShowActivity = (id: string, month?: string) => {
    if (scrollContainerRef.current) {
      sessionStorage.setItem(
        'budget-scroll-position',
        String(scrollContainerRef.current.scrollTop),
      );
    }
    onShowActivity(id, month);
  };

  return (
    <View style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
      <BudgetToolbar
        onAddGroup={() => setNewItem({ type: 'group' })}
        onAddCategory={onAddCategory}
        overBudget={{
          count: overBudgetIds.size,
          isOn: isOverBudgetOnly,
          onToggle: () => setIsOverBudgetOnly(!isOverBudgetOnly),
        }}
      />
      <View
        style={{
          flex: 1,
          minHeight: 0,
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: spacing.lg,
        }}
      >
        <View
          data-testid="budget-table"
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            ...(styles.lightScrollbar && {
              '& ::-webkit-scrollbar': {
                backgroundColor: 'transparent',
              },
              '& ::-webkit-scrollbar-thumb:vertical': {
                // A slim pill in the subdued table tone, inset from the gutter.
                backgroundColor: theme.tableTextSubdued,
                backgroundClip: 'padding-box',
                border: '3px solid transparent',
                borderRadius: 999,
              },
            }),
          }}
        >
          <MonthsProvider
            startMonth={startMonth}
            numMonths={numMonths}
            monthBounds={monthBounds}
            type={type}
          >
            <View innerRef={crossfadeRef} style={{ flex: 1, minHeight: 0 }}>
              {hasColumnSummaries && (
                <MonthsContext.Consumer>
                  {({ months }) => (
                    <View
                      style={{
                        paddingLeft: 5,
                        paddingRight: 5 + getScrollbarWidth(),
                        paddingBottom: 6,
                      }}
                    >
                      <MonthColumnSummaries
                        months={months}
                        budgetType={
                          type === 'tracking' ? 'tracking' : 'envelope'
                        }
                        focusedMonth={focusedMonth}
                        onFocusMonth={onFocusMonth}
                        categoryWidth={categoryWidth}
                      />
                    </View>
                  )}
                </MonthsContext.Consumer>
              )}
              <BudgetTotals />
              <View
                ref={scrollContainerRef}
                data-testid="budget-table-scroll-container"
                style={{
                  overflowY: 'scroll',
                  overflowAnchor: 'none',
                  flex: 1,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
              >
                <View style={{ flexShrink: 0 }} onKeyDown={onKeyDown}>
                  <BudgetCategories
                    categoryGroups={categoryGroups}
                    editingCell={editing}
                    onEditMonth={onEditMonth}
                    onEditName={onEditName}
                    onSaveCategory={onSaveCategory}
                    onSaveGroup={onSaveGroup}
                    onDeleteCategory={onDeleteCategory}
                    onDeleteGroup={onDeleteGroup}
                    onReorderCategory={_onReorderCategory}
                    onReorderGroup={_onReorderGroup}
                    onBudgetAction={onBudgetAction}
                    onShowActivity={_onShowActivity}
                    onApplyBudgetTemplatesInGroup={
                      onApplyBudgetTemplatesInGroup
                    }
                    onSortCategories={onSortCategories}
                    newItem={newItem}
                    onNewItemChange={setNewItem}
                    visibleCategoryIds={isOverBudgetOnly ? overBudgetIds : null}
                    onOpenDetails={id => openCategory(id, focusedMonth)}
                  />
                </View>
              </View>
            </View>
          </MonthsProvider>
        </View>
        {aside}
      </View>
    </View>
  );
}

BudgetTable.displayName = 'BudgetTable';
