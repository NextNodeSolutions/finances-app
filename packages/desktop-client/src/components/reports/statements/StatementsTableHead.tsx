import { Trans, useTranslation } from 'react-i18next';

import type { SyncedPrefs } from '@actual-app/core/types/prefs';
import { cx } from '@emotion/css';

import {
  statementHeadCellClass,
  statementHeadFigureCellClass,
} from './statementCellStyles';

const figureHeadClass = cx(
  statementHeadCellClass,
  statementHeadFigureCellClass,
);

type StatementsTableHeadProps = {
  budgetType: SyncedPrefs['budgetType'];
};

/** Column heads; a tracking budget plans savings instead of a to-budget. */
export function StatementsTableHead({ budgetType }: StatementsTableHeadProps) {
  const { t } = useTranslation();

  return (
    <thead>
      <tr>
        <th scope="col" className={statementHeadCellClass}>
          <Trans>Month</Trans>
        </th>
        <th scope="col" className={figureHeadClass}>
          <Trans>Income</Trans>
        </th>
        <th scope="col" className={figureHeadClass}>
          <Trans>Spent</Trans>
        </th>
        <th scope="col" className={figureHeadClass}>
          <Trans>Saved</Trans>
        </th>
        <th scope="col" className={figureHeadClass}>
          {budgetType === 'tracking' ? (
            <Trans>Planned saving</Trans>
          ) : (
            <Trans>To budget</Trans>
          )}
        </th>
        <th scope="col" className={figureHeadClass}>
          <Trans>Net worth</Trans>
        </th>
        <th scope="col" className={statementHeadCellClass}>
          <Trans>Note</Trans>
        </th>
        <th
          scope="col"
          aria-label={t('Actions')}
          className={statementHeadCellClass}
        />
      </tr>
    </thead>
  );
}
