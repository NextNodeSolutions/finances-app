import { useTranslation } from 'react-i18next';
import { useMatch } from 'react-router';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { Link } from '#components/common/Link';
import type { Binding } from '#spreadsheet';

import { AccountTree } from './AccountTree';
import { CollapseChevron } from './CollapseChevron';
import { CountPill } from './CountPill';
import { SidebarBalance } from './SidebarBalance';
import {
  rowTransition,
  sectionLabelStyle,
  TREE_COLUMN_GAP,
  TREE_LEAD_COLUMN,
  TREE_ROW_PADDING_LEFT,
  TREE_ROW_PADDING_RIGHT,
  treeFocusRing,
} from './styles';
import { SyncErrorRollup } from './SyncErrorRollup';
import type { GroupBucket, SidebarAccountSide } from './useSidebarAccountTree';

type SideGroupProps = {
  label: string;
  side: 'on' | 'off';
  showSyncDot: boolean;
  sideData: SidebarAccountSide;
  totalBinding: Binding<
    'account',
    'onbudget-accounts-balance' | 'offbudget-accounts-balance'
  >;
  balanceTestId: string;
  isOpen: boolean;
  onToggle: () => void;
  isDragDisabled: boolean;
  isBucketOpen: (bucket: GroupBucket) => boolean;
  onToggleBucket: (bucket: GroupBucket) => void;
};

export function SideGroup({
  label,
  side,
  showSyncDot,
  sideData,
  totalBinding,
  balanceTestId,
  isOpen,
  onToggle,
  isDragDisabled,
  isBucketOpen,
  onToggleBucket,
}: SideGroupProps) {
  const { t } = useTranslation();
  const to = side === 'on' ? '/accounts/onbudget' : '/accounts/offbudget';
  const isActive = useMatch({ path: to, end: true }) !== null;

  return (
    <View style={{ marginTop: spacing.xs }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: TREE_COLUMN_GAP,
          height: 30,
          paddingLeft: TREE_ROW_PADDING_LEFT,
          paddingRight: TREE_ROW_PADDING_RIGHT,
          borderRadius: radius.md,
          backgroundColor: isActive
            ? theme.sidebarItemBackgroundSelected
            : 'transparent',
          transition: rowTransition,
        }}
      >
        <Button
          variant="bare"
          aria-expanded={isOpen}
          aria-label={
            isOpen
              ? t('Collapse {{section}}', { section: label })
              : t('Expand {{section}}', { section: label })
          }
          onPress={onToggle}
          className={css({
            width: TREE_LEAD_COLUMN,
            height: TREE_LEAD_COLUMN,
            padding: 0,
            flexShrink: 0,
            borderRadius: radius.sm,
            transition: rowTransition,
            '&[data-hovered]': {
              backgroundColor: theme.sidebarItemBackgroundHover,
            },
            '&[data-focus-visible]': treeFocusRing,
          })}
        >
          <CollapseChevron isOpen={isOpen} />
        </Button>
        <Link
          variant="internal"
          to={to}
          isExactPathMatch
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs + spacing.xxs,
            flex: 1,
            minWidth: 0,
            alignSelf: 'stretch',
            borderRadius: radius.sm,
            textDecoration: 'none',
            color: theme.sidebarHeaderText,
            transition: rowTransition,
            ':hover': { color: theme.sidebarItemTextSelected },
            ':focus-visible': treeFocusRing,
          }}
          activeStyle={{ color: theme.sidebarItemTextSelected }}
        >
          <Text style={sectionLabelStyle}>{label}</Text>
          {!isOpen && <CountPill count={sideData.accountCount} />}
          <SyncErrorRollup count={sideData.failedCount} />
          <View style={{ flex: 1 }} />
          <SidebarBalance
            binding={totalBinding}
            testId={balanceTestId}
            style={{ fontWeight: 500, color: 'inherit' }}
          />
        </Link>
      </View>
      {isOpen && (
        <AccountTree
          label={label}
          side={side}
          buckets={sideData.buckets}
          showSyncDot={showSyncDot}
          isDragDisabled={isDragDisabled}
          isBucketOpen={isBucketOpen}
          onToggleBucket={onToggleBucket}
        />
      )}
    </View>
  );
}
