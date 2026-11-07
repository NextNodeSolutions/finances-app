import { useTranslation } from 'react-i18next';

import { addNotification } from '#notifications/notificationsSlice';
import { useDispatch } from '#redux';
import { undo } from '#undo';

const UNDO_TOAST_TIMEOUT_MS = 10000;

/**
 * A toast with an Undo button for money moved from a side panel. Unlike
 * `useUndo().showUndoNotification`, it also shows on wide screens, where
 * the panels live.
 */
export function useUndoToast(): (message: string) => void {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (message: string) => {
    dispatch(
      addNotification({
        notification: {
          type: 'message',
          message,
          timeout: UNDO_TOAST_TIMEOUT_MS,
          button: { title: t('Undo'), action: undo },
        },
      }),
    );
  };
}
