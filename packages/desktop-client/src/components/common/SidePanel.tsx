import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDelete } from '@actual-app/components/icons/v0';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { keyframes } from '@emotion/css';

import {
  SIDE_PANEL_SELECTOR,
  usePanelFocusRequest,
} from '#components/panels/PanelProvider';

type SidePanelProps = {
  /** Set in the display serif. */
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional display figure under the title. */
  headline?: ReactNode;
  /** Sticky actions, right-aligned under a hairline. */
  footer?: ReactNode;
  onClose: () => void;
  /** Runs on Cmd/Ctrl+Enter (Save, Transfer, Cover…). */
  onPrimaryAction?: () => void;
  /** `${name}-panel`. */
  testId: string;
  children: ReactNode;
};

export const SIDE_PANEL_WIDTH = 440;
export const PANEL_HOTKEY_SCOPE = 'panel';

const PANEL_GUTTER = 20;

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

/**
 * Non-modal right panel for inspecting and editing beside a live page. No
 * scrim: the page stays interactive and narrows to make room.
 */
export function SidePanel({
  title,
  subtitle,
  headline,
  footer,
  onClose,
  onPrimaryAction,
  testId,
  children,
}: SidePanelProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const focusRequest = usePanelFocusRequest();

  usePanelHotkeyScope();
  useFocusTitleOnOpen(titleRef, focusRequest);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (
      event.key === 'Enter' &&
      (event.metaKey || event.ctrlKey) &&
      onPrimaryAction
    ) {
      event.preventDefault();
      onPrimaryAction();
    }
  };

  return (
    <View
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      data-testid={testId}
      data-side-panel
      onKeyDown={onKeyDown}
      style={{
        width: SIDE_PANEL_WIDTH,
        flexShrink: 0,
        height: '100%',
        borderLeft: `1px solid ${theme.hairline}`,
        backgroundColor: theme.cardBackground,
        color: theme.pageText,
        animation: `${fadeIn} ${motion.base} ${motion.ease}`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.sm,
          padding: `${PANEL_GUTTER}px ${spacing.md}px ${spacing.lg}px ${PANEL_GUTTER}px`,
        }}
      >
        <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}>
          <h2
            id={titleId}
            ref={titleRef}
            tabIndex={-1}
            style={{
              ...styles.display,
              margin: 0,
              fontSize: 20,
              lineHeight: '26px',
              color: theme.pageTextDark,
              outline: 'none',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <Text style={{ fontSize: 12.5, color: theme.pageTextSubdued }}>
              {subtitle}
            </Text>
          )}
          {headline && (
            <View style={{ marginTop: spacing.sm }}>{headline}</View>
          )}
        </View>
        <Button
          variant="bare"
          aria-label={t('Close')}
          onPress={onClose}
          style={{ padding: 9, color: theme.pageTextLight }}
        >
          <SvgDelete width={10} />
        </Button>
      </View>
      <View
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `0 ${PANEL_GUTTER}px ${PANEL_GUTTER}px`,
        }}
      >
        {children}
      </View>
      {footer && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: spacing.sm,
            padding: `${spacing.md}px ${PANEL_GUTTER}px`,
            borderTop: `1px solid ${theme.hairline}`,
          }}
        >
          {footer}
        </View>
      )}
    </View>
  );
}

/** Keeps the `panel` hotkeys scope active while a panel is mounted. */
function usePanelHotkeyScope() {
  const { enableScope, disableScope } = useHotkeysContext();

  useEffect(() => {
    enableScope(PANEL_HOTKEY_SCOPE);
    return () => disableScope(PANEL_HOTKEY_SCOPE);
  }, [enableScope, disableScope]);
}

/**
 * Moves focus to the title once per open request (first open, or the same
 * panel opened again), unless something inside the panel (an autofocused
 * field) already holds it.
 */
function useFocusTitleOnOpen(
  titleRef: { current: HTMLHeadingElement | null },
  focusRequest: number | null,
) {
  const handledRequestRef = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    if (handledRequestRef.current === focusRequest) {
      return;
    }
    handledRequestRef.current = focusRequest;

    const title = titleRef.current;
    const panel = title?.closest(SIDE_PANEL_SELECTOR);
    if (!title || panel?.contains(document.activeElement)) {
      return;
    }
    title.focus();
  }, [titleRef, focusRequest]);
}
