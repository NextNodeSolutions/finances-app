import { Fragment } from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';

import { PanelFocusRequestProvider, useOpenPanel } from './PanelProvider';

/**
 * Renders the open side panel. It sits beside the page's scroll view in the
 * app shell, so opening a panel narrows the page instead of covering it.
 * Narrow screens never show panels: openers fall back to mobile pages.
 */
export function PanelHost() {
  const { isNarrowWidth } = useResponsive();
  const panel = useOpenPanel();

  if (isNarrowWidth || panel === null) {
    return null;
  }

  return (
    <PanelFocusRequestProvider value={panel.focusRequest}>
      <Fragment key={panel.key}>{panel.element}</Fragment>
    </PanelFocusRequestProvider>
  );
}
