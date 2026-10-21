import { useTranslation } from 'react-i18next';

import {
  SvgCalendar,
  SvgListBullet,
  SvgUser,
} from '@actual-app/components/icons/v1';
import { q } from '@actual-app/core/shared/query';

import { useBudgetPanels } from '#components/budget/panels/useBudgetPanels';
import { usePayeePanel } from '#components/payees/panels/usePayeePanel';
import { useSchedulePanel } from '#components/schedules/panels/useSchedulePanel';
import { useCategories } from '#hooks/useCategories';
import { usePayees } from '#hooks/usePayees';
import { useSchedules } from '#hooks/useSchedules';

import type { PaletteSection } from './paletteTypes';

// Module-level so the live query is created once.
const OPEN_SCHEDULES_QUERY = q('schedules')
  .filter({ completed: false })
  .select('*');

// Records can run to hundreds; a few matches each keep the rest in view.
const RECORD_MATCH_LIMIT = 5;

/**
 * Categories, payees and schedules, found by name once the user types. Each
 * opens in its side panel.
 */
export function usePaletteRecords(): PaletteSection[] {
  const { t } = useTranslation();
  const budgetPanels = useBudgetPanels();
  const payeePanel = usePayeePanel();
  const schedulePanel = useSchedulePanel();
  const { data: categoryData } = useCategories();
  const { data: payees = [] } = usePayees();
  const { schedules } = useSchedules({ query: OPEN_SCHEDULES_QUERY });

  const categories = (categoryData?.list ?? []).filter(
    category => !category.hidden,
  );
  // Transfer payees stand for accounts, which Accounts already lists.
  const namedPayees = payees.filter(payee => !payee.transfer_acct);
  const payeeNames = new Map(payees.map(payee => [payee.id, payee.name]));

  return [
    {
      key: 'categories',
      heading: t('Categories'),
      isSearchOnly: true,
      limit: RECORD_MATCH_LIMIT,
      items: categories.map(category => ({
        id: category.id,
        name: category.name,
        Icon: SvgListBullet,
      })),
      onSelect: id => budgetPanels.openCategory(id),
    },
    {
      key: 'payees',
      heading: t('Payees'),
      isSearchOnly: true,
      limit: RECORD_MATCH_LIMIT,
      items: namedPayees.map(payee => ({
        id: payee.id,
        name: payee.name,
        Icon: SvgUser,
      })),
      onSelect: id => payeePanel.open(id),
    },
    {
      key: 'schedules',
      heading: t('Schedules'),
      isSearchOnly: true,
      limit: RECORD_MATCH_LIMIT,
      items: schedules.flatMap(schedule => {
        const name = schedule.name || payeeNames.get(schedule._payee);
        return name ? [{ id: schedule.id, name, Icon: SvgCalendar }] : [];
      }),
      // Beside the current page: a panel closes when the route changes.
      onSelect: id => schedulePanel.open(id),
    },
  ];
}
