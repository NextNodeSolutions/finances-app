import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { Tooltip } from '@actual-app/components/tooltip';

import { useNavigate } from '#hooks/useNavigate';

type BudgetMethodPillProps = {
  budgetType: 'envelope' | 'tracking';
};

/** Envelope or Tracking, linking to the setting that changes it. */
export function BudgetMethodPill({ budgetType }: BudgetMethodPillProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Tooltip
      content={t('Change budgeting method in Settings')}
      placement="bottom"
    >
      <Button
        variant="bare"
        onPress={() => void navigate('/settings/general#budget-type')}
        style={{
          padding: '2px 9px',
          borderRadius: radius.pill,
          border: `1px solid ${theme.hairline}`,
          fontSize: 12,
          fontWeight: 500,
          color: theme.pageTextLight,
        }}
      >
        {budgetType === 'tracking' ? (
          <Trans>Tracking</Trans>
        ) : (
          <Trans>Envelope</Trans>
        )}
      </Button>
    </Tooltip>
  );
}
