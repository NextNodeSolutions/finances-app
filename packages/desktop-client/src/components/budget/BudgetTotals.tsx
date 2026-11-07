import React, { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import {
  SvgArrowButtonLeft1,
  SvgArrowButtonRight1,
  SvgArrowButtonSingleLeft1,
} from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { elevation, motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { useGlobalPref } from '#hooks/useGlobalPref';

import { RenderMonths } from './RenderMonths';
import { getScrollbarWidth } from './util';

import { useBudgetComponents } from '.';

const headerIconButtonStyle = {
  width: 26,
  height: 26,
  padding: 0,
  borderRadius: radius.md,
  color: 'currentColor',
};

/**
 * The header band: CATEGORY with the column-width toggle, then each
 * month's labelled totals. Hidden categories and expand/collapse live in
 * the toolbar.
 */
export const BudgetTotals = memo(function BudgetTotals() {
  const { t } = useTranslation();
  const [categoryExpandedStatePref, setCategoryExpandedStatePref] =
    useGlobalPref('categoryExpandedState');
  const categoryExpandedState = categoryExpandedStatePref ?? 0;

  const cycleExpandedState = () => {
    const nextState = (categoryExpandedState + 1) % 3;
    setCategoryExpandedStatePref(nextState);
  };

  const getExpandStateLabel = () => {
    switch (categoryExpandedState) {
      case 0:
        return t('Expand');
      case 1:
        return t('Fully Expand');
      case 2:
        return t('Collapse');
      default:
        return t('Expand');
    }
  };

  const { BudgetTotalsComponent: MonthComponent } = useBudgetComponents();

  return (
    <View
      data-testid="budget-totals"
      style={{
        backgroundColor: theme.tableHeaderBackground,
        flexDirection: 'row',
        flexShrink: 0,
        boxShadow: elevation.card,
        marginLeft: 5,
        marginRight: 5 + getScrollbarWidth(),
        border: '1px solid ' + theme.hairline,
        borderRadius: `${radius.lg}px ${radius.lg}px 0 0`,
        overflow: 'hidden',
        '& .hover-visible': {
          opacity: 0,
          transition: `opacity ${motion.base} ${motion.ease}`,
        },
        '&:hover .hover-visible, & .hover-visible:focus-visible': {
          opacity: 1,
        },
      }}
    >
      <View
        style={{
          width: 200 + 100 * categoryExpandedState,
          color: theme.tableHeaderText,
          justifyContent: 'center',
          paddingLeft: 22,
          paddingRight: 6,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <View style={{ flexGrow: '1', ...styles.monoLabel }}>
          <Trans>Category</Trans>
        </View>
        <Button
          variant="bare"
          aria-label={getExpandStateLabel()}
          onPress={cycleExpandedState}
          className="hover-visible"
          style={headerIconButtonStyle}
        >
          {categoryExpandedState === 0 ? (
            <SvgArrowButtonSingleLeft1 style={{ width: 11, height: 11 }} />
          ) : categoryExpandedState === 1 ? (
            <SvgArrowButtonLeft1 style={{ width: 11, height: 11 }} />
          ) : (
            <SvgArrowButtonRight1 style={{ width: 11, height: 11 }} />
          )}
        </Button>
      </View>
      <RenderMonths>
        <MonthComponent />
      </RenderMonths>
    </View>
  );
});
