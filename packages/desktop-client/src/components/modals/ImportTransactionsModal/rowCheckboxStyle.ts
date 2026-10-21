import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';

import type { ImportTransaction } from './utils';

// The preview checkbox carries three glyphs instead of a check: plus
// (import), minus (skip) and layers (merge into the matched transaction).
// They are drawn as masks, like the base checkbox's check, so they take the
// theme's checkbox colours.
function glyphMask(svgPaths: string, viewBox: string): string {
  return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${svgPaths}</svg>') center / contain no-repeat`;
}

// Adapted from packages/desktop-client/src/icons/v1/add.svg
const MINUS_PATH =
  '<path d="M23,11.5 C23,12.3284271 22.3284271,13 21.5,13 L1.5,13 C0.671572875,13 0,12.3284271 0,11.5 C0,10.6715729 0.671572875,10 1.5,10 L21.5,10 C22.3284271,10 23,10.6715729 23,11.5 Z"/>';
const PLUS_VERTICAL_PATH =
  '<path d="M11.5,23 C10.6715729,23 10,22.3284271 10,21.5 L10,1.5 C10,0.671572875 10.6715729,0 11.5,0 C12.3284271,0 13,0.671572875 13,1.5 L13,21.5 C13,22.3284271 12.3284271,23 11.5,23 Z"/>';
// From packages/desktop-client/src/icons/v1/layer.svg
const LAYERS_PATH =
  '<path d="M10 1l10 6-10 6L0 7l10-6zm6.67 10L20 13l-10 6-10-6 3.33-2L10 15l6.67-4z"/>';

const minusMask = glyphMask(MINUS_PATH, '0 0 24 24');
const plusMask = glyphMask(MINUS_PATH + PLUS_VERTICAL_PATH, '0 0 24 24');
const layersMask = glyphMask(LAYERS_PATH, '0 0 20 20');

const GLYPH_SIZE = 9;
const TOMBSTONE_OPACITY = 0.3;

const mergeStyle: CSSProperties = {
  ':checked': {
    '::after': { mask: layersMask, WebkitMask: layersMask },
  },
};

const tombstoneStyle: CSSProperties = {
  opacity: TOMBSTONE_OPACITY,
  backgroundColor: theme.buttonNormalDisabledBorder,
};

const importOrSkipStyle: CSSProperties = {
  '::after': {
    content: '" "',
    display: 'block',
    width: GLYPH_SIZE,
    height: GLYPH_SIZE,
    backgroundColor: theme.pageTextSubdued,
    mask: minusMask,
    WebkitMask: minusMask,
  },
  ':checked': {
    '::after': {
      backgroundColor: theme.checkboxText,
      mask: plusMask,
      WebkitMask: plusMask,
    },
  },
};

export function getRowCheckboxStyle(
  transaction: Pick<ImportTransaction, 'selected_merge'> & {
    tombstone?: ImportTransaction[string];
  },
): CSSProperties {
  if (transaction.selected_merge) {
    return mergeStyle;
  }
  if (transaction.tombstone) {
    return tombstoneStyle;
  }
  return importOrSkipStyle;
}
