import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useLocale } from '#hooks/useLocale';

import { statementMonthCellClass } from './statementCellStyles';

type StatementMonthCellProps = {
  month: string;
  onOpen: () => void;
};

/** The row's month, which opens the budget at that month. */
export function StatementMonthCell({ month, onOpen }: StatementMonthCellProps) {
  const locale = useLocale();
  const isInProgress = month === monthUtils.currentMonth();

  return (
    <th scope="row" className={statementMonthCellClass}>
      <View style={{ alignItems: 'flex-start' }}>
        <Button
          variant="bare"
          style={{
            padding: '2px 4px',
            marginLeft: -4,
            fontSize: 13,
            fontWeight: 500,
            color: theme.pageTextDark,
          }}
          onPress={onOpen}
        >
          {monthUtils.format(month, 'MMMM yyyy', locale)}
        </Button>
        {isInProgress && (
          <Text
            style={{
              fontSize: 11.5,
              lineHeight: '14px',
              color: theme.pageTextSubdued,
            }}
          >
            <Trans>In progress</Trans>
          </Text>
        )}
      </View>
    </th>
  );
}
