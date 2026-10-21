import type * as PlatformModule from '@actual-app/core/shared/platform';
import type { AccountEntity } from '@actual-app/core/types/models';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TestProviders } from '#mocks';
import { mergeSyncedPrefs } from '#prefs/prefsSlice';
import { useStore } from '#redux';

import { isOptionalFeatureOn, useOptionalFeature } from './useOptionalFeature';

const platform = vi.hoisted(() => ({ isPlaywright: false }));
const accountsQuery = vi.hoisted(() => ({
  data: [] as AccountEntity[],
  isPlaceholderData: false,
}));

vi.mock('@actual-app/core/shared/platform', async () => {
  const actual = await vi.importActual<typeof PlatformModule>(
    '@actual-app/core/shared/platform',
  );
  return {
    ...actual,
    get isPlaywright() {
      return platform.isPlaywright;
    },
  };
});

vi.mock('#hooks/useAccounts', () => ({
  useAccounts: () => accountsQuery,
}));

function account(overrides: Partial<AccountEntity> = {}): AccountEntity {
  return {
    id: 'account-1',
    account_group_id: null,
    name: 'Checking',
    offbudget: 0,
    closed: 0,
    sort_order: 0,
    last_reconciled: null,
    tombstone: 0,
    account_id: null,
    bank: null,
    bankName: null,
    bankId: null,
    mask: null,
    official_name: null,
    balance_current: null,
    balance_available: null,
    balance_limit: null,
    account_sync_source: null,
    last_sync: null,
    bank_sync_status: null,
    ...overrides,
  };
}

const linkedAccount = account({ account_sync_source: 'simpleFin' });

beforeEach(() => {
  platform.isPlaywright = false;
  accountsQuery.data = [];
});

describe('isOptionalFeatureOn', () => {
  it('lets an explicit pref win over every default', () => {
    platform.isPlaywright = true;

    expect(
      isOptionalFeatureOn(
        { 'features.bankSync': 'false' },
        [linkedAccount],
        'bankSync',
      ),
    ).toBe(false);
    expect(isOptionalFeatureOn({ 'features.tags': 'false' }, [], 'tags')).toBe(
      false,
    );

    platform.isPlaywright = false;

    expect(
      isOptionalFeatureOn({ 'features.bankSync': 'true' }, [], 'bankSync'),
    ).toBe(true);
    expect(isOptionalFeatureOn({ 'features.tags': 'true' }, [], 'tags')).toBe(
      true,
    );
  });

  it('turns every feature on under Playwright when nothing is saved', () => {
    platform.isPlaywright = true;

    expect(isOptionalFeatureOn({}, [], 'bankSync')).toBe(true);
    expect(isOptionalFeatureOn({}, [], 'tags')).toBe(true);
  });

  it('keeps bank sync on when an open account is linked to a bank', () => {
    expect(
      isOptionalFeatureOn({}, [account(), linkedAccount], 'bankSync'),
    ).toBe(true);
  });

  it('turns bank sync off when no open account is linked', () => {
    expect(isOptionalFeatureOn({}, [], 'bankSync')).toBe(false);
    expect(isOptionalFeatureOn({}, [account()], 'bankSync')).toBe(false);
    expect(
      isOptionalFeatureOn(
        {},
        [account({ account_sync_source: 'goCardless', closed: 1 })],
        'bankSync',
      ),
    ).toBe(false);
    expect(
      isOptionalFeatureOn(
        {},
        [account({ account_sync_source: 'goCardless', tombstone: 1 })],
        'bankSync',
      ),
    ).toBe(false);
  });

  it('turns tags off by default, whatever the accounts', () => {
    expect(isOptionalFeatureOn({}, [linkedAccount], 'tags')).toBe(false);
  });

  it('ignores values other than true and false', () => {
    expect(
      isOptionalFeatureOn(
        { 'features.bankSync': '' },
        [linkedAccount],
        'bankSync',
      ),
    ).toBe(true);
    expect(isOptionalFeatureOn({ 'features.tags': 'yes' }, [], 'tags')).toBe(
      false,
    );
  });
});

describe('useOptionalFeature', () => {
  function renderFeature(feature: 'bankSync' | 'tags') {
    return renderHook(
      () => ({ feature: useOptionalFeature(feature), store: useStore() }),
      { wrapper: TestProviders },
    );
  }

  it('derives bank sync from the linked accounts', () => {
    accountsQuery.data = [linkedAccount];

    const { result } = renderFeature('bankSync');

    expect(result.current.feature[0]).toBe(true);
  });

  it('follows the synced pref once it is set', () => {
    const { result } = renderFeature('tags');
    expect(result.current.feature[0]).toBe(false);

    act(() => {
      result.current.store.dispatch(
        mergeSyncedPrefs({ 'features.tags': 'true' }),
      );
    });

    expect(result.current.feature[0]).toBe(true);
  });

  it('stores the choice in the synced prefs', () => {
    accountsQuery.data = [linkedAccount];
    const { result } = renderFeature('bankSync');

    act(() => {
      result.current.feature[1](false);
    });

    expect(result.current.feature[0]).toBe(false);
    expect(
      result.current.store.getState().prefs.synced['features.bankSync'],
    ).toBe('false');
  });
});
