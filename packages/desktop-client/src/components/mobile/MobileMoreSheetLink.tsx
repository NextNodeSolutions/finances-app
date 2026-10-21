import type { ComponentType, SVGProps } from 'react';
import { NavLink } from 'react-router';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, spacing } from '@actual-app/components/tokens';

const ROW_MIN_HEIGHT = 48;
const ROW_ICON_SIZE = 18;

type MobileMoreSheetLinkProps = {
  title: string;
  path: string;
  Icon:
    | ComponentType<SVGProps<SVGElement>>
    | ComponentType<SVGProps<SVGSVGElement>>;
  onNavigate: () => void;
};

/** One page in the More sheet: its sidebar icon and title. */
export function MobileMoreSheetLink({
  title,
  path,
  Icon,
  onNavigate,
}: MobileMoreSheetLinkProps) {
  return (
    <NavLink
      to={path}
      end
      onClick={onNavigate}
      style={({ isActive }) => ({
        ...styles.noTapHighlight,
        ...styles.mediumText,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: ROW_MIN_HEIGHT,
        padding: `${spacing.sm}px ${spacing.lg + 4}px`,
        borderTop: `1px solid ${theme.hairlineSubtle}`,
        color: theme.pageText,
        fontWeight: isActive ? 600 : 400,
        textDecoration: 'none',
        transition: `background-color ${motion.fast} ${motion.ease}`,
      })}
    >
      <Icon
        width={ROW_ICON_SIZE}
        height={ROW_ICON_SIZE}
        style={{ flexShrink: 0, color: theme.pageTextSubdued }}
      />
      <Text style={styles.ellipsisText}>{title}</Text>
    </NavLink>
  );
}
