import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { AccountPage } from './account-page';

export class BudgetPage {
  readonly page: Page;
  readonly budgetSummary: Locator;
  readonly budgetTable: Locator;
  readonly budgetTableTotals: Locator;
  readonly selectedMonthButton: Locator;
  readonly nextMonthButton: Locator;
  readonly budgetTableScrollContainer: Locator;
  readonly overspentCard: Locator;
  readonly moveMoneyPanel: Locator;
  readonly coverOverspendingPanel: Locator;

  constructor(page: Page) {
    this.page = page;

    this.budgetSummary = page.getByTestId('budget-summary');
    this.budgetTable = page.getByTestId('budget-table');
    this.budgetTableTotals = this.budgetTable.getByTestId('budget-totals');
    this.selectedMonthButton = page.getByTestId('selected-budget-month');
    this.nextMonthButton = page.getByRole('button', {
      name: 'Next month',
      exact: true,
    });
    this.budgetTableScrollContainer = page.getByTestId(
      'budget-table-scroll-container',
    );
    // The month rail (one month) or the column summaries (compare mode)
    // carry `budget-summary`; the panels open beside the table.
    this.overspentCard = page.getByTestId('overspent-card');
    this.moveMoneyPanel = page.getByTestId('move-money-panel');
    this.coverOverspendingPanel = page.getByTestId('cover-overspending-panel');
  }

  /** The rail or column summary of one month (`yyyy-MM`). */
  getMonthSummary(month: string) {
    return this.page.locator(
      `[data-testid="budget-summary"][data-month="${month}"]`,
    );
  }

  async getScrollTop() {
    return this.budgetTableScrollContainer.evaluate(el => el.scrollTop);
  }

  async scrollToBottom() {
    await this.budgetTableScrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
  }

  /**
   * Wait for the budget page to finish loading. The budget-table is
   * inside AutoSizer which returns null until layout provides width/
   * height, so it only appears after the page has fully mounted.
   */
  async waitFor(...options: Parameters<Locator['waitFor']>) {
    await this.budgetTable.waitFor(...options);
  }

  async getTotalBudgeted() {
    const totalBudgetedText = await this.budgetTableTotals
      .getByTestId(/total-budgeted$/)
      .textContent();

    if (!totalBudgetedText) {
      throw new Error('Failed to get total budgeted.');
    }

    return parseInt(totalBudgetedText, 10);
  }

  async getTotalSpent() {
    const totalSpentText = await this.budgetTableTotals
      .getByTestId(/total-spent$/)
      .textContent();

    if (!totalSpentText) {
      throw new Error('Failed to get total spent.');
    }

    return parseInt(totalSpentText, 10);
  }

  async getTotalLeftover() {
    const totalLeftoverText = await this.budgetTableTotals
      .getByTestId(/total-leftover$/)
      .textContent();

    if (!totalLeftoverText) {
      throw new Error('Failed to get total leftover.');
    }

    return parseInt(totalLeftoverText, 10);
  }

  async getTableTotals() {
    return {
      budgeted: await this.getTotalBudgeted(),
      spent: await this.getTotalSpent(),
      balance: await this.getTotalLeftover(),
    };
  }

  async setBudgetedAmount(
    categoryName: string,
    amount: string,
    monthIndex = 0,
  ) {
    const row = this.budgetTable
      .getByTestId('row')
      .filter({ hasText: categoryName })
      .first();
    const budgetCell = row.getByTestId('budget').nth(monthIndex);

    await budgetCell.click();
    const input = budgetCell.locator('input');
    await input.waitFor({ state: 'visible' });
    await input.fill(amount);
    await input.press('Enter');
  }

  async getSelectedMonth() {
    const selectedMonth =
      await this.selectedMonthButton.getAttribute('data-month');

    if (!selectedMonth) {
      throw new Error('Failed to get the selected month.');
    }

    return selectedMonth;
  }

  async #waitForNewMonthToLoad({
    currentMonth,
    errorMessage,
  }: {
    currentMonth: string;
    errorMessage: string;
  }) {
    await expect(this.selectedMonthButton, errorMessage).not.toHaveAttribute(
      'data-month',
      currentMonth,
    );

    return this.getSelectedMonth();
  }

  async goToNextMonth() {
    const currentMonth = await this.getSelectedMonth();

    await this.nextMonthButton.click();

    return await this.#waitForNewMonthToLoad({
      currentMonth,
      errorMessage: 'Failed to navigate to the next month.',
    });
  }

  async getBalanceForRow(idx: number) {
    const balanceText = await this.budgetTable
      .getByTestId('row')
      .nth(idx)
      .getByTestId('balance')
      .textContent();

    if (!balanceText) {
      throw new Error(`Failed to get balance on row index ${idx}.`);
    }

    return Math.round(parseFloat(balanceText.replace(/,/g, '')) * 100);
  }

  async getCategoryNameForRow(idx: number) {
    const categoryNameText = this.budgetTable
      .getByTestId('row')
      .nth(idx)
      .getByTestId('category-name')
      .textContent();

    if (!categoryNameText) {
      throw new Error(`Failed to get category name on row index ${idx}.`);
    }

    return categoryNameText;
  }

  async clickOnSpentAmountForRow(idx: number) {
    await this.budgetTable
      .getByTestId('row')
      .nth(idx)
      .getByTestId('category-month-spent')
      .click();
    return new AccountPage(this.page);
  }

  async clickOnSpentAmountForLastVisibleRow() {
    // Click the last spent-amount cell currently visible in the scroll container
    // without triggering Playwright's auto-scroll-into-view, so the scroll
    // position is not changed before the click handler captures it.
    const clicked = await this.page.evaluate(() => {
      const container = document.querySelector(
        '[data-testid="budget-table-scroll-container"]',
      );
      if (!container) {
        throw new Error('Budget scroll container not found');
      }
      const containerRect = container.getBoundingClientRect();
      const cells = container.querySelectorAll<HTMLElement>(
        '[data-testid="category-month-spent"]',
      );
      for (const cell of [...cells].reverse()) {
        const rect = cell.getBoundingClientRect();
        if (
          rect.top >= containerRect.top &&
          rect.bottom <= containerRect.bottom
        ) {
          cell.click();
          return true;
        }
      }
      return false;
    });

    if (!clicked) {
      throw new Error('No visible spent-amount cell found to click');
    }
    return new AccountPage(this.page);
  }

  async transferAllBalance(fromIdx: number, toIdx: number) {
    const toName = await this.getCategoryNameForRow(toIdx);
    if (!toName) {
      throw new Error(`Unable to get category name of row index ${toIdx}.`);
    }

    await this.openBalanceMenuForRow(fromIdx);

    await this.page
      .getByRole('menu')
      .getByRole('button', { name: 'Transfer to another category' })
      .click();

    // The transfer happens in the Move money side panel.
    await this.moveMoneyPanel.getByPlaceholder('(none)').click();

    await this.page.keyboard.type(toName);
    await this.page.keyboard.press('Enter');

    await this.moveMoneyPanel
      .getByRole('button', { name: 'Transfer', exact: true })
      .click();
    await this.moveMoneyPanel.waitFor({ state: 'hidden' });
  }

  async openBalanceMenuForRow(idx: number) {
    await this.budgetTable
      .getByTestId('row')
      .nth(idx)
      .getByTestId('balance')
      .getByTestId(/^budget/)
      .click();
  }

  /** Opens the one-category cover stepper from an overspent balance. */
  async openCoverOverspendingForRow(idx: number) {
    await this.openBalanceMenuForRow(idx);
    // The rail's Overspent card has a button of the same name.
    await this.page
      .getByRole('menu')
      .getByRole('button', { name: 'Cover overspending' })
      .click();
    await this.coverOverspendingPanel.waitFor({ state: 'visible' });
    return this.coverOverspendingPanel;
  }

  /** Picks where the cover's money comes from; nothing is preselected. */
  async chooseCoverSource(sourceName: string) {
    await this.coverOverspendingPanel.getByText('Choose a source…').click();
    await this.page
      .getByRole('option', { name: new RegExp(`^${sourceName}`) })
      .click();
  }

  async rightClickCategory(idx: number) {
    await this.budgetTable
      .getByTestId('row')
      .nth(idx)
      .getByTestId('category-name')
      .click({ button: 'right' });
  }

  async rightClickCategoryGroup(name: string) {
    // Assuming category groups have a specific text or role, or we can just find by text
    await this.budgetTable
      .getByText(name, { exact: true })
      .click({ button: 'right' });
  }
}
