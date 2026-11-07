import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { format as formatDate } from '@actual-app/core/shared/months';
import type { PayeeEntity } from '@actual-app/core/types/models';

import { SidePanel } from '#components/common/SidePanel';
import { FinancialText } from '#components/FinancialText';
import { usePanels } from '#components/panels/PanelProvider';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useAccounts } from '#hooks/useAccounts';
import { useCategoriesById } from '#hooks/useCategories';
import { useDateFormat } from '#hooks/useDateFormat';
import { useFormat } from '#hooks/useFormat';
import { usePayee } from '#hooks/usePayee';
import { usePayeeRuleCounts } from '#hooks/usePayeeRuleCounts';

import { PanelStatRow } from './PanelStatRow';
import { PayeeCategoryBreakdown } from './PayeeCategoryBreakdown';
import { PayeeMergePicker } from './PayeeMergePicker';
import { PAYEE_PANEL_LOADING, PayeeSummary } from './PayeeSummary';
import { usePayeeActivity } from './usePayeeActivity';
import { usePayeeDetailActions } from './usePayeeDetailActions';

const LOADING = PAYEE_PANEL_LOADING;

type PayeeDetailPanelProps = {
  payeeId: PayeeEntity['id'];
};

/** Where a payee's money goes, beside the payees table. */
export function PayeeDetailPanel({ payeeId }: PayeeDetailPanelProps) {
  const { t } = useTranslation();
  const { close } = usePanels();
  const { data: payee } = usePayee(payeeId);
  const { data: accounts = [] } = useAccounts();
  const { data: ruleCounts } = usePayeeRuleCounts();
  const { data: categoriesById } = useCategoriesById();
  const activity = usePayeeActivity(payeeId);
  const format = useFormat();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const [isMerging, setIsMerging] = useState(false);
  const actions = usePayeeDetailActions(
    { id: payeeId, name: payee?.name ?? '' },
    close,
  );

  const transferAccount = accounts.find(
    account => account.id === payee?.transfer_acct,
  );
  const isTransfer = payee?.transfer_acct != null;
  const ruleCount = ruleCounts?.get(payeeId) ?? 0;

  return (
    <SidePanel
      testId="payee-panel"
      title={payee?.name ?? LOADING}
      subtitle={
        isTransfer ? (
          <Trans>Transfer to {{ account: transferAccount?.name ?? '' }}</Trans>
        ) : (
          <PayeeSummary
            activity={activity}
            categoryName={getCategoryName(
              activity.categories[0]?.categoryId,
              categoriesById?.list,
              t('Uncategorized'),
            )}
          />
        )
      }
      onClose={close}
      footer={
        <>
          {!isTransfer && (
            <>
              <Button variant="bare" onPress={() => setIsMerging(true)}>
                <Trans>Merge…</Trans>
              </Button>
              <Button variant="bare" onPress={actions.remove}>
                <Trans>Delete</Trans>
              </Button>
            </>
          )}
          <View style={{ flex: 1 }} />
          <Button onPress={actions.createRule}>
            <Trans>Create rule</Trans>
          </Button>
          <Button variant="primary" onPress={actions.viewTransactions}>
            <Trans>View transactions</Trans>
          </Button>
        </>
      }
    >
      <View style={{ gap: spacing.xl }}>
        <View>
          <PanelStatRow label={t('Last 12 months')}>
            <PrivacyFilter>
              <FinancialText style={{ fontSize: 13 }}>
                {activity.isLoading
                  ? LOADING
                  : format(activity.total, 'financial')}
              </FinancialText>
            </PrivacyFilter>
          </PanelStatRow>
          <PanelStatRow label={t('Last used')}>
            <Text style={{ ...styles.tnum, fontSize: 13 }}>
              {activity.isLoading
                ? LOADING
                : activity.lastUsed
                  ? formatDate(activity.lastUsed, dateFormat)
                  : '—'}
            </Text>
          </PanelStatRow>
          <PanelStatRow label={t('Rules')}>
            {ruleCount > 0 ? (
              <Button
                variant="bare"
                style={{ marginRight: -spacing.sm }}
                onPress={actions.viewRules}
              >
                <Trans count={ruleCount}>{{ count: ruleCount }} rules</Trans> ›
              </Button>
            ) : (
              <Text style={{ fontSize: 13, color: theme.pageTextSubdued }}>
                <Trans>None</Trans>
              </Text>
            )}
          </PanelStatRow>
        </View>

        {isMerging && (
          <PayeeMergePicker
            payeeId={payeeId}
            onPick={actions.mergeInto}
            onCancel={() => setIsMerging(false)}
          />
        )}

        {!isTransfer && activity.categories.length > 0 && (
          <View style={{ gap: spacing.sm }}>
            <Text style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
              <Trans>Categories</Trans>
            </Text>
            <PayeeCategoryBreakdown
              shares={activity.categories}
              categoriesById={categoriesById?.list ?? {}}
            />
          </View>
        )}
      </View>
    </SidePanel>
  );
}

function getCategoryName(
  categoryId: string | null | undefined,
  categoriesById: Record<string, { name: string }> | undefined,
  uncategorized: string,
) {
  if (categoryId === undefined) {
    return '';
  }
  return categoryId === null
    ? uncategorized
    : (categoriesById?.[categoryId]?.name ?? '');
}
