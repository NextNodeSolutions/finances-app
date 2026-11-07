import { useTranslation } from 'react-i18next';

import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { useBudgetActions } from '#budget';
import { useCategories } from '#hooks/useCategories';
import { useFormat } from '#hooks/useFormat';
import { useNavigate } from '#hooks/useNavigate';
import { useSpreadsheet } from '#hooks/useSpreadsheet';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { getBalanceCellName, TO_BUDGET_ID } from './balanceCell';
import type { BudgetPanelRequest } from './budgetPanelRequest';

const TO_BUDGET_CELL = getBalanceCellName(TO_BUDGET_ID);

/**
 * Narrow screens have no side panel: each request opens the mobile page or
 * sheet that does the same job today.
 */
export function useNarrowBudgetFallbacks(): (
  request: BudgetPanelRequest,
) => void {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const spreadsheet = useSpreadsheet();
  const format = useFormat();
  const budgetActions = useBudgetActions();
  const { data: { list: categories } = { list: [] } } = useCategories();

  const readCell = async (month: string, name: string): Promise<number> => {
    const { value } = await spreadsheet.get(
      monthUtils.sheetForMonth(month),
      name,
    );
    return typeof value === 'number' ? value : 0;
  };

  const findName = (id: CategoryEntity['id']) =>
    categories.find(category => category.id === id)?.name ?? '';

  const openTransfer = async (from: CategoryEntity['id'], month: string) => {
    const amount = await readCell(month, `leftover-${from}`);
    dispatch(
      pushModal({
        modal: {
          name: 'transfer',
          options: {
            title: findName(from),
            categoryId: from,
            month,
            amount,
            showToBeBudgeted: true,
            onSubmit: (transferAmount, to) =>
              budgetActions.mutate({
                month,
                type: 'transfer-category',
                args: {
                  amount: transferAmount,
                  from,
                  to,
                  currencyCode: format.currency.code,
                },
              }),
          },
        },
      }),
    );
  };

  const openMoveToBudget = async (month: string) => {
    const amount = await readCell(month, TO_BUDGET_CELL);
    dispatch(
      pushModal({
        modal: {
          name: 'transfer',
          options: {
            title: t('Move to a category'),
            month,
            amount,
            onSubmit: (transferAmount, category) =>
              budgetActions.mutate({
                month,
                type: 'transfer-available',
                args: { amount: transferAmount, category },
              }),
          },
        },
      }),
    );
  };

  const openCover = async (to: CategoryEntity['id'], month: string) => {
    const amount = await readCell(month, `leftover-${to}`);
    dispatch(
      pushModal({
        modal: {
          name: 'cover',
          options: {
            title: findName(to),
            categoryId: to,
            month,
            amount,
            onSubmit: (coverAmount, from) =>
              budgetActions.mutate({
                month,
                type: 'cover-overspending',
                args: {
                  to,
                  from,
                  amount: coverAmount,
                  currencyCode: format.currency.code,
                },
              }),
          },
        },
      }),
    );
  };

  return request => {
    switch (request.type) {
      case 'category':
        void navigate(
          `/categories/${request.categoryId}?month=${request.month}`,
        );
        return;
      case 'move-money':
        void (request.from
          ? openTransfer(request.from, request.month)
          : openMoveToBudget(request.month));
        return;
      case 'cover':
        if (request.categoryId) {
          void openCover(request.categoryId, request.month);
        } else {
          void navigate('/budget', { state: { month: request.month } });
        }
        return;
      default:
        throw new Error(`Unknown budget panel: ${JSON.stringify(request)}`);
    }
  };
}
