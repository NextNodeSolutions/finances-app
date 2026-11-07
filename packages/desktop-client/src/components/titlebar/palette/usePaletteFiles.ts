import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SvgClose, SvgFolder } from '@actual-app/components/icons/v1';
import type { File } from '@actual-app/core/types/file';

import {
  closeAndDownloadBudget,
  closeAndLoadBudget,
} from '#budgetfiles/budgetfilesSlice';
import { useMetadataPref } from '#hooks/useMetadataPref';
import { useDispatch, useSelector } from '#redux';

import type { PaletteSection } from './paletteTypes';

const CONFIRM_ID = 'confirm';
const CANCEL_ID = 'cancel';

type PaletteFiles = {
  /** The other budget files, found once the user types. */
  files: PaletteSection;
  /** Asks before closing the open file; null until a file is chosen. */
  confirmation: PaletteSection | null;
};

/**
 * Other budget files. Choosing one asks first, then switches the way the
 * file switcher does: close this file, then open (or download) that one.
 */
export function usePaletteFiles(): PaletteFiles {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const allFiles = useSelector(state => state.budgetfiles.allFiles ?? []);
  const [openFileId] = useMetadataPref('id');
  const [budgetName] = useMetadataPref('budgetName');
  const [chosenKey, setChosenKey] = useState<string | null>(null);

  const otherFiles = allFiles.filter(
    file => file.state === 'remote' || file.id !== openFileId,
  );
  const chosenFile = otherFiles.find(file => getFileKey(file) === chosenKey);

  const switchTo = (file: File) => {
    if (file.state === 'remote') {
      void dispatch(closeAndDownloadBudget({ cloudFileId: file.cloudFileId }));
    } else {
      void dispatch(closeAndLoadBudget({ fileId: file.id }));
    }
  };

  const files: PaletteSection = {
    key: 'files',
    heading: t('Files'),
    isSearchOnly: true,
    items: otherFiles.map(file => ({
      id: getFileKey(file),
      name: file.name,
      Icon: SvgFolder,
      keepsOpen: true,
    })),
    onSelect: setChosenKey,
  };

  const confirmation: PaletteSection | null = chosenFile
    ? {
        key: 'files-confirm',
        heading: t('Switch to {{fileName}}?', { fileName: chosenFile.name }),
        items: [
          {
            id: CONFIRM_ID,
            name: t('Close {{budgetName}} and open {{fileName}}', {
              budgetName,
              fileName: chosenFile.name,
            }),
            Icon: SvgFolder,
          },
          {
            id: CANCEL_ID,
            name: t('Stay in {{budgetName}}', { budgetName }),
            Icon: SvgClose,
            keepsOpen: true,
          },
        ],
        onSelect: id => {
          setChosenKey(null);
          if (id === CONFIRM_ID) {
            switchTo(chosenFile);
          }
        },
      }
    : null;

  return { files, confirmation };
}

function getFileKey(file: File): string {
  return file.state === 'remote'
    ? `remote:${file.cloudFileId}`
    : `local:${file.id}`;
}
