import type { Locator, Page } from '@playwright/test';

import { BootstrapPage } from './bootstrap-page';
import { BudgetPage } from './budget-page';
import { OverviewPage } from './overview-page';

// Below this viewport width the app renders its mobile layout (no sidebar,
// bottom navbar); mirrors the `small` breakpoint of the component library.
const NARROW_WIDTH = 512;
// Importing a budget file can take a while before the app opens it.
const IMPORT_TIMEOUT = 30_000;

export class ConfigurationPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading');
  }

  async createTestFile() {
    await this.page
      .getByRole('button', { name: 'Try the demo', exact: true })
      .click();
    return this.goFromStartPageToBudget();
  }

  async createDemoFile() {
    await this.page.getByRole('button', { name: 'Try the demo' }).click();
    return this.goFromStartPageToBudget();
  }

  async clickOnConnectServer() {
    await this.page
      .getByRole('button', { name: 'Connect to a sync server' })
      .click();
  }

  async clickOnNoServer() {
    await this.page.getByRole('button', { name: "Don't use a server" }).click();
  }

  async clickOnStartSyncServer() {
    await this.page.getByRole('button', { name: 'Start' }).click();
    await this.page.waitForURL('**/bootstrap');
    return new BootstrapPage(this.page);
  }

  async startFresh() {
    await this.page.getByRole('button', { name: 'Start budgeting' }).click();
    return this.goFromStartPageToBudget();
  }

  async importBudget(type: 'YNAB4' | 'nYNAB' | 'Actual', file: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: 'Import my budget' }).click();

    switch (type) {
      case 'YNAB4':
        await this.page
          .getByRole('button', {
            name: 'YNAB4 The old unsupported desktop app',
          })
          .click();
        await this.page
          .getByRole('button', { name: 'Select zip file...' })
          .click();
        break;

      case 'nYNAB':
        await this.page
          .getByRole('button', { name: 'nYNAB The newer web app' })
          .click();
        await this.page.getByRole('button', { name: 'Select file...' }).click();
        break;

      case 'Actual':
        await this.page
          .getByRole('button', {
            name: 'Actual Import a file exported from Actual',
          })
          .click();
        await this.page.getByRole('button', { name: 'Select file...' }).click();
        break;

      default:
        throw new Error(`Unrecognized import type: ${String(type)}`);
    }

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);

    return this.goFromStartPageToBudget({ timeout: IMPORT_TIMEOUT });
  }

  /**
   * A newly opened file lands on the Overview (imports still open straight
   * on the budget). Tests start from the budget, so open Budget from the
   * navigation when needed, and wait for the budget page to be fully
   * mounted (its virtualized table lays out last) before handing it back.
   */
  private async goFromStartPageToBudget(
    options: Parameters<Locator['waitFor']>[0] = {},
  ) {
    const overviewPage = new OverviewPage(this.page);
    const budgetPage = new BudgetPage(this.page);
    await overviewPage.container.or(budgetPage.budgetTable).waitFor(options);

    if (await overviewPage.container.isVisible()) {
      await this.openBudgetFromNavigation();
    }

    await budgetPage.waitFor(options);
    return budgetPage;
  }

  private async openBudgetFromNavigation() {
    if ((this.page.viewportSize()?.width ?? Infinity) < NARROW_WIDTH) {
      const budgetLink = this.page
        .locator('[data-navbar-state]')
        .getByRole('link', { name: 'Budget' });
      // Click via evaluate: the navbar uses react-spring transforms, so
      // Playwright's viewport-stability check rejects mid-animation clicks.
      await budgetLink.evaluate((el: HTMLElement) => el.click());
    } else {
      await this.page
        .getByTestId('sidebar-primary-buttons')
        .getByRole('link', { name: 'Budget', exact: true })
        .click();
    }
  }
}
