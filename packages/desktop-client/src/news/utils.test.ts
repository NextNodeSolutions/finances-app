import { describe, expect, it } from 'vitest';

import type { NewsEntry } from './types';
import { getNewestDate, getUnseenEntries } from './utils';

function release(version: string, date: string): NewsEntry {
  return {
    id: `release-${version}`,
    type: 'release',
    title: `Release ${version}`,
    date,
    version,
    url: '',
    body: '',
  };
}

function post(slug: string, date: string): NewsEntry {
  return {
    id: `post-${slug}`,
    type: 'post',
    title: slug,
    date,
    url: '',
    body: '',
  };
}

const entries = [
  release('26.9.0', '2026-09-01'),
  release('26.8.1', '2026-08-07'),
  post('announcement', '2026-08-05'),
  release('26.8.0', '2026-08-02'),
];

describe('getUnseenEntries', () => {
  it('returns nothing until a last seen date exists', () => {
    expect(getUnseenEntries(entries, undefined)).toEqual([]);
  });

  it('only returns entries strictly newer than the last seen date', () => {
    expect(
      getUnseenEntries(entries, '2026-08-05').map(entry => entry.id),
    ).toEqual(['release-26.9.0', 'release-26.8.1']);
  });
});

describe('getNewestDate', () => {
  it('finds the newest date regardless of order', () => {
    expect(getNewestDate([...entries].reverse())).toBe('2026-09-01');
    expect(getNewestDate([])).toBeUndefined();
  });
});
