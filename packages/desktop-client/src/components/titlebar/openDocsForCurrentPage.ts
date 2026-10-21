function getPageDocs(page: string): string {
  switch (page) {
    case '/budget':
      return 'https://actualbudget.org/docs/getting-started/envelope-budgeting';
    case '/reports':
      return 'https://actualbudget.org/docs/reports/';
    case '/schedules':
    case '/settings/schedules':
      return 'https://actualbudget.org/docs/schedules';
    case '/payees':
    case '/settings/payees':
      return 'https://actualbudget.org/docs/transactions/payees';
    case '/rules':
    case '/settings/rules':
      return 'https://actualbudget.org/docs/budgeting/rules';
    case '/tags':
    case '/settings/tags':
      return 'https://actualbudget.org/docs/transactions/tags';
    case '/bank-sync':
    case '/settings/bank-sync':
      return 'https://actualbudget.org/docs/advanced/bank-sync';
    case '/settings/experimental':
      return 'https://actualbudget.org/docs/experimental';
    case '/settings':
    case '/settings/general':
    case '/settings/advanced':
      return 'https://actualbudget.org/docs/settings';
    case '/notifications':
      return 'https://actualbudget.org/docs/notifications';
    default:
      // All pages under /accounts, plus any missing pages
      return 'https://actualbudget.org/docs';
  }
}

/** Opens the documentation for the page the user is on. */
export function openDocsForCurrentPage(): void {
  window.Actual.openURLInBrowser(getPageDocs(window.location.pathname));
}
