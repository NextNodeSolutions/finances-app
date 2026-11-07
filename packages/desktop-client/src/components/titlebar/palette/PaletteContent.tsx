import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { css } from '@emotion/css';
import { Command } from 'cmdk';

import { useMetadataPref } from '#hooks/useMetadataPref';

import { PaletteGroup } from './PaletteGroup';
import type { PaletteItem, PaletteSection } from './paletteTypes';
import { usePaletteActions } from './usePaletteActions';
import { usePaletteFiles } from './usePaletteFiles';
import { usePaletteLibrary } from './usePaletteLibrary';
import { usePaletteNavigation } from './usePaletteNavigation';
import { usePaletteNewTransaction } from './usePaletteNewTransaction';
import { usePaletteRecords } from './usePaletteRecords';

type PaletteContentProps = {
  onClose: () => void;
};

/**
 * The palette's input and results. Mounted only while the palette is open,
 * so its data loads on open and the query starts empty every time.
 */
export function PaletteContent({ onClose }: PaletteContentProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [budgetName] = useMetadataPref('budgetName');
  const newTransaction = usePaletteNewTransaction(search);
  const { navigate, accounts } = usePaletteNavigation();
  const actions = usePaletteActions();
  const records = usePaletteRecords();
  const { reports, customReports, help } = usePaletteLibrary();
  const { files, confirmation } = usePaletteFiles();

  const query = search.trim().toLowerCase();
  const matches = filterSections(
    [
      navigate,
      actions,
      accounts,
      ...records,
      reports,
      customReports,
      files,
      help,
    ],
    query,
  );
  const sections = confirmation
    ? [confirmation]
    : [...(newTransaction ? [newTransaction] : []), ...matches];

  const select = (section: PaletteSection, item: PaletteItem) => {
    if (!item.keepsOpen) {
      onClose();
    }
    section.onSelect(item.id);
  };

  return (
    <>
      <Command.Input
        autoFocus
        placeholder={t('Search {{budgetName}}...', { budgetName })}
        value={search}
        onValueChange={setSearch}
        className={inputClassName}
      />
      <Command.List className={listClassName}>
        {sections.map(section => (
          <PaletteGroup
            key={section.key}
            section={section}
            onSelect={item => select(section, item)}
          />
        ))}
        {sections.length === 0 && (
          <Command.Empty className={emptyClassName}>
            <Trans>No results found</Trans>
          </Command.Empty>
        )}
      </Command.List>
    </>
  );
}

/**
 * Keeps the items whose name holds the query, at most `limit` per section.
 * An empty query shows only the sections meant for browsing.
 */
function filterSections(
  sections: readonly PaletteSection[],
  query: string,
): PaletteSection[] {
  return sections
    .filter(section => query !== '' || !section.isSearchOnly)
    .map(section => ({
      ...section,
      items: section.items
        .filter(item => item.name.toLowerCase().includes(query))
        .slice(0, section.limit),
    }))
    .filter(section => section.items.length > 0);
}

const inputClassName = css({
  width: '100%',
  padding: '16px 20px',
  fontSize: 15,
  border: 'none',
  borderBottom: `1px solid ${theme.hairline}`,
  backgroundColor: 'transparent',
  color: theme.pageText,
  outline: 'none',
  '&::placeholder': {
    color: theme.formInputTextPlaceholder,
  },
});

const listClassName = css({
  maxHeight: 340,
  overflowY: 'auto',
  padding: '6px 0 8px',
  // Scrolls without showing a scrollbar.
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const emptyClassName = css({
  padding: '20px 16px',
  textAlign: 'center',
  fontSize: 13,
  color: theme.pageTextSubdued,
});
