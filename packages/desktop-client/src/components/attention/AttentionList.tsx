import { Trans } from 'react-i18next';
import { Link } from 'react-router';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import type { AttentionItem } from '#hooks/useAttentionItems';
import { useFormat } from '#hooks/useFormat';

type AttentionListProps = {
  items: readonly AttentionItem[];
  /** Called after a row is activated, e.g. to close the popover. */
  onNavigate?: () => void;
};

const LIST_WIDTH = 360;
const DOT_SIZE = 6;

const listClassName = css({
  display: 'flex',
  flexDirection: 'column',
  width: LIST_WIDTH,
  maxWidth: '100%',
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

const rowClassName = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm + 2,
  padding: '8px 10px',
  borderRadius: radius.sm,
  color: theme.menuItemText,
  textDecoration: 'none',
  fontSize: 13,
  transition: `background-color ${motion.fast} ${motion.ease}`,
  ':hover': { backgroundColor: theme.menuItemBackgroundHover },
  ':focus-visible': {
    outline: `2px solid ${theme.focusRing}`,
    outlineOffset: -2,
  },
});

/** The rows of the Attention popover: what needs the user, in order. */
export function AttentionList({ items, onNavigate }: AttentionListProps) {
  const format = useFormat();

  if (items.length === 0) {
    return (
      <Text
        style={{
          width: LIST_WIDTH,
          padding: '8px 10px',
          fontSize: 13,
          color: theme.pageTextSubdued,
        }}
      >
        <Trans>Nothing needs your attention.</Trans>
      </Text>
    );
  }

  return (
    <ul className={listClassName}>
      {items.map(item => (
        <li key={`${item.id}-${item.accountId ?? ''}`}>
          <Link
            to={item.to}
            state={item.state}
            className={rowClassName}
            onClick={onNavigate}
          >
            <View
              aria-hidden
              style={{
                width: DOT_SIZE,
                height: DOT_SIZE,
                borderRadius: radius.pill,
                flexShrink: 0,
                backgroundColor:
                  item.severity === 'signal'
                    ? theme.signal
                    : theme.pageTextSubdued,
              }}
            />
            <Text style={{ ...styles.ellipsisText, flex: 1 }}>
              {item.label}
            </Text>
            {item.amount !== null && (
              <PrivacyFilter>
                <FinancialText
                  style={{
                    fontSize: 12.5,
                    color:
                      item.amount < 0
                        ? theme.numberNegative
                        : theme.pageTextSubdued,
                  }}
                >
                  {format(item.amount, 'financial')}
                </FinancialText>
              </PrivacyFilter>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
