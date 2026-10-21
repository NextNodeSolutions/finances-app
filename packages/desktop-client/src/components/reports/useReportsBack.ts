import { useLocation } from 'react-router';

import { useNavigate } from '#hooks/useNavigate';

/**
 * Leaves a report page: back to wherever it was opened from, or to the
 * reports dashboard when the report was the first page loaded (a direct link
 * or a reload has no history entry to return to).
 */
export function useReportsBack(): () => void {
  const location = useLocation();
  const navigate = useNavigate();

  return () => {
    if (location.key !== 'default') {
      void navigate(-1);
      return;
    }
    void navigate('/reports');
  };
}
