import React, { createContext, useContext, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing, tokens } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

const HEADER_HEIGHT = 50;
// The mobile header sits at the top edge of the viewport (viewport-fit=cover),
// so it grows by the top safe-area inset and keeps its content below it.
const SAFE_AREA_TOP = 'env(safe-area-inset-top)';
const MOBILE_HEADER_HEIGHT_WITH_INSET = `calc(${HEADER_HEIGHT}px + ${SAFE_AREA_TOP})`;

// Desktop page frame: the side gutter shared by the title and the content,
// and the calm space between the titlebar hairline and the page title.
const PAGE_GUTTER = 20;
const PAGE_TOP_SPACE = 28;
const PAGE_TITLE_GAP = 20;
const NARROW_PAGE_GUTTER = 10;

type PageHeaderProps = {
  /** Page title, set in the display serif. */
  title: ReactNode;
  /** The page's one headline figure, under the title. */
  headline?: ReactNode;
  /** Instrument strip under the headline: mono labels and figures. */
  meta?: ReactNode;
  /** Buttons aligned to the right of the title. */
  actions?: ReactNode;
  /** Above the title, e.g. a back crumb. */
  leading?: ReactNode;
  style?: CSSProperties;
};

export function PageHeader({
  title,
  headline,
  meta,
  actions,
  leading,
  style,
}: PageHeaderProps) {
  return (
    <View
      style={{
        gap: spacing.sm,
        marginLeft: PAGE_GUTTER,
        marginRight: PAGE_GUTTER,
        marginBottom: PAGE_TITLE_GAP,
        ...style,
      }}
    >
      {leading && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {leading}
        </View>
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: spacing.md,
          minHeight: 34,
        }}
      >
        <View
          style={{
            ...styles.display,
            flexDirection: 'row',
            alignItems: 'center',
            minWidth: 0,
            fontSize: 28,
            lineHeight: '34px',
            color: theme.pageText,
          }}
        >
          {typeof title === 'string' ? <Text>{title}</Text> : title}
        </View>
        {actions && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              marginLeft: 'auto',
              flexShrink: 0,
            }}
          >
            {actions}
          </View>
        )}
      </View>
      {headline && <View style={{ flexDirection: 'row' }}>{headline}</View>}
      {meta && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            columnGap: spacing.xl,
            rowGap: spacing.xs,
          }}
        >
          {meta}
        </View>
      )}
    </View>
  );
}

type MobilePageHeaderProps = {
  title: ReactNode;
  style?: CSSProperties;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
};

export function MobilePageHeader({
  title,
  style,
  leftContent,
  rightContent,
}: MobilePageHeaderProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        flexShrink: 0,
        height: MOBILE_HEADER_HEIGHT_WITH_INSET,
        paddingTop: SAFE_AREA_TOP,
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        backgroundColor: theme.mobileHeaderBackground,
        '& *': {
          color: theme.mobileHeaderText,
        },
        '& button[data-pressed]': {
          backgroundColor: theme.mobileHeaderTextHover,
        },
        ...style,
      }}
    >
      <View
        style={{
          flexBasis: '25%',
          justifyContent: 'flex-start',
          flexDirection: 'row',
        }}
      >
        {leftContent}
      </View>
      <h1
        style={{
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          flexBasis: '50%',
          fontSize: 17,
          fontWeight: 500,
          overflowY: 'auto',
          display: 'flex',
          margin: 0,
          padding: 0,
        }}
      >
        {title}
      </h1>
      <View
        style={{
          flexBasis: '25%',
          justifyContent: 'flex-end',
          flexDirection: 'row',
        }}
      >
        {rightContent}
      </View>
    </View>
  );
}

// On mobile the page header element stays mounted while navigating between
// pages so its background doesn't flash while the next page renders. Pages
// render their header into a single persistent `<MobilePageHeaderSlot />`
// (rendered by the app shell) through a portal. Without a provider (e.g. in
// tests or storybook) the header is rendered inline instead.
const MobilePageHeaderSlotContext = createContext<HTMLElement | null>(null);
const MobilePageHeaderSlotRefContext = createContext<
  ((element: HTMLElement | null) => void) | null
>(null);

export function MobilePageHeaderProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  return (
    <MobilePageHeaderSlotRefContext.Provider value={setSlot}>
      <MobilePageHeaderSlotContext.Provider value={slot}>
        {children}
      </MobilePageHeaderSlotContext.Provider>
    </MobilePageHeaderSlotRefContext.Provider>
  );
}

type MobilePageHeaderSlotProps = {
  style?: CSSProperties;
};

export function MobilePageHeaderSlot({ style }: MobilePageHeaderSlotProps) {
  const slotRef = useContext(MobilePageHeaderSlotRefContext);
  return (
    <View
      ref={slotRef ?? undefined}
      style={{
        flexShrink: 0,
        minHeight: MOBILE_HEADER_HEIGHT_WITH_INSET,
        backgroundColor: theme.mobileHeaderBackground,
        ...style,
      }}
    />
  );
}

type PageProps = {
  header: ReactNode;
  /** `data-testid` of the page container. */
  testId?: string;
  style?: CSSProperties;
  padding?: number;
  children: ReactNode;
  footer?: ReactNode;
};

export function Page({
  header,
  testId,
  style,
  padding,
  children,
  footer,
}: PageProps) {
  const { isNarrowWidth } = useResponsive();
  const mobileHeaderSlot = useContext(MobilePageHeaderSlotContext);
  const childrenPadding =
    padding ?? (isNarrowWidth ? NARROW_PAGE_GUTTER : PAGE_GUTTER);

  const headerToRender =
    typeof header === 'string' ? (
      isNarrowWidth ? (
        <MobilePageHeader title={header} />
      ) : (
        <PageHeader title={header} />
      )
    ) : (
      header
    );

  const main = (
    <View
      role="main"
      style={{
        flex: 1,
        overflowY: isNarrowWidth ? 'auto' : undefined,
        padding: `0 ${childrenPadding}px`,
      }}
    >
      {children}
    </View>
  );

  if (isNarrowWidth) {
    return (
      <View
        data-testid={testId}
        style={{
          flex: 1,
          backgroundColor: theme.mobilePageBackground,
          ...style,
        }}
      >
        {mobileHeaderSlot
          ? createPortal(headerToRender, mobileHeaderSlot)
          : headerToRender}
        {main}
        {footer}
      </View>
    );
  }

  return (
    <View
      data-testid={testId}
      style={{
        ...styles.page,
        [`@media (min-width: ${tokens.breakpoint_small})`]: {
          paddingTop: PAGE_TOP_SPACE,
        },
        flex: 1,
        backgroundColor: theme.pageBackground,
        ...style,
      }}
    >
      {headerToRender}
      {main}
      {footer}
    </View>
  );
}
