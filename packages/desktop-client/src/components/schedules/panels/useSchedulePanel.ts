import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { usePanels } from '#components/panels/PanelProvider';
import { useNavigate } from '#hooks/useNavigate';

import { SchedulePanel } from './SchedulePanel';

// One panel key per schedule, so switching schedules remounts the panel
// with fresh state and the open schedule can be read back from the key.
const KEY_PREFIX = 'schedule:';

type SchedulePanelOpener = {
  /** Shows the schedule's details beside the current page. */
  open: (id: ScheduleEntity['id']) => void;
  /** The schedule whose panel is open, if any. */
  openScheduleId: ScheduleEntity['id'] | null;
};

/**
 * Opens a schedule's details in the side panel. Narrow screens have no side
 * panel, so they go to the existing mobile schedule page instead.
 */
export function useSchedulePanel(): SchedulePanelOpener {
  const { isNarrowWidth } = useResponsive();
  const navigate = useNavigate();
  const panels = usePanels();

  const open = (id: ScheduleEntity['id']) => {
    if (isNarrowWidth) {
      void navigate(`/schedules/${id}`);
      return;
    }
    panels.open({
      key: `${KEY_PREFIX}${id}`,
      Component: SchedulePanel,
      props: { id },
    });
  };

  const openKey = panels.current?.key;
  const openScheduleId =
    !isNarrowWidth && openKey?.startsWith(KEY_PREFIX)
      ? openKey.slice(KEY_PREFIX.length)
      : null;

  return { open, openScheduleId };
}
