import { useResponsive } from '@actual-app/components/hooks/useResponsive';

import { Page } from '#components/Page';
import { ReportsHeader } from '#components/reports/ReportsHeader';
import { ReportsMobileHeader } from '#components/reports/ReportsMobileHeader';
import { ReportsTabs } from '#components/reports/ReportsTabs';

import { StatementsTable } from './StatementsTable';

/** The Statements tab of reports: one read-only line per month. */
export function StatementsPage() {
  const { isNarrowWidth } = useResponsive();
  const tabs = <ReportsTabs activeTab="statements" />;

  return (
    <Page
      header={
        isNarrowWidth ? (
          <ReportsMobileHeader tabs={tabs} />
        ) : (
          <ReportsHeader tabs={tabs} />
        )
      }
    >
      <StatementsTable />
    </Page>
  );
}
