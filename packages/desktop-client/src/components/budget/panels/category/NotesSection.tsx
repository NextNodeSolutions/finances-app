import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { send } from '@actual-app/core/platform/client/connection';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { Notes } from '#components/Notes';
import { useNotes } from '#hooks/useNotes';

import { PanelSection } from './PanelSection';

type NotesSectionProps = {
  categoryId: CategoryEntity['id'];
};

/** The category's notes, saved when the editor loses focus. */
export function NotesSection({ categoryId }: NotesSectionProps) {
  const { t } = useTranslation();
  const savedNote = useNotes(categoryId) ?? '';
  // Only the user's unsaved edit lives here; the saved note stays the
  // source of truth until then.
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <PanelSection label={t('Notes')}>
      <Notes
        notes={draft ?? savedNote}
        editable
        onChange={setDraft}
        onBlur={note => {
          if (draft !== null && note !== savedNote) {
            void send('notes-save', { id: categoryId, note });
          }
          setDraft(null);
        }}
      />
    </PanelSection>
  );
}
