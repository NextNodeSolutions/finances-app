// @ts-strict-ignore
import React, { memo, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { SvgRightArrow2 } from '@actual-app/components/icons/v0';
import { SpaceBetween } from '@actual-app/components/space-between';
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

        <Cell name="stage" width={50} plain style={{ color: theme.tableText }}>
          {rule.stage && (
            <View
              style={{
                alignSelf: 'flex-start',
                margin: `${spacing.md + spacing.xxs}px ${spacing.xs}px`,
                ...pillStyle,
                backgroundColor: theme.pillBackground,
                color: theme.pillText,
              }}
            >
              {translateRuleStage(rule.stage)}
            </View>
          )}
        </Cell>

        <Field
          width="flex"
          style={{ padding: `${spacing.md}px 0` }}
          truncate={false}
        >
          <SpaceBetween gap={spacing.md} style={{ alignItems: 'center' }}>
            <View
              style={{ flex: 1, alignItems: 'flex-start' }}
              data-testid="conditions"
            >
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

            <Text>
              <SvgRightArrow2
                style={{ width: 11, height: 11, color: theme.tableTextLight }}
              />
            </Text>

            <View
              style={{ flex: 1, alignItems: 'flex-start' }}
              data-testid="actions"
            >
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
          </SpaceBetween>
        </Field>

        <Cell name="edit" plain style={{ padding: '0 15px', paddingLeft: 5 }}>
          <QuietRowActionButton onPress={() => onEditRule(rule)}>
            <Trans>Edit</Trans>
          </QuietRowActionButton>
        </Cell>
      </Row>
    );
  },
);

RuleRow.displayName = 'RuleRow';
