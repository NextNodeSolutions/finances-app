import { useEffect } from 'react';

import { getNewestDate } from '#news/utils';

import { useGlobalPref } from './useGlobalPref';
import { useNewsFeed } from './useNewsFeed';

/**
 * Keeps What's new honest without interrupting: news never raises a toast.
 * Unseen entries show as an unread mark on the Help menu's What's new item.
 *
 * The first time the feed is enabled, the hook records where the feed
 * currently is, so only entries published from then on count as unread
 * rather than the whole back catalogue. Does nothing while the news feed is
 * disabled (the user turned it off in settings).
 */
export function useNewsNotification() {
  const { isEnabled, entries } = useNewsFeed();
  const [lastSeenNewsDate, setLastSeenNewsDate] =
    useGlobalPref('lastSeenNewsDate');

  useEffect(() => {
    if (!isEnabled || entries.length === 0 || lastSeenNewsDate) {
      return;
    }

    const newestDate = getNewestDate(entries);
    if (newestDate) {
      setLastSeenNewsDate(newestDate);
    }
  }, [entries, isEnabled, lastSeenNewsDate, setLastSeenNewsDate]);
}
