import { useTranslation } from 'react-i18next';

import { SvgSubtract } from '@actual-app/components/icons/v0';
import { View } from '@actual-app/components/view';

import { Cell, Field, SelectCell, TableHeader } from '#components/table';
import { useSelectedDispatch, useSelectedItems } from '#hooks/useSelected';

import {
  DETAILS_COLUMN_WIDTH,
  ICON_COLUMN_WIDTH,
  RULES_COLUMN_WIDTH,
  TRANSACTIONS_COLUMN_WIDTH,
} from './payeeTableColumns';

export function PayeeTableHeader() {
  const { t } = useTranslation();

  const dispatchSelected = useSelectedDispatch();
  const selectedItems = useSelectedItems();

  return (
    <View>
      <TableHeader collapsed>
        <SelectCell
          exposed
          focused={false}
          selected={selectedItems.size > 0}
          icon={<SvgSubtract width={6} height={6} />}
          onSelect={e =>
            dispatchSelected({ type: 'select-all', isRangeSelect: e.shiftKey })
          }
        />
        {/* Matches the rows' favourite/learning icon column. */}
        <Field width={ICON_COLUMN_WIDTH} />
        <Cell value={t('Payee')} width="flex" />
        <Cell
          value={t('Transactions')}
          width={TRANSACTIONS_COLUMN_WIDTH}
          valueStyle={{ justifyContent: 'flex-end', paddingRight: 10 }}
        />
        <Cell
          value={t('Rules')}
          width={RULES_COLUMN_WIDTH}
          valueStyle={{ paddingLeft: 10 }}
        />
        <Field width={DETAILS_COLUMN_WIDTH} />
      </TableHeader>
    </View>
  );
}
