import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { AccountEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { AccountTree } from './AccountTree';
import { CollapseChevron } from './CollapseChevron';
import { CountPill } from './CountPill';
import {
  rowTransition,
  sectionLabelStyle,
  TREE_COLUMN_GAP,
  TREE_LEAD_COLUMN,
  TREE_ROW_PADDING_LEFT,
  TREE_ROW_PADDING_RIGHT,
  treeFocusRing,
} from './styles';

type ClosedSectionProps = {
  accounts: AccountEntity[];
  isOpen: boolean;
  onToggle: () => void;
  isDragDisabled: boolean;
};

export function ClosedSection({
  accounts,
  isOpen,
  onToggle,
  isDragDisabled,
}: ClosedSectionProps) {
  const { t } = useTranslation();

  if (accounts.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: spacing.xs }}>
      <Button
        variant="bare"
        aria-expanded={isOpen}
        onPress={onToggle}
        className={css({
          transition: rowTransition,
          '&[data-hovered]': {
            backgroundColor: theme.sidebarItemBackgroundHover,
          },
          '&[data-focus-visible]': treeFocusRing,
        })}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: TREE_COLUMN_GAP,
          height: 30,
          paddingLeft: TREE_ROW_PADDING_LEFT,
          paddingRight: TREE_ROW_PADDING_RIGHT,
          borderRadius: radius.md,
          width: '100%',
        }}
      >
        <View
          style={{
            width: TREE_LEAD_COLUMN,
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <CollapseChevron isOpen={isOpen} />
        </View>
        <Text style={{ ...sectionLabelStyle, color: theme.sidebarTextMuted }}>
          <Trans>Closed</Trans>
        </Text>
        {!isOpen && <CountPill count={accounts.length} />}
      </Button>
      {isOpen && (
        <AccountTree
          label={t('Closed accounts')}
          side="closed"
          buckets={[{ group: null, accounts, failedCount: 0 }]}
          showSyncDot={false}
          isDragDisabled={isDragDisabled}
        />
      )}
    </View>
  );
}
