import type { ComponentType, SVGProps } from 'react';
import { GridListItem } from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgMenu } from '@actual-app/components/icons/v1';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { Toggle } from '@actual-app/components/toggle';
import { motion, spacing } from '@actual-app/components/tokens';
import { css } from '@emotion/css';

import { pillStyle } from '#components/schedules/StatusBadge';
import { isSidebarMenuItemLocked } from '#components/sidebar/sidebarMenu';
import type {
  SidebarMenuItem,
  SidebarMenuItemId,
} from '#components/sidebar/sidebarMenu';

type SidebarMenuListItemProps = {
  item: SidebarMenuItem;
  label: string;
  Icon:
    | ComponentType<SVGProps<SVGElement>>
    | ComponentType<SVGProps<SVGSVGElement>>;
  isStartPage: boolean;
  onToggle: (id: SidebarMenuItemId, isVisible: boolean) => void;
};

export function SidebarMenuListItem({
  item,
  label,
  Icon,
  isStartPage,
  onToggle,
}: SidebarMenuListItemProps) {
  const { t } = useTranslation();

  return (
    <GridListItem
      id={item.id}
      textValue={label}
      className={css({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minHeight: 40,
        padding: `0 ${spacing.xs}px`,
        // Ruled rows inside the settings card, not boxes within it.
        borderTop: '1px solid ' + theme.hairlineSubtle,
        backgroundColor: theme.tableBackground,
        outline: 'none',
        transition: `background-color ${motion.base} ${motion.ease}`,
        '&[data-hovered]': {
          backgroundColor: theme.tableRowBackgroundHover,
        },
        '&[data-dragging]': {
          opacity: 0.5,
        },
        '&[data-focus-visible]': {
          outline: `2px solid ${theme.focusRing}`,
          outlineOffset: -2,
        },
      })}
    >
      <Button
        slot="drag"
        variant="bare"
        aria-label={t('Reorder {{ pageName }}', { pageName: label })}
        style={{
          cursor: 'grab',
          color: theme.pageTextSubdued,
          width: 26,
          height: 26,
          padding: 0,
        }}
      >
        <SvgMenu width={11} height={11} />
      </Button>
      <Icon
        width={14}
        height={14}
        style={{
          flexShrink: 0,
          color: item.hidden ? theme.pageTextSubdued : theme.pageTextLight,
        }}
      />
      <Text
        style={{
          flex: 1,
          fontWeight: 500,
          color: item.hidden ? theme.pageTextSubdued : theme.tableText,
        }}
      >
        {label}
      </Text>
      {isStartPage && (
        <Text
          style={{
            ...pillStyle,
            color: theme.pillText,
            backgroundColor: theme.pillBackground,
          }}
        >
          <Trans>Start page</Trans>
        </Text>
      )}
      {isSidebarMenuItemLocked(item.id) ? (
        <Text size="small" style={{ color: theme.pageTextSubdued }}>
          <Trans>Always shown</Trans>
        </Text>
      ) : (
        <Toggle
          id={`toggle-sidebar-item-${item.id}`}
          aria-label={label}
          isOn={!item.hidden}
          onToggle={isVisible => onToggle(item.id, isVisible)}
        />
      )}
    </GridListItem>
  );
}
