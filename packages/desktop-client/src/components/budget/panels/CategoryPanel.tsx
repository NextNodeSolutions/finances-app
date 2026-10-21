import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { SidePanel } from '#components/common/SidePanel';
import { usePanels } from '#components/panels/PanelProvider';
import { SchedulesProvider } from '#hooks/useCachedSchedules';
import { useCategories } from '#hooks/useCategories';
import { SheetNameProvider } from '#hooks/useSheetName';

import { CategoryInspector } from './category/CategoryInspector';

type CategoryPanelProps = {
  categoryId: CategoryEntity['id'];
  month: string;
};

/**
 * The category inspector: the month's figures, the last 12 months, the
 * month's transactions, notes, rollover and template, beside the table.
 */
export function CategoryPanel({ categoryId, month }: CategoryPanelProps) {
  const { t } = useTranslation();
  const { close } = usePanels();
  const [schedulesQuery] = useState(() => q('schedules').select('*'));
  const { data: { list: categories, grouped } = { list: [], grouped: [] } } =
    useCategories();
  const category = categories.find(candidate => candidate.id === categoryId);
  const group = grouped.find(candidate => candidate.id === category?.group);

  if (!category) {
    return (
      <SidePanel testId="category-panel" title={t('Category')} onClose={close}>
        <Text style={{ color: theme.pageTextSubdued }}>
          <Trans>This category no longer exists.</Trans>
        </Text>
      </SidePanel>
    );
  }

  return (
    <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
      <SchedulesProvider query={schedulesQuery}>
        <SidePanel
          testId="category-panel"
          title={category.name}
          subtitle={group?.name}
          onClose={close}
        >
          <CategoryInspector category={category} month={month} />
        </SidePanel>
      </SchedulesProvider>
    </SheetNameProvider>
  );
}
