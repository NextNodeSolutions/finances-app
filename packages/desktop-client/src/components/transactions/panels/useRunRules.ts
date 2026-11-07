import { useTranslation } from 'react-i18next';

import { send } from '@actual-app/core/platform/client/connection';
import type { TransactionEntity } from '@actual-app/core/types/models';

import { addNotification } from '#notifications/notificationsSlice';
import { useDispatch } from '#redux';

type RunRules = (transaction: TransactionEntity) => Promise<TransactionEntity>;

/**
 * Runs the user's rules over a transaction being entered, the same
 * `rules-run` call the register makes, and reports formula errors.
 */
export function useRunRules(): RunRules {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return async transaction => {
    const afterRules = await send('rules-run', { transaction });
    const ruleErrors = afterRules._ruleErrors ?? [];
    if (ruleErrors.length > 0) {
      dispatch(
        addNotification({
          notification: {
            type: 'error',
            message: [t('Formula errors in rules:'), ...ruleErrors].join('\n'),
            sticky: true,
          },
        }),
      );
    }
    return afterRules;
  };
}
