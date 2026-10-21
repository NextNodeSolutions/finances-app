import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';

import { Page, PageHeader } from '#components/Page';

/**
 * The Overview: where the user stands. This is the route stub; the
 * statement of position (net worth, balance sheet, month health, coming
 * up) is built on top of it.
 */
export function OverviewPage() {
  const { t } = useTranslation();

  return (
    <Page header={<PageHeader title={t('Overview')} />} testId="overview-page">
      <Text style={{ fontSize: 13, color: theme.pageTextSubdued }}>
        <Trans>
          Your net worth, this month and what is coming up will appear here.
        </Trans>
      </Text>
    </Page>
  );
}
