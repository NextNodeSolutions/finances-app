import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { SvgCog } from '@actual-app/components/icons/v1';

import {
  isSettingsSection,
  isSettingsSectionOnMobile,
} from '#components/sidebar/sidebarMenu';
import type { SidebarMenuItemId } from '#components/sidebar/sidebarMenu';
import { useSidebarMenuItemDetails } from '#components/sidebar/useSidebarMenuItemDetails';
import { useSidebarMenu } from '#hooks/useSidebarMenu';

import { MobileMoreSheetLink } from './MobileMoreSheetLink';
import { MobileSheet } from './MobileSheet';

// The secondary pages, in the order the sheet lists them; Settings closes it.
const MORE_PAGE_IDS = [
  'reports',
  'schedules',
  'payees',
  'rules',
  'tags',
  'bank-sync',
] as const satisfies readonly SidebarMenuItemId[];

// Pages reached through More: the bar marks More as the current tab there.
const MORE_PATH_PREFIXES = [
  '/reports',
  '/schedules',
  '/settings',
  '/notifications',
];

type MoreRow = Omit<ComponentProps<typeof MobileMoreSheetLink>, 'onNavigate'>;

type MobileMoreSheetProps = {
  /** Called as a row is followed, so the bar can drop the sheet at once. */
  onNavigate: () => void;
  onClose: () => void;
};

/** The bottom bar's More sheet: every page that has no tab of its own. */
export function MobileMoreSheet({ onNavigate, onClose }: MobileMoreSheetProps) {
  const { t } = useTranslation();
  const { isItemAvailable } = useSidebarMenu();
  const itemDetails = useSidebarMenuItemDetails();

  const rows: MoreRow[] = [
    ...MORE_PAGE_IDS.filter(id => isItemAvailable(id)).map(id => ({
      title: itemDetails[id].title,
      path: getNarrowPagePath(id),
      Icon: itemDetails[id].Icon,
    })),
    { title: t('Settings'), path: '/settings', Icon: SvgCog },
  ];

  return (
    <MobileSheet name="mobile-more" title={t('More')} onClose={onClose}>
      <nav aria-label={t('More pages')}>
        {rows.map(row => (
          <MobileMoreSheetLink
            key={row.path}
            {...row}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </MobileSheet>
  );
}

export function isMorePath(pathname: string): boolean {
  return MORE_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

// On narrow screens every settings section but Schedules lives under
// /settings; going there directly skips a redirect.
function getNarrowPagePath(id: (typeof MORE_PAGE_IDS)[number]): string {
  return isSettingsSection(id) && isSettingsSectionOnMobile(id)
    ? `/settings/${id}`
    : `/${id}`;
}
