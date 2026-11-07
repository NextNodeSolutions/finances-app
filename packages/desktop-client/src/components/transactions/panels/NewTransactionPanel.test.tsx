import { MemoryRouter } from 'react-router';

import {
  generateAccount,
  generateCategoryGroups,
} from '@actual-app/core/mocks';
import { initServer } from '@actual-app/core/platform/client/connection';
import type {
  PayeeEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { accountQueries } from '#accounts';
import { categoryQueries } from '#budget';
import { PanelHost } from '#components/panels/PanelHost';
import { PanelProvider } from '#components/panels/PanelProvider';
import {
  configureTestAppStore,
  createTestQueryClient,
  TestProviders,
} from '#mocks';
import { payeeQueries } from '#payees';

import { useTransactionPanels } from './useTransactionPanels';
import type { NewTransactionPrefill } from './useTransactionPanels';

vi.mock(
  '@actual-app/core/platform/client/connection',
  () => import('#mocks/connection'),
);

const account = generateAccount('Everyday checking');
const categoryGroups = generateCategoryGroups([
  { name: 'Usual expenses', categories: [{ name: 'Food' }, { name: 'Home' }] },
]);
const categories = categoryGroups.flatMap(group => group.categories ?? []);
const payee: PayeeEntity = { id: 'payee-grocer', name: 'Corner grocer' };

type BatchUpdate = {
  added?: TransactionEntity[];
  learnCategories?: boolean;
};

let batchUpdates: BatchUpdate[] = [];

function OpenNewTransaction({ prefill }: { prefill: NewTransactionPrefill }) {
  const { openNew } = useTransactionPanels();
  return (
    <button type="button" onClick={() => openNew(prefill)}>
      open
    </button>
  );
}

function renderPanel(prefill: NewTransactionPrefill) {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(accountQueries.list().queryKey, [account]);
  queryClient.setQueryData(categoryQueries.list().queryKey, {
    grouped: categoryGroups,
    list: categories,
  });
  queryClient.setQueryData(payeeQueries.list().queryKey, [payee]);
  queryClient.setQueryData(payeeQueries.listCommon().queryKey, []);
  const store = configureTestAppStore({ queryClient });

  render(
    <TestProviders queryClient={queryClient} store={store}>
      <MemoryRouter>
        <PanelProvider>
          <OpenNewTransaction prefill={prefill} />
          <PanelHost />
        </PanelProvider>
      </MemoryRouter>
    </TestProviders>,
  );
}

async function openPanel(prefill: NewTransactionPrefill) {
  renderPanel(prefill);
  await userEvent.click(screen.getByRole('button', { name: 'open' }));
  return screen.findByTestId('new-transaction-panel');
}

describe('NewTransactionPanel', () => {
  beforeEach(() => {
    batchUpdates = [];
    initServer({
      'rules-run': async ({ transaction }) => transaction,
      'transactions-batch-update': async args => {
        batchUpdates.push(args);
        return { added: [], updated: [], deleted: [], errors: [] };
      },
    });
  });

  it('cannot save a split until REMAINING is 0.00, then adds the split', async () => {
    const panel = await openPanel({
      accountId: account.id,
      payeeId: payee.id,
      categoryId: categories[0].id,
      amount: -10000,
      date: '2026-10-21',
    });
    const footerSave = () =>
      within(panel).getByRole('button', { name: 'Save' });

    await userEvent.click(
      within(panel).getByRole('button', { name: 'Split into categories' }),
    );

    expect(within(panel).getByTestId('split-remaining')).toHaveTextContent(
      '100.00',
    );
    expect(
      within(panel).getByText('Split lines must add up to the total.'),
    ).toBeVisible();
    expect(footerSave()).toBeDisabled();
    expect(
      within(panel).getByRole('button', { name: 'Save and add another' }),
    ).toBeDisabled();

    const [firstLine, secondLine] = within(panel).getAllByRole('textbox', {
      name: /^Amount for line/,
    });
    await userEvent.type(firstLine, '60');
    expect(within(panel).getByTestId('split-remaining')).toHaveTextContent(
      '40.00',
    );
    expect(footerSave()).toBeDisabled();

    await userEvent.type(secondLine, '40');
    expect(within(panel).getByTestId('split-remaining')).toHaveTextContent(
      '0.00',
    );
    expect(within(panel).getByText('Balanced')).toBeVisible();
    expect(
      within(panel).queryByText('Split lines must add up to the total.'),
    ).not.toBeInTheDocument();
    expect(footerSave()).toBeEnabled();
    expect(batchUpdates).toHaveLength(0);

    await userEvent.click(footerSave());

    await waitFor(() => expect(batchUpdates).toHaveLength(1));
    const [{ added = [], learnCategories }] = batchUpdates;
    expect(learnCategories).toBe(true);
    expect(added).toHaveLength(3);

    const [parent, ...lines] = added;
    expect(parent).toMatchObject({
      is_parent: true,
      account: account.id,
      amount: -10000,
      date: '2026-10-21',
      payee: payee.id,
    });
    expect(parent.id).not.toMatch(/^temp/);
    expect(lines.map(line => line.amount)).toEqual([-6000, -4000]);
    for (const line of lines) {
      expect(line).toMatchObject({
        is_child: true,
        parent_id: parent.id,
        account: account.id,
      });
      expect(line.id).not.toMatch(/^temp/);
    }
    expect(lines[0].category).toBe(categories[0].id);
    for (const transaction of added) {
      expect(transaction).not.toHaveProperty('error');
      expect(transaction).not.toHaveProperty('subtransactions');
    }

    // A successful save closes the panel.
    await waitFor(() =>
      expect(
        screen.queryByTestId('new-transaction-panel'),
      ).not.toBeInTheDocument(),
    );
  });
});
