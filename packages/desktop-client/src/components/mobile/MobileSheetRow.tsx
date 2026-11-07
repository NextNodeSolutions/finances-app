import type { ReactNode } from 'react';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';

const ROW_MIN_HEIGHT = 48;

type MobileSheetRowProps = {
  label: ReactNode;
  onPress: () => void;
  isDestructive?: boolean;
};

export function MobileSheetRow({
  label,
  onPress,
  isDestructive = false,
}: MobileSheetRowProps) {
  return (
    <Button
      variant="bare"
      onPress={onPress}
      style={{
        ...styles.mediumText,
        fontWeight: 400,
        width: '100%',
        minHeight: ROW_MIN_HEIGHT,
        justifyContent: 'flex-start',
        padding: `${spacing.sm}px ${spacing.lg + 4}px`,
        borderRadius: 0,
        borderTop: `1px solid ${theme.hairlineSubtle}`,
        color: isDestructive ? theme.errorText : theme.pageText,
      }}
    >
      <Text style={{ ...styles.ellipsisText, textAlign: 'left' }}>{label}</Text>
    </Button>
  );
}
