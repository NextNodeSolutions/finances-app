import type { Locator, Page } from '@playwright/test';

import { AccountPage } from './account-page';
import { BudgetPage } from './budget-page';

export class OverviewPage {
  readonly page: Page;
  readonly container: Locator;
  readonly netWorth: Locator;
  readonly netWorthChange: Locator;
  readonly trendChart: Locator;
  readonly asOf: Locator;
  readonly asOfPill: Locator;
  readonly previousMonthEndButton: Locator;
  readonly nextMonthEndButton: Locator;
  readonly todayButton: Locator;
  readonly balanceSheet: Locator;
  readonly monthHealth: Locator;
  readonly upcoming: Locator;
  readonly recentActivity: Locator;
  readonly attentionStrip: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('overview-page');
    this.netWorth = page.getByTestId('overview-net-worth');
    this.netWorthChange = page.getByTestId('overview-net-worth-change');
    this.trendChart = this.container.getByRole('img', { name: /^Net worth,/ });
    this.asOf = page.getByTestId('overview-as-of');
    this.asOfPill = page.getByTestId('overview-as-of-pill');
    this.previousMonthEndButton = this.container.getByRole('button', {
      name: 'Previous month-end',
    });
    this.nextMonthEndButton = this.container.getByRole('button', {
      name: 'Next month-end',
    });
    this.todayButton = this.container.getByRole('button', {
      name: 'Today',
      exact: true,
    });
    this.balanceSheet = page.getByTestId('overview-balance-sheet');
    this.monthHealth = page.getByTestId('overview-month-health');
    this.upcoming = page.getByTestId('overview-upcoming');
    this.recentActivity = page.getByTestId('overview-recent-activity');
    this.attentionStrip = page.getByTestId('overview-attention-strip');
  }

  async waitFor(...options: Parameters<Locator['waitFor']>) {
    await this.container.waitFor(...options);
  }

  /** Waits until the history has loaded and Rewind can step back. */
  async waitForHistory() {
    await this.trendChart.waitFor();
  }

  /** A balance sheet account row; its link reads "Open {{name}}". */
  accountRow(accountName: string) {
    return this.balanceSheet.getByRole('link', {
      name: `Open ${accountName}`,
      exact: true,
    });
  }

  async openAccount(accountName: string) {
    await this.accountRow(accountName).click();

    const accountPage = new AccountPage(this.page);
    await accountPage.accountName.waitFor();
    return accountPage;
  }

  async openBudget() {
    await this.monthHealth
      .getByRole('button', { name: 'Open budget', exact: true })
      .click();

    const budgetPage = new BudgetPage(this.page);
    await budgetPage.waitFor();
    return budgetPage;
  }
}
