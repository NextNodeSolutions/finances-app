import { Dialog, DialogTrigger } from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDownloadThickBottom } from '@actual-app/components/icons/v2';
import { Menu } from '@actual-app/components/menu';
import { Popover } from '@actual-app/components/popover';
import type { AccountEntity } from '@actual-app/core/types/models';

import { headerLabelIconStyle } from './headerStyles';
import { useImportTransactionsFlow } from './useImportTransactionsFlow';

type ImportAccountPickerProps = {
  /** The open accounts the register shows. */
  accounts: AccountEntity[];
  onImported: () => void;
};

/**
 * `Import` on a multi-account register: the account comes first, then the
 * file and the import modal.
 */
export function ImportAccountPicker({
  accounts,
  onImported,
}: ImportAccountPickerProps) {
  const { t } = useTranslation();
  const importTransactions = useImportTransactionsFlow();

  return (
    <DialogTrigger>
      <Button style={{ gap: 7 }}>
        <SvgDownloadThickBottom style={headerLabelIconStyle} />
        <Trans>Import</Trans>
      </Button>
      <Popover style={{ minWidth: 220 }}>
        <Dialog aria-label={t('Choose account')}>
          <Menu
            slot="close"
            onMenuSelect={accountId =>
              void importTransactions(accountId, onImported)
            }
            items={[
              { type: Menu.label, name: t('Choose account'), text: '' },
              ...accounts.map(account => ({
                name: account.id,
                text: account.name,
              })),
            ]}
          />
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
