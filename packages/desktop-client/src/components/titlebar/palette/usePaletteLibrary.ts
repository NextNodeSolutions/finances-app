import { useTranslation } from 'react-i18next';

import {
  SvgBookReference,
  SvgChatBubbleDots,
  SvgReports,
} from '@actual-app/components/icons/v1';
import { SvgNotesPaperText } from '@actual-app/components/icons/v2';

import { openDocsForCurrentPage } from '#components/titlebar/openDocsForCurrentPage';
import { useDashboardPages } from '#hooks/useDashboardPages';
import { useNavigate } from '#hooks/useNavigate';
import { useReports } from '#hooks/useReports';

import type { PaletteSection } from './paletteTypes';

const DOCS_ID = 'docs';
const COMMUNITY_URL = 'https://discord.gg/pRYNYr4W5A';

type PaletteLibrary = {
  reports: PaletteSection;
  customReports: PaletteSection;
  help: PaletteSection;
};

/** Reports, custom reports and help, found once the user types. */
export function usePaletteLibrary(): PaletteLibrary {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: dashboardPages = [] } = useDashboardPages();
  const { data: customReports = [] } = useReports();

  return {
    reports: {
      key: 'reports',
      heading: t('Reports'),
      isSearchOnly: true,
      items: dashboardPages.map(dashboardPage => ({
        id: dashboardPage.id,
        name: dashboardPage.name,
        Icon: SvgReports,
      })),
      onSelect: id => void navigate(`/reports/${id}`),
    },
    customReports: {
      key: 'reports-custom',
      heading: t('Custom reports'),
      isSearchOnly: true,
      items: customReports.map(report => ({
        id: report.id,
        name: report.name,
        Icon: SvgNotesPaperText,
      })),
      onSelect: id => void navigate(`/reports/custom/${id}`),
    },
    help: {
      key: 'help',
      heading: t('Help'),
      isSearchOnly: true,
      items: [
        { id: DOCS_ID, name: t('Documentation'), Icon: SvgBookReference },
        {
          id: COMMUNITY_URL,
          name: t('Community support (Discord)'),
          Icon: SvgChatBubbleDots,
        },
      ],
      onSelect: id => {
        if (id === DOCS_ID) {
          openDocsForCurrentPage();
        } else {
          window.Actual.openURLInBrowser(COMMUNITY_URL);
        }
      },
    },
  };
}
