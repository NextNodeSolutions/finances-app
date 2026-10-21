import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@actual-app/components/input';

import { NoteTagAutocomplete } from '#components/autocomplete/NoteTagAutocomplete';
import { useOptionalFeature } from '#hooks/useOptionalFeature';

import { PanelField } from './PanelField';

type NotesFieldProps = {
  notes: string | undefined;
  onChange: (notes: string) => void;
  isDisabled?: boolean;
};

/** Plain text; tag suggestions join in only when tags are on. */
export function NotesField({ notes, onChange, isDisabled }: NotesFieldProps) {
  const { t } = useTranslation();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTagsOn] = useOptionalFeature('tags');

  return (
    <PanelField label={t('Notes')} htmlFor={id}>
      <Input
        id={id}
        ref={inputRef}
        value={notes ?? ''}
        disabled={isDisabled}
        onChangeValue={onChange}
      />
      {isTagsOn && <NoteTagAutocomplete inputRef={inputRef} />}
    </PanelField>
  );
}
