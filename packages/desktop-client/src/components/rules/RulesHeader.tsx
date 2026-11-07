import React from 'react';
import { useTranslation } from 'react-i18next';

import { Cell, Field, SelectCell, TableHeader } from '#components/table';
import { useSelectedDispatch, useSelectedItems } from '#hooks/useSelected';

import {
  ARROW_COLUMN_WIDTH,
  EDIT_COLUMN_WIDTH,
  STAGE_COLUMN_WIDTH,
} from './ruleTableColumns';

export function RulesHeader() {
  const { t } = useTranslation();
  const selectedItems = useSelectedItems();
  const dispatchSelected = useSelectedDispatch();

  return (
    <TableHeader style={{}}>
      <SelectCell
        exposed
        focused={false}
        selected={selectedItems.size > 0}
        onSelect={e =>
          dispatchSelected({ type: 'select-all', isRangeSelect: e.shiftKey })
        }
      />
      <Cell
        value={t('Stage')}
        width={STAGE_COLUMN_WIDTH}
        valueStyle={{ paddingLeft: 10 }}
      />
      <Cell value={t('If')} width="flex" />
      <Field width={ARROW_COLUMN_WIDTH} />
      <Cell value={t('Then')} width="flex" />
      <Field width={EDIT_COLUMN_WIDTH} />
    </TableHeader>
  );
}
