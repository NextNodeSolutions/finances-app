import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgCheveronDown } from '@actual-app/components/icons/v1';
import { Popover } from '@actual-app/components/popover';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';

import { useLocale } from '#hooks/useLocale';

import { formatMonthRangeTitle } from './budgetMonths';
import { MonthPicker } from './MonthPicker';
import type { MonthBounds } from './MonthsContext';

type BudgetMonthTitleProps = {
  startMonth: string;
  numMonths: number;
  monthBounds: MonthBounds;
  onMonthSelect: (month: string) => void;
};

const PICKER_WIDTH = 640;

/** "October 2026" (or a range in compare mode), opening the month picker. */
export function BudgetMonthTitle({
  startMonth,
  numMonths,
  monthBounds,
  onMonthSelect,
}: BudgetMonthTitleProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        ref={triggerRef}
        variant="bare"
        data-testid="selected-budget-month"
        data-month={startMonth}
        aria-label={t('Choose month: {{title}}', {
          title: formatMonthRangeTitle(startMonth, numMonths, locale),
        })}
        onPress={() => setIsOpen(true)}
        style={{ gap: spacing.sm, padding: '0 6px', marginLeft: -6 }}
      >
        <span
          style={{
            ...styles.display,
            fontSize: 28,
            lineHeight: '36px',
            color: theme.pageTextDark,
            whiteSpace: 'nowrap',
          }}
        >
          {formatMonthRangeTitle(startMonth, numMonths, locale)}
        </span>
        <SvgCheveronDown
          width={12}
          height={12}
          style={{ color: theme.pageTextLight }}
        />
      </Button>
      <Popover
        triggerRef={triggerRef}
        placement="bottom start"
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(false)}
        style={{
          width: PICKER_WIDTH,
          padding: `${spacing.xl}px ${spacing.md}px ${spacing.md}px`,
        }}
      >
        <MonthPicker
          startMonth={startMonth}
          numDisplayed={numMonths}
          monthBounds={monthBounds}
          style={{}}
          onSelect={month => {
            setIsOpen(false);
            onMonthSelect(month);
          }}
        />
      </Popover>
    </>
  );
}
