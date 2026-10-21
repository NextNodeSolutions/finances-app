import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';

import { MobilePageHeader, Page } from '#components/Page';

/**
 * The Overview on narrow screens. Route stub; the mobile statement of
 * position is built on top of it.
 */
export function MobileOverviewPage() {
  const { t } = useTranslation();

  return (
    <Page
      header={<MobilePageHeader title={t('Overview')} />}
      testId="overview-page"
    >
      <Text
        style={{
          paddingTop: spacing.lg,
          fontSize: 15,
          color: theme.pageTextSubdued,
        }}
      >
        <Trans>
          Your net worth, this month and what is coming up will appear here.
        </Trans>
      </Text>
    </Page>
  );
}
