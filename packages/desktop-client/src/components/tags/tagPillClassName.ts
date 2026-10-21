import { radius } from '@actual-app/components/tokens';
import { css } from '@emotion/css';

// The tag shape the ledger uses: a tinted chip that sits in a 32px row like
// the status pills. Merge it after `useTagCSS`, which keeps the tag's colour.
export const tagPillClassName = css({
  borderRadius: radius.sm,
  padding: '1px 7px',
  fontSize: 11.5,
  fontWeight: 500,
  lineHeight: '16px',
});
