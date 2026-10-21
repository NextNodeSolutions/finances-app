import type { ReactNode } from 'react';
import { Trans } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { MobilePageHeader } from '#components/Page';

type ReportsMobileHeaderProps = {
  /** The Dashboard / Statements tabs. */
  tabs: ReactNode;
};

/** Mobile header of the reports area: the title bar, then the tabs. */
export function ReportsMobileHeader({ tabs }: ReportsMobileHeaderProps) {
  return (
    <View>
      <MobilePageHeader title={<Trans>Reports</Trans>} />
      <View
        style={{
          padding: '6px 10px',
          borderBottom: `1px solid ${theme.hairline}`,
          backgroundColor: theme.mobilePageBackground,
        }}
      >
        {tabs}
      </View>
    </View>
  );
}
