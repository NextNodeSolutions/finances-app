import { useTranslation } from 'react-i18next';

import type { AccountEntity } from '@actual-app/core/types/models';

import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

const IMPORT_EXTENSIONS = ['qif', 'ofx', 'qfx', 'csv', 'tsv', 'xml'];

type ImportTransactionsFlow = (
  accountId: AccountEntity['id'],
  onImported: () => void,
) => Promise<void>;

/**
 * Asks for a bank file, then opens the import modal for `accountId`.
 * `onImported` runs once the import changed something.
 */
export function useImportTransactionsFlow(): ImportTransactionsFlow {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return async (accountId, onImported) => {
    const files = await window.Actual.openFileDialog({
      filters: [{ name: t('Financial files'), extensions: IMPORT_EXTENSIONS }],
    });
    const [filename] = files ?? [];
    if (!filename) {
      return;
    }

    dispatch(
      pushModal({
        modal: {
          name: 'import-transactions',
          options: {
            accountId,
            filename,
            onImported: (didChange: boolean) => {
              if (didChange) {
                onImported();
              }
            },
          },
        },
      }),
    );
  };
}
