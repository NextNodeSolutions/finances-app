import { Trans } from 'react-i18next';

import type { PayeeActivity } from './usePayeeActivity';

const PERCENT = 100;

/** Shown while the panel's figures load. */
export const PAYEE_PANEL_LOADING = '…';

type PayeeSummaryProps = {
  activity: PayeeActivity;
  categoryName: string;
};

/** `Mostly Food · 61%`: the category that takes most of the payee's money. */
export function PayeeSummary({ activity, categoryName }: PayeeSummaryProps) {
  const [top] = activity.categories;
  if (activity.isLoading) {
    return PAYEE_PANEL_LOADING;
  }
  if (!top) {
    return <Trans>No transactions in the last 12 months</Trans>;
  }
  return (
    <Trans>
      Mostly {{ category: categoryName }} ·{' '}
      {{ pct: Math.round(top.share * PERCENT) }}%
    </Trans>
  );
}
