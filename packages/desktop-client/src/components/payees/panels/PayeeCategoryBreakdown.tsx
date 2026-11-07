import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

import type { PayeeCategoryShare } from './usePayeeActivity';

const PERCENT = 100;

type PayeeCategoryBreakdownProps = {
  shares: PayeeCategoryShare[];
  categoriesById: Record<CategoryEntity['id'], CategoryEntity>;
};

/** One line per category: name, share of the money, and the amount. */
export function PayeeCategoryBreakdown({
  shares,
  categoriesById,
}: PayeeCategoryBreakdownProps) {
  const { t } = useTranslation();
  const format = useFormat();

  return (
    <View>
      {shares.map(share => (
        <View
          key={share.categoryId ?? 'uncategorized'}
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: spacing.md,
            minHeight: 32,
            paddingBlock: spacing.xs + spacing.xxs,
            borderTop: `1px solid ${theme.hairlineSubtle}`,
          }}
        >
          <Text
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {share.categoryId == null
              ? t('Uncategorized')
              : (categoriesById[share.categoryId]?.name ?? t('(deleted)'))}
          </Text>
          <Text
            style={{
              ...styles.tnum,
              fontSize: 12,
              color: theme.pageTextSubdued,
            }}
          >
            {Math.round(share.share * PERCENT)}%
          </Text>
          <PrivacyFilter>
            <FinancialText
              style={{ minWidth: 96, fontSize: 12.5, textAlign: 'right' }}
            >
              {format(share.total, 'financial')}
            </FinancialText>
          </PrivacyFilter>
        </View>
      ))}
    </View>
  );
}
