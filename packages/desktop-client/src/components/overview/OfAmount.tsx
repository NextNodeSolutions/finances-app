import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';

import { Amount } from './Amount';

type OfAmountProps = {
  value: number | null;
  of: number | null;
};

/** "2,940.12 / 3,355.00": a figure against its plan, read as "of". */
export function OfAmount({ value, of }: OfAmountProps) {
  const { t } = useTranslation();

  return (
    <>
      <Amount value={value} />
      <Text aria-hidden style={{ color: theme.tableTextSubdued }}>
        /
      </Text>
      <Text style={styles.visuallyHidden}>{t('of')}</Text>
      <Amount value={of} style={{ color: theme.pageTextSubdued }} />
    </>
  );
}
