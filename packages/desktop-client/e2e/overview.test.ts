import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { OverviewPage } from './page-models/overview-page';

test.describe('Overview', () => {
  let page: Page;
  let overviewPage: OverviewPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    overviewPage = new OverviewPage(page);

    await page.goto('/');
    // A newly opened file lands on the Overview.
    await page
      .getByRole('button', { name: 'Try the demo', exact: true })
      .click();
    await overviewPage.waitFor();
  });

  test.afterEach(async () => {
    await page?.close();
  });

  test('lands on the statement of position', async () => {
    await expect(page).toHaveURL(/\/overview$/);
    await expect(
      overviewPage.container.getByText('Net worth').first(),
    ).toBeVisible();
    await expect(overviewPage.balanceSheet).toBeVisible();
    await expect(overviewPage.monthHealth).toBeVisible();
    await expect(overviewPage.recentActivity).toBeVisible();
    await expect(page).toMatchThemeScreenshots();
  });

  test('headline matches the sidebar all-accounts balance', async () => {
    const sidebarBalance = page.getByTestId('sidebar-all-accounts-balance');
    await expect(sidebarBalance).not.toHaveText('');
    await expect(overviewPage.netWorth).not.toHaveText('—');

    await expect
      .poll(async () => (await overviewPage.netWorth.textContent())?.trim())
      .toBe((await sidebarBalance.textContent())?.trim());
  });

  test('rewinds with the arrow keys and returns to today with Esc', async () => {
    await overviewPage.waitForHistory();
    const todayNetWorth = (await overviewPage.netWorth.textContent())?.trim();

    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/[?&]asof=2016-12/);
    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/[?&]asof=2016-11/);

    await expect(overviewPage.asOfPill).toBeVisible();
    await expect(overviewPage.asOf).toHaveText('As of 30 Nov 2016');
    await expect(overviewPage.monthHealth).toContainText(
      'November 2016 statement',
    );
    await expect(overviewPage.upcoming).toBeHidden();
    await expect(overviewPage.netWorth).not.toHaveText('—');

    await page.keyboard.press('Escape');
    await expect(page).not.toHaveURL(/asof=/);
    await expect(overviewPage.asOfPill).toBeHidden();
    await expect(overviewPage.netWorth).toHaveText(todayNetWorth ?? '');
  });

  test('reads the as-of month from the URL', async () => {
    await overviewPage.waitForHistory();

    await page.evaluate(() => {
      window.history.pushState({}, '', '/overview?asof=2016-10');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    await expect(overviewPage.asOfPill).toBeVisible();
    await expect(overviewPage.asOf).toHaveText('As of 31 Oct 2016');

    await overviewPage.todayButton.click();
    await expect(page).not.toHaveURL(/asof=/);
    await expect(overviewPage.asOfPill).toBeHidden();
  });

  test('steps through month-ends with the header buttons', async () => {
    await overviewPage.waitForHistory();

    await overviewPage.previousMonthEndButton.click();
    await expect(overviewPage.asOf).toHaveText('As of 31 Dec 2016');
    await overviewPage.nextMonthEndButton.click();
    await expect(overviewPage.asOfPill).toBeHidden();
  });

  test('an account row opens its register', async () => {
    const accountPage = await overviewPage.openAccount('Ally Savings');

    await expect(page).toHaveURL(/\/accounts\/[^/]+$/);
    await expect(accountPage.accountName).toHaveText('Ally Savings');
  });

  test('Open budget opens the budget at that month', async () => {
    await overviewPage.openBudget();

    await expect(page).toHaveURL(/\/budget$/);
  });
});
