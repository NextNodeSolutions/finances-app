import React from 'react';

import { generateAccount } from '@actual-app/core/mocks';
import { q } from '@actual-app/core/shared/query';
import type { AccountEntity } from '@actual-app/core/types/models';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useOptionalFeature } from '#hooks/useOptionalFeature';
import { useSheetValue } from '#hooks/useSheetValue';
import { TestProviders } from '#mocks';

import { ReconcileStrip } from './ReconcileStrip';
import type { ReconcileHandlers } from './ReconcileStrip';
import { recordValuation } from './recordValuation';

vi.mock('#hooks/useSheetValue', () => ({
  useSheetValue: vi.fn(),
}));

vi.mock('#hooks/useOptionalFeature', () => ({
  useOptionalFeature: vi.fn(),
}));

vi.mock('./recordValuation', () => ({
  recordValuation: vi.fn(() => Promise.resolve()),
}));

// Amounts are integer cents with the default two decimal places.

const balanceQuery = {
  name: 'balance-query-test' as const,
  query: q('transactions'),
};

function makeHandlers(
  overrides: Partial<ReconcileHandlers> = {},
): ReconcileHandlers {
  return {
    reconcileAmount: null,
    onReconcile: vi.fn(),
    onDone: vi.fn(),
    onExit: vi.fn(),
    onCreateTransaction: vi.fn(),
    onValuationRecorded: vi.fn(),
    ...overrides,
  };
}

function renderStrip(
  reconcile: ReconcileHandlers,
  account: AccountEntity = generateAccount('Checking', false, false),
  onClose = vi.fn(),
) {
  render(
    <TestProviders>
      <ReconcileStrip
        account={account}
        balanceQuery={balanceQuery}
        reconcile={reconcile}
        onClose={onClose}
      />
    </TestProviders>,
  );
  return { onClose };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useOptionalFeature).mockReturnValue([true, vi.fn()]);
});

describe('ReconcileStrip while reconciling', () => {
  test('draws "All reconciled!" and offers locking when the statement matches', async () => {
    vi.mocked(useSheetValue).mockReturnValue(5000);
    const reconcile = makeHandlers({ reconcileAmount: 5000 });

    renderStrip(reconcile);

    expect(screen.getByText('All reconciled!')).toBeInTheDocument();
    expect(
      screen.queryByText('Create reconciliation transaction'),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Lock transactions'));
    expect(reconcile.onDone).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByText('Exit reconciliation'));
    expect(reconcile.onExit).toHaveBeenCalledTimes(1);
    expect(reconcile.onDone).toHaveBeenCalledTimes(1);
  });

  test('shows a positive difference with its sign and passes it on', async () => {
    // cleared = 30.00, statement = 100.00 => difference = +70.00
    vi.mocked(useSheetValue).mockReturnValue(3000);
    const reconcile = makeHandlers({ reconcileAmount: 10000 });

    renderStrip(reconcile);

    expect(screen.getByText('30.00')).toBeInTheDocument();
    expect(screen.getByText('100.00')).toBeInTheDocument();
    expect(screen.getByText('+70.00')).toBeInTheDocument();
    expect(screen.queryByText('All reconciled!')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByText('Create reconciliation transaction'),
    );
    expect(reconcile.onCreateTransaction).toHaveBeenCalledWith(7000);
  });

  test('shows a negative difference and passes it on', async () => {
    // cleared = 120.00, statement = 100.00 => difference = -20.00
    vi.mocked(useSheetValue).mockReturnValue(12000);
    const reconcile = makeHandlers({ reconcileAmount: 10000 });

    renderStrip(reconcile);

    expect(screen.getByText('120.00')).toBeInTheDocument();
    expect(screen.getByText('-20.00')).toBeInTheDocument();

    await userEvent.click(
      screen.getByText('Create reconciliation transaction'),
    );
    expect(reconcile.onCreateTransaction).toHaveBeenCalledWith(-2000);
  });

  test('exiting before the rows match finishes without the lock step', async () => {
    vi.mocked(useSheetValue).mockReturnValue(3000);
    const reconcile = makeHandlers({ reconcileAmount: 10000 });

    renderStrip(reconcile);

    expect(screen.queryByText('Lock transactions')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Exit reconciliation'));
    expect(reconcile.onDone).toHaveBeenCalledTimes(1);
  });
});

describe('ReconcileStrip statement balance', () => {
  test('is a labelled region', () => {
    vi.mocked(useSheetValue).mockReturnValue(1000);

    renderStrip(makeHandlers());

    expect(
      screen.getByRole('region', { name: 'Reconcile' }),
    ).toBeInTheDocument();
  });

  test('evaluates arithmetic in the statement balance', async () => {
    // cleared = 123.45
    vi.mocked(useSheetValue).mockReturnValue(12345);
    const reconcile = makeHandlers();

    renderStrip(reconcile);

    const input = screen.getByRole('textbox', { name: 'Statement balance' });
    expect(input).toHaveValue('123.45');
    await userEvent.clear(input);
    await userEvent.type(input, '100+25.50-10');
    await userEvent.click(screen.getByRole('button', { name: 'Reconcile' }));

    // 100 + 25.50 - 10 = 115.50
    expect(reconcile.onReconcile).toHaveBeenCalledWith(11550);
  });

  test('falls back to the cleared balance when the input has no number', async () => {
    vi.mocked(useSheetValue).mockReturnValue(123456);
    const reconcile = makeHandlers();

    renderStrip(reconcile);

    const input = screen.getByRole('textbox', { name: 'Statement balance' });
    await userEvent.clear(input);
    await userEvent.type(input, 'abcd');
    await userEvent.click(screen.getByRole('button', { name: 'Reconcile' }));

    expect(reconcile.onReconcile).toHaveBeenCalledWith(123456);
  });

  test('does not reconcile an empty statement balance', async () => {
    vi.mocked(useSheetValue).mockReturnValue(2222);
    const reconcile = makeHandlers();

    renderStrip(reconcile);

    await userEvent.clear(
      screen.getByRole('textbox', { name: 'Statement balance' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Reconcile' }));

    expect(reconcile.onReconcile).not.toHaveBeenCalled();
  });

  test('submits null while the cleared balance is unknown', async () => {
    vi.mocked(useSheetValue).mockReturnValue(null);
    const reconcile = makeHandlers();

    renderStrip(reconcile);

    await userEvent.click(screen.getByRole('button', { name: 'Reconcile' }));
    expect(reconcile.onReconcile).toHaveBeenCalledWith(null);
  });

  test('Cancel closes the strip', async () => {
    vi.mocked(useSheetValue).mockReturnValue(1000);

    const { onClose } = renderStrip(makeHandlers());

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('uses the bank balance of a linked account when bank sync is on', async () => {
    vi.mocked(useSheetValue).mockReturnValue(1000);
    const linkedAccount = {
      ...generateAccount('Checking', true, false),
      balance_current: 4321,
    };
    const reconcile = makeHandlers();

    renderStrip(reconcile, linkedAccount);

    expect(screen.getByText('Bank balance')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Use' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reconcile' }));
    expect(reconcile.onReconcile).toHaveBeenCalledWith(4321);
  });

  test('hides the bank balance when bank sync is off', () => {
    vi.mocked(useSheetValue).mockReturnValue(1000);
    vi.mocked(useOptionalFeature).mockReturnValue([false, vi.fn()]);
    const linkedAccount = {
      ...generateAccount('Checking', true, false),
      balance_current: 4321,
    };

    renderStrip(makeHandlers(), linkedAccount);

    expect(screen.queryByText('Bank balance')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use' }),
    ).not.toBeInTheDocument();
  });
});

describe('ReconcileStrip valuation mode', () => {
  const investment = generateAccount('Vanguard 401k', false, true);

  test('records the change in value without a lock step', async () => {
    // balance = 100.00, new value = 120.00 => adjustment = +20.00
    vi.mocked(useSheetValue).mockReturnValue(10000);
    const reconcile = makeHandlers();

    const { onClose } = renderStrip(reconcile, investment);

    expect(screen.queryByText('Lock transactions')).not.toBeInTheDocument();
    const input = screen.getByRole('textbox', { name: 'Current value' });
    await userEvent.clear(input);
    await userEvent.type(input, '120');
    await userEvent.click(screen.getByRole('button', { name: 'Record' }));

    expect(recordValuation).toHaveBeenCalledWith(investment.id, 2000);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(reconcile.onValuationRecorded).toHaveBeenCalledTimes(1);
  });

  test('records nothing when the value is unchanged', async () => {
    vi.mocked(useSheetValue).mockReturnValue(10000);
    const reconcile = makeHandlers();

    const { onClose } = renderStrip(reconcile, investment);

    await userEvent.click(screen.getByRole('button', { name: 'Record' }));

    expect(recordValuation).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
