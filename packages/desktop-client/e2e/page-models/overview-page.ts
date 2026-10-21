import type { Locator, Page } from '@playwright/test';

export class OverviewPage {
  readonly page: Page;
  readonly container: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('overview-page');
  }

  async waitFor(...options: Parameters<Locator['waitFor']>) {
    await this.container.waitFor(...options);
  }
}
