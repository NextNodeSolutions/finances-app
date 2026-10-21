import React, { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDelete } from '@actual-app/components/icons/v0';
import { Popover } from '@actual-app/components/popover';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { RuleConditionEntity } from '@actual-app/core/types/models';

import { Value } from '#components/rules/Value';
import { friendlyOp, mapField } from '#util/rule';

import { FilterEditor } from './FiltersMenu';
import { subfieldFromFilter } from './subfieldFromFilter';

let isDatepickerClick = false;

// The delete button and its 1px right margin; the label may take the rest
// of the pill without being clipped.
const DELETE_BUTTON_SIZE = 22;
const DELETE_BUTTON_SPACE = DELETE_BUTTON_SIZE + 1;

type FilterExpressionProps<T extends RuleConditionEntity> = {
  field: T['field'];
  customName: T['customName'];
  op: T['op'];
  value: T['value'];
  options: T['options'];
  style?: CSSProperties;
  onChange: (cond: T) => void;
  onDelete: () => void;
};

export function FilterExpression<T extends RuleConditionEntity>({
  field: originalField,
  customName,
  op,
  value,
  options,
  style,
  onChange,
  onDelete,
}: FilterExpressionProps<T>) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const triggerRef = useRef(null);

  const field = subfieldFromFilter({ field: originalField, value });

  return (
    <View
      style={{
        ...styles.editorPill,
        padding: 0,
        border: '1px solid ' + theme.pillBorder,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 6,
        marginTop: 10,
        ...style,
      }}
    >
      <Button
        ref={triggerRef}
        variant="bare"
        isDisabled={customName != null}
        onPress={() => setEditing(true)}
        style={{
          maxWidth: `calc(100% - ${DELETE_BUTTON_SPACE}px)`,
          whiteSpace: 'nowrap',
          display: 'block',
          padding: '3px 2px 3px 8px',
          borderRadius: `${radius.sm}px 0 0 ${radius.sm}px`,
          fontSize: 12.5,
        }}
      >
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {customName ? (
            <Text style={{ color: theme.pillText, fontWeight: 500 }}>
              {customName}
            </Text>
          ) : (
            <>
              <Text style={{ color: theme.pillText, fontWeight: 500 }}>
                {mapField(field, options)}
              </Text>{' '}
              <Text style={{ color: theme.pageTextLight }}>
                {friendlyOp(op, null)}
              </Text>{' '}
              {!['onbudget', 'offbudget'].includes(op?.toLocaleLowerCase()) && (
                <Value
                  value={value}
                  field={field}
                  inline
                  valueIsRaw={
                    op === 'contains' ||
                    op === 'matches' ||
                    op === 'doesNotContain' ||
                    op === 'hasTags' ||
                    op === 'hasAnyTag'
                  }
                />
              )}
            </>
          )}
        </div>
      </Button>
      <Button
        variant="bare"
        onPress={onDelete}
        aria-label={t('Delete filter')}
        style={{
          width: DELETE_BUTTON_SIZE,
          height: DELETE_BUTTON_SIZE,
          padding: 0,
          marginRight: DELETE_BUTTON_SPACE - DELETE_BUTTON_SIZE,
          borderRadius: radius.xs,
          color: theme.pageTextLight,
        }}
      >
        <SvgDelete style={{ width: 7, height: 7 }} />
      </Button>

      <Popover
        triggerRef={triggerRef}
        placement="bottom start"
        isOpen={editing}
        onOpenChange={() => setEditing(false)}
        shouldCloseOnInteractOutside={element => {
          // Datepicker selections for some reason register 2x clicks
          // We want to keep the popover open after selecting a date.
          // So we ignore the "close" event on selection + the subsequent event.
          if (element instanceof HTMLElement && element.dataset.pikaYear) {
            isDatepickerClick = true;
            return false;
          }
          if (isDatepickerClick) {
            isDatepickerClick = false;
            return false;
          }

          if (
            element instanceof HTMLElement &&
            (element.closest('[data-testid="account-autocomplete-modal"]') ||
              element.closest('[data-testid="payee-autocomplete-modal"]') ||
              element.closest('[data-testid="category-autocomplete-modal"]'))
          ) {
            return false;
          }

          return true;
        }}
        style={{
          width: 288,
          padding: 16,
          color: theme.menuItemText,
          zIndex: '2500 !important',
        }}
        data-testid="filters-menu-tooltip"
      >
        <FilterEditor
          field={originalField}
          op={op}
          value={value}
          options={options}
          onSave={onChange}
          onClose={() => setEditing(false)}
        />
      </Popover>
    </View>
  );
}
