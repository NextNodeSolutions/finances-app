import React from 'react';

import { Button } from '@actual-app/components/button';
import { View } from '@actual-app/components/view';

import { useOptionalFeature } from '#hooks/useOptionalFeature';
import { useTagCSS } from '#hooks/useTagCSS';

type DesktopTaggedNotesProps = {
  content: string;
  onPress?: (content: string) => void;
  tag: string;
  separator: string;
};

export function DesktopTaggedNotes({
  content,
  onPress,
  tag,
  separator,
}: DesktopTaggedNotesProps) {
  const getTagCSS = useTagCSS();
  const [isTagsOn] = useOptionalFeature('tags');

  // With tags turned off, a #word is just text.
  if (!isTagsOn) {
    return (
      <>
        {content}
        {separator}
      </>
    );
  }

  return (
    <View style={{ display: 'inline' }}>
      <Button
        variant="bare"
        className={getTagCSS(tag)}
        onPress={() => {
          onPress?.(content);
        }}
      >
        {content}
      </Button>
      {separator}
    </View>
  );
}
