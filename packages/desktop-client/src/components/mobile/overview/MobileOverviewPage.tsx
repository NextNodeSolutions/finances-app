import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { MOBILE_NAV_INSET } from '#components/mobile/MobileNavTabs';
import { NoAccountsCard } from '#components/overview/NoAccountsCard';
import {
  getRangeCovering,
  getRangeStartMonth,
  getTrendPoints,
  getWiderRange,
} from '#components/overview/statement';
import { UpcomingCard } from '#components/overview/UpcomingCard';
import {
  AS_OF_PARAM,
  parseAsOfMonth,
  useRewind,
} from '#components/overview/useRewind';
import { useStatement } from '#components/overview/useStatement';
import { MobilePageHeader, Page } from '#components/Page';
import { SyncStatusLine } from '#components/sidebar/redesign/SyncStatusLine';
import { useSidebarAccountTree } from '#components/sidebar/redesign/useSidebarAccountTree';
import { useAccounts } from '#hooks/useAccounts';
import { useNetWorthHistory } from '#hooks/useNetWorthHistory';
import type { NetWorthRange } from '#hooks/useNetWorthHistory';

import { MobileAccountGroups } from './MobileAccountGroups';
import { MobileAsOfBar } from './MobileAsOfBar';
import { MobileMonthCard } from './MobileMonthCard';
import { MobileNetWorthHeadline } from './MobileNetWorthHeadline';
import { NetWorthSparkline } from './NetWorthSparkline';

const PAGE_GUTTER = 12;
const SECTION_GAP = 16;

/**
 * The Overview on narrow screens: net worth and its trend, the sync state,
 * this month, what is coming up and every account. `?asof=` (opened from
 * the Statements list) re-reads it as of a past month-end.
 */
export function MobileOverviewPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const requestedMonth = parseAsOfMonth(searchParams.get(AS_OF_PARAM));

  // The trend must reach the pinned month, so a pin from the URL widens the
  // range when needed.
  const [range, setRange] = useState<NetWorthRange>(() =>
    getRangeCovering(requestedMonth),
  );
  const neededRange = getWiderRange(range, getRangeCovering(requestedMonth));
  if (neededRange !== range) {
    setRange(neededRange);
  }

  const history = useNetWorthHistory({ range });
  const points = history.data?.points ?? [];
  const trend = getTrendPoints(points, range);
  const { asOfMonth, setAsOf } = useRewind({
    earliestMonth:
      history.isLoading || history.isStale ? null : (trend[0]?.month ?? null),
  });
  const isRewound = asOfMonth !== null;

  const { data: accounts = [], isPlaceholderData: isAccountsLoading } =
    useAccounts();
  const tree = useSidebarAccountTree();
  const statement = useStatement({ asOfMonth, points, accounts });
  const hasOpenAccounts = accounts.some(account => !account.closed);

  const toggleRange = () => {
    const next: NetWorthRange = range === '6M' ? '1Y' : '6M';
    // A pin the new range no longer shows returns the page to today.
    if (asOfMonth !== null && asOfMonth < getRangeStartMonth(next)) {
      setAsOf(null);
    }
    setRange(next);
  };

  return (
    <Page
      header={<MobilePageHeader title={t('Overview')} />}
      testId="overview-page"
      padding={0}
    >
      <View
        style={{
          flex: 'none',
          gap: SECTION_GAP,
          padding: `${SECTION_GAP}px ${PAGE_GUTTER}px`,
          paddingBottom: `calc(${MOBILE_NAV_INSET} + ${SECTION_GAP}px)`,
        }}
      >
        {isRewound && (
          <MobileAsOfBar asOfMonth={asOfMonth} onToday={() => setAsOf(null)} />
        )}
        {!isAccountsLoading && !hasOpenAccounts ? (
          <NoAccountsCard />
        ) : (
          <>
            <View
              data-testid="overview-position"
              style={{ gap: spacing.md, padding: `0 ${spacing.xs}px` }}
            >
              <MobileNetWorthHeadline statement={statement} />
              <NetWorthSparkline
                points={trend}
                range={range}
                isLoading={history.isLoading}
                pinnedMonth={asOfMonth}
                onToggleRange={toggleRange}
              />
              {!isRewound && <SyncStatusLine />}
            </View>
            <MobileMonthCard
              month={asOfMonth ?? monthUtils.currentMonth()}
              isStatement={isRewound}
              hasOnBudgetAccounts={
                isAccountsLoading || tree.onBudget.accountCount > 0
              }
            />
            {!isRewound && <UpcomingCard />}
            <MobileAccountGroups tree={tree} statement={statement} />
          </>
        )}
      </View>
    </Page>
  );
}
