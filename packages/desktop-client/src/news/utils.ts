import type { NewsEntry } from './types';

/**
 * Entries published after the date the user last looked at the feed. Until a
 * baseline date exists (first run) nothing counts as unseen, so a new user
 * isn't greeted with a backlog of "unread" history.
 */
export function getUnseenEntries(
  entries: NewsEntry[],
  lastSeenDate: string | undefined,
): NewsEntry[] {
  if (!lastSeenDate) {
    return [];
  }
  return entries.filter(entry => entry.date > lastSeenDate);
}

export function getNewestDate(entries: NewsEntry[]): string | undefined {
  return entries.reduce<string | undefined>(
    (newest, entry) =>
      newest === undefined || entry.date > newest ? entry.date : newest,
    undefined,
  );
}
