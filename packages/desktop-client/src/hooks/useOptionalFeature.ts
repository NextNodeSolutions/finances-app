import * as Platform from '@actual-app/core/shared/platform';
import type { AccountEntity } from '@actual-app/core/types/models';
import type {
  OptionalFeature,
  SyncedPrefs,
} from '@actual-app/core/types/prefs';

import { useAccounts } from '#hooks/useAccounts';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { mergeSyncedPrefs, saveSyncedPrefs } from '#prefs/prefsSlice';
import { useDispatch } from '#redux';

type FeatureAccount = Pick<
  AccountEntity,
  'closed' | 'tombstone' | 'account_sync_source'
>;

// What a feature resolves to when the budget has no explicit setting.
// Bank sync stays on for budgets that already download from a bank, so an
// upgrade never silently stops those downloads.
const DEFAULT_RESOLVERS: Record<
  OptionalFeature,
  (accounts: readonly FeatureAccount[]) => boolean
> = {
  bankSync: accounts =>
    accounts.some(
      account =>
        !account.closed &&
        !account.tombstone &&
        account.account_sync_source != null,
    ),
  tags: () => false,
};

function getPrefKey(feature: OptionalFeature) {
  return `features.${feature}` as const;
}

function parseExplicitPref(pref: string | undefined): boolean | null {
  if (pref === 'true') {
    return true;
  }
  if (pref === 'false') {
    return false;
  }
  return null;
}

function resolveOptionalFeature(
  pref: string | undefined,
  accounts: readonly FeatureAccount[],
  feature: OptionalFeature,
): boolean {
  const explicit = parseExplicitPref(pref);
  if (explicit !== null) {
    return explicit;
  }
  // Playwright runs with every feature on so existing e2e flows keep working;
  // the off state is covered by tests that set the pref explicitly.
  if (Platform.isPlaywright) {
    return true;
  }
  return DEFAULT_RESOLVERS[feature](accounts);
}

/**
 * Non-hook form of `useOptionalFeature`, for thunks, timers and other code
 * that already holds the synced prefs and the account list.
 */
export function isOptionalFeatureOn(
  prefs: SyncedPrefs,
  accounts: readonly FeatureAccount[],
  feature: OptionalFeature,
): boolean {
  return resolveOptionalFeature(prefs[getPrefKey(feature)], accounts, feature);
}

export type OptionalFeatureStatus = {
  isOn: boolean;
  /**
   * False while the answer still depends on the account list loading.
   * Route guards wait for this before redirecting away from a page.
   */
  isResolved: boolean;
};

export function useOptionalFeatureStatus(
  feature: OptionalFeature,
): OptionalFeatureStatus {
  const [pref] = useSyncedPref(getPrefKey(feature));
  const { data: accounts = [], isPlaceholderData } = useAccounts();

  const dependsOnAccounts =
    parseExplicitPref(pref) === null &&
    !Platform.isPlaywright &&
    feature === 'bankSync';

  return {
    isOn: resolveOptionalFeature(pref, accounts, feature),
    isResolved: !dependsOnAccounts || !isPlaceholderData,
  };
}

/**
 * Whether an optional feature (bank sync, tags) is turned on for the open
 * budget, and a setter that stores the choice in the budget's synced prefs.
 */
export function useOptionalFeature(
  feature: OptionalFeature,
): [isOn: boolean, setOn: (isOn: boolean) => void] {
  const dispatch = useDispatch();
  const { isOn } = useOptionalFeatureStatus(feature);

  const setOn = (nextIsOn: boolean) => {
    const prefs: SyncedPrefs = { [getPrefKey(feature)]: String(nextIsOn) };
    dispatch(mergeSyncedPrefs(prefs));
    void dispatch(saveSyncedPrefs({ prefs }));
  };

  return [isOn, setOn];
}
