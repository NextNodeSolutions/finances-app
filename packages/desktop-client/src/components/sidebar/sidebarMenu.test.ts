import {
  getDefaultSidebarMenuItems,
  getSidebarMenuItemPath,
  isInMobileSettingsNav,
  isSidebarMenuItemAvailable,
  moveSidebarMenuItem,
  parseSidebarMenuItems,
  parseSidebarStartPage,
} from './sidebarMenu';
import type { SidebarMenuItem } from './sidebarMenu';

describe('parseSidebarMenuItems', () => {
  it('returns the defaults when nothing is saved', () => {
    expect(parseSidebarMenuItems(undefined)).toEqual([
      { id: 'overview', hidden: false },
      { id: 'budget', hidden: false },
      { id: 'schedules', hidden: false },
      { id: 'reports', hidden: false },
      { id: 'payees', hidden: true },
      { id: 'rules', hidden: true },
      { id: 'tags', hidden: true },
      { id: 'bank-sync', hidden: true },
    ]);
  });

  it('returns the defaults for a malformed value', () => {
    expect(parseSidebarMenuItems('{not json')).toEqual(
      getDefaultSidebarMenuItems(),
    );
  });

  it('keeps the saved order and visibility', () => {
    const saved = [
      { id: 'payees', hidden: false },
      { id: 'budget', hidden: false },
      { id: 'overview', hidden: false },
      { id: 'reports', hidden: false },
      { id: 'schedules', hidden: true },
      { id: 'tags', hidden: true },
      { id: 'rules', hidden: false },
      { id: 'bank-sync', hidden: true },
    ];

    expect(parseSidebarMenuItems(JSON.stringify(saved))).toEqual(saved);
  });

  it('drops unknown and duplicate entries', () => {
    const items = parseSidebarMenuItems(
      JSON.stringify([
        { id: 'reports', hidden: false },
        { id: 'unknown', hidden: false },
        { id: 'reports', hidden: true },
        null,
      ]),
    );

    expect(items.filter(item => item.id === 'reports')).toEqual([
      { id: 'reports', hidden: false },
    ]);
    expect(items).toHaveLength(8);
  });

  it('inserts missing pages at their default position', () => {
    const items = parseSidebarMenuItems(
      JSON.stringify([
        { id: 'schedules', hidden: false },
        { id: 'budget', hidden: false },
      ]),
    );

    expect(items.map(item => item.id)).toEqual([
      'overview',
      'schedules',
      'budget',
      'reports',
      'payees',
      'rules',
      'tags',
      'bank-sync',
    ]);
    expect(items.find(item => item.id === 'reports')?.hidden).toBe(false);
    expect(items.find(item => item.id === 'payees')?.hidden).toBe(true);
  });

  it('puts Overview first for a menu saved before Overview existed', () => {
    const items = parseSidebarMenuItems(
      JSON.stringify([
        { id: 'budget', hidden: false },
        { id: 'reports', hidden: false },
        { id: 'schedules', hidden: true },
        { id: 'payees', hidden: false },
        { id: 'tags', hidden: true },
        { id: 'rules', hidden: true },
        { id: 'bank-sync', hidden: true },
      ]),
    );

    expect(items).toEqual([
      { id: 'overview', hidden: false },
      { id: 'budget', hidden: false },
      { id: 'reports', hidden: false },
      { id: 'schedules', hidden: true },
      { id: 'payees', hidden: false },
      { id: 'tags', hidden: true },
      { id: 'rules', hidden: true },
      { id: 'bank-sync', hidden: true },
    ]);
  });

  it('always keeps overview, budget and reports in the sidebar', () => {
    const items = parseSidebarMenuItems(
      JSON.stringify(
        getDefaultSidebarMenuItems().map(item => ({ ...item, hidden: true })),
      ),
    );

    expect(items.filter(item => !item.hidden)).toEqual([
      { id: 'overview', hidden: false },
      { id: 'budget', hidden: false },
      { id: 'reports', hidden: false },
    ]);
  });
});

describe('parseSidebarStartPage', () => {
  const items = parseSidebarMenuItems(
    JSON.stringify([
      { id: 'reports', hidden: false },
      { id: 'budget', hidden: false },
      { id: 'schedules', hidden: true },
    ]),
  );

  it('returns the saved page whether or not it is in the sidebar', () => {
    expect(parseSidebarStartPage('budget', items)).toBe('budget');
    expect(parseSidebarStartPage('schedules', items)).toBe('schedules');
  });

  it('falls back to Overview', () => {
    expect(parseSidebarStartPage(undefined, items)).toBe('overview');
    expect(parseSidebarStartPage('unknown', items)).toBe('overview');
  });

  it('falls back to Overview even when it is not the first page', () => {
    const reordered = parseSidebarMenuItems(
      JSON.stringify([
        { id: 'budget', hidden: false },
        { id: 'overview', hidden: false },
      ]),
    );

    expect(parseSidebarStartPage(undefined, reordered)).toBe('overview');
  });
});

describe('moveSidebarMenuItem', () => {
  const items: SidebarMenuItem[] = [
    { id: 'budget', hidden: false },
    { id: 'reports', hidden: false },
    { id: 'schedules', hidden: false },
  ];

  it('moves a page before the target', () => {
    expect(
      moveSidebarMenuItem(items, 'schedules', 'budget', 'before').map(
        item => item.id,
      ),
    ).toEqual(['schedules', 'budget', 'reports']);
  });

  it('moves a page after the target', () => {
    expect(
      moveSidebarMenuItem(items, 'budget', 'schedules', 'after').map(
        item => item.id,
      ),
    ).toEqual(['reports', 'schedules', 'budget']);
  });

  it('leaves the order alone for an unknown target', () => {
    expect(moveSidebarMenuItem(items, 'budget', 'unknown', 'after')).toBe(
      items,
    );
  });
});

describe('isInMobileSettingsNav', () => {
  it('leaves schedules and tags out of the mobile settings menu', () => {
    expect(isInMobileSettingsNav('schedules')).toBe(false);
    expect(isInMobileSettingsNav('tags')).toBe(false);
    expect(isInMobileSettingsNav('payees')).toBe(true);
    expect(isInMobileSettingsNav('bank-sync')).toBe(true);
  });
});

describe('isSidebarMenuItemAvailable', () => {
  const allOn = { isUsingServer: true, isBankSyncOn: true, isTagsOn: true };

  it('offers bank sync only with a server and the feature on', () => {
    expect(isSidebarMenuItemAvailable('bank-sync', allOn)).toBe(true);
    expect(
      isSidebarMenuItemAvailable('bank-sync', {
        ...allOn,
        isBankSyncOn: false,
      }),
    ).toBe(false);
    expect(
      isSidebarMenuItemAvailable('bank-sync', {
        ...allOn,
        isUsingServer: false,
      }),
    ).toBe(false);
  });

  it('offers tags only with the feature on', () => {
    expect(isSidebarMenuItemAvailable('tags', allOn)).toBe(true);
    expect(
      isSidebarMenuItemAvailable('tags', { ...allOn, isTagsOn: false }),
    ).toBe(false);
  });

  it('keeps every other page whatever the features', () => {
    const allOff = {
      isUsingServer: false,
      isBankSyncOn: false,
      isTagsOn: false,
    };
    for (const id of [
      'overview',
      'budget',
      'schedules',
      'reports',
      'payees',
      'rules',
    ] as const) {
      expect(isSidebarMenuItemAvailable(id, allOff)).toBe(true);
    }
  });
});

describe('getSidebarMenuItemPath', () => {
  it('uses a top-level path for pages in the sidebar', () => {
    expect(getSidebarMenuItemPath('payees', true)).toBe('/payees');
    expect(getSidebarMenuItemPath('budget', true)).toBe('/budget');
    expect(getSidebarMenuItemPath('overview', true)).toBe('/overview');
  });

  it('keeps settings sections under /settings when they are not in the sidebar', () => {
    expect(getSidebarMenuItemPath('payees', false)).toBe('/settings/payees');
    expect(getSidebarMenuItemPath('schedules', false)).toBe(
      '/settings/schedules',
    );
  });
});
