import React from 'react';
import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgFilter } from '@actual-app/components/icons/v1';

export function FiltersButton({ onPress }: { onPress: () => void }) {
  return (
    <Button variant="normal" onPress={onPress} style={{ gap: 7 }}>
      <SvgFilter style={{ width: 11, height: 11, flexShrink: 0 }} />
      <Trans>Filter</Trans>
    </Button>
  );
}
