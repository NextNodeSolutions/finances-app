import { send } from '@actual-app/core/platform/client/connection';
import type { ScheduleEntity } from '@actual-app/core/types/models';

export type ScheduleItemAction =
  | 'post-transaction'
  | 'post-transaction-today'
  | 'skip'
  | 'complete'
  | 'restart'
  | 'delete';

/** Runs one of the schedule row / panel menu actions. */
export async function runScheduleAction(
  action: ScheduleItemAction,
  id: ScheduleEntity['id'],
): Promise<void> {
  switch (action) {
    case 'post-transaction':
      await send('schedule/post-transaction', { id });
      return;
    case 'post-transaction-today':
      await send('schedule/post-transaction', { id, today: true });
      return;
    case 'skip':
      await send('schedule/skip-next-date', { id });
      return;
    case 'complete':
      await send('schedule/update', { schedule: { id, completed: true } });
      return;
    case 'restart':
      await send('schedule/update', {
        schedule: { id, completed: false },
        resetNextDate: true,
      });
      return;
    case 'delete':
      await send('schedule/delete', { id });
      return;
    default:
      throw new Error(`Unknown schedule action: ${String(action)}`);
  }
}
