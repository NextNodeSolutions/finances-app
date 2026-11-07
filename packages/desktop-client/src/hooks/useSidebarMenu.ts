import type { SyncedPrefs } from '@actual-app/core/types/prefs';

import {
  getSidebarMenuItemPath,
  isSidebarMenuItemAvailable,
  parseSidebarMenuItems,
  parseSidebarStartPage,
} from '#components/sidebar/sidebarMenu';
import type {
  SidebarMenuItem,
  SidebarMenuItemId,
} from '#components/sidebar/sidebarMenu';
import { useIsTestEnv } from '#hooks/useIsTestEnv';
import { useOptionalFeatureStatus } from '#hooks/useOptionalFeature';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { useSyncServerStatus } from '#hooks/useSyncServerStatus';
import { mergeSyncedPrefs, saveSyncedPrefs } from '#prefs/prefsSlice';
import { useDispatch } from '#redux';

export function useSidebarMenu() {
  const dispatch = useDispatch();
  const [itemsPref] = useSyncedPref('sidebar-menu-items');
  const [startPagePref] = useSyncedPref('sidebar-start-page');
  const syncServerStatus = useSyncServerStatus();
  const isTestEnv = useIsTestEnv();
  const isUsingServer = syncServerStatus !== 'no-server' || isTestEnv;
  const bankSync = useOptionalFeatureStatus('bankSync');
  const tags = useOptionalFeatureStatus('tags');

  const isItemAvailable = (id: SidebarMenuItemId) =>
    isSidebarMenuItemAvailable(id, {
      isUsingServer,
      isBankSyncOn: bankSync.isOn,
      isTagsOn: tags.isOn,
    });
  // While a feature's default still waits on the account list, an
  // unavailable page may only look unavailable: route guards hold off.
  const isAvailabilityResolved = bankSync.isResolved && tags.isResolved;

  const items = parseSidebarMenuItems(itemsPref);
  const availableItems = items.filter(item => isItemAvailable(item.id));
  const sidebarItems = availableItems.filter(item => !item.hidden);
  const settingsItems = availableItems.filter(item => item.hidden);

  const startPage = parseSidebarStartPage(startPagePref, availableItems);
  const startPath = getSidebarMenuItemPath(
    startPage,
    sidebarItems.some(item => item.id === startPage),
  );

  const savePrefs = (prefs: Partial<SyncedPrefs>) => {
    dispatch(mergeSyncedPrefs(prefs));
    void dispatch(saveSyncedPrefs({ prefs }));
  };

  const saveItems = (newItems: SidebarMenuItem[]) => {
    savePrefs({ 'sidebar-menu-items': JSON.stringify(newItems) });
  };

  const saveStartPage = (newStartPage: SidebarMenuItemId) => {
    savePrefs({ 'sidebar-start-page': newStartPage });
  };

  return {
    items,
    availableItems,
    sidebarItems,
    settingsItems,
    startPage,
    startPath,
    isItemAvailable,
    isAvailabilityResolved,
    saveItems,
    saveStartPage,
  };
}
