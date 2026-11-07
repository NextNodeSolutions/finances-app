import { Button } from 'react-aria-components';

import { SvgMenu } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { css } from '@emotion/css';

export function DragHandle() {
  return (
    <Button
      slot="drag"
      className={css({
        ...styles.visuallyHidden,
        '&[data-focus-visible]': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          margin: 0,
          overflow: 'visible',
          clip: 'auto',
          display: 'flex',
          alignItems: 'center',
          border: 'none',
          background: 'none',
          color: theme.sidebarTextMuted,
          borderRadius: radius.sm,
          outline: `2px solid ${theme.focusRing}`,
          outlineOffset: 1,
        },
      })}
    >
      <SvgMenu style={{ width: 10, height: 10 }} />
    </Button>
  );
}
