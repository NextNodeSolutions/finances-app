import {
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from 'react-aria-components';
import { useTranslation } from 'react-i18next';

import { SvgCheveronDown } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { css } from '@emotion/css';

import { Amount } from '#components/budget/Amount';

import type { CoverCategory } from './getCoverPlan';

type SourcePickerProps = {
  sources: readonly CoverCategory[];
  value: CoverCategory['id'] | null;
  onChange: (id: CoverCategory['id']) => void;
  isInvalid?: boolean;
};

const triggerClassName = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spacing.sm,
  width: '100%',
  padding: '6px 10px',
  font: 'inherit',
  color: theme.formInputText,
  backgroundColor: theme.formInputBackground,
  border: `1px solid ${theme.formInputBorder}`,
  borderRadius: radius.sm,
  cursor: 'pointer',
  '&[data-focus-visible]': styles.focusRing,
  '&[data-invalid]': { borderColor: theme.errorBorder },
  '& [data-placeholder]': { color: theme.formInputTextPlaceholder },
});

const popoverClassName = css({
  ...styles.popover,
  width: 'var(--trigger-width)',
  maxHeight: 280,
  overflowY: 'auto',
  padding: spacing.xs,
});

const itemClassName = css({
  display: 'flex',
  justifyContent: 'space-between',
  gap: spacing.md,
  padding: '6px 10px',
  borderRadius: radius.sm,
  color: theme.menuItemText,
  cursor: 'pointer',
  outline: 'none',
  '&[data-focused], &[data-hovered]': {
    backgroundColor: theme.menuItemBackgroundHover,
    color: theme.menuItemTextHover,
  },
  '&[data-selected]': { fontWeight: 600 },
});

/**
 * Where the money for a cover comes from. Starts empty on purpose: the
 * user names the source, nothing is guessed for them.
 */
export function SourcePicker({
  sources,
  value,
  onChange,
  isInvalid = false,
}: SourcePickerProps) {
  const { t } = useTranslation();

  return (
    <Select
      aria-label={t('Cover from')}
      placeholder={t('Choose a source…')}
      value={value}
      isInvalid={isInvalid}
      onChange={key => {
        if (typeof key === 'string') {
          onChange(key);
        }
      }}
    >
      <Button className={triggerClassName}>
        <SelectValue />
        <SvgCheveronDown width={10} height={10} aria-hidden />
      </Button>
      <Popover className={popoverClassName} placement="bottom start">
        <ListBox items={sources}>
          {source => (
            <ListBoxItem
              id={source.id}
              textValue={source.name}
              className={itemClassName}
            >
              <span>{source.name}</span>
              <Amount value={source.balance} />
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  );
}
