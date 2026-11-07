import React, { Fragment } from 'react';
import type {
  ComponentProps,
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactElement,
} from 'react';
import { useTranslation } from 'react-i18next';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { styles } from '@actual-app/components/styles';
import { TextOneLine } from '@actual-app/components/text-one-line';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { AccountGroupEntity } from '@actual-app/core/types/models';
import { css, cx } from '@emotion/css';

import { Autocomplete } from './Autocomplete';

export const NEW_ACCOUNT_GROUP_ID = 'new';

type AccountGroupAutocompleteItem = Pick<AccountGroupEntity, 'id' | 'name'>;

function filterGroupSuggestions(
  suggestions: AccountGroupAutocompleteItem[],
  value: string,
): AccountGroupAutocompleteItem[] {
  const trimmed = value.trim().toLowerCase();
  const matches = suggestions.filter(suggestion =>
    suggestion.name.toLowerCase().includes(trimmed),
  );
  const hasExactMatch = matches.some(
    suggestion => suggestion.name.toLowerCase() === trimmed,
  );
  if (trimmed === '' || hasExactMatch) {
    return matches;
  }
  return [...matches, { id: NEW_ACCOUNT_GROUP_ID, name: value.trim() }];
}

type AccountGroupListProps = {
  items: AccountGroupAutocompleteItem[];
  getItemProps?: (arg: {
    item: AccountGroupAutocompleteItem;
  }) => Partial<ComponentProps<typeof View>>;
  highlightedIndex: number;
  embedded?: boolean;
  renderAccountGroupItem?: (
    props: ComponentPropsWithoutRef<typeof AccountGroupItem>,
  ) => ReactElement<typeof AccountGroupItem>;
};

function AccountGroupList({
  items,
  getItemProps,
  highlightedIndex,
  embedded,
  renderAccountGroupItem = defaultRenderAccountGroupItem,
}: AccountGroupListProps) {
  return (
    <View>
      <View
        style={{
          overflowY: 'auto',
          willChange: 'transform',
          padding: 4,
          ...(!embedded && { maxHeight: 175 }),
        }}
      >
        {items.map((item, index) => (
          <Fragment key={item.id}>
            {renderAccountGroupItem({
              ...(getItemProps ? getItemProps({ item }) : {}),
              item,
              highlighted: highlightedIndex === index,
              embedded,
            })}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

type AccountGroupAutocompleteProps = Omit<
  Extract<
    ComponentProps<typeof Autocomplete<AccountGroupAutocompleteItem>>,
    { type?: 'single' | never }
  >,
  'suggestions' | 'renderItems'
> & {
  groups: AccountGroupAutocompleteItem[];
  renderAccountGroupItem?: (
    props: ComponentPropsWithoutRef<typeof AccountGroupItem>,
  ) => ReactElement<typeof AccountGroupItem>;
};

export function AccountGroupAutocomplete({
  groups,
  embedded,
  renderAccountGroupItem,
  ...props
}: AccountGroupAutocompleteProps) {
  return (
    <Autocomplete
      strict
      highlightFirst
      embedded={embedded}
      suggestions={groups}
      filterSuggestions={filterGroupSuggestions}
      renderItems={(items, getItemProps, highlightedIndex) => (
        <AccountGroupList
          items={items}
          getItemProps={getItemProps}
          highlightedIndex={highlightedIndex}
          embedded={embedded}
          renderAccountGroupItem={renderAccountGroupItem}
        />
      )}
      {...props}
    />
  );
}

type AccountGroupItemProps = {
  item: AccountGroupAutocompleteItem;
  className?: string;
  style?: CSSProperties;
  highlighted?: boolean;
  embedded?: boolean;
};

function AccountGroupItem({
  item,
  className,
  style,
  highlighted,
  // Kept out of the DOM props; items look the same embedded or not.
  embedded: _embedded,
  ...props
}: AccountGroupItemProps) {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  const narrowStyle = isNarrowWidth
    ? {
        ...styles.mobileMenuItem,
        borderRadius: 0,
        borderTop: `1px solid ${theme.pillBorder}`,
      }
    : {};
  const isCreateRow = item.id === NEW_ACCOUNT_GROUP_ID;

  return (
    <button
      type="button"
      style={style}
      className={cx(
        className,
        css({
          backgroundColor: highlighted
            ? theme.menuAutoCompleteBackgroundHover
            : 'transparent',
          color: isCreateRow
            ? theme.accentText
            : highlighted
              ? theme.menuAutoCompleteItemTextHover
              : theme.menuAutoCompleteItemText,
          padding: '5px 10px',
          paddingLeft: 20,
          borderRadius: radius.sm,
          border: 'none',
          font: 'inherit',
          // After the `font` shorthand, which would reset it.
          fontWeight: isCreateRow ? 500 : undefined,
          ...narrowStyle,
        }),
      )}
      data-testid={`${item.name}-account-group-item`}
      data-highlighted={highlighted || undefined}
      {...props}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextOneLine>
          {isCreateRow
            ? `+ ${t('Create "{{name}}"', { name: item.name })}`
            : item.name}
        </TextOneLine>
      </View>
    </button>
  );
}

function defaultRenderAccountGroupItem(
  props: ComponentPropsWithoutRef<typeof AccountGroupItem>,
): ReactElement<typeof AccountGroupItem> {
  return <AccountGroupItem {...props} />;
}
