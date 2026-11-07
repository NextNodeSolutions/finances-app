// @ts-strict-ignore
import React, { memo, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { SvgRightArrow2 } from '@actual-app/components/icons/v0';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { RuleEntity } from '@actual-app/core/types/models';

import { pillStyle } from '#components/schedules/StatusBadge';
import { QuietRowActionButton } from '#components/settings/QuietRowActionButton';
import { Cell, Field, Row, SelectCell } from '#components/table';
import { useContextMenu } from '#hooks/useContextMenu';
import { useSelectedDispatch } from '#hooks/useSelected';
import {
  friendlyOp,
  groupActionsBySplitIndex,
  translateRuleStage,
} from '#util/rule';

import { ActionExpression } from './ActionExpression';
import { ConditionExpression } from './ConditionExpression';
import {
  ARROW_COLUMN_WIDTH,
  EDIT_COLUMN_WIDTH,
  STAGE_COLUMN_WIDTH,
} from './ruleTableColumns';

type RuleRowProps = {
  rule: RuleEntity;
  hovered?: boolean;
  selected?: boolean;
  onHover?: (id: string | null) => void;
  onEditRule?: (rule: RuleEntity) => void;
  onDeleteRule?: (rule: RuleEntity) => void;
};

export const RuleRow = memo(
  ({
    rule,
    hovered,
    selected,
    onHover,
    onEditRule,
    onDeleteRule,
  }: RuleRowProps) => {
    const dispatchSelected = useSelectedDispatch();
    const borderColor = selected ? theme.tableBorderSelected : 'none';
    const backgroundFocus = hovered;

    const actionSplits = groupActionsBySplitIndex(rule.actions);
    const hasSplits = actionSplits.length > 1;

    const hasSchedule = rule.actions.some(({ op }) => op === 'link-schedule');

    const { t } = useTranslation();

    const triggerRef = useRef(null);

    useContextMenu({
      triggerRef,
      items: [
        onEditRule && {
          name: 'edit',
          text: t('Edit'),
          onClick: () => onEditRule(rule),
        },
        onDeleteRule &&
          !hasSchedule && {
            name: 'delete',
            text: t('Delete'),
            onClick: () => onDeleteRule(rule),
          },
      ],
    });

    return (
      <Row
        ref={triggerRef}
        height="auto"
        style={{
          fontSize: 13,
          zIndex: selected ? 101 : 'auto',
          borderColor,
          backgroundColor: selected
            ? theme.tableRowBackgroundHighlight
            : backgroundFocus
              ? theme.tableRowBackgroundHover
              : theme.tableBackground,
        }}
        collapsed
        data-quiet-actions
        onMouseEnter={() => onHover && onHover(rule.id)}
        onMouseLeave={() => onHover && onHover(null)}
      >
        <SelectCell
          exposed={hovered || selected}
          focused
          onSelect={e => {
            dispatchSelected({
              type: 'select',
              id: rule.id,
              isRangeSelect: e.shiftKey,
            });
          }}
          selected={selected}
        />

        <Cell name="stage" width={STAGE_COLUMN_WIDTH} plain>
          <View
            style={{
              alignSelf: 'flex-start',
              margin: `${spacing.md + spacing.xxs}px ${spacing.sm}px`,
              ...pillStyle,
              ...(rule.stage
                ? {
                    backgroundColor: theme.pillBackground,
                    color: theme.pillText,
                  }
                : {
                    backgroundColor: 'transparent',
                    color: theme.pageTextSubdued,
                    boxShadow: `inset 0 0 0 1px ${theme.hairline}`,
                  }),
            }}
          >
            {rule.stage ? translateRuleStage(rule.stage) : t('Default')}
          </View>
        </Cell>

        <Field
          width="flex"
          style={{ padding: `${spacing.md}px 0` }}
          truncate={false}
        >
          <View style={{ alignItems: 'flex-start' }} data-testid="conditions">
            {rule.conditions.map((cond, i) => (
              <ConditionExpression
                key={i}
                field={cond.field}
                op={cond.op}
                inline
                value={cond.value}
                options={cond.options}
                prefix={i > 0 ? friendlyOp(rule.conditionsOp) : null}
                style={i !== 0 && { marginTop: spacing.xs }}
              />
            ))}
          </View>
        </Field>

        <Cell
          name="arrow"
          width={ARROW_COLUMN_WIDTH}
          plain
          style={{ alignItems: 'center' }}
        >
          <SvgRightArrow2
            aria-hidden
            style={{ width: 11, height: 11, color: theme.tableTextLight }}
          />
        </Cell>

        <Field
          width="flex"
          style={{ padding: `${spacing.md}px 0` }}
          truncate={false}
        >
          <View style={{ alignItems: 'flex-start' }} data-testid="actions">
            {hasSplits
              ? actionSplits.map((split, i) => (
                  <View
                    key={split.id}
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      marginTop: i > 0 ? spacing.xs : 0,
                      padding: spacing.sm,
                      borderColor: theme.hairline,
                      borderWidth: '1px',
                      borderRadius: radius.md + 2,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.pageTextLight,
                        fontWeight: 500,
                        marginBottom: 6,
                      }}
                    >
                      {i ? t('Split {{num}}', { num: i }) : t('Apply to all')}
                    </Text>
                    {split.actions.map((action, j) => (
                      <ActionExpression
                        key={j}
                        {...action}
                        style={j !== 0 && { marginTop: spacing.xs }}
                      />
                    ))}
                  </View>
                ))
              : rule.actions.map((action, i) => (
                  <ActionExpression
                    key={i}
                    {...action}
                    style={i !== 0 && { marginTop: spacing.xs }}
                  />
                ))}
          </View>
        </Field>

        <Cell
          name="edit"
          width={EDIT_COLUMN_WIDTH}
          plain
          style={{ alignItems: 'flex-end', paddingRight: spacing.lg }}
        >
          <QuietRowActionButton onPress={() => onEditRule(rule)}>
            <Trans>Edit</Trans>
          </QuietRowActionButton>
        </Cell>
      </Row>
    );
  },
);

RuleRow.displayName = 'RuleRow';
