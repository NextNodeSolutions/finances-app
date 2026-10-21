import type { ReactNode } from 'react';
import { GridListItem } from 'react-aria-components';

import { Card } from '@actual-app/components/card';
import type { CSSProperties } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import type { AttentionItem } from '#hooks/useAttentionItems';
import { useFormat } from '#hooks/useFormat';

const MARK_SIZE = 6;

// Signal for money that needs the user (overspending, overbudgeting, a
// failed sync); quiet paper for chores (uncategorized, missed schedules).
const BANNER_TONES = {
  signal: {
    backgroundColor: theme.signalSubtle,
    borderColor: theme.warningBorder,
    markColor: theme.signal,
  },
  notice: {
    backgroundColor: theme.cardBackground,
    borderColor: theme.hairline,
    markColor: theme.pageTextSubdued,
  },
} satisfies Record<AttentionItem['severity'], Record<string, string>>;

/** The one button a banner carries, on its right. */
export const BUDGET_BANNER_ACTION_STYLE: CSSProperties = {
  flexShrink: 0,
  marginLeft: 10,
  minHeight: 30,
  padding: '0 14px',
  borderRadius: radius.md,
  fontSize: 12.5,
  fontWeight: 500,
  color: theme.buttonNormalText,
};

type BudgetBannerProps = {
  severity: AttentionItem['severity'];
  /** Translated sentence; also the row's text value for the grid list. */
  label: string;
  /** Cents, shown in mono under the label; null shows nothing. */
  amount?: number | null;
  action: ReactNode;
};

/** One row of the budget page's banners: a mark, the sentence, an action. */
export function BudgetBanner({
  severity,
  label,
  amount = null,
  action,
}: BudgetBannerProps) {
  const format = useFormat();
  const tone = BANNER_TONES[severity];

  return (
    <GridListItem textValue={label}>
      <Card
        style={{
          minHeight: 48,
          // Vertical margins collapse between rows, so the stack keeps 10 px
          // gaps and clears the summary below it.
          margin: '10px 8px',
          padding: '8px 8px 8px 12px',
          justifyContent: 'center',
          borderRadius: radius.lg,
          border: `1px solid ${tone.borderColor}`,
          boxShadow: 'none',
          backgroundColor: tone.backgroundColor,
          color: theme.pageText,
          fontSize: 13,
          lineHeight: '18px',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            aria-hidden
            style={{
              width: MARK_SIZE,
              height: MARK_SIZE,
              borderRadius: radius.pill,
              flexShrink: 0,
              backgroundColor: tone.markColor,
            }}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text>{label}</Text>
            {amount !== null && (
              <PrivacyFilter>
                <FinancialText
                  style={{
                    fontSize: 12.5,
                    color:
                      amount < 0 ? theme.numberNegative : theme.pageTextSubdued,
                  }}
                >
                  {format(amount, 'financial')}
                </FinancialText>
              </PrivacyFilter>
            )}
          </View>
          {action}
        </View>
      </Card>
    </GridListItem>
  );
}
