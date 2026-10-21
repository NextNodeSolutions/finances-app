import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { Amount } from '#components/budget/Amount';
import { useSheetValues } from '#components/budget/useSheetValues';
import { useCategoryScheduleGoalTemplateIndicator } from '#hooks/useCategoryScheduleGoalTemplateIndicator';
import { useFeatureFlag } from '#hooks/useFeatureFlag';

import { PanelSection } from './PanelSection';

type TemplateSectionProps = {
  category: CategoryEntity;
  month: string;
  budgeted: number | null;
};

/**
 * The template's goal for the month and whether the budget meets it, plus
 * the schedule it is waiting on. Hidden when templates are off or unused.
 */
export function TemplateSection({
  category,
  month,
  budgeted,
}: TemplateSectionProps) {
  const { t } = useTranslation();
  const isGoalTemplatesEnabled = useFeatureFlag('goalTemplatesEnabled');
  const { description } = useCategoryScheduleGoalTemplateIndicator({
    category,
    month,
  });
  const values = useSheetValues([
    {
      key: 'goal',
      sheetName: monthUtils.sheetForMonth(month),
      name: `goal-${category.id}`,
    },
  ]);
  const goal = values.goal ?? 0;
  const hasTemplate = Boolean(category.goal_def) || goal !== 0;

  if (!isGoalTemplatesEnabled || (!hasTemplate && !description)) {
    return null;
  }

  return (
    <PanelSection label={t('Template')}>
      {hasTemplate && (
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            alignItems: 'baseline',
          }}
        >
          <Text style={{ color: theme.pageText }}>
            <Trans>Goal</Trans>
          </Text>
          <Amount value={goal} />
          <Text style={{ color: theme.pageTextSubdued }}>
            {budgeted !== null && budgeted >= goal ? (
              <Trans>Funded</Trans>
            ) : (
              <Trans>Underfunded</Trans>
            )}
          </Text>
        </View>
      )}
      {description && (
        <Text style={{ color: theme.pageTextSubdued, fontSize: 12.5 }}>
          {description}
        </Text>
      )}
    </PanelSection>
  );
}
