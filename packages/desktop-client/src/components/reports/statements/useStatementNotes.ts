import { q } from '@actual-app/core/shared/query';
import type { NoteEntity } from '@actual-app/core/types/models';

import { useQuery } from '#hooks/useQuery';

import { getMonthNoteId } from './getMonthNoteId';

const ID_SEPARATOR = ',';

/** The first line of each listed month's budget note, keyed by month. */
export function useStatementNotes(
  months: readonly string[],
): Map<string, string> {
  const idsKey = months.map(getMonthNoteId).join(ID_SEPARATOR);
  const { data } = useQuery<Pick<NoteEntity, 'id' | 'note'>>(
    () =>
      q('notes')
        .filter({ id: { $oneof: idsKey.split(ID_SEPARATOR) } })
        .select(['id', 'note']),
    [idsKey],
  );

  const firstLines = new Map<string, string>();
  for (const month of months) {
    const note = data?.find(row => row.id === getMonthNoteId(month))?.note;
    const firstLine = note ? getFirstLine(note) : '';
    if (firstLine) {
      firstLines.set(month, firstLine);
    }
  }
  return firstLines;
}

/** The first non-empty line, without a markdown heading marker. */
function getFirstLine(note: string): string {
  const line = note.split('\n').find(text => text.trim() !== '') ?? '';
  return line.replace(/^#+\s+/, '').trim();
}
