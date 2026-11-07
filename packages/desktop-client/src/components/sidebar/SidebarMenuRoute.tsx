import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';

import { Page } from '#components/Page';
import { useSidebarMenu } from '#hooks/useSidebarMenu';

import {
  getSidebarMenuItemPath,
  isSettingsSection,
  isSettingsSectionOnMobile,
} from './sidebarMenu';
import type { SidebarMenuItemId } from './sidebarMenu';
import { useSidebarMenuItemDetails } from './useSidebarMenuItemDetails';

type SidebarMenuRouteProps = {
  id: SidebarMenuItemId;
  isInSettings?: boolean;
  children: ReactNode;
};

export function SidebarMenuRoute({
  id,
  isInSettings = false,
  children,
}: SidebarMenuRouteProps) {
  const { isNarrowWidth } = useResponsive();
  const { sidebarItems, startPath, isItemAvailable, isAvailabilityResolved } =
    useSidebarMenu();
  const itemDetails = useSidebarMenuItemDetails();
  const location = useLocation();

  if (!isItemAvailable(id)) {
    return isAvailabilityResolved ? <Navigate to={startPath} replace /> : null;
  }

  // Pages that are not settings sections (Overview, Budget, Reports) have a
  // single route and render their own page frame.
  if (!isSettingsSection(id)) {
    return children;
  }

  const isMobilePage = isNarrowWidth && !isSettingsSectionOnMobile(id);
  const isSettingsPage = isNarrowWidth
    ? !isMobilePage
    : !sidebarItems.some(item => item.id === id);

  if (isSettingsPage !== isInSettings) {
    return (
      <Navigate
        to={{
          pathname: getSidebarMenuItemPath(id, isInSettings),
          search: location.search,
          hash: location.hash,
        }}
        state={location.state}
        replace
      />
    );
  }

  if (isInSettings || isMobilePage) {
    return children;
  }

  return <Page header={itemDetails[id].title}>{children}</Page>;
}
