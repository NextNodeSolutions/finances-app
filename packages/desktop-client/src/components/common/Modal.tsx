import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  CSSProperties,
  ReactNode,
} from 'react';
import {
  Dialog,
  Modal as ReactAriaModal,
  ModalOverlay as ReactAriaModalOverlay,
} from 'react-aria-components';
import { ErrorBoundary } from 'react-error-boundary';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import { SvgLogo } from '@actual-app/components/icons/logo';
import { SvgDelete } from '@actual-app/components/icons/v0';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { TextOneLine } from '@actual-app/components/text-one-line';
import { theme } from '@actual-app/components/theme';
import {
  elevation,
  motion,
  radius,
  spacing,
  tokens,
} from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css, keyframes } from '@emotion/css';
import { AutoTextSize } from 'auto-text-size';

import { FeatureErrorFallback } from '#components/FeatureErrorFallback';
import { useModalState } from '#hooks/useModalState';
import { useReducedMotion } from '#hooks/useReducedMotion';
import { useSwipeToDismiss } from '#hooks/useSwipeToDismiss';
import { collapseModals } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

export const MODAL_Z_INDEX = 3000;

const mobileSheetContainerStyle: CSSProperties = {
  minWidth: '100%',
  maxWidth: '100%',
  borderRadius: `${radius.sheet}px ${radius.sheet}px 0 0`,
  ...styles.shadowSheet,
};

const SHEET_EXIT_MS = 180;

const sheetSlideIn = keyframes({
  from: { transform: 'translateY(100%)' },
  to: { transform: 'translateY(0)' },
});

const sheetSlideOut = keyframes({
  to: { transform: 'translateY(100%)' },
});

const overlayFadeIn = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const overlayFadeOut = keyframes({ from: { opacity: 1 }, to: { opacity: 0 } });

const mobileSheetModalClassName = css({
  '&[data-entering]': {
    animation: `${sheetSlideIn} 240ms cubic-bezier(0.22, 1, 0.36, 1)`,
  },
  '&[data-exiting]': {
    animation: `${sheetSlideOut} ${SHEET_EXIT_MS}ms ease-in forwards`,
  },
});

const mobileSheetOverlayClassName = css({
  '&[data-entering]': { animation: `${overlayFadeIn} 180ms ease-out` },
  '&[data-exiting]': {
    animation: `${overlayFadeOut} ${SHEET_EXIT_MS}ms ease-in forwards`,
  },
});

// Desktop dialogs use a double bezel: a recessed tray (the container)
// holds the title row and a white card that carries the content. The
// corners are concentric: shell radius = card radius + bezel inset.
const TRAY_BORDER_WIDTH = 1;
const BEZEL_PADDING = radius.sheet - radius.lg - TRAY_BORDER_WIDTH;
const CARD_PADDING = 22;
const MODAL_HEADER_HEIGHT = 48;
const CLOSE_BUTTON_PADDING = 9;

const bezelContainerStyle: CSSProperties = {
  padding: BEZEL_PADDING,
  borderRadius: radius.sheet,
  border: `${TRAY_BORDER_WIDTH}px solid ${theme.trayBorder}`,
  backgroundColor: theme.trayBackground,
  boxShadow: elevation.modal,
};

const narrowContainerStyle: CSSProperties = {
  padding: 10,
  borderRadius: radius.lg,
  border: '1px solid ' + theme.modalBorder,
  backgroundColor: theme.modalBackground,
  boxShadow: elevation.modal,
};

// The card is painted by a pseudo-element so modals keep composing
// ModalHeader + content as siblings: when the header leads, the card
// starts below it and the header sits on the tray; otherwise the card
// fills the whole bezel.
const modalCardClassName = css({
  isolation: 'isolate',
  padding: CARD_PADDING,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    pointerEvents: 'none',
    backgroundColor: theme.modalBackground,
    border: '1px solid ' + theme.hairline,
    borderRadius: radius.lg,
    boxShadow: elevation.xs,
  },
  '&:has(> [data-modal-header]:first-child)': {
    paddingTop: 0,
    '&::before': { top: MODAL_HEADER_HEIGHT },
  },
  // The title starts on the card's content edge and the close glyph ends
  // on it, so the tray row and the card share one column.
  '& > [data-modal-header]:first-child': {
    margin: `0 -${CARD_PADDING}px ${CARD_PADDING}px`,
    padding: `0 ${CARD_PADDING - CLOSE_BUTTON_PADDING}px 0 ${CARD_PADDING}px`,
  },
});

const mobileSheetHandleStyle: CSSProperties = {
  width: 36,
  height: 4,
  borderRadius: radius.pill,
  backgroundColor: theme.pageTextSubdued,
  alignSelf: 'center',
  marginTop: spacing.sm,
  marginBottom: spacing.sm,
  flexShrink: 0,
};

type ModalProps = ComponentPropsWithRef<typeof ReactAriaModal> & {
  presentation?: 'dialog' | 'sheet';
  ariaLabelledBy?: string;
  name: string;
  isLoading?: boolean;
  noAnimation?: boolean;
  style?: CSSProperties;
  onClose?: () => void;
  wrapperProps?: {
    style?: CSSProperties;
  };
  containerProps?: {
    style?: CSSProperties;
  };
};

export const Modal = ({
  name,
  isLoading = false,
  noAnimation = false,
  style,
  children,
  onClose,
  wrapperProps,
  containerProps,
  presentation = 'dialog',
  ariaLabelledBy,
  ...props
}: ModalProps) => {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  const isSheet = presentation === 'sheet' && isNarrowWidth;
  const { enableScope, disableScope } = useHotkeysContext();

  // This deactivates any key handlers in the "app" scope
  useEffect(() => {
    enableScope(name);
    return () => disableScope(name);
  }, [enableScope, disableScope, name]);

  const { isHidden, isActive, onClose: closeModal } = useModalState();
  const dispatch = useDispatch();
  const prefersReducedMotion = useReducedMotion();
  const isAnimatedSheet = isSheet && !prefersReducedMotion;
  const [isOpen, setIsOpen] = useState(true);
  const isClosingRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleOnClose = () => {
    if (isClosingRef.current) {
      return;
    }
    isClosingRef.current = true;
    const finishClose = () => {
      if (isSheet) {
        dispatch(collapseModals({ rootModalName: name }));
      } else {
        closeModal();
      }
      onClose?.();
    };
    if (isAnimatedSheet) {
      closeTimerRef.current = setTimeout(finishClose, SHEET_EXIT_MS);
      return;
    }
    finishClose();
  };

  const sheetRef = useSwipeToDismiss({
    isEnabled: isSheet,
    onDismiss: () => {
      setIsOpen(false);
      handleOnClose();
    },
  });

  return (
    <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
      <ReactAriaModalOverlay
        data-testid={`${name}-modal`}
        className={isAnimatedSheet ? mobileSheetOverlayClassName : undefined}
        isDismissable
        isOpen={isOpen}
        onOpenChange={nextIsOpen => {
          setIsOpen(nextIsOpen);
          if (!nextIsOpen) {
            handleOnClose();
          }
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: MODAL_Z_INDEX,
          fontSize: 13,
          backgroundColor: theme.overlayBackground,
          // on mobile, we disable the blurred background for performance reasons
          ...(!isNarrowWidth && { backdropFilter: 'blur(2px)' }),
          ...style,
        }}
        {...props}
      >
        {/* A container for positioning the modal relative to the visual viewport */}
        <View
          style={{
            display: 'flex',
            ...(isSheet
              ? { alignItems: 'stretch', justifyContent: 'flex-end' }
              : { alignItems: 'center', justifyContent: 'center' }),
            height: 'var(--visual-viewport-height)',
            overflowY: 'auto',
            ...wrapperProps?.style,
          }}
        >
          <ReactAriaModal
            ref={sheetRef}
            className={isAnimatedSheet ? mobileSheetModalClassName : undefined}
          >
            {modalProps => (
              <Dialog
                aria-label={ariaLabelledBy ? undefined : t('Modal dialog')}
                aria-labelledby={ariaLabelledBy}
                className={css(styles.lightScrollbar)}
                style={{
                  outline: 'none', // remove focus outline
                }}
              >
                <ModalContentContainer
                  noAnimation={noAnimation || isSheet}
                  isActive={isActive(name)}
                  {...containerProps}
                  style={{
                    flex: 1,
                    willChange: isSheet ? undefined : 'opacity, transform',
                    maxWidth: '90vw',
                    minWidth: '90vw',
                    maxHeight: 'calc(var(--visual-viewport-height) * 0.9)',
                    minHeight: 0,
                    color: theme.pageText,
                    opacity: isHidden ? 0 : 1,
                    [`@media (min-width: ${tokens.breakpoint_small})`]: {
                      minWidth: tokens.breakpoint_small,
                    },
                    overflowY: 'auto',
                    ...(isNarrowWidth
                      ? narrowContainerStyle
                      : bezelContainerStyle),
                    ...(isSheet && mobileSheetContainerStyle),
                    ...containerProps?.style,
                  }}
                >
                  {isSheet && <View style={mobileSheetHandleStyle} />}
                  <View
                    className={isNarrowWidth ? undefined : modalCardClassName}
                    style={{ flex: 1, flexShrink: 0 }}
                  >
                    <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
                      {typeof children === 'function'
                        ? children(modalProps)
                        : children}
                    </ErrorBoundary>
                  </View>
                  {isLoading && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 'inherit',
                        backgroundColor: theme.modalBackground,
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                      }}
                    >
                      <AnimatedLoading
                        style={{ width: 20, height: 20 }}
                        color={theme.pageText}
                      />
                    </View>
                  )}
                </ModalContentContainer>
              </Dialog>
            )}
          </ReactAriaModal>
        </View>
      </ReactAriaModalOverlay>
    </ErrorBoundary>
  );
};

type ModalContentContainerProps = {
  style?: CSSProperties;
  noAnimation?: boolean;
  isActive?: boolean;
  children: ReactNode;
};

const contentTransition = `opacity ${motion.base} ${motion.ease}, transform ${motion.base} ${motion.ease}`;

const ModalContentContainer = ({
  style,
  noAnimation,
  isActive,
  children,
}: ModalContentContainerProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useLayoutEffect(() => {
    if (!contentRef.current) {
      return;
    }

    function setProps() {
      if (!contentRef.current) {
        return;
      }

      if (isActive) {
        contentRef.current.style.transform = 'none';
        contentRef.current.style.willChange = 'auto';
        contentRef.current.style.pointerEvents = 'auto';
      } else {
        // A modal stacked under another one recedes slightly.
        contentRef.current.style.transform = 'translateY(-16px) scale(.97)';
        contentRef.current.style.pointerEvents = 'none';
      }
    }

    if (!mounted.current) {
      if (noAnimation) {
        contentRef.current.style.opacity = '1';
        contentRef.current.style.transform = 'none';

        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.style.transition = contentTransition;
          }
        }, 0);
      } else {
        contentRef.current.style.opacity = '0';
        contentRef.current.style.transform = 'none';

        setTimeout(() => {
          if (contentRef.current) {
            mounted.current = true;
            contentRef.current.style.transition = contentTransition;
            contentRef.current.style.opacity = '1';
            setProps();
          }
        }, 0);
      }
    } else {
      setProps();
    }
  }, [noAnimation, isActive]);

  return (
    <View
      innerRef={contentRef}
      style={{
        ...style,
        ...(noAnimation && !isActive && { display: 'none' }),
      }}
    >
      {children}
    </View>
  );
};

type ModalButtonsProps = {
  style?: CSSProperties;
  leftContent?: ReactNode;
  focusButton?: boolean;
  children: ReactNode;
};

export const ModalButtons = ({
  style,
  leftContent,
  focusButton = false,
  children,
}: ModalButtonsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusButton && containerRef.current) {
      const button = containerRef.current.querySelector<HTMLButtonElement>(
        'button:not([data-hidden])',
      );

      if (button) {
        button.focus();
      }
    }
  }, [focusButton]);

  return (
    <View
      innerRef={containerRef}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        ...style,
      }}
    >
      {leftContent}
      <View style={{ flex: 1 }} />
      {children}
    </View>
  );
};

type ModalHeaderProps = {
  leftContent?: ReactNode;
  showLogo?: boolean;
  title?: ReactNode;
  rightContent?: ReactNode;
};

const headerBaseStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  flex: 'none',
  margin: 0,
  padding: 0,
};

// Desktop: the title row of the tray, title set flush left with the
// close control on the right. Narrow: the centered sheet header.
const desktopHeaderClassName = css({
  ...headerBaseStyle,
  height: MODAL_HEADER_HEIGHT,
  gap: spacing.sm,
});

const narrowHeaderClassName = css({
  ...headerBaseStyle,
  justifyContent: 'center',
  height: 60,
});

export function ModalHeader({
  leftContent,
  showLogo,
  title,
  rightContent,
}: ModalHeaderProps) {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();

  const logo = showLogo && (
    <SvgLogo
      aria-label={t('Modal logo')}
      width={isNarrowWidth ? 30 : 22}
      height={isNarrowWidth ? 30 : 22}
      style={{ justifyContent: 'center', alignSelf: 'center', flexShrink: 0 }}
    />
  );
  const titleContent =
    title &&
    (typeof title === 'string' || typeof title === 'number' ? (
      <ModalTitle title={`${title}`} />
    ) : (
      title
    ));

  if (!isNarrowWidth) {
    return (
      <h1 data-modal-header className={desktopHeaderClassName}>
        {leftContent && <View style={{ flexShrink: 0 }}>{leftContent}</View>}
        <View
          style={{
            flex: 1,
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
          }}
        >
          {logo}
          {titleContent && (
            <View style={{ flex: 1, minWidth: 0 }}>{titleContent}</View>
          )}
        </View>
        {rightContent && <View style={{ flexShrink: 0 }}>{rightContent}</View>}
      </h1>
    );
  }

  return (
    <h1 data-modal-header className={narrowHeaderClassName}>
      <View
        style={{
          position: 'absolute',
          left: 0,
        }}
      >
        {leftContent}
      </View>

      {(title || showLogo) && (
        <View
          style={{
            textAlign: 'center',
            // We need to force a width for the text-overflow
            // ellipses to work because we are aligning center.
            width: 'calc(100% - 60px)',
          }}
        >
          {logo}
          {titleContent}
        </View>
      )}

      {rightContent && (
        <View
          style={{
            position: 'absolute',
            right: 0,
          }}
        >
          {rightContent}
        </View>
      )}
    </h1>
  );
}

type ModalTitleProps = {
  title: string;
  isEditable?: boolean;
  getStyle?: (isEditing: boolean) => CSSProperties;
  onEdit?: (isEditing: boolean) => void;
  onTitleUpdate?: (newName: string) => void;
  shrinkOnOverflow?: boolean;
};

const TITLE_FONT_SIZE = 22;
const NARROW_TITLE_FONT_SIZE = 20;
const MIN_TITLE_FONT_SIZE = 15;

export function ModalTitle({
  title,
  isEditable,
  getStyle,
  onTitleUpdate,
  shrinkOnOverflow = false,
}: ModalTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { isNarrowWidth } = useResponsive();

  const onTitleClick = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };

  const _onTitleUpdate = (newTitle: string) => {
    if (newTitle !== title) {
      onTitleUpdate?.(newTitle);
    }
    setIsEditing(false);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditing) {
      if (inputRef.current) {
        inputRef.current.scrollLeft = 0;
      }
    }
  }, [isEditing]);

  const style = getStyle?.(isEditing);
  const fontSize = isNarrowWidth ? NARROW_TITLE_FONT_SIZE : TITLE_FONT_SIZE;
  // Modal titles are engraved in the display serif, like page titles.
  const titleStyle: CSSProperties = {
    ...styles.display,
    fontSize,
    lineHeight: `${fontSize + 6}px`,
    color: theme.pageTextDark,
    textAlign: isNarrowWidth ? 'center' : 'left',
  };

  return isEditing ? (
    <Input
      ref={inputRef}
      style={{
        ...titleStyle,
        ...style,
      }}
      defaultValue={title}
      onUpdate={_onTitleUpdate}
      onEnter={(value, e) => {
        e.preventDefault();
        _onTitleUpdate?.(value);
      }}
    />
  ) : (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: isNarrowWidth ? 'center' : 'flex-start',
        alignItems: 'center',
      }}
    >
      {shrinkOnOverflow ? (
        <AutoTextSize
          as={Text}
          minFontSizePx={MIN_TITLE_FONT_SIZE}
          maxFontSizePx={fontSize}
          onClick={onTitleClick}
          style={{
            ...titleStyle,
            ...(isEditable && styles.underlinedText),
            ...style,
          }}
        >
          {title}
        </AutoTextSize>
      ) : (
        <TextOneLine
          onClick={onTitleClick}
          style={{
            ...titleStyle,
            ...(isEditable && styles.underlinedText),
            ...style,
          }}
        >
          {title}
        </TextOneLine>
      )}
    </View>
  );
}

type ModalCloseButtonProps = {
  onPress: ComponentPropsWithoutRef<typeof Button>['onPress'];
  style?: CSSProperties;
};

export function ModalCloseButton({ onPress, style }: ModalCloseButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      variant="bare"
      onPress={onPress}
      style={{ padding: CLOSE_BUTTON_PADDING, color: theme.pageTextLight }}
      aria-label={t('Close')}
    >
      <SvgDelete width={10} style={style} />
    </Button>
  );
}
