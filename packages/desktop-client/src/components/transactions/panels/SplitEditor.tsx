import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgAdd } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { PanelField } from './PanelField';
import { SplitLine } from './SplitLine';
import { SplitRemaining } from './SplitRemaining';
import type { TransactionDraft } from './useTransactionDraft';

type SplitEditorProps = {
  draft: TransactionDraft;
  isDisabled: boolean;
};

/**
 * Splits a transaction into categories. It cannot be saved until the lines
 * add up to the total (REMAINING 0.00).
 */
export function SplitEditor({ draft, isDisabled }: SplitEditorProps) {
  const { t } = useTranslation();

  if (draft.remaining === null) {
    return (
      <PanelField label={t('Split')}>
        <Button
          variant="bare"
          isDisabled={isDisabled}
          onPress={draft.split}
          style={{ alignSelf: 'flex-start', gap: spacing.xs }}
        >
          <SvgAdd width={9} height={9} />
          <Trans>Split into categories</Trans>
        </Button>
      </PanelField>
    );
  }

  return (
    <View style={{ gap: spacing.sm, paddingBlock: spacing.xs }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
          <Trans>Split</Trans>
        </Text>
        <Button
          variant="bare"
          isDisabled={isDisabled}
          onPress={draft.addLine}
          style={{ gap: spacing.xs }}
        >
          <SvgAdd width={9} height={9} />
          <Trans>Add line</Trans>
        </Button>
      </View>
      {draft.lines.map((line, index) => (
        <SplitLine
          key={line.id}
          line={line}
          position={index + 1}
          direction={draft.direction}
          isDisabled={isDisabled}
          onChange={patch => draft.setLine(line.id, patch)}
          onRemove={() => draft.removeLine(line.id)}
        />
      ))}
      <SplitRemaining remaining={draft.remaining} />
    </View>
  );
}
