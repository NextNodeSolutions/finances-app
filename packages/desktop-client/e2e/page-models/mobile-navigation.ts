import type { Locator, Page } from '@playwright/test';

import { MobileAccountPage } from './mobile-account-page';
import { MobileAccountsPage } from './mobile-accounts-page';
import { MobileBankSyncPage } from './mobile-bank-sync-page';
import { MobileBudgetPage } from './mobile-budget-page';
import { MobileOverviewPage } from './mobile-overview-page';
import { MobilePayeesPage } from './mobile-payees-page';
import { MobileReportsPage } from './mobile-reports-page';
import { MobileRulesPage } from './mobile-rules-page';
import { MobileSchedulesPage } from './mobile-schedules-page';
import { MobileTransactionEntryPage } from './mobile-transaction-entry-page';
import { SettingsPage } from './settings-page';

// The bottom bar is one always-visible row; secondary pages sit in its
// More sheet.
export const NAVBAR_ROWS = 1;
const ROUTES_BY_PAGE = {
  Overview: '/overview',
  Budget: '/budget',
  Accounts: '/accounts',
  Transaction: '/transactions/new',
  Reports: '/reports',
  Schedules: '/schedules',
  Payees: '/settings/payees',
  Rules: '/settings/rules',
  'Bank Sync': '/settings/bank-sync',
  Settings: '/settings',
};
type PageName = keyof typeof ROUTES_BY_PAGE;
const PAGES_IN_MORE_SHEET: readonly PageName[] = [
  'Reports',
  'Schedules',
  'Payees',
  'Rules',
  'Bank Sync',
  'Settings',
];

export class MobileNavigation {
  readonly page: Page;
  readonly heading: Locator;
  readonly navbar: Locator;
  readonly moreButton: Locator;
  readonly moreSheet: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading');
    this.navbar = page.locator('[data-navbar-state]');
    this.moreButton = this.navbar.getByRole('button', { name: 'More' });
    this.moreSheet = page.getByRole('dialog', { name: 'More' });
  }

  async openMoreSheet() {
    if (!(await this.moreSheet.isVisible())) {
      await this.moreButton.click();
    }
    await this.moreSheet.waitFor();
    return this.moreSheet;
  }

  async navigateToPage<T extends { waitFor: Locator['waitFor'] }>(
    pageName: PageName,
    pageModelFactory: () => T,
  ): Promise<T> {
    const pageInstance = pageModelFactory();

    if (this.page.url().endsWith(ROUTES_BY_PAGE[pageName])) {
      // Already on the page.
      return pageInstance;
    }

    await this.navbar.waitFor();

    const linkContainer = PAGES_IN_MORE_SHEET.includes(pageName)
      ? await this.openMoreSheet()
      : this.navbar;
    await linkContainer
      .getByRole('link', { name: pageName, exact: true })
      .click();

    await pageInstance.waitFor();
    return pageInstance;
  }

  async goToOverviewPage() {
    return await this.navigateToPage(
      'Overview',
      () => new MobileOverviewPage(this.page),
    );
  }

  async goToBudgetPage() {
    return await this.navigateToPage(
      'Budget',
      () => new MobileBudgetPage(this.page),
    );
  }

  async goToAccountsPage() {
    return await this.navigateToPage(
      'Accounts',
      () => new MobileAccountsPage(this.page),
    );
  }

  async goToUncategorizedPage() {
    const button = this.page.getByRole('button', { name: 'Categorize' });
    await button.click();

    return new MobileAccountPage(this.page);
  }

  async goToTransactionEntryPage() {
    return await this.navigateToPage(
      'Transaction',
      () => new MobileTransactionEntryPage(this.page),
    );
  }

  async goToReportsPage() {
    return await this.navigateToPage(
      'Reports',
      () => new MobileReportsPage(this.page),
    );
  }

  async goToPayeesPage() {
    return await this.navigateToPage(
      'Payees',
      () => new MobilePayeesPage(this.page),
    );
  }

  async goToSchedulesPage() {
    return await this.navigateToPage(
      'Schedules',
      () => new MobileSchedulesPage(this.page),
    );
  }

  async goToRulesPage() {
    return await this.navigateToPage(
      'Rules',
      () => new MobileRulesPage(this.page),
    );
  }

  async goToBankSyncPage() {
    return await this.navigateToPage(
      'Bank Sync',
      () => new MobileBankSyncPage(this.page),
    );
  }

  async goToSettingsPage() {
    return await this.navigateToPage(
      'Settings',
      () => new SettingsPage(this.page),
    );
  }
}
