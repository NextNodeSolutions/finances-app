import React from 'react';
import type { ComponentProps } from 'react';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { elevation } from '@actual-app/components/tokens';
import { css } from '@emotion/css';

// A row action repeated down a table (Edit, Link account) rests as quiet text
// and takes its framed look only while its row is hovered or holds focus, so a
// column of identical buttons never outweighs the rows. The row carries the
// `data-quiet-actions` attribute. The frame stays in place, transparent, so
// revealing it shifts nothing; `:where()` keeps the reveal at the Button's own
// specificity so its hover, press and focus styles still win.
const quietRowActionClassName = css({
  minHeight: 30,
  fontSize: 12.5,
  fontWeight: 500,
  color: theme.pageTextLight,
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  boxShadow: 'none',
  '*:where([data-quiet-actions]:hover, [data-quiet-actions]:focus-within) &': {
    color: theme.buttonNormalText,
    backgroundColor: theme.buttonNormalBackground,
    borderColor: theme.buttonNormalBorder,
    boxShadow: elevation.xs,
  },
});

type QuietRowActionButtonProps = Omit<
  ComponentProps<typeof Button>,
  'variant' | 'className'
>;

export function QuietRowActionButton(props: QuietRowActionButtonProps) {
  return (
    <Button {...props} variant="normal" className={quietRowActionClassName} />
  );
}
