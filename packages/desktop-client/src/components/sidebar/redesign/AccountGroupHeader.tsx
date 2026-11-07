import { useContext, useState } from 'react';
import {
  Button,
  TreeItem,
  TreeItemContent,
  TreeStateContext,
} from 'react-aria-components';
import { useTranslation } from 'react-i18next';

import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type {
  AccountEntity,
  AccountGroupEntity,
} from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import {
  useDeleteAccountGroupMutation,
  useUpdateAccountGroupMutation,
} from '#account-groups';
import { useContextMenu } from '#hooks/useContextMenu';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';
import * as bindings from '#spreadsheet/bindings';

import { AccountRow } from './AccountRow';
import { CollapseChevron } from './CollapseChevron';
import { CountPill } from './CountPill';
import { DragHandle } from './DragHandle';
import { SidebarBalance } from './SidebarBalance';
import {
  dropZoneStyle,
  groupLabelStyle,
  rowTransition,
  TREE_COLUMN_GAP,
  TREE_LEAD_COLUMN,
  TREE_ROW_PADDING_LEFT,
  TREE_ROW_PADDING_RIGHT,
  treeFocusRing,
} from './styles';
import { SyncErrorRollup } from './SyncErrorRollup';
import { useTreeItemEditing } from './treeItemEditing';
import { treeKeys } from './treeKeys';

type AccountGroupHeaderProps = {
  group: AccountGroupEntity;
  side: 'on' | 'off';
  accounts: AccountEntity[];
  failedCount: number;
  showSyncDot: boolean;
  isDropZoneActive: boolean;
};

export function AccountGroupHeader({
  group,
  side,
  accounts,
  failedCount,
  showSyncDot,
  isDropZoneActive,
}: AccountGroupHeaderProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useTreeItemEditing(
    treeKeys.group(group.id),
  );
  const updateGroup = useUpdateAccountGroupMutation();
  const deleteGroup = useDeleteAccountGroupMutation();

  const [rowElement, setRowElement] = useState<HTMLDivElement | null>(null);
  useContextMenu({
    triggerRef: { current: rowElement },
    items: [
      {
        name: 'account-group-rename',
        text: t('Rename group'),
        onClick: () => setIsEditing(true),
      },
      {
        name: 'account-group-delete',
        text: t('Delete group'),
        onClick: () =>
          dispatch(
            pushModal({
              modal: {
                name: 'confirm-delete',
                options: {
                  message: t(
                    'Are you sure you want to delete the group "{{name}}"? Any accounts in it will be kept but left ungrouped.',
                    { name: group.name },
                  ),
                  onConfirm: () => deleteGroup.mutate({ id: group.id }),
                },
              },
            }),
          ),
      },
    ],
  });

  const treeState = useContext(TreeStateContext);
  const key = treeKeys.group(group.id);

  return (
    <TreeItem
      ref={setRowElement}
      id={key}
      textValue={group.name}
      onAction={() => treeState?.toggleKey(key)}
      className={css({
        outline: 'none',
        borderRadius: radius.md,
        marginBottom: 1,
        ...(isDropZoneActive && dropZoneStyle),
        '&[data-dragging]': { opacity: 0.5 },
      })}
    >
      <TreeItemContent>
        {({ isExpanded }) => (
          <View
            className={css({
              flexDirection: 'row',
              alignItems: 'center',
              gap: TREE_COLUMN_GAP,
              height: 28,
              paddingLeft: TREE_ROW_PADDING_LEFT,
              paddingRight: TREE_ROW_PADDING_RIGHT,
              borderRadius: radius.md,
              cursor: 'pointer',
              transition: rowTransition,
              '[data-hovered] > &': {
                backgroundColor: theme.sidebarItemBackgroundHover,
              },
              '[data-focus-visible] > &': {
                backgroundColor: theme.sidebarItemBackgroundHover,
                ...treeFocusRing,
              },
            })}
          >
            <Button
              slot="chevron"
              aria-label={
                isExpanded
                  ? t('Collapse {{group}}', { group: group.name })
                  : t('Expand {{group}}', { group: group.name })
              }
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: TREE_LEAD_COLUMN,
                height: TREE_LEAD_COLUMN,
                flexShrink: 0,
                padding: 0,
                border: 'none',
                borderRadius: radius.sm,
                background: 'none',
                color: 'inherit',
                cursor: 'pointer',
                outline: 'none',
                '&[data-focus-visible]': treeFocusRing,
              })}
            >
              <CollapseChevron isOpen={isExpanded} />
            </Button>
            {isEditing ? (
              <InitialFocus>
                <Input
                  aria-label={t('Group name')}
                  style={{ flex: 1, padding: '2px 6px', fontSize: 12.5 }}
                  defaultValue={group.name}
                  onKeyDown={e => e.stopPropagation()}
                  onEnter={newGroupName => {
                    if (newGroupName.trim() !== '') {
                      updateGroup.mutate({ id: group.id, name: newGroupName });
                    }
                    setIsEditing(false);
                  }}
                  onEscape={() => setIsEditing(false)}
                  onBlur={() => setIsEditing(false)}
                />
              </InitialFocus>
            ) : (
              <>
                <Text style={{ ...groupLabelStyle, ...styles.ellipsisText }}>
                  {group.name}
                </Text>
                {!isExpanded && <CountPill count={accounts.length} />}
                <SyncErrorRollup count={failedCount} />
                <View style={{ flex: 1 }} />
                <SidebarBalance
                  binding={bindings.accountGroupBalance(
                    group.id,
                    side === 'off',
                  )}
                  style={{ fontWeight: 500, color: groupLabelStyle.color }}
                />
              </>
            )}
            <DragHandle />
          </View>
        )}
      </TreeItemContent>
      {accounts.map(account => (
        <AccountRow
          key={treeKeys.account(account.id)}
          account={account}
          showSyncDot={showSyncDot}
        />
      ))}
    </TreeItem>
  );
}
