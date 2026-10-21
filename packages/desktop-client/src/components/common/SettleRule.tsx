import { useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { keyframes } from '@emotion/css';

type SettleRuleProps = {
  isSettled: boolean;
  hasJustSettled: boolean;
  /** Defaults to "Balanced". */
  label?: string;
};

const RULE_GAP = 3;

const drawIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

/**
 * The double hairline that marks a difference reaching exactly 0.00.
 * Pair with `useSettled`. The wrapper is always rendered as a polite live
 * region, so the label is announced once when the value settles and not
 * when the page opens already settled.
 */
export function SettleRule({
  isSettled,
  hasJustSettled,
  label,
}: SettleRuleProps) {
  const { t } = useTranslation();

  return (
    <View aria-live="polite">
      {isSettled && (
        <View
          data-testid="settle-rule"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            ...(hasJustSettled && {
              animation: `${drawIn} ${motion.slow} ${motion.ease}`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }),
          }}
        >
          <View
            aria-hidden
            style={{
              flex: 1,
              height: RULE_GAP + 2,
              borderTop: `1px solid ${theme.pageTextDark}`,
              borderBottom: `1px solid ${theme.pageTextDark}`,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: theme.pageTextSubdued,
              flexShrink: 0,
            }}
          >
            {label ?? t('Balanced')}
          </Text>
        </View>
      )}
    </View>
  );
}
