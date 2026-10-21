import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Dialog } from 'react-aria-components';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Popover } from '@actual-app/components/popover';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { AttentionList } from '#components/attention/AttentionList';
import { useAttentionItems } from '#hooks/useAttentionItems';

import {
  TITLEBAR_ICON_BUTTON_SIZE,
  TITLEBAR_WIDE_QUERY,
  titlebarIconButtonStyle,
} from './titlebarStyles';

const DOT_SIZE = 6;

const attentionOpeners = new Set<() => void>();

/**
 * Opens the titlebar's Attention list from anywhere (the Overview strip,
 * page banners). Does nothing while nothing needs attention, or where the
 * titlebar is not shown (narrow screens).
 */
export function openAttention(): void {
  attentionOpeners.forEach(open => open());
}

/**
 * The single owner of attention: a quiet count in the titlebar that opens
 * the list of everything that needs the user. Hidden when nothing does.
 */
export function AttentionButton() {
  const { t } = useTranslation();
  const { items } = useAttentionItems();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const count = items.length;

  const requestOpen = useEffectEvent(() => {
    if (count > 0) {
      setIsOpen(true);
    }
  });

  useEffect(() => {
    const onOpenRequest = () => requestOpen();
    attentionOpeners.add(onOpenRequest);
    return () => {
      attentionOpeners.delete(onOpenRequest);
    };
  }, []);

  if (count === 0) {
    return null;
  }

  const hasSignal = items.some(item => item.severity === 'signal');
  const label = t('{{count}} need attention', { count });

  return (
    <>
      <Button
        ref={triggerRef}
        variant="bare"
        aria-label={label}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        data-testid="attention-button"
        onPress={() => setIsOpen(!isOpen)}
        style={{
          ...titlebarIconButtonStyle,
          gap: spacing.xs + 2,
          height: TITLEBAR_ICON_BUTTON_SIZE,
          padding: '0 9px',
          marginRight: spacing.xs,
          color: theme.pageText,
        }}
      >
        <View
          aria-hidden
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: radius.pill,
            flexShrink: 0,
            backgroundColor: hasSignal ? theme.signal : theme.pageTextSubdued,
          }}
        />
        <Text
          aria-hidden
          style={{
            ...styles.tnum,
            fontSize: 12,
            fontWeight: 500,
            [TITLEBAR_WIDE_QUERY]: { display: 'none' },
          }}
        >
          {count}
        </Text>
        <Text
          aria-hidden
          style={{
            display: 'none',
            fontSize: 12.5,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums',
            [TITLEBAR_WIDE_QUERY]: { display: 'inline' },
          }}
        >
          {label}
        </Text>
      </Button>
      <Popover
        triggerRef={triggerRef}
        placement="bottom end"
        offset={8}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        style={{ padding: spacing.xs }}
      >
        {/* A dialog, so focus moves into the list and Escape closes it. */}
        <Dialog aria-label={t('Needs attention')} style={{ outline: 'none' }}>
          <AttentionList items={items} onNavigate={() => setIsOpen(false)} />
        </Dialog>
      </Popover>
    </>
  );
}
