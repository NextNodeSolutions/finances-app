import { Navigate } from 'react-router';

import { useSidebarMenu } from '#hooks/useSidebarMenu';

export function StartPageRedirect() {
  const { startPath, isAvailabilityResolved } = useSidebarMenu();

  // A saved start page may be one whose availability is still loading.
  if (!isAvailabilityResolved) {
    return null;
  }

  return <Navigate to={startPath} replace />;
}
