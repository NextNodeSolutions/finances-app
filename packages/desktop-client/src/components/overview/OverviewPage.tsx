import { useState } from 'react';
import { Trans } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { Page, PageHeader } from '#components/Page';
import { useSidebarAccountTree } from '#components/sidebar/redesign/useSidebarAccountTree';
import { useAccounts } from '#hooks/useAccounts';
import { useNetWorthHistory } from '#hooks/useNetWorthHistory';
import type { NetWorthRange } from '#hooks/useNetWorthHistory';

import { AsOfControl } from './AsOfControl';
import { AttentionStrip } from './AttentionStrip';
import { BalanceSheet } from './BalanceSheet';
import { MonthHealthCard } from './MonthHealthCard';
import { NoAccountsCard } from './NoAccountsCard';
import { PositionCard } from './PositionCard';
import { RangeControl } from './RangeControl';
import { RecentActivity } from './RecentActivity';
import {
  getRangeCovering,
  getRangeStartMonth,
  getTrendPoints,
  getWiderRange,
} from './statement';
import { TrendArea } from './TrendArea';
import { UpcomingCard } from './UpcomingCard';
import { AS_OF_PARAM, parseAsOfMonth, useRewind } from './useRewind';
import { useRewindHotkeys } from './useRewindHotkeys';
import { useStatement } from './useStatement';

const PAGE_WIDTH = 1136;
const GRID_GAP = 16;
const SIDE_COLUMN = 360;
// Content width under which the grid becomes a single column.
const SINGLE_COLUMN_BELOW = 1100;

/**
 * The Statement of Position: what the user owns and owes, whether it is
 * going up, whether this month is on track, what is about to leave the
 * accounts and what needs them. Rewind re-reads it as of a past month-end.
 */
export function OverviewPage() {
  const [searchParams] = useSearchParams();
  const requestedMonth = parseAsOfMonth(searchParams.get(AS_OF_PARAM));

  // The chart must show the pinned month, so a pin from the URL (reload,
  // Back/Forward, a shared link) widens the range when needed.
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
  const rewind = useRewind({
    earliestMonth:
      history.isLoading || history.isStale ? null : (trend[0]?.month ?? null),
  });
  useRewindHotkeys(rewind);
  const { asOfMonth, setAsOf } = rewind;
  const isRewound = asOfMonth !== null;

  const { data: accounts = [], isPlaceholderData: isAccountsLoading } =
    useAccounts();
  const tree = useSidebarAccountTree();
  const statement = useStatement({ asOfMonth, points, accounts });
  const hasOpenAccounts = accounts.some(account => !account.closed);

  const changeRange = (next: NetWorthRange) => {
    // A pin the new range no longer shows returns the page to today.
    if (asOfMonth !== null && asOfMonth < getRangeStartMonth(next)) {
      setAsOf(null);
    }
    setRange(next);
  };

  return (
    <Page
      testId="overview-page"
      header={
        <PageHeader
          title={
            <h1
              style={{
                margin: 0,
                font: 'inherit',
                color: 'inherit',
              }}
            >
              <Trans>Overview</Trans>
            </h1>
          }
          actions={hasOpenAccounts && <AsOfControl rewind={rewind} />}
          style={{
            width: `calc(100% - ${2 * 20}px)`,
            maxWidth: PAGE_WIDTH,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        />
      }
    >
      <View
        style={{
          flex: 'none',
          width: '100%',
          maxWidth: PAGE_WIDTH,
          margin: '0 auto',
          paddingBottom: 40,
          gap: GRID_GAP,
          containerType: 'inline-size',
        }}
      >
        {!isAccountsLoading && !hasOpenAccounts ? (
          <NoAccountsCard />
        ) : (
          <>
            {!isRewound && <AttentionStrip />}
            <View
              style={{
                display: 'grid',
                flex: 'none',
                gap: GRID_GAP,
                gridTemplateColumns: `minmax(0, 1fr) ${SIDE_COLUMN}px`,
                gridTemplateRows: 'auto auto 1fr auto',
                gridTemplateAreas: `
                  "position position"
                  "sheet health"
                  "sheet upcoming"
                  "recent recent"`,
                [`@container (max-width: ${SINGLE_COLUMN_BELOW - 1}px)`]: {
                  gridTemplateColumns: 'minmax(0, 1fr)',
                  gridTemplateRows: 'auto',
                  gridTemplateAreas: `
                    "position"
                    "health"
                    "sheet"
                    "upcoming"
                    "recent"`,
                },
              }}
            >
              <View style={{ gridArea: 'position' }}>
                <PositionCard
                  statement={statement}
                  controls={
                    <RangeControl range={range} onChange={changeRange} />
                  }
                >
                  <TrendArea
                    history={history}
                    points={trend}
                    pinnedMonth={asOfMonth}
                    onPin={setAsOf}
                  />
                </PositionCard>
              </View>
              <View style={{ gridArea: 'sheet', alignSelf: 'start' }}>
                <BalanceSheet tree={tree} statement={statement} />
              </View>
              <View style={{ gridArea: 'health', alignSelf: 'start' }}>
                <MonthHealthCard
                  month={asOfMonth ?? monthUtils.currentMonth()}
                  isStatement={isRewound}
                  hasOnBudgetAccounts={
                    isAccountsLoading || tree.onBudget.accountCount > 0
                  }
                />
              </View>
              {!isRewound && (
                <View style={{ gridArea: 'upcoming', alignSelf: 'start' }}>
                  <UpcomingCard />
                </View>
              )}
              <View style={{ gridArea: 'recent' }}>
                <RecentActivity />
              </View>
            </View>
          </>
        )}
      </View>
    </Page>
  );
}
