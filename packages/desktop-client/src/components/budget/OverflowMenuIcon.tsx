import React from 'react';

import { SvgDotsHorizontalTriple } from '@actual-app/components/icons/v1';

// The v1 glyph is drawn upright; turned a quarter it becomes the
// horizontal ellipsis the rest of the app uses for overflow menus.
export function OverflowMenuIcon() {
  return (
    <SvgDotsHorizontalTriple
      width={14}
      height={14}
      style={{ transform: 'rotate(90deg)' }}
    />
  );
}
