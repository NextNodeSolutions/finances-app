import { useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { groupById } from '@actual-app/core/shared/util';
import type { IntegerAmount } from '@actual-app/core/shared/util';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { useCategories } from '#hooks/useCategories';
import { useFormat } from '#hooks/useFormat';
import { useNavigate } from '#hooks/useNavigate';
import { useOverspentCategories } from '#hooks/useOverspentCategories';
import { useUndo } from '#hooks/useUndo';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { BUDGET_BANNER_ACTION_STYLE, BudgetBanner } from './BudgetBanner';

type OverspentBannerProps = {
  /** The attention item's sentence and total. */
  label: string;
  amount: number | null;
  month: string;
  budgetType: 'envelope' | 'tracking';
  onBudgetAction: (month: string, action: string, args: unknown) => void;
};

/**
 * Overspent categories this month. Envelope: Cover picks a category, then
 * the cover sheet asks where the money comes from (nothing preselected).
 * Tracking: View lists them and opens the one picked.
 */
export function OverspentBanner({
  label,
  amount,
  month,
  budgetType,
  onBudgetAction,
}: OverspentBannerProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const format = useFormat();
  const navigate = useNavigate();
  const { showUndoNotification } = useUndo();
  const {
    data: { list: categories, grouped: categoryGroups } = {
      list: [],
      grouped: [],
    },
  } = useCategories();
  const { categories: overspentCategories, amountsByCategory } =
    useOverspentCategories({ month });

  // The category picker stays open across covers and keeps this closure,
  // so it reads each category's amount when it is picked.
  const amountsByCategoryRef =
    useRef<Map<CategoryEntity['id'], IntegerAmount>>(amountsByCategory);
  useEffect(() => {
    amountsByCategoryRef.current = amountsByCategory;
  }, [amountsByCategory]);

  const categoriesById = groupById(categories);
  const overspentGroups = categoryGroups
    .filter(group =>
      overspentCategories.some(category => category.group === group.id),
    )
    .map(group => ({
      ...group,
      categories: overspentCategories.filter(
        category => category.group === group.id,
      ),
    }));

  const getCategoryName = (id: string) =>
    id === 'to-budget' ? t('To Budget') : (categoriesById[id]?.name ?? '');

  const openCoverSheet = (categoryId: string | null) => {
    const category = categoryId ? categoriesById[categoryId] : undefined;
    if (!category) {
      return;
    }
    dispatch(
      pushModal({
        modal: {
          name: 'cover',
          options: {
            title: category.name,
            month,
            amount: amountsByCategoryRef.current.get(category.id),
            categoryId: category.id,
            onSubmit: (coverAmount, fromCategoryId) => {
              onBudgetAction(month, 'cover-overspending', {
                to: category.id,
                from: fromCategoryId,
                amount: coverAmount,
                currencyCode: format.currency.code,
              });
              showUndoNotification({
                message: t(
                  'Covered {{toCategoryName}} overspending from {{fromCategoryName}}.',
                  {
                    toCategoryName: category.name,
                    fromCategoryName: getCategoryName(fromCategoryId),
                  },
                ),
              });
            },
          },
        },
      }),
    );
  };

  const openCategory = (categoryId: string | null) => {
    if (categoryId) {
      void navigate(`/categories/${categoryId}?month=${month}`);
    }
  };

  const isEnvelope = budgetType === 'envelope';
  const openOverspentCategories = () => {
    dispatch(
      pushModal({
        modal: {
          name: 'category-autocomplete',
          options: {
            title: isEnvelope
              ? t('Cover overspending')
              : t('Overspent categories'),
            month,
            categoryGroups: overspentGroups,
            showHiddenCategories: true,
            onSelect: isEnvelope ? openCoverSheet : openCategory,
            clearOnSelect: true,
            closeOnSelect: !isEnvelope,
          },
        },
      }),
    );
  };

  return (
    <BudgetBanner
      severity="signal"
      label={label}
      amount={amount}
      action={
        <Button
          onPress={openOverspentCategories}
          style={BUDGET_BANNER_ACTION_STYLE}
        >
          {isEnvelope ? <Trans>Cover</Trans> : <Trans>View</Trans>}
        </Button>
      }
    />
  );
}
