import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';

import type { TrendPoint } from './statement';

type MonthEndTableProps = {
  points: readonly TrendPoint[];
};

/**
 * The trend's month-end values as a table for screen readers; the chart
 * itself is a single image with a summary label.
 */
export function MonthEndTable({ points }: MonthEndTableProps) {
  const format = useFormat();
  const locale = useLocale();

  return (
    <View style={styles.visuallyHidden}>
      <table>
        <caption>
          <Trans>Month-end net worth</Trans>
        </caption>
        <thead>
          <tr>
            <th scope="col">
              <Trans>Month</Trans>
            </th>
            <th scope="col">
              <Trans>Net worth</Trans>
            </th>
            <th scope="col">
              <Trans>Change</Trans>
            </th>
          </tr>
        </thead>
        <tbody>
          {points.map(point => (
            <tr key={point.month}>
              <th scope="row">
                {monthUtils.format(point.month, 'MMMM yyyy', locale)}
              </th>
              <td>{format(point.netWorth, 'financial')}</td>
              <td>{format(point.change, 'financial-with-sign')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </View>
  );
}
