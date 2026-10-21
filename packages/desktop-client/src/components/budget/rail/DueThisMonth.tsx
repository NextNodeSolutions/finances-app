import { Trans, useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { Amount } from '#components/budget/Amount';
import { Link } from '#components/common/Link';
import { useCachedSchedules } from '#hooks/useCachedSchedules';
import { useLocale } from '#hooks/useLocale';
import { usePayeesById } from '#hooks/usePayees';
import { usePreviewTransactions } from '#hooks/usePreviewTransactions';

import { RailSection } from './RailSection';

type DueThisMonthProps = {
  month: string;
};

const ROWS_SHOWN = 4;

/**
 * Scheduled transactions still to come between today and the end of
 * `month`. Needs a SchedulesProvider above it; renders nothing when none
 * are due.
 */
export function DueThisMonth({ month }: DueThisMonthProps) {
  const locale = useLocale();
  const { t } = useTranslation();
  const { data: payeesById = {} } = usePayeesById();
  const { schedules } = useCachedSchedules();
  const { previewTransactions } = usePreviewTransactions();
  const today = monthUtils.currentDay();
  const due = previewTransactions.filter(
    transaction =>
      !transaction.is_child &&
      transaction.date >= today &&
      monthUtils.monthFromDate(transaction.date) === month,
  );

  if (due.length === 0) {
    return null;
  }

  const hiddenCount = due.length - ROWS_SHOWN;

  return (
    <RailSection testId="due-this-month">
      <Text style={{ ...styles.monoLabel, color: theme.pageTextSubdued }}>
        <Trans>Due this month</Trans>
      </Text>
      {due.slice(0, ROWS_SHOWN).map(transaction => {
        // A schedule without a payee goes by its own name, as on the Overview.
        const name =
          (transaction.payee && payeesById[transaction.payee]?.name) ||
          schedules.find(schedule => schedule.id === transaction.schedule)
            ?.name;

        return (
          <View
            key={transaction.id}
            style={{ flexDirection: 'row', gap: spacing.sm, fontSize: 12.5 }}
          >
            <Text
              style={{ width: 44, flexShrink: 0, color: theme.pageTextSubdued }}
            >
              {monthUtils.format(transaction.date, 'd MMM', locale)}
            </Text>
            <Text
              style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: name ? theme.pageText : theme.pageTextSubdued,
              }}
            >
              {name || t('No payee')}
            </Text>
            <Amount value={transaction.amount} />
          </View>
        );
      })}
      {hiddenCount > 0 && (
        <Link variant="internal" to="/schedules" style={{ fontSize: 12.5 }}>
          <Trans count={hiddenCount}>and {{ count: hiddenCount }} more</Trans>
        </Link>
      )}
    </RailSection>
  );
}
