import { Dialog, DialogTrigger } from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDotsHorizontalTriple } from '@actual-app/components/icons/v1';
import { Menu } from '@actual-app/components/menu';
import { Popover } from '@actual-app/components/popover';
import { theme } from '@actual-app/components/theme';
import type { ScheduleStatusType } from '@actual-app/core/shared/schedules';

import type { ScheduleItemAction } from './runScheduleAction';

type SchedulePanelActionsProps = {
  status: ScheduleStatusType | undefined;
  onAction: (action: ScheduleItemAction) => void;
  onEdit: () => void;
};

type MenuAction = Extract<
  ScheduleItemAction,
  'complete' | 'restart' | 'delete'
>;

/** The panel's sticky actions: post and skip, edit, and the row menu's rest. */
export function SchedulePanelActions({
  status,
  onAction,
  onEdit,
}: SchedulePanelActionsProps) {
  const { t } = useTranslation();
  const isCompleted = status === 'completed';

  const menuItems: Array<{ name: MenuAction; text: string }> = [
    isCompleted
      ? { name: 'restart', text: t('Restart') }
      : { name: 'complete', text: t('Complete') },
    { name: 'delete', text: t('Delete') },
  ];

  return (
    <>
      <DialogTrigger>
        <Button variant="bare" aria-label={t('More schedule actions')}>
          <SvgDotsHorizontalTriple
            width={14}
            height={14}
            style={{ transform: 'rotateZ(90deg)', color: theme.pageTextLight }}
          />
        </Button>
        <Popover placement="top end">
          <Dialog>
            <Menu<MenuAction>
              slot="close"
              onMenuSelect={onAction}
              items={menuItems}
            />
          </Dialog>
        </Popover>
      </DialogTrigger>
      <Button onPress={onEdit}>
        <Trans>Edit</Trans>
      </Button>
      {!isCompleted && (
        <>
          <Button onPress={() => onAction('skip')}>
            <Trans>Skip next date</Trans>
          </Button>
          <Button
            variant="primary"
            onPress={() => onAction('post-transaction-today')}
          >
            <Trans>Post transaction today</Trans>
          </Button>
        </>
      )}
    </>
  );
}
