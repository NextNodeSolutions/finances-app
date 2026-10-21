import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDelete } from '@actual-app/components/icons/v0';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { elevation, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { openAttention } from '#components/titlebar/AttentionButton';
import { useAttentionItems } from '#hooks/useAttentionItems';

import { Amount } from './Amount';

const DISMISSED_KEY = 'overview.attention-strip-dismissed';
const DOT_SIZE = 6;

/**
 * The first thing that needs the user, mirrored from the titlebar's
 * Attention control. Review opens that control; ✕ hides the strip for the
 * rest of the session.
 */
export function AttentionStrip() {
  const { t } = useTranslation();
  const { items } = useAttentionItems();
  const [isDismissed, setIsDismissed] = useState(readDismissed);
  const [first] = items;
  const moreCount = items.length - 1;

  if (isDismissed || first === undefined) {
    return null;
  }

  const onDismiss = () => {
    writeDismissed();
    setIsDismissed(true);
  };

  return (
    <View
      role="region"
      aria-label={t('Needs attention')}
      data-testid="overview-attention-strip"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 40,
        padding: `${spacing.xs}px ${spacing.xs}px ${spacing.xs}px ${spacing.lg}px`,
        border: `1px solid ${theme.hairline}`,
        borderRadius: radius.lg,
        backgroundColor: theme.cardBackground,
        boxShadow: elevation.card,
        fontSize: 13,
      }}
    >
      <View
        aria-hidden
        style={{
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: radius.pill,
          flexShrink: 0,
          backgroundColor:
            first.severity === 'signal' ? theme.signal : theme.pageTextSubdued,
        }}
      />
      <Text style={{ ...styles.ellipsisText, color: theme.pageText }}>
        {first.label}
      </Text>
      {first.amount !== null && (
        <Amount
          value={first.amount}
          tone="balance"
          style={{ fontSize: 12.5 }}
        />
      )}
      {moreCount > 0 && (
        <Text style={{ color: theme.pageTextSubdued, flexShrink: 0 }}>
          <Trans count={moreCount}>and {{ count: moreCount }} more</Trans>
        </Text>
      )}
      <View style={{ flex: 1 }} />
      <Button
        variant="bare"
        onPress={openAttention}
        style={{ fontWeight: 500 }}
      >
        <Trans>Review</Trans>
      </Button>
      <Button
        variant="bare"
        aria-label={t('Dismiss for this session')}
        onPress={onDismiss}
        style={{ padding: 9, color: theme.pageTextLight }}
      >
        <SvgDelete width={9} height={9} />
      </Button>
    </View>
  );
}

// Session storage can be missing or blocked (private windows, previews);
// the strip then simply shows again.
function readDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeDismissed(): void {
  try {
    window.sessionStorage.setItem(DISMISSED_KEY, 'true');
  } catch {
    // Dismissal then lasts only while the page is mounted.
  }
}
