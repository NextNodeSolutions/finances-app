import {
  createContext,
  createElement,
  useContext,
  useRef,
  useState,
} from 'react';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import { useLocation } from 'react-router';

/**
 * What to show in the side panel. `key` names the panel (e.g. `category`,
 * `payee`); opening the key that is already open replaces its content and
 * brings it forward instead of stacking a second panel.
 */
export type PanelDescriptor<Props extends object> =
  | { key: string; Component: ComponentType<Props>; props: Props }
  | { key: string; element: ReactElement };

type OpenPanel = {
  key: string;
  element: ReactElement;
  /** The page the panel belongs to; it closes when the route changes. */
  pathname: string;
  /** Bumped on every open so the panel can pull focus to its title. */
  focusRequest: number;
};

type PanelsContextValue = {
  current: { key: string } | null;
  open: <Props extends object>(descriptor: PanelDescriptor<Props>) => void;
  close: () => void;
};

/** Matches a side panel's root (`data-side-panel`), to tell focus is inside. */
export const SIDE_PANEL_SELECTOR = '[data-side-panel]';

const PanelsContext = createContext<PanelsContextValue | null>(null);
const OpenPanelContext = createContext<OpenPanel | null>(null);
const PanelFocusRequestContext = createContext<number | null>(null);

/**
 * Owns the one non-modal side panel of the desktop app. Opening replaces
 * any open panel; closing restores focus to whatever opened it.
 */
export function PanelProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [panel, setPanel] = useState<OpenPanel | null>(null);
  // Where focus goes back to on close. A ref, not state, so a `close`
  // captured when the panel was opened still restores focus.
  const openerRef = useRef<HTMLElement | null>(null);

  // A panel belongs to the page it was opened on.
  if (panel !== null && panel.pathname !== pathname) {
    setPanel(null);
  }

  const open = <Props extends object>(descriptor: PanelDescriptor<Props>) => {
    const element =
      'element' in descriptor
        ? descriptor.element
        : createElement(descriptor.Component, descriptor.props);
    const activeElement = document.activeElement;
    // Opening from inside a panel keeps the original opener.
    if (
      activeElement instanceof HTMLElement &&
      activeElement.closest(SIDE_PANEL_SELECTOR) === null
    ) {
      openerRef.current = activeElement;
    }

    setPanel(previous => ({
      key: descriptor.key,
      element,
      pathname,
      focusRequest: (previous?.focusRequest ?? 0) + 1,
    }));
  };

  const close = () => {
    const opener = openerRef.current;
    openerRef.current = null;
    setPanel(null);
    if (opener?.isConnected) {
      opener.focus();
    }
  };

  return (
    <PanelsContext.Provider
      value={{
        current: panel === null ? null : { key: panel.key },
        open,
        close,
      }}
    >
      <OpenPanelContext.Provider value={panel}>
        {children}
      </OpenPanelContext.Provider>
    </PanelsContext.Provider>
  );
}

/** Open, close or inspect the side panel from anywhere under the provider. */
export function usePanels(): PanelsContextValue {
  const context = useContext(PanelsContext);
  if (context === null) {
    throw new Error('usePanels must be used inside <PanelProvider>.');
  }
  return context;
}

/** The open panel, for `PanelHost` to render. */
export function useOpenPanel(): OpenPanel | null {
  return useContext(OpenPanelContext);
}

/**
 * Changes every time the surrounding panel is (re)opened; null outside a
 * panel host. `SidePanel` moves focus to its title when it changes.
 */
export function usePanelFocusRequest(): number | null {
  return useContext(PanelFocusRequestContext);
}

export const PanelFocusRequestProvider = PanelFocusRequestContext.Provider;
