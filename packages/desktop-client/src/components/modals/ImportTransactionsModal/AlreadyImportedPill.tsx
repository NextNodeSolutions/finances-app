import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';

// Fits the pill plus the cell's inset, so the status column never truncates it.
export const ALREADY_IMPORTED_COLUMN_WIDTH = 124;

/** Marks a preview row that matches a transaction already in the account. */
export function AlreadyImportedPill() {
  return (
    <Text
      style={{
        flexShrink: 0,
        padding: '2px 8px',
        borderRadius: radius.sm,
        backgroundColor: theme.pillBackground,
        color: theme.pillText,
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: '16px',
        whiteSpace: 'nowrap',
      }}
    >
      <Trans>Already imported</Trans>
    </Text>
  );
}
