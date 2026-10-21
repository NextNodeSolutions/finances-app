import type { useOverspentCategories } from '#hooks/useOverspentCategories';

import { BudgetRail } from './BudgetRail';
import { EnvelopeRailContent } from './EnvelopeRailContent';

type EnvelopeRailProps = {
  month: string;
  overspent: ReturnType<typeof useOverspentCategories>;
};

/** The envelope month beside a one-month table. */
export function EnvelopeRail({ month, overspent }: EnvelopeRailProps) {
  return (
    <BudgetRail month={month}>
      <EnvelopeRailContent month={month} overspent={overspent} />
    </BudgetRail>
  );
}
