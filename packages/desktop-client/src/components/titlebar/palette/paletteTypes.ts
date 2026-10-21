import type { ComponentType, ReactNode, SVGProps } from 'react';

export type PaletteItem = {
  id: string;
  /** The text to display and to search. */
  name: string;
  /** Richer content shown instead of `name` (a balance, a keycap). */
  content?: ReactNode;
  Icon:
    | ComponentType<SVGProps<SVGElement>>
    | ComponentType<SVGProps<SVGSVGElement>>;
  /** Keeps the palette open once chosen (a step towards a confirmation). */
  keepsOpen?: boolean;
};

export type PaletteSection = {
  key: string;
  /** Omitted for a lone item that speaks for itself. */
  heading?: string;
  items: readonly PaletteItem[];
  onSelect: (id: PaletteItem['id']) => void;
  /** Shown only once the user types, among the search results. */
  isSearchOnly?: boolean;
  /** At most this many matches, so long lists don't bury the rest. */
  limit?: number;
};
