import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgCheveronLeft } from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';

import { useReportsBack } from './useReportsBack';

/** The `‹ Reports` crumb above a report page's title. */
export function ReportBackButton() {
  const { t } = useTranslation();
  const goBack = useReportsBack();

  return (
    <Button
      variant="bare"
      aria-label={t('Back to reports')}
      style={{
        gap: 2,
        marginLeft: -6,
        padding: '2px 8px 2px 2px',
        fontSize: 13,
        fontWeight: 500,
        color: theme.pageTextLight,
      }}
      onPress={goBack}
    >
      <SvgCheveronLeft width={16} height={16} style={{ flexShrink: 0 }} />
      <Trans>Reports</Trans>
    </Button>
  );
}
