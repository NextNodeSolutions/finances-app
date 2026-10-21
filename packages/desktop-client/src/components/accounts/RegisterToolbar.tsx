import type { RefObject } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import { SvgCog } from '@actual-app/components/icons/v1';
import {
  SvgArrowsExpand3,
  SvgArrowsShrink3,
} from '@actual-app/components/icons/v2';
import { theme } from '@actual-app/components/theme';
import { motion, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { RuleConditionEntity } from '@actual-app/core/types/models';

import { Search } from '#components/common/Search';
import { FilterButton } from '#components/filters/FiltersMenu';

import {
  headerIconButtonStyle,
  headerIconStyle,
  headerLabelIconStyle,
} from './headerStyles';

type RegisterToolbarProps = {
  searchInputRef: RefObject<HTMLInputElement | null>;
  search: string;
  /** True while a bulk action runs. */
  isWorking: boolean;
  areSplitsCollapsed: boolean;
  onSearch: (search: string) => void;
  onApplyFilter: (filter: RuleConditionEntity) => void;
  onToggleSplits: () => void;
  onManageColumns: () => void;
};

/** Search and filter on the left; split mode and columns on the right. */
export function RegisterToolbar({
  searchInputRef,
  search,
  isWorking,
  areSplitsCollapsed,
  onSearch,
  onApplyFilter,
  onToggleSplits,
  onManageColumns,
}: RegisterToolbarProps) {
  const { t } = useTranslation();
  const splitsLabel = areSplitsCollapsed
    ? t('Collapse split transactions')
    : t('Expand split transactions');

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
    >
      <Search
        placeholder={t('Search')}
        value={search}
        onChange={onSearch}
        ref={searchInputRef}
        width={240}
        height={30}
        style={{
          borderColor: theme.formInputBorder,
          borderRadius: radius.md,
          backgroundColor: theme.formInputBackground,
          transition: `border-color ${motion.base} ${motion.ease}, box-shadow ${motion.base} ${motion.ease}`,
          ':hover': { borderColor: theme.hairlineStrong },
          ':focus-within': {
            borderColor: theme.formInputBorderSelected,
            boxShadow: '0 0 0 3px ' + theme.formInputShadowSelected,
          },
        }}
      />
      <View style={{ flexShrink: 0 }}>
        <FilterButton onApply={onApplyFilter} compact={false} hover={false} />
      </View>
      <View style={{ flex: 1 }} />
      {isWorking && <AnimatedLoading style={{ width: 16, height: 16 }} />}
      <Button
        variant="bare"
        aria-label={splitsLabel}
        style={headerIconButtonStyle}
        onPress={onToggleSplits}
      >
        <View title={splitsLabel}>
          {areSplitsCollapsed ? (
            <SvgArrowsShrink3 style={headerIconStyle} />
          ) : (
            <SvgArrowsExpand3 style={headerIconStyle} />
          )}
        </View>
      </Button>
      <Button
        variant="bare"
        onPress={onManageColumns}
        style={{ gap: 6, color: theme.pageTextLight }}
      >
        <Trans>Columns</Trans>
        <SvgCog style={headerLabelIconStyle} />
      </Button>
    </View>
  );
}
