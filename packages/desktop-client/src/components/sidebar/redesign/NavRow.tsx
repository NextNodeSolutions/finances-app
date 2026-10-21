import type { ComponentType, SVGProps } from 'react';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Link } from '#components/common/Link';

const ROW_HEIGHT = 32;
const ICON_SIZE = 15;

type NavRowProps = {
  title: string;
  Icon:
    | ComponentType<SVGProps<SVGElement>>
    | ComponentType<SVGProps<SVGSVGElement>>;
  to: string;
};

export function NavRow({ title, Icon, to }: NavRowProps) {
  return (
    <View style={{ flexShrink: 0 }}>
      <Link
        variant="internal"
        to={to}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          height: ROW_HEIGHT,
          padding: '0 10px',
          borderRadius: radius.md,
          marginBottom: 2,
          fontSize: 13,
          fontWeight: 500,
          textDecoration: 'none',
          color: theme.sidebarItemText,
          transition: `background-color ${motion.base} ${motion.ease}, color ${motion.base} ${motion.ease}`,
          ':hover': {
            backgroundColor: theme.sidebarItemBackgroundHover,
            color: theme.sidebarItemTextSelected,
          },
          ':focus-visible': {
            outline: `2px solid ${theme.focusRing}`,
            outlineOffset: -2,
          },
        }}
        activeStyle={{
          backgroundColor: theme.sidebarItemBackgroundSelected,
          color: theme.sidebarItemTextSelected,
          ':hover': {
            backgroundColor: theme.sidebarItemBackgroundSelected,
          },
        }}
      >
        <Icon width={ICON_SIZE} height={ICON_SIZE} style={{ flexShrink: 0 }} />
        <Text style={styles.ellipsisText}>{title}</Text>
      </Link>
    </View>
  );
}
