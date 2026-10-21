import type { Locator, Page } from '@playwright/test';

import { MobileAccountPage } from './mobile-account-page';

export class MobileOverviewPage {
  readonly page: Page;
  readonly container: Locator;
  readonly netWorth: Locator;
  readonly netWorthChange: Locator;
  readonly rangeToggle: Locator;
  readonly asOf: Locator;
  readonly todayButton: Locator;
  readonly monthCard: Locator;
  readonly upcoming: Locator;
  readonly accounts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('overview-page');
    this.netWorth = page.getByTestId('overview-net-worth');
    this.netWorthChange = page.getByTestId('overview-net-worth-change');
    // The sparkline is the toggle; its name says which range it switches to.
    this.rangeToggle = this.container.getByRole('button', {
      name: /^Show the last \d+ months$/,
    });
    this.asOf = page.getByTestId('overview-as-of');
    this.todayButton = this.container.getByRole('button', {
      name: 'Today',
      exact: true,
    });
    this.monthCard = page.getByTestId('overview-month-health');
    this.upcoming = page.getByTestId('overview-upcoming');
    this.accounts = page.getByTestId('overview-balance-sheet');
  }

  async waitFor(...options: Parameters<Locator['waitFor']>) {
    await this.container.waitFor(...options);
  }

  async openAccount(name: string) {
    await this.accounts.getByRole('link', { name: `Open ${name}` }).click();
    return new MobileAccountPage(this.page);
  }
}
