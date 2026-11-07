import { useEffect, useState } from 'react';

import { useGlobalPref } from '#hooks/useGlobalPref';
import { useSelector } from '#redux';

type AppUpdates = {
  /** A newer build is downloaded and applies on reload (web app). */
  isReloadReady: boolean;
  /** The latest release, when this one is behind and the user asked to know. */
  outdatedVersion: string | null;
};

/**
 * What the Help menu says about updates. Updates are information, not
 * interruptions, so they wait there instead of raising a toast at boot.
 */
export function useAppUpdates(): AppUpdates {
  const [isReloadReady, setIsReloadReady] = useState(() =>
    window.Actual.isUpdateReadyForDownload(),
  );
  const versionInfo = useSelector(state => state.app.versionInfo);
  const [notifyWhenUpdateIsAvailable] = useGlobalPref(
    'notifyWhenUpdateIsAvailable',
  );

  useEffect(() => {
    let isCurrent = true;
    // Resolves once, when the service worker has the next build ready.
    void window.Actual.waitForUpdateReadyForDownload().then(() => {
      if (isCurrent) {
        setIsReloadReady(true);
      }
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const outdatedVersion =
    notifyWhenUpdateIsAvailable && versionInfo?.isOutdated
      ? versionInfo.latestVersion
      : null;

  return { isReloadReady, outdatedVersion };
}
