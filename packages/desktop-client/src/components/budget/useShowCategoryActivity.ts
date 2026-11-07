import type { CategoryEntity } from '@actual-app/core/types/models';

import { useNavigate } from '#hooks/useNavigate';

/** Opens the register filtered to one category and month. */
export function useShowCategoryActivity(): (
  categoryId: CategoryEntity['id'],
  month: string,
) => void {
  const navigate = useNavigate();

  return (categoryId, month) => {
    const filterConditions = [
      { field: 'category', op: 'is', value: categoryId, type: 'id' },
      {
        field: 'date',
        op: 'is',
        value: month,
        options: { month: true },
        type: 'date',
      },
    ];
    void navigate('/accounts', {
      state: { goBack: true, filterConditions, categoryId },
    });
  };
}
