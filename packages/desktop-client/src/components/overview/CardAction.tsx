import type { ReactNode } from 'react';

import { Button } from '@actual-app/components/button';
import { SvgCheveronRight } from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';

type CardActionProps = {
  onPress: () => void;
  children: ReactNode;
};

/**
 * The quiet "go there" control in a card's title row. A button rather than
 * a link, so its name never collides with the sidebar's navigation links.
 */
export function CardAction({ onPress, children }: CardActionProps) {
  return (
    <Button
      variant="bare"
      onPress={onPress}
      style={{
        gap: spacing.xxs,
        padding: '5px 6px 5px 10px',
        fontSize: 12.5,
        fontWeight: 500,
        color: theme.pageTextLink,
      }}
    >
      {children}
      <SvgCheveronRight aria-hidden width={12} height={12} />
    </Button>
  );
}
