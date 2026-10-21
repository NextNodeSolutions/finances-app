import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { ConfigurationPage } from './page-models/configuration-page';
import { MobileNavigation } from './page-models/mobile-navigation';
import { MobileOverviewPage } from './page-models/mobile-overview-page';

test.describe('Mobile Overview', () => {
  let page: Page;
  let navigation: MobileNavigation;
  let configurationPage: ConfigurationPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    navigation = new MobileNavigation(page);
    configurationPage = new ConfigurationPage(page);

    await page.setViewportSize({
      width: 350,
      height: 600,
    });
    await page.goto('/');
    await configurationPage.createTestFile();
  });

  test.afterEach(async () => {
    await page?.close();
  });

  test('opens on the Overview from the start page', async () => {
    await page.goto('/');
    const overviewPage = new MobileOverviewPage(page);
    await overviewPage.waitFor();

    await expect(page).toHaveURL(/\/overview$/);
    await expect(overviewPage.netWorth).toBeVisible();
  });

  test('switches the trend between six months and a year', async () => {
    const overviewPage = await navigation.goToOverviewPage();

    await expect(overviewPage.rangeToggle).toHaveAccessibleName(
      'Show the last 12 months',
    );
    await overviewPage.rangeToggle.click();
    await expect(overviewPage.rangeToggle).toHaveAccessibleName(
      'Show the last 6 months',
    );
  });

  test('reads a past month-end from the asof link', async () => {
    await page.goto('/overview?asof=2016-12');
    const overviewPage = new MobileOverviewPage(page);
    await overviewPage.waitFor();

    await expect(overviewPage.asOf).toHaveText('As of 31 Dec 2016');
    await expect(overviewPage.monthCard).toContainText(
      'December 2016 statement',
    );
    await expect(overviewPage.upcoming).toHaveCount(0);

    await overviewPage.todayButton.click();
    await expect(overviewPage.asOf).toHaveCount(0);
    await expect(overviewPage.monthCard).toContainText('This month');
  });

  test('opens an account from its row', async () => {
    const overviewPage = await navigation.goToOverviewPage();
    await overviewPage.openAccount('Bank of America');

    // The Overview's headings stay on screen for a moment after the route
    // changes, so look for the account's own heading.
    await expect(
      page.getByRole('heading', { name: 'Bank of America', exact: true }),
    ).toBeVisible();
  });

  test('lists the secondary pages in the More sheet', async () => {
    const moreSheet = await navigation.openMoreSheet();

    for (const name of [
      'Reports',
      'Schedules',
      'Payees',
      'Rules',
      'Settings',
    ]) {
      await expect(
        moreSheet.getByRole('link', { name, exact: true }),
      ).toBeVisible();
    }
    // Optional features default to on under Playwright, so Tags is listed.
    await expect(
      moreSheet.getByRole('link', { name: 'Tags', exact: true }),
    ).toBeVisible();

    // Following a row drops the sheet with the page change.
    const payeesPage = await navigation.goToPayeesPage();
    await expect(payeesPage.payeesList).toBeVisible();
    await expect(navigation.moreSheet).toHaveCount(0);
  });
});
