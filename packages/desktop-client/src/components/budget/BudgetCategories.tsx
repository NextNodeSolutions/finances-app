import React, { memo, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { elevation, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';

import { DropHighlightPosContext } from '#components/sort';
import type { DragState, OnDropCallback } from '#components/sort';
import { Row } from '#components/table';
import { useLocalPref } from '#hooks/useLocalPref';

import { ExpenseCategory } from './ExpenseCategory';
import { ExpenseGroup } from './ExpenseGroup';
import { IncomeCategory } from './IncomeCategory';
import { IncomeGroup } from './IncomeGroup';
import { IncomeHeader } from './IncomeHeader';
import { SidebarCategory } from './SidebarCategory';
import { SidebarGroup } from './SidebarGroup';
import { separateGroups } from './util';

/** The inline row for a group or category being added, if any. */
export type NewBudgetItem =
  | { type: 'group' }
  | { type: 'category'; groupId: CategoryGroupEntity['id'] }
  | null;

type BudgetItem =
  | { type: 'empty' }
  | { type: 'new-group' }
  | { type: 'new-category' }
  | { type: 'expense-group'; value: CategoryGroupEntity }
  | {
      type: 'expense-category';
      value: CategoryEntity;
      group: CategoryGroupEntity;
    }
  | { type: 'income-separator' }
  | { type: 'income-group'; value: CategoryGroupEntity }
  | { type: 'income-category'; value: CategoryEntity };

// Category rows take a translucent wash on hover so the tint reads over
// the current and other-month columns alike. It steps aside while a cell
// is being edited.
const rowHoverTintStyle = {
  '&:hover:not(:focus-within)::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    pointerEvents: 'none',
    backgroundColor: theme.buttonBareBackgroundHover,
  },
};

function isHoverTintedRow(type: BudgetItem['type']) {
  return type === 'expense-category' || type === 'income-category';
}

type LocalDragState =
  | DragState<CategoryEntity>
  | DragState<CategoryGroupEntity>
  | null;

type BudgetCategoriesProps = {
  categoryGroups: CategoryGroupEntity[];
  editingCell: { id: string; cell: string } | null;
  onBudgetAction: (month: string, action: string, arg: unknown) => void;
  onShowActivity: (id: CategoryEntity['id'], month?: string) => void;
  onEditName: (id: CategoryEntity['id']) => void;
  onEditMonth: (id: CategoryEntity['id'], month: string) => void;
  onSaveCategory: (category: CategoryEntity) => void;
  onSaveGroup: (group: CategoryGroupEntity) => void;
  onDeleteCategory: (id: CategoryEntity['id']) => void;
  onDeleteGroup: (id: CategoryGroupEntity['id']) => void;
  onApplyBudgetTemplatesInGroup: (categoryIds: CategoryEntity['id'][]) => void;
  onSortCategories?: (
    groupId: CategoryGroupEntity['id'],
    direction: 'asc' | 'desc',
  ) => void;
  onReorderCategory: OnDropCallback;
  onReorderGroup: OnDropCallback;
  newItem: NewBudgetItem;
  onNewItemChange: (item: NewBudgetItem) => void;
  /** Only these categories show (the Over budget filter); all when null. */
  visibleCategoryIds: ReadonlySet<CategoryEntity['id']> | null;
  onOpenDetails: (id: CategoryEntity['id']) => void;
};

export const BudgetCategories = memo<BudgetCategoriesProps>(
  ({
    categoryGroups,
    editingCell,
    onBudgetAction,
    onShowActivity,
    onEditName,
    onEditMonth,
    onSaveCategory,
    onSaveGroup,
    onDeleteCategory,
    onDeleteGroup,
    onApplyBudgetTemplatesInGroup,
    onSortCategories,
    onReorderCategory,
    onReorderGroup,
    newItem,
    onNewItemChange,
    visibleCategoryIds,
    onOpenDetails,
  }) => {
    const [collapsedGroupIds = [], setCollapsedGroupIdsPref] =
      useLocalPref('budget.collapsed');
    const [showHiddenCategories] = useLocalPref('budget.showHiddenCategories');
    function onCollapse(value: Array<CategoryGroupEntity['id']>) {
      setCollapsedGroupIdsPref(value);
    }

    const isAddingGroup = newItem?.type === 'group';
    const newCategoryForGroup =
      newItem?.type === 'category' ? newItem.groupId : null;
    const items: BudgetItem[] = useMemo(() => {
      const [expenseGroups, incomeGroup] = separateGroups(categoryGroups);

      if (visibleCategoryIds) {
        return getFilteredItems(
          expenseGroups,
          visibleCategoryIds,
          showHiddenCategories,
        );
      }

      let items: BudgetItem[] = Array.prototype.concat.apply(
        [],
        expenseGroups.map(group => {
          if (group.hidden && !showHiddenCategories) {
            return [];
          }

          const groupCategories = group.categories?.filter(
            cat => showHiddenCategories || !cat.hidden,
          );

          const items: BudgetItem[] = [
            { type: 'expense-group', value: { ...group } },
          ];

          if (newCategoryForGroup === group.id) {
            items.push({ type: 'new-category' });
          }

          return [
            ...items,
            ...(collapsedGroupIds.includes(group.id)
              ? []
              : groupCategories || []
            ).map((cat): BudgetItem => ({
              type: 'expense-category',
              value: cat,
              group,
            })),
          ];
        }),
      );

      if (isAddingGroup) {
        items.push({ type: 'new-group' });
      } else if (expenseGroups.length === 0) {
        items.push({ type: 'empty' });
      }

      if (incomeGroup) {
        const incomeCategoryItems: BudgetItem[] = [
          { type: 'income-separator' },
          { type: 'income-group', value: incomeGroup },
        ];

        if (newCategoryForGroup === incomeGroup.id) {
          incomeCategoryItems.push({ type: 'new-category' });
        }

        incomeCategoryItems.push(
          ...(collapsedGroupIds.includes(incomeGroup.id)
            ? []
            : incomeGroup.categories?.filter(
                cat => showHiddenCategories || !cat.hidden,
              ) || []
          ).map((cat): BudgetItem => ({
            type: 'income-category',
            value: cat,
          })),
        );

        items = items.concat(incomeCategoryItems);
      }

      return items;
    }, [
      categoryGroups,
      collapsedGroupIds,
      newCategoryForGroup,
      isAddingGroup,
      showHiddenCategories,
      visibleCategoryIds,
    ]);

    const [dragState, setDragState] = useState<LocalDragState>(null);
    const [savedCollapsed, setSavedCollapsed] = useState<Array<
      CategoryGroupEntity['id']
    > | null>(null);

    // TODO: If we turn this into a reducer, we could probably memoize
    // each item in the list for better perf
    function onDragChange(
      newDragState: DragState<CategoryEntity> | DragState<CategoryGroupEntity>,
    ) {
      const { state } = newDragState;

      if (state === 'start-preview') {
        // @ts-expect-error fix me
        setDragState({
          type: newDragState.type,
          item: newDragState.item,
          preview: true,
        });
      } else if (state === 'start') {
        if (dragState) {
          setDragState({
            ...dragState,
            preview: false,
          });
          setSavedCollapsed(collapsedGroupIds);
        }
      } else if (state === 'end') {
        setDragState(null);
        onCollapse(savedCollapsed || []);
      }
    }

    function onToggleCollapse(id: CategoryGroupEntity['id']) {
      if (collapsedGroupIds.includes(id)) {
        onCollapse(collapsedGroupIds.filter(id_ => id_ !== id));
      } else {
        onCollapse([...collapsedGroupIds, id]);
      }
    }

    function onShowNewGroup() {
      onNewItemChange({ type: 'group' });
    }

    function onHideNewGroup() {
      onNewItemChange(null);
    }

    function _onSaveGroup(group: CategoryGroupEntity) {
      onSaveGroup?.(group);
      if (group.id === 'new') {
        onHideNewGroup();
      }
    }

    function onShowNewCategory(groupId: CategoryGroupEntity['id']) {
      onCollapse(collapsedGroupIds.filter(c => c !== groupId));
      onNewItemChange({ type: 'category', groupId });
    }

    function onHideNewCategory() {
      onNewItemChange(null);
    }

    function _onSaveCategory(category: CategoryEntity) {
      onSaveCategory?.(category);
      if (category.id === 'new') {
        onHideNewCategory();
      }
    }

    return (
      <View
        style={{
          marginBottom: 16,
          backgroundColor: theme.budgetCurrentMonth, // match budget colors, not generic table colors.
          overflow: 'hidden',
          boxShadow: elevation.card,
          border: '1px solid ' + theme.hairline,
          borderTopWidth: 0,
          borderRadius: `0 0 ${radius.lg}px ${radius.lg}px`,
          flex: 1,
        }}
      >
        {items.map((item, idx) => {
          let content;
          switch (item.type) {
            case 'empty':
              content = (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: '20px 22px',
                  }}
                >
                  <Text style={{ color: theme.pageTextLight }}>
                    {visibleCategoryIds ? (
                      <Trans>Nothing is over budget.</Trans>
                    ) : (
                      <Trans>Create a group to start budgeting.</Trans>
                    )}
                  </Text>
                  {!visibleCategoryIds && (
                    // Named apart from the toolbar's Add group, which
                    // stays the page's only button of that name.
                    <Button onPress={onShowNewGroup}>
                      <Trans>Add your first group</Trans>
                    </Button>
                  )}
                </View>
              );
              break;
            case 'new-group':
              content = (
                <Row
                  style={{ backgroundColor: theme.budgetHeaderCurrentMonth }}
                >
                  <SidebarGroup
                    group={{ id: 'new', name: '' }}
                    collapsed={false}
                    editing
                    onSave={_onSaveGroup}
                    onHideNewGroup={onHideNewGroup}
                    onEdit={onEditName}
                  />
                </Row>
              );
              break;
            case 'new-category':
              content = (
                <Row>
                  <SidebarCategory
                    innerRef={null}
                    category={{
                      name: '',
                      group: newCategoryForGroup!,
                      is_income:
                        newCategoryForGroup ===
                        categoryGroups.find(g => g.is_income)?.id,
                      id: 'new',
                    }}
                    editing
                    onSave={_onSaveCategory}
                    onHideNewCategory={onHideNewCategory}
                    onEditName={onEditName!}
                  />
                </Row>
              );
              break;

            case 'expense-group':
              content = (
                <ExpenseGroup
                  group={item.value}
                  editingCell={editingCell}
                  collapsed={collapsedGroupIds.includes(item.value.id)}
                  dragState={dragState}
                  onEditName={onEditName}
                  onSave={_onSaveGroup}
                  onDelete={onDeleteGroup}
                  onDragChange={onDragChange}
                  onReorderGroup={onReorderGroup}
                  onReorderCategory={onReorderCategory}
                  onToggleCollapse={onToggleCollapse}
                  onShowNewCategory={onShowNewCategory}
                  onApplyBudgetTemplatesInGroup={onApplyBudgetTemplatesInGroup}
                  onSortCategories={onSortCategories}
                />
              );
              break;
            case 'expense-category':
              content = (
                <ExpenseCategory
                  cat={item.value}
                  categoryGroup={item.group}
                  editingCell={editingCell}
                  dragState={dragState}
                  onEditName={onEditName}
                  onEditMonth={onEditMonth}
                  onSave={_onSaveCategory}
                  onDelete={onDeleteCategory}
                  onDragChange={onDragChange}
                  onReorder={onReorderCategory}
                  onBudgetAction={onBudgetAction}
                  onShowActivity={onShowActivity}
                  onOpenDetails={onOpenDetails}
                />
              );
              break;
            case 'income-separator':
              content = (
                <View
                  style={{
                    height: styles.incomeHeaderHeight,
                    backgroundColor: theme.budgetCurrentMonth,
                  }}
                >
                  <IncomeHeader />
                </View>
              );
              break;
            case 'income-group':
              content = (
                <IncomeGroup
                  group={item.value}
                  editingCell={editingCell}
                  collapsed={collapsedGroupIds.includes(item.value.id)}
                  onEditName={onEditName!}
                  onSave={_onSaveGroup}
                  onSortCategories={onSortCategories}
                  onToggleCollapse={onToggleCollapse}
                  onShowNewCategory={onShowNewCategory!}
                />
              );
              break;
            case 'income-category':
              content = (
                <IncomeCategory
                  cat={item.value}
                  editingCell={editingCell}
                  isLast={idx === items.length - 1}
                  onEditName={onEditName}
                  onEditMonth={onEditMonth}
                  onSave={_onSaveCategory}
                  onDelete={onDeleteCategory}
                  onDragChange={onDragChange}
                  onReorder={onReorderCategory}
                  onBudgetAction={onBudgetAction}
                  onShowActivity={onShowActivity}
                  onOpenDetails={onOpenDetails}
                />
              );
              break;
            default:
              // @ts-expect-error Error is expected here because "item.type" is "never"
              throw new Error('Unknown item type: ' + item.type);
          }

          const pos =
            idx === 0 ? 'first' : idx === items.length - 1 ? 'last' : null;

          return (
            <DropHighlightPosContext.Provider
              key={
                'value' in item
                  ? item.value.id
                  : item.type === 'income-separator'
                    ? 'separator'
                    : idx
              }
              value={pos}
            >
              <View
                style={
                  !dragState && isHoverTintedRow(item.type)
                    ? rowHoverTintStyle
                    : undefined
                }
              >
                {content}
              </View>
            </DropHighlightPosContext.Provider>
          );
        })}
      </View>
    );
  },
);

BudgetCategories.displayName = 'BudgetCategories';

/**
 * The Over budget filter: expense groups holding a listed category, each
 * with only those categories, whether or not the group is collapsed.
 * Hidden categories stay out unless hidden ones are shown.
 */
function getFilteredItems(
  expenseGroups: CategoryGroupEntity[],
  visibleCategoryIds: ReadonlySet<CategoryEntity['id']>,
  showHiddenCategories: boolean | undefined,
): BudgetItem[] {
  const items = expenseGroups.flatMap((group): BudgetItem[] => {
    const categories = (group.categories ?? []).filter(
      category =>
        visibleCategoryIds.has(category.id) &&
        (showHiddenCategories || !(category.hidden || group.hidden)),
    );
    if (categories.length === 0) {
      return [];
    }
    return [
      { type: 'expense-group', value: { ...group } },
      ...categories.map((category): BudgetItem => ({
        type: 'expense-category',
        value: category,
        group,
      })),
    ];
  });
  return items.length > 0 ? items : [{ type: 'empty' }];
}
