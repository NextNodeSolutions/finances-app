import { Navigate, useLocation } from 'react-router';

import { useSidebarMenu } from '#hooks/useSidebarMenu';

export function StartPageRedirect() {
  const location = useLocation();
  const { startPath, isAvailabilityResolved } = useSidebarMenu();

  // A saved start page may be one whose availability is still loading.
  if (!isAvailabilityResolved) {
    return null;
  }

  // Keyed by the location: a second visit to this route before the first
  // redirect rendered (an import navigating to '/' as the opened file lands
  // here) must redirect again instead of reusing the Navigate that ran.
  return <Navigate key={location.key} to={startPath} replace />;
}
