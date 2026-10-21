import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { css } from '@emotion/css';
import { Command } from 'cmdk';

import type { PaletteItem, PaletteSection } from './paletteTypes';

type PaletteGroupProps = {
  section: PaletteSection;
  onSelect: (item: PaletteItem) => void;
};

/** One palette section: its heading and its items. */
export function PaletteGroup({ section, onSelect }: PaletteGroupProps) {
  return (
    <Command.Group heading={section.heading} className={groupClassName}>
      {section.items.map(item => (
        <Command.Item
          key={item.id}
          // Unique across sections, so two same-named items select apart.
          value={`${section.key}:${item.id}`}
          onSelect={() => onSelect(item)}
          className={itemClassName}
        >
          <item.Icon width={15} height={15} />
          {item.content ?? item.name}
        </Command.Item>
      ))}
    </Command.Group>
  );
}

const groupClassName = css({
  padding: '0 6px',
  '& [cmdk-group-heading]': {
    padding: '10px 10px 4px',
    fontSize: 11.5,
    fontWeight: 500,
    color: theme.menuItemTextHeader,
  },
});

const itemClassName = css({
  padding: '7px 10px',
  cursor: 'pointer',
  fontSize: 13,
  borderRadius: radius.sm,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  color: theme.menuItemText,
  transition: `background-color ${motion.fast} ${motion.ease}`,
  '& > svg': {
    color: theme.pageTextLight,
    flexShrink: 0,
  },
  // No hover styles while the keyboard drives the selection.
  '[data-cmdk-list]:not([data-cmdk-list-nav-active]) &:hover': {
    backgroundColor: theme.menuItemBackgroundHover,
    color: theme.menuItemTextHover,
  },
  "&[data-selected='true']": {
    backgroundColor: theme.menuItemBackgroundHover,
    color: theme.menuItemTextHover,
  },
});
