import { useEffect, useRef } from 'react';
import { Trans } from 'react-i18next';
import { useLocation } from 'react-router';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Amount } from '#components/budget/Amount';
import { useBudgetPanels } from '#components/budget/panels/useBudgetPanels';
import type { useOverspentCategories } from '#hooks/useOverspentCategories';

import { RailSection } from './RailSection';

type OverspentCardProps = {
  month: string;
  overspent: ReturnType<typeof useOverspentCategories>;
};

const CATEGORIES_SHOWN = 4;

/**
 * The month's overspent envelopes and the way to cover them. Arriving from
 * the attention list (`state.focusOverspent`) scrolls here and focuses the
 * button.
 */
export function OverspentCard({ month, overspent }: OverspentCardProps) {
  const { openCover } = useBudgetPanels();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { categories, amountsByCategory, totalAmount } = overspent;
  useFocusOnArrival(buttonRef, categories.length > 0);

  if (categories.length === 0) {
    return null;
  }

  return (
    <RailSection testId="overspent-card">
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <Text style={{ fontWeight: 600, color: theme.pageTextDark }}>
          <Trans count={categories.length}>
            {{ count: categories.length }} overspent
          </Trans>
        </Text>
        <Amount value={totalAmount} style={{ color: theme.numberNegative }} />
      </View>
      {categories.slice(0, CATEGORIES_SHOWN).map(category => (
        <View
          key={category.id}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: spacing.sm,
            fontSize: 12.5,
          }}
        >
          <Text style={{ color: theme.pageTextLight }}>{category.name}</Text>
          <Amount
            value={amountsByCategory.get(category.id) ?? null}
            style={{ color: theme.numberNegative }}
          />
        </View>
      ))}
      <View style={{ alignItems: 'flex-start', marginTop: spacing.xs }}>
        <Button
          ref={buttonRef}
          variant="primary"
          onPress={() => openCover({ month })}
        >
          <Trans>Cover overspending</Trans>
        </Button>
      </View>
    </RailSection>
  );
}

/** Once per navigation that asked for it, bring the button into view. */
function useFocusOnArrival(
  buttonRef: { current: HTMLButtonElement | null },
  isReady: boolean,
) {
  const location = useLocation();
  const handledKeyRef = useRef<string | null>(null);
  const isRequested =
    typeof location.state === 'object' &&
    location.state !== null &&
    'focusOverspent' in location.state &&
    location.state.focusOverspent === true;

  useEffect(() => {
    const button = buttonRef.current;
    if (!isRequested || !isReady || !button) {
      return;
    }
    if (handledKeyRef.current === location.key) {
      return;
    }
    handledKeyRef.current = location.key;
    button.scrollIntoView({ block: 'nearest' });
    button.focus();
  }, [buttonRef, isRequested, isReady, location.key]);
}
