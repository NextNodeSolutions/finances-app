import type { ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useOptionalFeature } from '#hooks/useOptionalFeature';
import { TestProviders } from '#mocks';

import { FilterEditor } from './FiltersMenu';

vi.mock('#hooks/useOptionalFeature', () => ({
  useOptionalFeature: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useOptionalFeature).mockReturnValue([true, vi.fn()]);
});

describe('FilterEditor amount sign', () => {
  const renderEditor = (
    props: Partial<ComponentProps<typeof FilterEditor>> = {},
  ) => {
    const onSave = vi.fn();
    render(
      <FilterEditor
        field="amount"
        op="gt"
        // New filters render null values as empty strings.
        value=""
        onSave={onSave}
        onClose={vi.fn()}
        {...props}
      />,
      { wrapper: TestProviders },
    );
    return { onSave };
  };

  it('submits a positive amount for a filter created without a value', async () => {
    const user = userEvent.setup();
    const { onSave } = renderEditor();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), '150');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ field: 'amount', op: 'gt', value: 15000 }),
    );
  });

  it('keeps an existing negative amount negative when edited', async () => {
    const user = userEvent.setup();
    const { onSave } = renderEditor({ value: -15000 });

    expect(
      screen.getByRole('button', { name: 'Make positive' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ field: 'amount', op: 'gt', value: -15000 }),
    );
  });
});

describe('FilterEditor tag operators', () => {
  const renderNotesEditor = (op: 'contains' | 'hasTags' = 'contains') =>
    render(
      <FilterEditor
        field="notes"
        op={op}
        value=""
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
      { wrapper: TestProviders },
    );

  it('offers the tag operators when tags are on', () => {
    renderNotesEditor();

    expect(
      screen.getByRole('button', { name: 'has all tags' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'has any tag' }),
    ).toBeInTheDocument();
  });

  it('hides the tag operators when tags are off', () => {
    vi.mocked(useOptionalFeature).mockReturnValue([false, vi.fn()]);
    renderNotesEditor();

    expect(
      screen.getByRole('button', { name: 'contains' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'has all tags' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'has any tag' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the tag operator an existing filter already uses', () => {
    vi.mocked(useOptionalFeature).mockReturnValue([false, vi.fn()]);
    renderNotesEditor('hasTags');

    expect(
      screen.getByRole('button', { name: 'has all tags' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'has any tag' }),
    ).not.toBeInTheDocument();
  });
});
