import {
  SvgCheveronDown,
  SvgCheveronRight,
} from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';

type CollapseChevronProps = {
  isOpen: boolean;
  size?: number;
  color?: string;
};

export function CollapseChevron({
  isOpen,
  size = 11,
  color = theme.sidebarTextMuted,
}: CollapseChevronProps) {
  const Chevron = isOpen ? SvgCheveronDown : SvgCheveronRight;

  return (
    <Chevron width={size} height={size} style={{ flexShrink: 0, color }} />
  );
}
