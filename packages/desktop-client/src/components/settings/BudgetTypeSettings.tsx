import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ButtonWithLoading } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';

import { useSyncedPref } from '#hooks/useSyncedPref';

import { BudgetTypeCard } from './BudgetTypeCard';
import { SettingsGroupHeading } from './SettingsGroupHeading';

const TRAY_PADDING = 5;

/** The budgeting method: two cards in a tray, the current one marked. */
export function BudgetTypeSettings() {
  const { t } = useTranslation();
  const [budgetType = 'envelope', setBudgetType] = useSyncedPref('budgetType');
  const [isLoading, setIsLoading] = useState(false);

  async function onSwitchType() {
    setIsLoading(true);
    try {
      const newBudgetType = budgetType === 'envelope' ? 'tracking' : 'envelope';
      setBudgetType(newBudgetType);

      // Reset the budget cache to ensure the server-side budget system is recalculated
      await send('reset-budget-cache');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={{ flexShrink: 0, gap: spacing.md }}>
      <SettingsGroupHeading title={t('Budgeting method')} />
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: TRAY_PADDING,
          padding: TRAY_PADDING,
          backgroundColor: theme.trayBackground,
          border: `1px solid ${theme.trayBorder}`,
          borderRadius: radius.lg + TRAY_PADDING,
        }}
      >
        <BudgetTypeCard
          title={t('Envelope')}
          description={t(
            'Give every dollar a job. Unspent money rolls forward.',
          )}
          learnMoreUrl="https://actualbudget.org/docs/getting-started/envelope-budgeting"
          isCurrent={budgetType !== 'tracking'}
          action={
            <ButtonWithLoading onPress={onSwitchType} isLoading={isLoading}>
              <Trans>Switch to envelope budgeting</Trans>
            </ButtonWithLoading>
          }
        />
        <BudgetTypeCard
          title={t('Tracking')}
          description={t(
            'Plan income and spending; compare with what happened.',
          )}
          learnMoreUrl="https://actualbudget.org/docs/getting-started/tracking-budget"
          isCurrent={budgetType === 'tracking'}
          action={
            <ButtonWithLoading onPress={onSwitchType} isLoading={isLoading}>
              <Trans>Switch to tracking budgeting</Trans>
            </ButtonWithLoading>
          }
        />
      </View>
    </View>
  );
}
