import React from 'react';

import { Button } from '@actual-app/components/button';
import { SvgFilter } from '@actual-app/components/icons/v1';

export function CompactFiltersButton({ onPress }: { onPress: () => void }) {
  return (
    <Button
      variant="bare"
      onPress={onPress}
      style={{ minWidth: 30, height: 30, padding: 0 }}
    >
      <SvgFilter style={{ width: 13, height: 13, flexShrink: 0 }} />
    </Button>
  );
}
