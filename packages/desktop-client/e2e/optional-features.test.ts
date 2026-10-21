import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { AccountPage } from './page-models/account-page';
import { ConfigurationPage } from './page-models/configuration-page';
import { Navigation } from './page-models/navigation';
import type { SettingsPage } from './page-models/settings-page';

const GATED_PAGES = ['Bank Sync', 'Tags'] as const;

test.describe('Optional features', () => {
  let page: Page;
  let navigation: Navigation;
  let settingsPage: SettingsPage;
  let configurationPage: ConfigurationPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    navigation = new Navigation(page);
    configurationPage = new ConfigurationPage(page);

    await page.goto('/');
    await configurationPage.createTestFile();

    settingsPage = await navigation.goToSettingsPage();
  });

  test.afterEach(async () => {
    await page?.close();
  });

  // The sidebar (primary nav, Manage footer) and the settings nav.
  function getPageLinks(name: string) {
    return [
      page.getByRole('navigation', { name: 'Sidebar' }),
      settingsPage.settingsNav,
    ].map(region => region.getByRole('link', { name, exact: true }));
  }

  test('removes bank sync and tags everywhere when turned off', async () => {
    // Playwright runs with both features on.
    for (const name of GATED_PAGES) {
      await expect(
        settingsPage.settingsNav.getByRole('link', { name, exact: true }),
      ).toBeVisible();
    }

    await settingsPage.disableFeature('bankSync');
    await settingsPage.disableFeature('tags');

    for (const name of GATED_PAGES) {
      for (const link of getPageLinks(name)) {
        await expect(link).toHaveCount(0);
      }
    }

    await page.goto('/bank-sync');
    await expect(page).toHaveURL(/\/overview$/);
    await page.goto('/tags');
    await expect(page).toHaveURL(/\/overview$/);

    // Adding an account goes straight to the local form.
    await page.getByTestId('sidebar-add-account').click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('heading', { name: 'Add account' }),
    ).toBeVisible();
    await expect(dialog.getByLabel('Name')).toBeVisible();
    await expect(dialog.getByRole('button', { name: /bank/i })).toHaveCount(0);

    await dialog.getByLabel('Name').fill('Wallet');
    await dialog.getByRole('button', { name: 'Create', exact: true }).click();

    const accountPage = new AccountPage(page);
    await accountPage.waitFor();
    await accountPage.createSingleTransaction({
      payee: 'Kroger',
      notes: '#food',
      debit: '12.00',
    });

    // A #word in a note stays text: no tag button.
    const { notes } = accountPage.getNthTransaction(0);
    await expect(notes).toContainText('#food');
    await expect(notes.getByRole('button', { name: '#food' })).toHaveCount(0);

    settingsPage = await navigation.goToSettingsPage();
    await settingsPage.enableFeature('bankSync');
    await settingsPage.enableFeature('tags');

    for (const name of GATED_PAGES) {
      await expect(
        settingsPage.settingsNav.getByRole('link', { name, exact: true }),
      ).toBeVisible();
      await expect(
        page.getByTestId('sidebar-manage').getByRole('link', {
          name,
          exact: true,
        }),
      ).toBeVisible();
    }
  });
});
