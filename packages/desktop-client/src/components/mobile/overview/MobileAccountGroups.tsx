import { Trans, useTranslation } from 'react-i18next';

import { View } from '@actual-app/components/view';

import { buildBalanceSheetRows } from '#components/overview/balanceSheetRows';
import { CardAction } from '#components/overview/CardAction';
import { OverviewCard } from '#components/overview/OverviewCard';
import type { Statement } from '#components/overview/statement';
import type { SidebarAccountTree } from '#components/sidebar/redesign/useSidebarAccountTree';
import { useNavigate } from '#hooks/useNavigate';

import { MobileAccountGroupRow } from './MobileAccountGroupRow';
import { MobileAccountRow } from './MobileAccountRow';

type MobileAccountGroupsProps = {
  tree: SidebarAccountTree;
  statement: Statement;
};

/**
 * Every account at the statement date, grouped as in the sidebar, each
 * row opening its account. The balance sheet of the narrow Overview.
 */
export function MobileAccountGroups({
  tree,
  statement,
}: MobileAccountGroupsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rows = buildBalanceSheetRows(tree, statement, {
    onBudget: t('On budget'),
    offBudget: t('Off budget'),
    closed: t('Closed'),
  });

  return (
    <OverviewCard
      title={t('Accounts')}
      testId="overview-balance-sheet"
      action={
        <CardAction onPress={() => navigate('/accounts')}>
          <Trans>All accounts</Trans>
        </CardAction>
      }
    >
      <View role="list">
        {rows.map(row =>
          row.kind === 'subtotal' ? (
            <MobileAccountGroupRow key={row.key} row={row} />
          ) : (
            <MobileAccountRow key={row.key} row={row} />
          ),
        )}
      </View>
    </OverviewCard>
  );
}
