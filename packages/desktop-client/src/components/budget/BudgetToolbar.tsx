import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgAdd } from '@actual-app/components/icons/v0';
import { Menu } from '@actual-app/components/menu';
import { Popover } from '@actual-app/components/popover';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { CategoryGroupEntity } from '@actual-app/core/types/models';

import { useCategories } from '#hooks/useCategories';
import { useLocalPref } from '#hooks/useLocalPref';

export type OverBudgetFilter = {
  count: number;
  isOn: boolean;
  onToggle: () => void;
};

type BudgetToolbarProps = {
  onAddGroup: () => void;
  onAddCategory: (groupId: CategoryGroupEntity['id']) => void;
  overBudget: OverBudgetFilter;
};

const chipStyle = (isOn: boolean) => ({
  padding: '3px 10px',
  borderRadius: radius.pill,
  border: `1px solid ${isOn ? theme.pageTextDark : theme.hairline}`,
  fontSize: 12,
  fontWeight: 500,
  color: isOn ? theme.pageTextDark : theme.pageTextLight,
});

const addButtonStyle = {
  gap: 6,
  padding: '4px 9px',
  fontSize: 12.5,
  fontWeight: 500,
  color: theme.pageTextLight,
};

/**
 * Add group or category, show hidden ones, expand or collapse every group,
 * and narrow the table to what is over budget.
 */
export function BudgetToolbar({
  onAddGroup,
  onAddCategory,
  overBudget,
}: BudgetToolbarProps) {
  const { t } = useTranslation();
  const addCategoryRef = useRef<HTMLButtonElement>(null);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const { data: { grouped: categoryGroups } = { grouped: [] } } =
    useCategories();
  const [collapsedGroupIds = [], setCollapsedGroupIds] =
    useLocalPref('budget.collapsed');
  const [showHiddenCategories, setShowHiddenCategories] = useLocalPref(
    'budget.showHiddenCategories',
  );
  const hiddenCount = categoryGroups.reduce(
    (count, group) =>
      count +
      (group.categories ?? []).filter(
        category => category.hidden || group.hidden,
      ).length,
    0,
  );
  const isAllCollapsed =
    categoryGroups.length > 0 &&
    categoryGroups.every(group => collapsedGroupIds.includes(group.id));

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.xs,
        paddingBottom: spacing.sm,
        flexShrink: 0,
      }}
    >
      <Button variant="bare" onPress={onAddGroup} style={addButtonStyle}>
        <SvgAdd width={9} height={9} />
        <Trans>Add group</Trans>
      </Button>
      <Button
        ref={addCategoryRef}
        variant="bare"
        onPress={() => setIsGroupMenuOpen(true)}
        style={addButtonStyle}
      >
        <SvgAdd width={9} height={9} />
        <Trans>Add category</Trans>
      </Button>
      <Popover
        triggerRef={addCategoryRef}
        placement="bottom start"
        isOpen={isGroupMenuOpen}
        onOpenChange={() => setIsGroupMenuOpen(false)}
        style={{ width: 220 }}
      >
        <Menu
          items={[
            { type: Menu.label, name: t('Add a category to'), text: '' },
            ...categoryGroups.map(group => ({
              name: group.id,
              text: group.name,
            })),
          ]}
          onMenuSelect={groupId => {
            setIsGroupMenuOpen(false);
            onAddCategory(groupId);
          }}
        />
      </Popover>
      {hiddenCount > 0 && (
        <Button
          variant="bare"
          aria-pressed={Boolean(showHiddenCategories)}
          onPress={() => setShowHiddenCategories(!showHiddenCategories)}
          style={chipStyle(Boolean(showHiddenCategories))}
        >
          <Trans>Hidden {{ count: hiddenCount }}</Trans>
        </Button>
      )}
      <Button
        variant="bare"
        onPress={() =>
          setCollapsedGroupIds(
            isAllCollapsed ? [] : categoryGroups.map(group => group.id),
          )
        }
        style={addButtonStyle}
      >
        {isAllCollapsed ? (
          <Trans>Expand all</Trans>
        ) : (
          <Trans>Collapse all</Trans>
        )}
      </Button>
      <View style={{ flex: 1 }} />
      {(overBudget.count > 0 || overBudget.isOn) && (
        <Button
          variant="bare"
          aria-pressed={overBudget.isOn}
          onPress={overBudget.onToggle}
          style={chipStyle(overBudget.isOn)}
        >
          <Trans>Over budget ({{ count: overBudget.count }})</Trans>
        </Button>
      )}
    </View>
  );
}
