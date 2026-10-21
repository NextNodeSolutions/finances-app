import type { Locator, Page } from '@playwright/test';

import { CloseAccountModal } from './close-account-modal';

type TransactionEntry = {
  debit?: string;
  credit?: string;
  account?: string;
  payee?: string;
  notes?: string;
  category?: string;
};

export class AccountPage {
  readonly page: Page;
  readonly header: Locator;
  readonly accountName: Locator;
  readonly accountBalance: Locator;
  readonly closedPill: Locator;
  readonly offBudgetPill: Locator;
  readonly addNewTransactionButton: Locator;
  readonly importButton: Locator;
  readonly reconcileButton: Locator;
  readonly reconcileStrip: Locator;
  readonly newTransactionRow: Locator;
  readonly addTransactionButton: Locator;
  readonly cancelTransactionButton: Locator;
  readonly accountMenuButton: Locator;
  readonly transactionTable: Locator;
  readonly transactionTableRow: Locator;
  readonly filterButton: Locator;
  readonly filterSelectTooltip: Locator;
  readonly selectButton: Locator;
  readonly selectTooltip: Locator;
  readonly selectionBar: Locator;
  readonly sidebarAllAccountsBalance: Locator;
  readonly sidebarOnBudgetBalance: Locator;
  readonly sidebarOffBudgetBalance: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = this.page.getByTestId('account-header');
    this.accountName = this.page.getByTestId('account-name');
    this.accountBalance = this.page.getByTestId('account-balance');
    this.closedPill = this.page.getByTestId('account-closed-pill');
    this.offBudgetPill = this.page.getByTestId('account-off-budget-pill');
    // Scoped to the header: an empty register repeats these buttons.
    this.addNewTransactionButton = this.header.getByRole('button', {
      name: 'Add transaction',
    });
    this.importButton = this.header.getByRole('button', {
      name: 'Import',
      exact: true,
    });
    this.reconcileButton = this.header.getByRole('button', {
      name: /^(Reconcile|Update value)$/,
    });
    this.reconcileStrip = this.page.getByTestId('reconcile-strip');
    this.newTransactionRow = this.page
      .getByTestId('new-transaction')
      .getByTestId('row');
    this.addTransactionButton = this.page.getByTestId('add-button');
    this.cancelTransactionButton = this.page.getByRole('button', {
      name: 'Cancel',
    });
    this.accountMenuButton = this.page.getByRole('button', {
      name: 'Account menu',
    });

    this.transactionTable = this.page.getByTestId('transaction-table');
    this.transactionTableRow = this.transactionTable.getByTestId('row');

    this.filterButton = this.page.getByRole('button', {
      name: 'Filter',
      exact: true,
    });
    this.filterSelectTooltip = this.page.getByTestId('filters-select-tooltip');

    this.selectButton = this.page.getByTestId('transactions-select-button');
    this.selectTooltip = this.page.getByTestId('transactions-select-tooltip');
    this.selectionBar = this.page.getByTestId('transactions-selection-bar');

    this.sidebarAllAccountsBalance = this.page.getByTestId(
      'sidebar-all-accounts-balance',
    );
    this.sidebarOnBudgetBalance = this.page.getByTestId(
      'sidebar-on-budget-balance',
    );
    this.sidebarOffBudgetBalance = this.page.getByTestId(
      'sidebar-off-budget-balance',
    );
  }

  async waitFor(...options: Parameters<Locator['waitFor']>) {
    await this.transactionTable.waitFor(...options);
  }

  /**
   * Enter details of a transaction
   */
  async enterSingleTransaction(transaction: TransactionEntry) {
    await this.addNewTransactionButton.click();
    await this._fillTransactionFields(this.newTransactionRow, transaction);
  }

  /**
   * Finish adding a transaction
   */
  async addEnteredTransaction() {
    await this.addTransactionButton.click();
    await this.cancelTransactionButton.click();
  }

  /**
   * Create a single transaction
   */
  async createSingleTransaction(transaction: TransactionEntry) {
    await this.enterSingleTransaction(transaction);
    await this.addEnteredTransaction();
  }

  /**
   * Create split transactions
   */
  async createSplitTransaction([
    rootTransaction,
    ...transactions
  ]: TransactionEntry[]) {
    await this.addNewTransactionButton.click();

    // Root transaction
    const transactionRow = this.newTransactionRow.first();
    await this._fillTransactionFields(transactionRow, {
      ...rootTransaction,
      category: 'split',
    });

    // Splitting starts with two empty splits
    const initialSplitCount = 2;

    // Child transactions
    for (let i = 0; i < transactions.length; i++) {
      if (i >= initialSplitCount) {
        await this.page.getByRole('button', { name: 'Add Split' }).click();
      }

      await this._fillTransactionFields(
        this.newTransactionRow.nth(i + 1),
        transactions[i],
      );
    }

    await this.addTransactionButton.click();
    await this.cancelTransactionButton.click();
  }

  async selectNthTransaction(index: number) {
    const row = this.transactionTableRow.nth(index);
    await row.getByTestId('select').click();
  }

  /**
   * Retrieve the data for the nth-transaction.
   * 0-based index
   */
  getNthTransaction(index: number) {
    const row = this.transactionTableRow.nth(index);

    return this._getTransactionDetails(row);
  }

  getEnteredTransaction() {
    return this._getTransactionDetails(this.newTransactionRow);
  }

  _getTransactionDetails(row: Locator) {
    return {
      account: row.getByTestId('account'),
      payee: row.getByTestId('payee'),
      notes: row.getByTestId('notes'),
      category: row.getByTestId('category'),
      debit: row.getByTestId('debit'),
      credit: row.getByTestId('credit'),
      balance: row.getByTestId('balance'),
    };
  }

  async clickSelectAction(action: string | RegExp) {
    await this.selectButton.click();
    await this.selectTooltip.getByRole('button', { name: action }).click();
  }

  /**
   * Reconcile against a statement balance through the inline strip. Without
   * a balance, the prefilled cleared balance is used.
   */
  async reconcile(statementBalance?: string) {
    await this.reconcileButton.click();
    const input = this.reconcileStrip.getByRole('textbox', {
      name: 'Statement balance',
    });
    await input.waitFor();
    if (statementBalance != null) {
      await input.fill(statementBalance);
    }
    await this.reconcileStrip
      .getByRole('button', { name: 'Reconcile', exact: true })
      .click();
  }

  /**
   * Lock the cleared transactions once the reconcile strip is settled.
   */
  async lockReconciledTransactions() {
    await this.reconcileStrip
      .getByRole('button', { name: 'Lock transactions' })
      .click();
  }

  /**
   * Record a new value for an off-budget account through the inline strip.
   */
  async updateValue(currentValue: string) {
    await this.reconcileButton.click();
    const input = this.reconcileStrip.getByRole('textbox', {
      name: 'Current value',
    });
    await input.fill(currentValue);
    await this.reconcileStrip.getByRole('button', { name: 'Record' }).click();
  }

  /**
   * Open the modal for closing the account.
   */
  async clickCloseAccount() {
    await this.accountMenuButton.click();
    await this.page.getByRole('button', { name: 'Close Account' }).click();
    return new CloseAccountModal(this.page.getByTestId('close-account-modal'));
  }

  /**
   * Open the "Manage table columns" modal from the account menu.
   */
  async openTransactionColumnsModal() {
    await this.accountMenuButton.click();
    await this.page
      .getByRole('button', { name: 'Manage table columns' })
      .click();
    return this.page.getByTestId('transaction-table-columns-modal');
  }

  /**
   * Set one column's visibility via the "Manage table columns" modal.
   */
  async setTransactionColumnVisibility(columnId: string, visible: boolean) {
    const modal = await this.openTransactionColumnsModal();
    const toggle = modal.locator(`#toggle-column-${columnId}`);
    if ((await toggle.isChecked()) !== visible) {
      await modal.locator(`label[for="toggle-column-${columnId}"]`).click();
    }
    await modal.getByRole('button', { name: 'Save', exact: true }).click();
    await modal.waitFor({ state: 'hidden' });
  }

  /**
   * Open the filtering popover.
   */
  async filterBy(field: string | RegExp) {
    await this.filterButton.click();
    await this.filterSelectTooltip.getByRole('button', { name: field }).click();

    return new FilterTooltip(this.page.getByTestId('filters-menu-tooltip'));
  }

  /**
   * Filter to a specific note
   */
  async filterByNote(note: string) {
    const filterTooltip = await this.filterBy('Note');
    await this.page.keyboard.type(note);
    await filterTooltip.applyButton.click();
  }

  /**
   * Remove the nth filter
   */
  async removeFilter(idx: number) {
    await this.page
      .getByRole('button', { name: 'Delete filter' })
      .nth(idx)
      .click();
  }

  async _fillTransactionFields(
    transactionRow: Locator,
    transaction: TransactionEntry,
  ) {
    if (transaction.debit) {
      const debitCell = transactionRow.getByTestId('debit');
      await debitCell.click();
      const debitInput = debitCell.getByRole('textbox');
      await this.selectInputText(debitInput);
      await debitInput.pressSequentially(transaction.debit);
      await this.page.keyboard.press('Tab');
    }

    if (transaction.credit) {
      const creditCell = transactionRow.getByTestId('credit');
      await creditCell.click();
      const creditInput = creditCell.getByRole('textbox');
      await this.selectInputText(creditInput);
      await creditInput.pressSequentially(transaction.credit);
      await this.page.keyboard.press('Tab');
    }

    if (transaction.account) {
      const accountCell = transactionRow.getByTestId('account');
      await accountCell.click();
      const accountInput = accountCell.getByRole('textbox');
      await this.selectInputText(accountInput);
      await accountInput.pressSequentially(transaction.account);
      await this.page.keyboard.press('Tab');
    }

    if (transaction.payee) {
      const payeeCell = transactionRow.getByTestId('payee');
      await payeeCell.click();
      const payeeInput = payeeCell.getByRole('textbox');
      await this.selectInputText(payeeInput);
      await payeeInput.pressSequentially(transaction.payee);
      await this.page.keyboard.press('Tab');
    }

    if (transaction.notes) {
      const notesCell = transactionRow.getByTestId('notes');
      await notesCell.click();
      const notesInput = notesCell.getByRole('combobox');
      await notesInput.fill(transaction.notes);
      await this.page.keyboard.press('Tab');
    }

    if (transaction.category) {
      const categoryCell = transactionRow.getByTestId('category');
      await categoryCell.click();

      if (transaction.category === 'split') {
        await this.page.getByTestId('split-transaction-button').click();
      } else {
        const categoryInput = categoryCell.getByRole('textbox');
        await this.selectInputText(categoryInput);
        await categoryInput.pressSequentially(transaction.category);
        await this.page.keyboard.press('Tab');
      }
    }
  }

  async selectInputText(input: Locator) {
    const value = await input.inputValue();
    if (value) {
      await input.selectText();
    }
  }

  async rightClickNthTransaction(index: number) {
    await this.transactionTableRow.nth(index).click({ button: 'right' });
  }
}

class FilterTooltip {
  readonly locator: Locator;
  readonly applyButton: Locator;

  constructor(locator: Locator) {
    this.locator = locator;
    this.applyButton = locator.getByRole('button', { name: 'Apply' });
  }
}
