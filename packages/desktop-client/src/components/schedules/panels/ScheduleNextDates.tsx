import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { ScheduleEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { useDateFormat } from '#hooks/useDateFormat';

import { SchedulePanelSection } from './SchedulePanelSection';
import { useScheduleNextDates } from './useScheduleNextDates';

type ScheduleNextDatesProps = {
  date: ScheduleEntity['_date'];
};

/** The next five occurrences of the schedule, from today. */
export function ScheduleNextDates({ date }: ScheduleNextDatesProps) {
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const { dates, isLoading } = useScheduleNextDates(date);

  return (
    <SchedulePanelSection label={<Trans>Next dates</Trans>}>
      {isLoading ? (
        <View
          aria-hidden
          style={{
            height: 18,
            width: '60%',
            borderRadius: 4,
            backgroundColor: theme.tableRowBackgroundHover,
          }}
        />
      ) : dates.length === 0 ? (
        <Text style={{ color: theme.pageTextSubdued }}>
          <Trans>No dates left in this schedule.</Trans>
        </Text>
      ) : (
        <ul
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: spacing.md,
            rowGap: spacing.xs,
            margin: 0,
            padding: 0,
            listStyle: 'none',
          })}
        >
          {dates.map(nextDate => (
            <li
              key={nextDate}
              className={css({
                ...styles.tnum,
                fontSize: 12.5,
                color: theme.pageText,
              })}
            >
              {monthUtils.format(nextDate, dateFormat)}
            </li>
          ))}
        </ul>
      )}
    </SchedulePanelSection>
  );
}
