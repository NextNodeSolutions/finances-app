import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import type { CategoryEntity } from '@actual-app/core/types/models';

import { CategoryAutocomplete } from '#components/autocomplete/CategoryAutocomplete';
import { useLocalPref } from '#hooks/useLocalPref';

import { PanelField } from './PanelField';

type CategoryFieldProps = {
  categoryId: CategoryEntity['id'] | undefined;
  onChange: (categoryId: CategoryEntity['id'] | undefined) => void;
  /** The category came from a rule and the user has not changed it. */
  isFromRule: boolean;
  isDisabled?: boolean;
};

/**
 * Lists each category with its balance (`Gift 75.00`); wrap it in the
 * transaction month's `SheetNameProvider`.
 */
export function CategoryField({
  categoryId,
  onChange,
  isFromRule,
  isDisabled,
}: CategoryFieldProps) {
  const { t } = useTranslation();
  const id = useId();
  const [showHiddenCategories] = useLocalPref('budget.showHiddenCategories');

  return (
    <PanelField
      label={t('Category')}
      htmlFor={id}
      caption={isFromRule ? t('Set by a rule') : undefined}
    >
      <CategoryAutocomplete
        value={categoryId ?? null}
        showBalances
        showHiddenCategories={showHiddenCategories}
        onSelect={selected => onChange(selected || undefined)}
        inputProps={{ id, 'aria-label': t('Category'), disabled: isDisabled }}
      />
    </PanelField>
  );
}
