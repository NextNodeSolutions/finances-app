import { Dialog, DialogTrigger } from 'react-aria-components';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDotsHorizontalTriple } from '@actual-app/components/icons/v1';
import { Menu } from '@actual-app/components/menu';
import { Popover } from '@actual-app/components/popover';
import { theme } from '@actual-app/components/theme';
import { send } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';

import { useLocale } from '#hooks/useLocale';
import { useNavigate } from '#hooks/useNavigate';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { getMonthNoteId } from './getMonthNoteId';
import { statementMenuCellClass } from './statementCellStyles';

type StatementMenuAction = 'open-overview' | 'edit-note';

type StatementRowMenuProps = {
  month: string;
};

/** The row's ⋯ menu: the Overview as of that month, and the month's note. */
export function StatementRowMenu({ month }: StatementRowMenuProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const monthName = monthUtils.format(month, 'MMMM yyyy', locale);

  const onMenuSelect = (action: StatementMenuAction) => {
    if (action === 'open-overview') {
      void navigate(`/overview?asof=${month}`);
      return;
    }
    dispatch(
      pushModal({
        modal: {
          name: 'notes',
          options: {
            id: getMonthNoteId(month),
            name: monthName,
            onSave: (id, contents) =>
              void send('notes-save', { id, note: contents }),
          },
        },
      }),
    );
  };

  return (
    // The menu is portalled but still bubbles through React, so its clicks
    // must not reach the row, which opens the budget.
    <td
      className={statementMenuCellClass}
      onClick={event => event.stopPropagation()}
    >
      <DialogTrigger>
        <Button
          variant="bare"
          aria-label={t('Actions for {{month}}', { month: monthName })}
          style={{ padding: 6 }}
        >
          <SvgDotsHorizontalTriple
            width={14}
            height={14}
            style={{
              transform: 'rotateZ(90deg)',
              color: theme.pageTextSubdued,
            }}
          />
        </Button>
        <Popover placement="bottom end">
          <Dialog>
            <Menu<StatementMenuAction>
              slot="close"
              onMenuSelect={onMenuSelect}
              items={[
                {
                  name: 'open-overview',
                  text: t('Open Overview as of {{month}}', {
                    month: monthName,
                  }),
                },
                { name: 'edit-note', text: t('Edit note') },
              ]}
            />
          </Dialog>
        </Popover>
      </DialogTrigger>
    </td>
  );
}
