// @ts-strict-ignore
import React, { useRef } from 'react';
import type { CSSProperties, Ref } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import {
  SvgCheveronDown,
  SvgInformationOutline,
} from '@actual-app/components/icons/v1';
import { TextOneLine } from '@actual-app/components/text-one-line';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { InputCell } from '#components/table';
import { useContextMenu } from '#hooks/useContextMenu';
import { useGlobalPref } from '#hooks/useGlobalPref';

import { SidebarCategoryButtons } from './SidebarCategoryButtons';

// Shown while the row is hovered or holds focus, and when it has focus
// itself; transparent rather than removed so the keyboard still reaches it.
const detailsButtonClassName = css({
  opacity: 0,
  transition: `opacity ${motion.base} ${motion.ease}`,
  '[data-testid="row"]:hover &, [data-testid="row"]:focus-within &, &[data-focus-visible]':
    { opacity: 1 },
});

type SidebarCategoryProps = {
  innerRef: Ref<HTMLDivElement>;
  category: CategoryEntity;
  categoryGroup?: CategoryGroupEntity;
  dragPreview?: boolean;
  dragging?: boolean;
  goalsShown?: boolean;
  style?: CSSProperties;
  borderColor?: string;
  isLast?: boolean;
  onEditName: (id: CategoryEntity['id']) => void;
  onSave: (category: CategoryEntity) => void;
  onHideNewCategory?: () => void;
  /** Opens the category's details panel; without it there is no Details. */
  onOpenDetails?: (id: CategoryEntity['id']) => void;
} & (
  | {
      editing: true;
      onDelete?: never;
    }
  | {
      editing: boolean;
      onDelete: (id: CategoryEntity['id']) => void;
    }
);

export function SidebarCategory({
  innerRef,
  category,
  categoryGroup,
  dragPreview,
  dragging,
  editing,
  goalsShown = false,
  style,
  isLast,
  onEditName,
  onSave,
  onDelete,
  onHideNewCategory,
  onOpenDetails,
}: SidebarCategoryProps) {
  const { t } = useTranslation();
  const [categoryExpandedStatePref] = useGlobalPref('categoryExpandedState');
  const categoryExpandedState = categoryExpandedStatePref ?? 0;

  const temporary = category.id === 'new';
  const triggerRef = useRef(null);
  const { handleContextMenu } = useContextMenu({
    triggerRef,
    items: [
      onOpenDetails && {
        name: 'details',
        text: t('Details'),
        onClick: () => onOpenDetails(category.id),
      },
      {
        name: 'rename',
        text: t('Rename'),
        onClick: () => onEditName(category.id),
      },
      !categoryGroup?.hidden && {
        name: 'toggle-visibility',
        text: category.hidden ? t('Show') : t('Hide'),
        onClick: () => onSave({ ...category, hidden: !category.hidden }),
      },
      {
        name: 'delete',
        text: t('Delete'),
        onClick: () => onDelete(category.id),
      },
    ],
  });

  const displayed = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        opacity: category.hidden || categoryGroup?.hidden ? 0.33 : undefined,
        backgroundColor: 'transparent',
        height: 20,
      }}
      ref={triggerRef}
    >
      <TextOneLine
        data-testid="category-name"
        style={{ color: theme.tableText }}
      >
        {category.name}
      </TextOneLine>
      <View style={{ flexShrink: 0, marginLeft: 5 }}>
        <Button
          variant="bare"
          className="hover-visible"
          style={{
            color: theme.pageTextLight,
            padding: 3,
            borderRadius: radius.sm,
          }}
          onPress={handleContextMenu}
        >
          <SvgCheveronDown
            width={13}
            height={13}
            style={{ color: 'currentColor' }}
          />
        </Button>
      </View>
      <SidebarCategoryButtons
        category={category}
        dragging={dragging}
        goalsShown={goalsShown}
      />
      {onOpenDetails && !temporary && (
        <Button
          variant="bare"
          className={detailsButtonClassName}
          aria-label={t('Category details')}
          onPress={() => onOpenDetails(category.id)}
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            marginLeft: 2,
            padding: 0,
            color: theme.pageTextLight,
            borderRadius: radius.sm,
          }}
        >
          <SvgInformationOutline
            width={13}
            height={13}
            style={{ color: 'currentColor' }}
          />
        </Button>
      )}
    </View>
  );

  return (
    <View
      innerRef={innerRef}
      style={{
        width: 200 + 100 * categoryExpandedState,
        overflow: 'hidden',
        '& .hover-visible': {
          display: 'none',
        },
        ...(!dragging &&
          !dragPreview && {
            '&:hover .hover-visible, &:focus-within .hover-visible': {
              display: 'flex',
            },
          }),
        ...(dragging && { color: theme.pageTextSubdued }), //always visible color
        // The zIndex here forces the the view on top of a row below
        // it that may be "collapsed" and show a border on top
        ...(dragPreview && {
          backgroundColor: theme.budgetCurrentMonth,
          zIndex: 10000,
          borderRadius: 6,
          overflow: 'hidden',
        }),
        ...style,
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onEditName(null);
          e.stopPropagation();
        }
      }}
    >
      <InputCell
        value={category.name}
        formatter={() => displayed}
        width="flex"
        exposed={editing || temporary}
        onUpdate={value => {
          if (temporary) {
            if (value === '') {
              onHideNewCategory();
            } else if (value !== '') {
              onSave({ ...category, name: value });
            }
          } else {
            if (value !== category.name) {
              onSave({ ...category, name: value });
            }
          }
        }}
        onBlur={() => onEditName(null)}
        style={{ paddingLeft: 17, ...(isLast && { borderBottomWidth: 0 }) }}
        inputProps={{
          placeholder: temporary ? t('New category name') : '',
        }}
      />
    </View>
  );
}
