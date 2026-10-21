import { useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';

import { Amount } from './Amount';

type OverspentFigureProps = {
  count: number;
  /** Total overspending in cents (negative). */
  amount: number;
};

/** "3 categories −389.86", the amount in the signal pill. */
export function OverspentFigure({ count, amount }: OverspentFigureProps) {
  const { t } = useTranslation();

  return (
    <>
      <Text style={{ fontSize: 12.5, color: theme.pageTextSubdued }}>
        {count === 1 ? t('1 category') : t('{{count}} categories', { count })}
      </Text>
      <Text
        style={{
          padding: '1px 6px',
          borderRadius: radius.sm,
          backgroundColor: theme.signalSubtle,
        }}
      >
        <Amount value={amount} style={{ color: theme.signalText }} />
      </Text>
    </>
  );
}
