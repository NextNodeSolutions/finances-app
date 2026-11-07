import React from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { RuleConditionEntity } from '@actual-app/core/types/models';

import { FieldSelect } from '#components/rules/RuleEditor';

export function ConditionsOpMenu({
  conditionsOp,
  onChange,
  conditions,
}: {
  conditionsOp: 'and' | 'or';
  onChange: (value: 'and' | 'or') => void;
  conditions: RuleConditionEntity[];
}) {
  return conditions.length > 1 ? (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        // Same height and offset as the filter pills, so the label sits on
        // their centre line.
        height: 24,
        marginTop: 10,
        marginRight: 8,
        color: theme.pageTextLight,
        fontSize: 12.5,
      }}
    >
      <FieldSelect
        style={{ display: 'inline-flex' }}
        fields={[
          ['and', 'all'],
          ['or', 'any'],
        ]}
        value={conditionsOp}
        onChange={onChange}
      />
      <Text>of:</Text>
    </View>
  ) : (
    <View />
  );
}
