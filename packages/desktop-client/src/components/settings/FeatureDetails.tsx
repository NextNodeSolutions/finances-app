import type { ReactNode } from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';

type FeatureDetailsProps = {
  note?: ReactNode;
  error?: ReactNode;
};

/** The warning note and the blocking error under a feature toggle. */
export function FeatureDetails({ note, error }: FeatureDetailsProps) {
  return (
    <>
      {error && (
        <Text style={{ color: theme.errorText, fontWeight: 500 }}>
          {error}{' '}
        </Text>
      )}
      {note && <Text style={{ color: theme.warningText }}>{note}</Text>}
    </>
  );
}
