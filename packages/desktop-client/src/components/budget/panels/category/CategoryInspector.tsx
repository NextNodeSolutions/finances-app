import { useTranslation } from 'react-i18next';

import type { CategoryEntity } from '@actual-app/core/types/models';

import { useSyncedPref } from '#hooks/useSyncedPref';

import { AveragesSection } from './AveragesSection';
import { CategoryActions } from './CategoryActions';
import { CategoryFiguresRow } from './CategoryFiguresRow';
import { HistoryBars } from './HistoryBars';
import { NotesSection } from './NotesSection';
import { PanelSection } from './PanelSection';
import { RolloverSection } from './RolloverSection';
import { TemplateSection } from './TemplateSection';
import { TransactionsSection } from './TransactionsSection';
import { useCategoryFigures } from './useCategoryFigures';
import { useCategoryHistory } from './useCategoryHistory';

type CategoryInspectorProps = {
  category: CategoryEntity;
  month: string;
};

/** The sections of the category panel, envelope or tracking. */
export function CategoryInspector({ category, month }: CategoryInspectorProps) {
  const { t } = useTranslation();
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const isTracking = budgetType === 'tracking';
  const figures = useCategoryFigures(category.id, month);
  const { history } = useCategoryHistory(category.id, month);

  return (
    <>
      <CategoryFiguresRow
        month={month}
        figures={figures}
        isTracking={isTracking}
      />
      {!category.is_income && (
        <CategoryActions
          category={category}
          month={month}
          figures={figures}
          isTracking={isTracking}
        />
      )}
      <PanelSection label={t('Last 12 months')}>
        <HistoryBars history={history} isIncome={Boolean(category.is_income)} />
        <AveragesSection category={category} month={month} history={history} />
      </PanelSection>
      <TransactionsSection categoryId={category.id} month={month} />
      <NotesSection categoryId={category.id} />
      {!isTracking && !category.is_income && (
        <RolloverSection categoryId={category.id} month={month} />
      )}
      <TemplateSection
        category={category}
        month={month}
        budgeted={figures.budgeted}
      />
    </>
  );
}
