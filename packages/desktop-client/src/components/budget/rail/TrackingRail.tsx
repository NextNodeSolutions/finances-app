import type { useOverspentCategories } from '#hooks/useOverspentCategories';

import { BudgetRail } from './BudgetRail';
import { TrackingRailContent } from './TrackingRailContent';

type TrackingRailProps = {
  month: string;
  overspent: ReturnType<typeof useOverspentCategories>;
};

/** The tracking month beside a one-month table: plan against actual. */
export function TrackingRail({ month, overspent }: TrackingRailProps) {
  return (
    <BudgetRail month={month}>
      <TrackingRailContent month={month} overspent={overspent} />
    </BudgetRail>
  );
}
