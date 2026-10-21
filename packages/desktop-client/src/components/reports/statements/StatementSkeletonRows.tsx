import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import {
  statementFigureCellClass,
  statementMonthCellClass,
  statementNoteCellClass,
} from './statementCellStyles';

const SKELETON_ROW_COUNT = 6;
const FIGURE_COLUMN_COUNT = 5;
const skeletonRows = Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => i);
const skeletonFigures = Array.from(
  { length: FIGURE_COLUMN_COUNT },
  (_, i) => i,
);

function SkeletonBar({ width }: { width: number | string }) {
  return (
    <View
      style={{
        display: 'inline-flex',
        width,
        height: 10,
        borderRadius: 3,
        backgroundColor: theme.tableRowBackgroundHover,
      }}
    />
  );
}

/** Placeholder rows while the statement months load. */
export function StatementSkeletonRows() {
  const { t } = useTranslation();

  return skeletonRows.map(row => (
    <tr key={row} aria-busy aria-label={t('Loading statements')}>
      <td className={statementMonthCellClass}>
        <SkeletonBar width={96} />
      </td>
      {skeletonFigures.map(figure => (
        <td key={figure} className={statementFigureCellClass}>
          <SkeletonBar width={64} />
        </td>
      ))}
      <td className={statementNoteCellClass} colSpan={2}>
        <SkeletonBar width="40%" />
      </td>
    </tr>
  ));
}
