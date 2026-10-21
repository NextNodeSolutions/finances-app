import React, { useEffect, useEffectEvent, useMemo, useState } from 'react';
import type { CSSProperties, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { animated, to, useSpring } from 'react-spring';
import { useSwipeable } from 'react-swipeable';

import { Button, ButtonWithLoading } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import { SvgDelete } from '@actual-app/components/icons/v0';
import { SpaceBetween } from '@actual-app/components/space-between';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { elevation, motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { removeNotification } from '#notifications/notificationsSlice';
import type { NotificationWithId } from '#notifications/notificationsSlice';
import { useDispatch, useSelector } from '#redux';

import { Link } from './common/Link';
import { MODAL_Z_INDEX } from './common/Modal';

// Notification stacking configuration
const MAX_VISIBLE_NOTIFICATIONS = 3; // Maximum number of notifications visible in the stack
const SCALE_MULTIPLIER = 0.05; // Scale reduction per stacked notification
const OPACITY_MULTIPLIER = 0.2; // Opacity reduction per stacked notification
const MIN_OPACITY = 1; // Minimum opacity for stacked notifications
const Y_OFFSET_PER_LEVEL = -20; // Vertical offset in pixels per stacked notification
const BASE_Z_INDEX = 10; // Base z-index for notification stacking

type NotificationTone = 'positive' | 'error' | 'warning';

// A small tinted lamp carries the status; the card itself stays a calm
// white popover surface.
const toneLamps: Record<NotificationTone, { halo: string; core: string }> = {
  positive: { halo: theme.noticeBackground, core: theme.noticeTextLight },
  error: { halo: theme.errorBackground, core: theme.errorText },
  warning: { halo: theme.warningBackground, core: theme.signal },
};

function compileMessage(
  message: string,
  actions: Record<string, () => void>,
  setLoading: (arg: SetStateAction<boolean>) => void,
  onRemove?: () => void,
) {
  return (
    <SpaceBetween direction="vertical" gap={10}>
      {message.split(/\n\n/).map((paragraph, idx) => {
        const parts = paragraph.split(/(\[[^\]]*\]\([^)]*\))/g);

        return (
          <Text key={idx} style={{ lineHeight: '1.4em' }}>
            {parts.map((part, idx) => {
              const match = part.match(/\[([^\]]*)\]\(([^)]*)\)/);
              if (match) {
                const [_, text, href] = match;

                if (href[0] === '#') {
                  const actionName = href.slice(1);
                  return (
                    <Link
                      variant="text"
                      key={idx}
                      onClick={async e => {
                        e.preventDefault();
                        if (actions[actionName]) {
                          setLoading(true);
                          actions[actionName]();
                          onRemove?.();
                        }
                      }}
                    >
                      {text}
                    </Link>
                  );
                }

                return (
                  <Link
                    variant="external"
                    linkColor="purple"
                    key={idx}
                    to={match[2]}
                  >
                    {match[1]}
                  </Link>
                );
              }
              return <Text key={idx}>{part}</Text>;
            })}
          </Text>
        );
      })}
    </SpaceBetween>
  );
}

function Notification({
  notification,
  onRemove,
  index,
  isInteractive,
}: {
  notification: NotificationWithId;
  onRemove: () => void;
  index: number;
  isInteractive: boolean;
}) {
  const { t } = useTranslation();
  const {
    type,
    title,
    message,
    pre,
    messageActions,
    sticky,
    internal,
    button,
    timeout,
  } = notification;

  const [loading, setLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState(false);

  const connected = useEffectEvent(() => {
    if (type === 'error' && internal) {
      console.error('Internal error:', internal);
    }

    if (!sticky) {
      setTimeout(onRemove, timeout || 6500);
    }
  });
  useEffect(() => connected(), []);

  const tone: NotificationTone =
    type === 'message' ? 'positive' : type === 'error' ? 'error' : 'warning';
  const lamp = toneLamps[tone];

  const processedMessage = useMemo(
    () =>
      compileMessage(
        message,
        messageActions ?? {},
        setOverlayLoading,
        onRemove,
      ),
    [message, messageActions, onRemove, setOverlayLoading],
  );

  const { isNarrowWidth } = useResponsive();
  const narrowStyle: CSSProperties = isNarrowWidth
    ? { minHeight: styles.mobileMinHeight }
    : {};

  // Calculate stacking properties based on index (scales for any number of notifications)
  const scale = 1.0 - index * SCALE_MULTIPLIER;
  const stackOpacity = Math.max(MIN_OPACITY, 1.0 - index * OPACITY_MULTIPLIER);
  const zIndex = BASE_Z_INDEX - index;

  const yOffset = index * Y_OFFSET_PER_LEVEL;

  const [isSwiped, setIsSwiped] = useState(false);
  const [spring, api] = useSpring(
    () => ({
      from: {
        x: 0,
        y: yOffset,
        opacity: stackOpacity,
        scale,
      },
    }),
    [],
  );

  // Update scale, opacity, and y-position when index changes
  useEffect(() => {
    void api.start({ to: { scale, opacity: stackOpacity, y: yOffset } });
  }, [index, scale, stackOpacity, yOffset, api]);

  const swipeHandlers = useSwipeable({
    onSwiping: ({ deltaX }) => {
      if (!isSwiped) {
        void api.start({ to: { x: deltaX } });
      }
    },
    onSwiped: ({ velocity, deltaX }) => {
      // Distance to trigger deletion
      const threshold = 100;
      const direction = deltaX > 0 ? 1 : -1;

      if (Math.abs(deltaX) > threshold || velocity > 0.5) {
        // Animate out & remove item after animation
        void api.start({
          to: { x: direction * 1000, opacity: 0 },
          onRest: onRemove,
        });
        setIsSwiped(true);
      } else {
        // Reset position if not swiped far enough
        void api.start({ to: { x: 0 } });
      }
    },
    trackMouse: true,
  });

  return (
    <animated.div
      role="alert"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex,
        // Combine translateX, translateY and scale transforms
        transform: to(
          [spring.x, spring.y, spring.scale],
          (x, y, s) => `translateX(${x}px) translateY(${y}px) scale(${s})`,
        ),
        opacity: spring.opacity,
        pointerEvents: isInteractive ? 'auto' : 'none',
        color: theme.pageTextLight,
        // Prevents scrolling conflicts
        touchAction: isInteractive ? 'none' : 'auto',
      }}
      {...(isInteractive ? swipeHandlers : {})}
    >
      <View
        style={{
          position: 'relative',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
          padding: '14px 44px 14px 14px',
          borderRadius: radius.lg,
          fontSize: 13,
          lineHeight: '19px',
          backgroundColor: theme.menuBackground,
          border: `1px solid ${theme.menuBorder}`,
          boxShadow: elevation.popover,
          maxWidth: 550,
          '& a': { color: theme.accentText },
        }}
      >
        <View
          aria-hidden
          style={{
            width: 22,
            height: 22,
            flexShrink: 0,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: lamp.halo,
          }}
        >
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: radius.pill,
              backgroundColor: lamp.core,
            }}
          />
        </View>

        {/* Close button in top right corner */}
        <Button
          variant="bare"
          aria-label={t('Close')}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 24,
            height: 24,
            padding: 0,
            borderRadius: radius.sm,
            color: theme.pageTextSubdued,
          }}
          onPress={onRemove}
        >
          <SvgDelete style={{ width: 9, height: 9 }} />
        </Button>

        {/* Content and action button layout */}
        <SpaceBetween
          direction="vertical"
          gap={8}
          style={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}
        >
          {title && (
            <View
              style={{
                fontSize: 13.5,
                lineHeight: '22px',
                fontWeight: 600,
                letterSpacing: '-0.005em',
                color: theme.pageText,
              }}
            >
              {title}
            </View>
          )}

          {/* Message with its action underneath, so the copy keeps the
              full card width */}
          <SpaceBetween
            direction="vertical"
            gap={12}
            style={{ width: '100%', alignItems: 'flex-start' }}
          >
            <View
              style={{
                width: '100%',
                minWidth: 0,
                paddingTop: title ? 0 : 2,
              }}
            >
              {processedMessage}
            </View>
            {button && (
              <ButtonWithLoading
                variant="bare"
                isLoading={loading}
                onPress={async () => {
                  setLoading(true);
                  await button.action();
                  onRemove();
                  setLoading(false);
                }}
                className={css({
                  height: 30,
                  padding: '0 12px',
                  borderRadius: radius.md,
                  backgroundColor: theme.buttonNormalBackground,
                  border: `1px solid ${theme.buttonNormalBorder}`,
                  boxShadow: elevation.xs,
                  color: theme.buttonNormalText,
                  fontSize: 13,
                  fontWeight: 500,
                  flexShrink: 0,
                  transition: `background-color ${motion.base} ${motion.ease}, border-color ${motion.base} ${motion.ease}`,
                  '&[data-hovered]': {
                    backgroundColor: theme.buttonNormalBackgroundHover,
                    borderColor: theme.hairlineStrong,
                    color: theme.buttonNormalText,
                    boxShadow: elevation.xs,
                  },
                  '&[data-pressed]': {
                    backgroundColor: theme.buttonNormalBackgroundHover,
                  },
                  ...narrowStyle,
                })}
              >
                {button.title}
              </ButtonWithLoading>
            )}
          </SpaceBetween>

          {pre
            ? pre.split('\n\n').map((text, idx) => (
                <View
                  key={idx}
                  style={{
                    ...styles.tnum,
                    whiteSpace: 'pre-wrap',
                    fontSize: 11.5,
                    lineHeight: '17px',
                    color: theme.pageTextLight,
                    backgroundColor: theme.trayBackground,
                    border: `1px solid ${theme.trayBorder}`,
                    padding: '10px 12px',
                    borderRadius: radius.md,
                    width: '100%',
                  }}
                >
                  {text}
                </View>
              ))
            : null}
        </SpaceBetween>
      </View>
      {overlayLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: radius.lg,
            backgroundColor: theme.menuBackground,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatedLoading
            style={{ width: 20, height: 20, color: theme.pageTextLight }}
          />
        </View>
      )}
    </animated.div>
  );
}

export function Notifications({ style }: { style?: CSSProperties }) {
  const dispatch = useDispatch();
  const { isNarrowWidth } = useResponsive();
  const notifications = useSelector(state => state.notifications.notifications);
  const notificationInset = useSelector(state => state.notifications.inset);

  // Only show the last N notifications (newest first) for z-axis stacking
  // Reverse so newest notification (last in array) becomes index 0 (front)
  const visibleNotifications = notifications
    .slice(-MAX_VISIBLE_NOTIFICATIONS)
    .reverse();

  return (
    <View
      style={{
        position: 'fixed',
        bottom: notificationInset?.bottom || 20,
        top: notificationInset?.top,
        right: notificationInset?.right || 13,
        left: notificationInset?.left || (isNarrowWidth ? 13 : undefined),
        zIndex: MODAL_Z_INDEX - 1,
        width: isNarrowWidth ? undefined : 400,
        ...style,
      }}
    >
      <View style={{ position: 'relative' }}>
        {visibleNotifications.map((note, index) => (
          <Notification
            key={note.id}
            notification={note}
            index={index}
            isInteractive={index === 0}
            onRemove={() => {
              if (note.onClose) {
                note.onClose();
              }
              dispatch(removeNotification({ id: note.id }));
            }}
          />
        ))}
      </View>
    </View>
  );
}
