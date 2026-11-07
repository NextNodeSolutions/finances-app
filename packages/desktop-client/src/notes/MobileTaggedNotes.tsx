import React from 'react';

import { Text } from '@actual-app/components/text';

import { useOptionalFeature } from '#hooks/useOptionalFeature';
import { useTagCSS } from '#hooks/useTagCSS';

type MobileTaggedNotesProps = {
  content: string;
  tag: string;
  separator: string;
};

export function MobileTaggedNotes({
  content,
  tag,
  separator,
}: MobileTaggedNotesProps) {
  const getTagCSS = useTagCSS();
  const [isTagsOn] = useOptionalFeature('tags');

  return (
    <>
      {isTagsOn ? (
        <Text className={getTagCSS(tag, { compact: true })}>{content}</Text>
      ) : (
        content
      )}
      {separator}
    </>
  );
}
