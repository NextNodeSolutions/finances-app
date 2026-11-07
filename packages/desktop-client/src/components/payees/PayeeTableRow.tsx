// @ts-strict-ignore
import { memo, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import {
  SvgArrowThinRight,
  SvgBookmark,
  SvgCheveronRight,
  SvgLightBulb,
} from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';
import { motion } from '@actual-app/components/tokens';
import { Tooltip } from '@actual-app/components/tooltip';
import type { PayeeEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { pillStyle } from '#components/schedules/StatusBadge';
import {
  Cell,
  CellButton,
  CustomCell,
  InputCell,
  Row,
  SelectCell,
} from '#components/table';
import { useContextMenu } from '#hooks/useContextMenu';
import { useSelectedDispatch, useSelectedItems } from '#hooks/useSelected';
import { useSyncedPref } from '#hooks/useSyncedPref';

import { PayeeRuleCountLabel } from './PayeeRuleCountLabel';
import {
  DETAILS_COLUMN_WIDTH,
  ICON_COLUMN_WIDTH,
  RULES_COLUMN_WIDTH,
} from './payeeTableColumns';
import { PayeeTransactionCountCell } from './PayeeTransactionCountCell';

type RuleButtonProps = {
  ruleCount: number;
  focused: boolean;
  onEdit: () => void;
  onClick: () => void;
};

function RuleButton({ ruleCount, focused, onEdit, onClick }: RuleButtonProps) {
  return (
    <Cell
      name="rule-count"
      width={RULES_COLUMN_WIDTH}
      focused={focused}
      style={{ padding: '0 10px', alignItems: 'flex-start' }}
      plain
    >
      <CellButton
        style={{
          ...pillStyle,
          gap: 6,
          border: '1px solid transparent',
          cursor: 'pointer',
          transition: `background-color ${motion.base} ${motion.ease}, color ${motion.base} ${motion.ease}`,
          ...(ruleCount > 0
            ? { backgroundColor: theme.pillBackground, color: theme.pillText }
            : { backgroundColor: 'transparent', color: theme.pageTextLight }),
          ':hover': {
            backgroundColor: theme.buttonNormalBackgroundHover,
            borderColor: theme.hairlineStrong,
            color: theme.pageText,
          },
        }}
        onEdit={onEdit}
        onSelect={onClick}
      >
        <PayeeRuleCountLabel count={ruleCount} />
        <SvgArrowThinRight style={{ width: 8, height: 8 }} />
      </CellButton>
    </Cell>
  );
}

type EditablePayeeFields = keyof Pick<
  PayeeEntity,
  'name' | 'favorite' | 'learn_categories'
>;

type PayeeTableRowProps = {
  payee: PayeeEntity;
  ruleCount: number;
  /** Null while the counts load. */
  transactionCount: number | null;
  selected: boolean;
  hovered: boolean;
  editing: boolean;
  focusedField: string;
  onHover?: (id: PayeeEntity['id']) => void;
  onEdit: (id: PayeeEntity['id'], field: string) => void;
  onUpdate: <T extends EditablePayeeFields>(
    id: PayeeEntity['id'],
    field: T,
    value: PayeeEntity[T],
  ) => void;
  onDelete: (ids: PayeeEntity['id'][]) => void;
  onViewRules: (id: PayeeEntity['id']) => void;
  onCreateRule: (id: PayeeEntity['id']) => void;
  onOpenDetails: (id: PayeeEntity['id']) => void;
  style?: CSSProperties;
};

export const PayeeTableRow = memo(
  ({
    payee,
    ruleCount,
    transactionCount,
    selected,
    hovered,
    editing,
    focusedField,
    onViewRules,
    onCreateRule,
    onOpenDetails,
    onHover,
    onDelete,
    onEdit,
    onUpdate,
    style,
  }: PayeeTableRowProps) => {
    const { id } = payee;
    const dispatchSelected = useSelectedDispatch();
    const selectedItems = useSelectedItems();
    const selectedIds = useMemo(() => {
      const ids =
        selectedItems && selectedItems.size > 0 ? selectedItems : [payee.id];
      return Array.from(new Set(ids));
    }, [payee, selectedItems]);

    const borderColor = selected
      ? theme.tableBorderSelected
      : theme.tableBorder;
    const backgroundFocus = hovered || focusedField === 'select';
    const [learnCategories = 'true'] = useSyncedPref('learn-categories');
    const isLearnCategoriesEnabled = String(learnCategories) === 'true';

    const { t } = useTranslation();

    const triggerRef = useRef(null);
    useContextMenu({
      triggerRef,
      items: [
        {
          name: 'details',
          text: t('Details'),
          onClick: () => onOpenDetails(id),
        },
        {
          name: 'delete',
          text: t('Delete'),
          onClick: () => onDelete(selectedIds),
          hidden: payee.transfer_acct != null,
        },
        {
          name: 'favorite',
          text: payee.favorite ? t('Unfavorite') : t('Favorite'),
          onClick: () =>
            selectedIds.forEach(id =>
              onUpdate(id, 'favorite', !payee.favorite),
            ),
          hidden: payee.transfer_acct != null,
        },
        {
          name: 'view-rules',
          text: t('View rules'),
          onClick: () => onViewRules(id),
          hidden: !ruleCount,
        },
        {
          name: 'create-rule',
          text: t('Create rule'),
          onClick: () => onCreateRule(id),
          hidden: selectedIds.length !== 1,
        },
        {
          name: 'learn',
          text: payee.learn_categories
            ? t('Disable learning')
            : t('Enable learning'),
          onClick: () =>
            selectedIds.forEach(id =>
              onUpdate(id, 'learn_categories', !payee.learn_categories),
            ),
          hidden: !isLearnCategoriesEnabled,
        },
      ],
    });

    return (
      <Row
        ref={triggerRef}
        style={{
          alignItems: 'stretch',
          ...style,
          borderColor,
          backgroundColor: hovered
            ? theme.tableRowBackgroundHover
            : selected
              ? theme.tableRowBackgroundHighlight
              : backgroundFocus
                ? theme.tableRowBackgroundHover
                : theme.tableBackground,
          ...(selected && {
            backgroundColor: theme.tableRowBackgroundHighlight,
            zIndex: 100,
          }),
        }}
        data-focus-key={payee.id}
        onMouseEnter={() => onHover && onHover(payee.id)}
      >
        <SelectCell
          exposed={
            payee.transfer_acct == null && (hovered || selected || editing)
          }
          focused={focusedField === 'select'}
          selected={selected}
          onSelect={e => {
            if (payee.transfer_acct != null) {
              return;
            }
            dispatchSelected({
              type: 'select',
              id: payee.id,
              isRangeSelect: e.shiftKey,
            });
          }}
        />
        <CustomCell
          width={ICON_COLUMN_WIDTH}
          exposed={!payee.transfer_acct}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          {() => {
            return (
              <>
                {payee.favorite ? (
                  <SvgBookmark
                    style={{ width: 10, color: theme.pageTextLight }}
                  />
                ) : null}
                {isLearnCategoriesEnabled && !payee.learn_categories && (
                  <Tooltip content={t('Category learning disabled')}>
                    <SvgLightBulb
                      style={{ color: theme.warningText, width: 10 }}
                    />
                  </Tooltip>
                )}
              </>
            );
          }}
        </CustomCell>
        <InputCell
          value={(payee.transfer_acct ? t('Transfer: ') : '') + payee.name}
          valueStyle={
            (!selected &&
              payee.transfer_acct && { color: theme.pageTextSubdued }) ||
            (!selected && !payee.transfer_acct && { color: theme.tableText }) ||
            (selected && { color: theme.tableTextSelected })
          }
          exposed={focusedField === 'name'}
          width="flex"
          onUpdate={value =>
            !payee.transfer_acct && onUpdate(id, 'name', value)
          }
          onExpose={() => onEdit(id, 'name')}
          inputProps={{ readOnly: !!payee.transfer_acct }}
        />
        <PayeeTransactionCountCell count={transactionCount} />
        <RuleButton
          ruleCount={ruleCount}
          focused={focusedField === 'rule-count'}
          onEdit={() => onEdit(id, 'rule-count')}
          onClick={() =>
            ruleCount > 0 ? onViewRules(payee.id) : onCreateRule(payee.id)
          }
        />
        <Cell
          name="details"
          width={DETAILS_COLUMN_WIDTH}
          plain
          style={{ alignItems: 'center' }}
        >
          <Button
            variant="bare"
            aria-label={t('Payee details')}
            onPress={() => onOpenDetails(id)}
            className={css({
              width: 26,
              height: 26,
              padding: 0,
              color: theme.pageTextLight,
              opacity: hovered || selected ? 1 : 0,
              transition: `opacity ${motion.fast} ${motion.ease}`,
              '&[data-focus-visible]': { opacity: 1 },
            })}
          >
            <SvgCheveronRight width={12} height={12} />
          </Button>
        </Cell>
      </Row>
    );
  },
);

PayeeTableRow.displayName = 'PayeeTableRow';
