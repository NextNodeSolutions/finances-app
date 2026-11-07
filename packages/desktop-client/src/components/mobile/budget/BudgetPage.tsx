// @ts-strict-ignore
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import { SvgLogo } from '@actual-app/components/icons/logo';
import {
  SvgArrowThinLeft,
  SvgArrowThinRight,
  SvgCheveronDown,
  SvgCheveronRight,
} from '@actual-app/components/icons/v1';
import { SvgCalendar } from '@actual-app/components/icons/v2';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';

import { sync } from '#app/appSlice';
import {
  useBudgetActions,
  useCreateCategoryGroupMutation,
  useCreateCategoryMutation,
  useDeleteCategoryGroupMutation,
  useDeleteCategoryMutation,
  useSaveCategoryGroupMutation,
  useSaveCategoryMutation,
  useSortCategoriesMutation,
} from '#budget';
import { closeBudget } from '#budgetfiles/budgetfilesSlice';
import { prewarmMonth } from '#components/budget/util';
import {
  MOBILE_HEADER_TITLE_CHEVRON_SIZE,
  mobileHeaderIconButtonStyle,
  mobileHeaderTitleChevronStyle,
  mobileHeaderTitleStyle,
} from '#components/mobile/utils';
import { MobilePageHeader, Page } from '#components/Page';
import { SyncRefresh } from '#components/SyncRefresh';
import { useCategories } from '#hooks/useCategories';
import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useLocale } from '#hooks/useLocale';
import { useLocalPref } from '#hooks/useLocalPref';
import { SheetNameProvider } from '#hooks/useSheetName';
import { useSpreadsheet } from '#hooks/useSpreadsheet';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { collapseModals, pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { BudgetBanners } from './BudgetBanners';
import { BudgetTable } from './BudgetTable';

// The month title is the page's display line on mobile.
const MONTH_TITLE_SIZE = 22;
const MONTH_TITLE_LINE_HEIGHT = 28;
const MONTH_STEP_BUTTON_SIZE = 32;

function isBudgetType(input?: string): input is 'envelope' | 'tracking' {
  return ['envelope', 'tracking'].includes(input);
}

export function BudgetPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    data: { list: categories, grouped: categoryGroups } = {
      list: [],
      grouped: [],
    },
  } = useCategories();
  const [budgetTypePref] = useSyncedPref('budgetType');
  const budgetType = isBudgetType(budgetTypePref) ? budgetTypePref : 'envelope';
  const goalTemplatesEnabled = useFeatureFlag('goalTemplatesEnabled');
  const goalTemplatesUIEnabled = useFeatureFlag('goalTemplatesUIEnabled');
  const spreadsheet = useSpreadsheet();

  const currMonth = monthUtils.currentMonth();
  const [startMonth = currMonth, setStartMonthPref] =
    useLocalPref('budget.startMonth');
  const [monthBounds, setMonthBounds] = useState({
    start: startMonth,
    end: startMonth,
  });
  // const [editMode, setEditMode] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [_numberFormat] = useSyncedPref('numberFormat');
  const numberFormat = _numberFormat || 'comma-dot';
  const [hideFraction] = useSyncedPref('hideFraction');
  const dispatch = useDispatch();
  const applyBudgetAction = useBudgetActions();
  const createCategory = useCreateCategoryMutation();
  const saveCategory = useSaveCategoryMutation();
  const deleteCategory = useDeleteCategoryMutation();
  const createCategoryGroup = useCreateCategoryGroupMutation();
  const saveCategoryGroup = useSaveCategoryGroupMutation();
  const deleteCategoryGroup = useDeleteCategoryGroupMutation();
  const sortCategories = useSortCategoriesMutation();

  useEffect(() => {
    async function init() {
      const { start, end } = await send('get-budget-bounds');
      setMonthBounds({ start, end });

      await prewarmMonth(budgetType, spreadsheet, startMonth);

      setInitialized(true);
    }

    void init();
  }, [budgetType, startMonth, dispatch, spreadsheet]);

  const onBudgetAction = useCallback(
    async (month, type, args) => {
      applyBudgetAction.mutate({ month, type, args });
    },
    [applyBudgetAction],
  );

  const onShowBudgetSummary = useCallback(() => {
    if (budgetType === 'tracking') {
      dispatch(
        pushModal({
          modal: {
            name: 'tracking-budget-summary',
            options: {
              month: startMonth,
            },
          },
        }),
      );
    } else {
      dispatch(
        pushModal({
          modal: {
            name: 'envelope-budget-summary',
            options: {
              month: startMonth,
              onBudgetAction,
            },
          },
        }),
      );
    }
  }, [budgetType, dispatch, onBudgetAction, startMonth]);

  const onOpenNewCategoryGroupModal = useCallback(() => {
    dispatch(
      pushModal({
        modal: {
          name: 'new-category-group',
          options: {
            onValidate: name => (!name ? 'Name is required.' : null),
            onSubmit: async name => {
              createCategoryGroup.mutate(
                { name },
                {
                  onSettled: () => {
                    dispatch(
                      collapseModals({ rootModalName: 'budget-page-menu' }),
                    );
                  },
                },
              );
            },
          },
        },
      }),
    );
  }, [dispatch, createCategoryGroup]);

  const onOpenNewCategoryModal = useCallback(
    (groupId, isIncome) => {
      dispatch(
        pushModal({
          modal: {
            name: 'new-category',
            options: {
              onValidate: name => (!name ? 'Name is required.' : null),
              onSubmit: async name => {
                createCategory.mutate(
                  {
                    name,
                    groupId,
                    isIncome,
                    isHidden: false,
                  },
                  {
                    onSettled: () => {
                      dispatch(
                        collapseModals({
                          rootModalName: 'category-group-menu',
                        }),
                      );
                    },
                  },
                );
              },
            },
          },
        }),
      );
    },
    [dispatch, createCategory],
  );

  const onSaveGroup = useCallback(
    group => {
      saveCategoryGroup.mutate({ group });
    },
    [saveCategoryGroup],
  );

  const onApplyBudgetTemplatesInGroup = useCallback(
    async categories => {
      applyBudgetAction.mutate({
        month: startMonth,
        type: 'apply-multiple-templates',
        args: {
          categories,
        },
      });
    },
    [applyBudgetAction, startMonth],
  );

  const onDeleteGroup = useCallback(
    (groupId, transferId) => {
      dispatch(collapseModals({ rootModalName: 'category-group-menu' }));
      deleteCategoryGroup.mutate({ id: groupId, transferId });
    },
    [deleteCategoryGroup, dispatch],
  );

  const onSaveCategory = useCallback(
    category => {
      saveCategory.mutate({ category });
    },
    [saveCategory],
  );

  const onDeleteCategory = useCallback(
    (categoryId, transferId) => {
      dispatch(collapseModals({ rootModalName: 'category-menu' }));
      deleteCategory.mutate({ id: categoryId, transferId });
    },
    [deleteCategory, dispatch],
  );

  const onPrevMonth = useCallback(async () => {
    const month = monthUtils.subMonths(startMonth, 1);
    await prewarmMonth(budgetType, spreadsheet, month);
    setStartMonthPref(month);
    setInitialized(true);
  }, [budgetType, setStartMonthPref, spreadsheet, startMonth]);

  const onNextMonth = useCallback(async () => {
    const month = monthUtils.addMonths(startMonth, 1);
    await prewarmMonth(budgetType, spreadsheet, month);
    setStartMonthPref(month);
    setInitialized(true);
  }, [budgetType, setStartMonthPref, spreadsheet, startMonth]);

  const onCurrentMonth = useCallback(async () => {
    await prewarmMonth(budgetType, spreadsheet, currMonth);
    setStartMonthPref(currMonth);
    setInitialized(true);
  }, [budgetType, setStartMonthPref, spreadsheet, currMonth]);

  // const onOpenMonthActionMenu = () => {
  //   const options = [
  //     'Copy last month's budget',
  //     'Set budgets to zero',
  //     'Set budgets to 3 month average',
  //     budgetType === 'tracking' && 'Apply to all future budgets',
  //   ].filter(Boolean);

  //   props.showActionSheetWithOptions(
  //     {
  //       options,
  //       cancelButtonIndex: options.length - 1,
  //       title: 'Actions',
  //     },
  //     idx => {
  //       switch (idx) {
  //         case 0:
  //           setEditMode(true);
  //           break;
  //         case 1:
  //           onBudgetAction('copy-last');
  //           break;
  //         case 2:
  //           onBudgetAction('set-zero');
  //           break;
  //         case 3:
  //           onBudgetAction('set-3-avg');
  //           break;
  //         case 4:
  //           if (budgetType === 'tracking') {
  //             onBudgetAction('set-all-future');
  //           }
  //           break;
  //         default:
  //       }
  //     },
  //   );
  // };

  const onSaveNotes = useCallback(async (id, notes) => {
    await send('notes-save', { id, note: notes });
  }, []);

  const onOpenCategoryGroupNotesModal = useCallback(
    id => {
      const group = categoryGroups.find(g => g.id === id);
      dispatch(
        pushModal({
          modal: {
            name: 'notes',
            options: {
              id,
              name: group.name,
              onSave: onSaveNotes,
            },
          },
        }),
      );
    },
    [categoryGroups, dispatch, onSaveNotes],
  );

  const onOpenCategoryNotesModal = useCallback(
    id => {
      const category = categories.find(c => c.id === id);
      dispatch(
        pushModal({
          modal: {
            name: 'notes',
            options: {
              id,
              name: category.name,
              onSave: onSaveNotes,
            },
          },
        }),
      );
    },
    [categories, dispatch, onSaveNotes],
  );

  const onOpenCategoryGroupMenuModal = useCallback(
    id => {
      const group = categoryGroups.find(g => g.id === id);
      dispatch(
        pushModal({
          modal: {
            name: 'category-group-menu',
            options: {
              groupId: group.id,
              onSave: onSaveGroup,
              onAddCategory: onOpenNewCategoryModal,
              onEditNotes: onOpenCategoryGroupNotesModal,
              onDelete: onDeleteGroup,
              onApplyBudgetTemplatesInGroup,
              onSortCategories: (groupId, direction) => {
                sortCategories.mutate({ groupId, direction });
              },
            },
          },
        }),
      );
    },
    [
      categoryGroups,
      dispatch,
      onDeleteGroup,
      onOpenCategoryGroupNotesModal,
      onOpenNewCategoryModal,
      onSaveGroup,
      onApplyBudgetTemplatesInGroup,
      sortCategories,
    ],
  );

  const onOpenCategoryMenuModal = useCallback(
    id => {
      const category = categories.find(c => c.id === id);
      const canEditAutomations =
        goalTemplatesEnabled &&
        goalTemplatesUIEnabled &&
        !(category.is_income && budgetType !== 'tracking');
      dispatch(
        pushModal({
          modal: {
            name: 'category-menu',
            options: {
              categoryId: category.id,
              onSave: onSaveCategory,
              onEditNotes: onOpenCategoryNotesModal,
              onDelete: onDeleteCategory,
              ...(canEditAutomations && {
                onEditAutomations: (categoryId: string) => {
                  dispatch(collapseModals({ rootModalName: 'category-menu' }));
                  dispatch(
                    pushModal({
                      modal: {
                        name: 'category-automations-edit',
                        options: { categoryId, month: startMonth },
                      },
                    }),
                  );
                },
              }),
            },
          },
        }),
      );
    },
    [
      budgetType,
      categories,
      dispatch,
      goalTemplatesEnabled,
      goalTemplatesUIEnabled,
      onDeleteCategory,
      onOpenCategoryNotesModal,
      onSaveCategory,
      startMonth,
    ],
  );

  const [showHiddenCategories, setShowHiddenCategoriesPref] = useLocalPref(
    'budget.showHiddenCategories',
  );

  const onToggleHiddenCategories = useCallback(() => {
    setShowHiddenCategoriesPref(!showHiddenCategories);
  }, [setShowHiddenCategoriesPref, showHiddenCategories]);

  const onOpenBudgetMonthNotesModal = useCallback(
    month => {
      dispatch(
        pushModal({
          modal: {
            name: 'notes',
            options: {
              id: `budget-${month}`,
              name: monthUtils.format(month, "MMMM ''yy", locale),
              onSave: onSaveNotes,
            },
          },
        }),
      );
    },
    [dispatch, onSaveNotes, locale],
  );

  const onSwitchBudgetFile = useCallback(() => {
    void dispatch(closeBudget());
  }, [dispatch]);

  const onOpenBudgetMonthMenu = useCallback(
    month => {
      dispatch(
        pushModal({
          modal: {
            name: `${budgetType}-budget-month-menu`,
            options: {
              month,
              onBudgetAction,
              onEditNotes: onOpenBudgetMonthNotesModal,
            },
          },
        }),
      );
    },
    [budgetType, dispatch, onBudgetAction, onOpenBudgetMonthNotesModal],
  );

  const onOpenBudgetPageMenu = useCallback(() => {
    dispatch(
      pushModal({
        modal: {
          name: 'budget-page-menu',
          options: {
            onAddCategoryGroup: onOpenNewCategoryGroupModal,
            onToggleHiddenCategories,
            onSwitchBudgetFile,
          },
        },
      }),
    );
  }, [
    dispatch,
    onOpenNewCategoryGroupModal,
    onSwitchBudgetFile,
    onToggleHiddenCategories,
  ]);

  if (!categoryGroups || !initialized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.mobilePageBackground,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 25,
        }}
      >
        <AnimatedLoading width={25} height={25} />
      </View>
    );
  }

  const isPrevMonthEnabled = startMonth > monthBounds.start;
  const isNextMonthEnabled =
    startMonth < monthUtils.subMonths(monthBounds.end, 1);

  return (
    <Page
      padding={0}
      header={
        <MobilePageHeader
          title={
            <MonthTitle
              month={startMonth}
              onOpenMonthMenu={onOpenBudgetMonthMenu}
            />
          }
          leftContent={
            <>
              <Button
                variant="bare"
                style={{
                  ...mobileHeaderIconButtonStyle,
                  width: 'auto',
                  padding: '0 6px',
                  gap: 2,
                }}
                onPress={onOpenBudgetPageMenu}
                aria-label={t('Budget page menu')}
              >
                <SvgLogo
                  style={{ color: theme.mobileHeaderText }}
                  width="18"
                  height="18"
                />
                <SvgCheveronRight
                  style={{
                    flexShrink: 0,
                    color: theme.mobileHeaderTextSubdued,
                  }}
                  width="12"
                  height="12"
                />
              </Button>
              <MonthStepButton
                label={t('Previous month')}
                isEnabled={isPrevMonthEnabled}
                onPress={onPrevMonth}
                style={{ marginLeft: 'auto' }}
              >
                <SvgArrowThinLeft width="14" height="14" />
              </MonthStepButton>
            </>
          }
          rightContent={
            <>
              <MonthStepButton
                label={t('Next month')}
                isEnabled={isNextMonthEnabled}
                onPress={onNextMonth}
                style={{ marginRight: 'auto' }}
              >
                <SvgArrowThinRight width="14" height="14" />
              </MonthStepButton>
              {!monthUtils.isCurrentMonth(startMonth) && (
                <Button
                  variant="bare"
                  onPress={onCurrentMonth}
                  aria-label={t('Today')}
                  style={mobileHeaderIconButtonStyle}
                >
                  <SvgCalendar width={18} height={18} />
                </Button>
              )}
            </>
          }
        />
      }
    >
      <SyncRefresh
        onSync={async () => {
          void dispatch(sync());
        }}
      >
        {({ onRefresh }) => (
          <>
            <BudgetBanners
              month={startMonth}
              budgetType={budgetType}
              onBudgetAction={onBudgetAction}
            />
            <SheetNameProvider name={monthUtils.sheetForMonth(startMonth)}>
              <BudgetTable
                // This key forces the whole table rerender when the number
                // format changes
                key={`${numberFormat}${hideFraction}`}
                categoryGroups={categoryGroups}
                month={startMonth}
                onShowBudgetSummary={onShowBudgetSummary}
                onBudgetAction={onBudgetAction}
                onRefresh={onRefresh}
                onEditCategoryGroup={onOpenCategoryGroupMenuModal}
                onEditCategory={onOpenCategoryMenuModal}
              />
            </SheetNameProvider>
          </>
        )}
      </SyncRefresh>
    </Page>
  );
}

// The month, in the display serif; it opens the month menu. The steps
// around it live in the header's side slots so a long month never pushes
// them out of reach.
function MonthTitle({ month, onOpenMonthMenu }) {
  const locale = useLocale();

  return (
    <Button
      variant="bare"
      style={{
        textAlign: 'center',
        padding: '4px 6px',
        borderRadius: radius.md,
        minWidth: 0,
      }}
      onPress={() => {
        onOpenMonthMenu?.(month);
      }}
      data-month={month}
    >
      <Text
        style={{
          ...mobileHeaderTitleStyle,
          fontSize: MONTH_TITLE_SIZE,
          lineHeight: `${MONTH_TITLE_LINE_HEIGHT}px`,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {monthUtils.format(month, "MMMM ''yy", locale)}
      </Text>
      <SvgCheveronDown
        width={MOBILE_HEADER_TITLE_CHEVRON_SIZE}
        height={MOBILE_HEADER_TITLE_CHEVRON_SIZE}
        style={mobileHeaderTitleChevronStyle}
      />
    </Button>
  );
}

function MonthStepButton({ label, isEnabled, onPress, style, children }) {
  return (
    <Button
      aria-label={label}
      variant="bare"
      isDisabled={!isEnabled}
      onPress={onPress}
      style={{
        ...mobileHeaderIconButtonStyle,
        width: MONTH_STEP_BUTTON_SIZE,
        margin: 0,
        color: theme.mobileHeaderTextSubdued,
        opacity: isEnabled ? 1 : 0.4,
        ...style,
      }}
    >
      {children}
    </Button>
  );
}
