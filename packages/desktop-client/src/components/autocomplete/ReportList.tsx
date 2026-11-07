import React from 'react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { ItemHeader } from './ItemHeader';

export function ReportList<T extends { id: string; name: string }>({
  items,
  getItemProps,
  highlightedIndex,
  embedded,
}: {
  items: T[];
  getItemProps: (arg: { item: T }) => ComponentProps<typeof View>;
  highlightedIndex: number;
  embedded?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View>
      <View
        style={{
          overflow: 'auto',
          padding: 4,
          ...(!embedded && { maxHeight: 175 }),
        }}
      >
        <ItemHeader title={t('Saved Reports')} />
        {items.map((item, idx) => {
          return [
            <div
              key={item.id}
              {...(getItemProps ? getItemProps({ item }) : null)}
              style={{
                backgroundColor:
                  highlightedIndex === idx
                    ? theme.menuAutoCompleteBackgroundHover
                    : 'transparent',
                padding: '5px 10px',
                paddingLeft: 20,
                borderRadius: radius.sm,
              }}
              data-highlighted={highlightedIndex === idx || undefined}
            >
              {item.name}
            </div>,
          ];
        })}
      </View>
    </View>
  );
}
