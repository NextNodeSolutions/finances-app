import React from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import {
  SvgArrowButtonDown1,
  SvgArrowButtonUp1,
} from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { NotesButton } from '#components/NotesButton';
import { useLocale } from '#hooks/useLocale';

import { summaryIconButtonStyle } from './SummaryCard';

type SummaryHeaderProps = {
  month: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  // Trailing actions, typically the month menu button and its popover.
  children: ReactNode;
};

// Month title engraved in the display serif, the year as a quiet mono
// label, then the card's bare actions.
export function SummaryHeader({
  month,
  isCollapsed,
  onToggleCollapse,
  children,
}: SummaryHeaderProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  const ExpandOrCollapseIcon = isCollapsed
    ? SvgArrowButtonDown1
    : SvgArrowButtonUp1;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View
        style={{
          flex: 1,
          minWidth: 0,
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        <Text
          style={{
            ...styles.display,
            ...styles.ellipsisText,
            fontSize: 22,
            lineHeight: '28px',
            color: theme.pageText,
          }}
        >
          {monthUtils.format(month, 'MMMM', locale)}
        </Text>
        <Text
          style={{
            ...styles.monoLabel,
            color: theme.tableHeaderText,
            flexShrink: 0,
          }}
        >
          {monthUtils.format(month, 'yyyy', locale)}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flexShrink: 0,
          marginRight: -6,
          userSelect: 'none',
        }}
      >
        <Button
          variant="bare"
          aria-label={
            isCollapsed
              ? t('Expand month summary')
              : t('Collapse month summary')
          }
          className="hover-visible"
          onPress={onToggleCollapse}
          style={summaryIconButtonStyle}
        >
          <ExpandOrCollapseIcon width={12} height={12} />
        </Button>
        <NotesButton
          id={`budget-${month}`}
          width={14}
          height={14}
          tooltipPosition="bottom right"
          defaultColor={theme.pageTextLight}
          style={summaryIconButtonStyle}
        />
        {children}
      </View>
    </View>
  );
}
