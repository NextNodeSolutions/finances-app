import { HotkeysProvider } from 'react-hotkeys-hook';

import * as monthUtils from '@actual-app/core/shared/months';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useBudgetHotkeys } from './useBudgetHotkeys';

type HotkeysOptions = Parameters<typeof useBudgetHotkeys>[0];

function HotkeysHarness(options: HotkeysOptions) {
  useBudgetHotkeys(options);
  return null;
}

function renderHotkeys(overrides: Partial<HotkeysOptions> = {}) {
  const options: HotkeysOptions = {
    startMonth: '2026-09',
    numMonths: 3,
    budgetType: 'envelope',
    focusedMonth: '2026-09',
    isGoalTemplatesEnabled: true,
    onMonthSelect: vi.fn(),
    onOverwriteTemplates: vi.fn(),
    ...overrides,
  };
  render(
    <HotkeysProvider initiallyActiveScopes={['app']}>
      <HotkeysHarness {...options} />
    </HotkeysProvider>,
  );
  return options;
}

describe('useBudgetHotkeys', () => {
  it('overwrites templates in the focused column, not the first one', async () => {
    const user = userEvent.setup();
    const { onOverwriteTemplates } = renderHotkeys({
      focusedMonth: '2026-10',
    });

    await user.keyboard('{Shift>}t{/Shift}');

    expect(onOverwriteTemplates).toHaveBeenCalledTimes(1);
    expect(onOverwriteTemplates).toHaveBeenCalledWith('2026-10');
  });

  it('leaves templates alone when goal templates are off', async () => {
    const user = userEvent.setup();
    const { onOverwriteTemplates } = renderHotkeys({
      isGoalTemplatesEnabled: false,
    });

    await user.keyboard('{Shift>}t{/Shift}');

    expect(onOverwriteTemplates).not.toHaveBeenCalled();
  });

  it('steps a month with the arrows and returns to this month with 0', async () => {
    const user = userEvent.setup();
    const { onMonthSelect } = renderHotkeys();

    await user.keyboard('{ArrowRight}');
    expect(onMonthSelect).toHaveBeenLastCalledWith('2026-10');

    await user.keyboard('{ArrowLeft}');
    expect(onMonthSelect).toHaveBeenLastCalledWith('2026-08');

    await user.keyboard('0');
    // Three envelope months centre the current one.
    expect(onMonthSelect).toHaveBeenLastCalledWith(
      monthUtils.subMonths(monthUtils.currentMonth(), 1),
    );
  });
});
