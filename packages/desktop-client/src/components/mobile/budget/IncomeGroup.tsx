import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Card } from '@actual-app/components/card';
import { SvgExpandArrow } from '@actual-app/components/icons/v0';
import { SvgCheveronRight } from '@actual-app/components/icons/v1';
import { Label } from '@actual-app/components/label';
import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryGroupEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';
import { AutoTextSize } from 'auto-text-size';

import {
  AMOUNT_CHIP_INSET,
  mobileCardStyle,
  mobileFigureLabelStyle,
} from '#components/mobile/utils';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { CellValue } from '#components/spreadsheet/CellValue';
import { useFormat } from '#hooks/useFormat';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { envelopeBudget, trackingBudget } from '#spreadsheet/bindings';

import {
  getColumnWidth,
  GROUP_NAME_BUTTON_LEFT_INSET,
  ROW_HEIGHT,
} from './BudgetTable';
import { IncomeCategoryList } from './IncomeCategoryList';

// Right inset of the row holding a group's column totals.
const CELLS_ROW_INSET = 5;

const incomeColumnLabelStyle: CSSProperties = {
  ...mobileFigureLabelStyle,
  marginBottom: 0,
};

function incomeGroupAmountStyle(columnWidth: string): CSSProperties {
  return {
    ...styles.tnum,
    width: columnWidth,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: 5,
    // The cells row already insets 5px; the rest of the chip inset lines the
    // totals up with the figures inside the category amount chips below.
    paddingRight: AMOUNT_CHIP_INSET - CELLS_ROW_INSET,
    textAlign: 'right',
    fontWeight: 500,
    color: theme.tableRowHeaderText,
  };
}

type IncomeGroupProps = {
  categoryGroup: CategoryGroupEntity;
  month: string;
  showHiddenCategories: boolean;
  onEditCategoryGroup: (id: CategoryGroupEntity['id']) => void;
  onEditCategory: (id: string) => void;
  onBudgetAction: (month: string, action: string, args: unknown) => void;
  isCollapsed: (id: CategoryGroupEntity['id']) => boolean;
  onToggleCollapse: (id: CategoryGroupEntity['id']) => void;
};

export function IncomeGroup({
  categoryGroup,
  month,
  showHiddenCategories,
  onEditCategoryGroup,
  onEditCategory,
  onBudgetAction,
  isCollapsed,
  onToggleCollapse,
}: IncomeGroupProps) {
  const { t } = useTranslation();
  const columnWidth = getColumnWidth();
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');

  const categories = useMemo(
    () =>
      isCollapsed(categoryGroup.id)
        ? []
        : (categoryGroup.categories?.filter(
            category => !category.hidden || showHiddenCategories,
          ) ?? []),
    [
      categoryGroup.categories,
      categoryGroup.id,
      isCollapsed,
      showHiddenCategories,
    ],
  );

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: 22,
          marginBottom: 6,
          marginRight: 21,
        }}
      >
        {budgetType === 'tracking' && (
          <Label
            title={t('Budgeted')}
            style={{ ...incomeColumnLabelStyle, width: columnWidth }}
          />
        )}
        <Label
          title={t('Received')}
          style={{ ...incomeColumnLabelStyle, width: columnWidth }}
        />
      </View>

      <Card
        style={{
          ...mobileCardStyle,
          marginTop: 0,
          marginLeft: 8,
          marginRight: 8,
        }}
      >
        <IncomeGroupHeader
          group={categoryGroup}
          month={month}
          onEdit={onEditCategoryGroup}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />
        <IncomeCategoryList
          categories={categories}
          month={month}
          onEditCategory={onEditCategory}
          onBudgetAction={onBudgetAction}
        />
      </Card>
    </View>
  );
}

type IncomeGroupHeaderProps = {
  group: CategoryGroupEntity;
  month: string;
  onEdit: (id: CategoryGroupEntity['id']) => void;
  isCollapsed: (id: CategoryGroupEntity['id']) => boolean;
  onToggleCollapse: (id: CategoryGroupEntity['id']) => void;
  style?: CSSProperties;
};

function IncomeGroupHeader({
  group,
  month,
  onEdit,
  isCollapsed,
  onToggleCollapse,
  style,
}: IncomeGroupHeaderProps) {
  return (
    <View
      data-testid="category-group-row"
      onClick={() => onToggleCollapse(group.id)}
      style={{
        cursor: 'pointer',
        height: ROW_HEIGHT,
        borderBottomWidth: 1,
        borderColor: theme.hairline,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 6,
        paddingRight: 6,
        opacity: group.hidden ? 0.5 : undefined,
        backgroundColor: monthUtils.isCurrentMonth(month)
          ? theme.budgetHeaderCurrentMonth
          : theme.budgetHeaderOtherMonth,
        ...style,
      }}
    >
      <IncomeGroupName
        group={group}
        onEdit={onEdit}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />
      <IncomeGroupCells group={group} />
    </View>
  );
}

type IncomeGroupNameProps = {
  group: CategoryGroupEntity;
  onEdit: (id: CategoryGroupEntity['id']) => void;
  isCollapsed: (id: CategoryGroupEntity['id']) => boolean;
  onToggleCollapse: (id: CategoryGroupEntity['id']) => void;
};

function IncomeGroupName({
  group,
  onEdit,
  isCollapsed,
  onToggleCollapse,
}: IncomeGroupNameProps) {
  const sidebarColumnWidth = getColumnWidth({
    isSidebar: true,
    offset: -13.5,
  });
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: sidebarColumnWidth,
      }}
    >
      <Button
        variant="bare"
        className={css({
          flexShrink: 0,
          color: theme.pageTextSubdued,
          '&[data-pressed]': {
            backgroundColor: 'transparent',
          },
          marginLeft: -5,
        })}
        onPress={() => onToggleCollapse(group.id)}
      >
        <SvgExpandArrow
          width={8}
          height={8}
          style={{
            flexShrink: 0,
            transition: 'transform .1s',
            transform: isCollapsed(group.id) ? 'rotate(-90deg)' : '',
          }}
        />
      </Button>
      <Button
        variant="bare"
        style={{
          maxWidth: sidebarColumnWidth,
          paddingLeft: GROUP_NAME_BUTTON_LEFT_INSET,
        }}
        onPress={() => onEdit(group.id)}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <Text
            style={{
              ...styles.lineClamp(2),
              width: sidebarColumnWidth,
              textAlign: 'left',
              ...styles.smallText,
              fontWeight: 500,
              color: theme.tableRowHeaderText,
            }}
            data-testid="category-group-name"
          >
            {group.name}
          </Text>
          <SvgCheveronRight
            style={{ flexShrink: 0, color: theme.tableTextSubdued }}
            width={12}
            height={12}
          />
        </View>
      </Button>
    </View>
  );
}

type IncomeGroupCellsProps = {
  group: CategoryGroupEntity;
};

function IncomeGroupCells({ group }: IncomeGroupCellsProps) {
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const format = useFormat();

  const budgeted =
    budgetType === 'tracking' ? trackingBudget.groupBudgeted(group.id) : null;

  const balance =
    budgetType === 'tracking'
      ? trackingBudget.groupSumAmount(group.id)
      : envelopeBudget.groupSumAmount(group.id);

  const columnWidth = getColumnWidth();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: CELLS_ROW_INSET,
      }}
    >
      {budgeted && (
        <CellValue<'envelope-budget' | 'tracking-budget', 'group-budget'>
          binding={budgeted}
          type="financial"
        >
          {({ type, value }) => (
            <View>
              <PrivacyFilter>
                <AutoTextSize
                  key={value}
                  as={Text}
                  minFontSizePx={6}
                  maxFontSizePx={12}
                  mode="oneline"
                  style={incomeGroupAmountStyle(columnWidth)}
                >
                  {format(value, type)}
                </AutoTextSize>
              </PrivacyFilter>
            </View>
          )}
        </CellValue>
      )}
      <CellValue<'envelope-budget' | 'tracking-budget', 'group-sum-amount'>
        binding={balance}
        type="financial"
      >
        {({ type, value }) => (
          <View>
            <PrivacyFilter>
              <AutoTextSize
                key={value}
                as={Text}
                minFontSizePx={6}
                maxFontSizePx={12}
                mode="oneline"
                style={incomeGroupAmountStyle(columnWidth)}
              >
                {format(value, type)}
              </AutoTextSize>
            </PrivacyFilter>
          </View>
        )}
      </CellValue>
    </View>
  );
}
