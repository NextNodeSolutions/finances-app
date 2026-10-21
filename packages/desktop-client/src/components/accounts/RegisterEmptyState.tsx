import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { RegisterSkeleton } from './RegisterSkeleton';

type RegisterEmptyStateProps = {
  isLoading: boolean;
  /** True when a search or a filter hides every row. */
  isFiltered: boolean;
  hasFilterConditions: boolean;
  /** Omitted where transactions cannot be added (a closed account). */
  onAddTransaction?: () => void;
  /** Omitted where the register cannot import (several accounts). */
  onImport?: () => void;
  onClearFilters: () => void;
};

/** What an empty register shows: a skeleton, a cleared filter, or a start. */
export function RegisterEmptyState({
  isLoading,
  isFiltered,
  hasFilterConditions,
  onAddTransaction,
  onImport,
  onClearFilters,
}: RegisterEmptyStateProps) {
  if (isLoading) {
    return <RegisterSkeleton />;
  }

  return (
    <View
      style={{
        alignItems: 'center',
        gap: spacing.md,
        marginTop: 28,
        paddingInline: spacing.lg,
        color: theme.tableTextLight,
        textAlign: 'center',
      }}
    >
      {isFiltered ? (
        <>
          <Text>
            <Trans>No transactions match these filters.</Trans>
          </Text>
          {hasFilterConditions && (
            <Button onPress={onClearFilters}>
              <Trans>Clear filters</Trans>
            </Button>
          )}
        </>
      ) : (
        <>
          <Text>
            <Trans>
              No transactions yet. Add one, or import a file from your bank.
            </Trans>
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {onAddTransaction && (
              <Button variant="primary" onPress={onAddTransaction}>
                <Trans>Add transaction</Trans>
              </Button>
            )}
            {onImport && (
              <Button onPress={onImport}>
                <Trans>Import</Trans>
              </Button>
            )}
          </View>
        </>
      )}
    </View>
  );
}
