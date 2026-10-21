import React from 'react';

import { theme } from '@actual-app/components/theme';
import type { TagEntity } from '@actual-app/core/types/models';

import { ROW_HEIGHT, Table } from '#components/table';
import type { TableNavigator } from '#components/table';

import { TagRow } from './TagRow';

type TagsListProps = {
  navigator: TableNavigator<TagEntity>;
  tags: TagEntity[];
  hoveredTag?: string;
  onHover: (id?: string) => void;
};

export function TagsList({
  navigator,
  tags,
  hoveredTag,
  onHover,
}: TagsListProps) {
  return (
    <Table
      navigator={navigator}
      items={tags}
      backgroundColor={theme.tableBackground}
      // Rows overlap by their 1px rule, so the list is one pixel per row
      // shorter than Table's default body; size it to the rows so the card
      // closes right under the last tag.
      style={{
        flex: 'none',
        height: (ROW_HEIGHT - 1) * Math.max(tags.length, 1),
      }}
      renderItem={({ item: tag, focusedField, onEdit }) => {
        const hovered = hoveredTag === tag.id;

        return (
          <TagRow
            key={tag.id}
            tag={tag}
            hovered={hovered}
            onHover={onHover}
            focusedField={focusedField}
            onEdit={onEdit}
          />
        );
      }}
    />
  );
}
