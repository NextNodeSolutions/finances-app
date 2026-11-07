import { useEffect, useRef, useState } from 'react';
import type {
  ComponentProps,
  ComponentType,
  CSSProperties,
  KeyboardEvent,
  ReactNode,
  SVGProps,
} from 'react';

import { Button } from './Button';
import { styles } from './styles';
import { Text } from './Text';
import { theme } from './theme';
import { Toggle } from './Toggle';
import { radius } from './tokens';
import { View } from './View';

const MenuLine: unique symbol = Symbol('menu-line');
const MenuLabel: unique symbol = Symbol('menu-label');
Menu.line = MenuLine as typeof MenuLine;
Menu.label = MenuLabel as typeof MenuLabel;

type KeybindingProps = {
  keyName: ReactNode;
};

function Keybinding({ keyName }: KeybindingProps) {
  return (
    <Text
      style={{
        ...styles.tnum,
        fontSize: 11,
        color: theme.menuKeybindingText,
        marginLeft: 12,
      }}
    >
      {keyName}
    </Text>
  );
}

export type MenuItemObject<NameType, Type extends string | symbol = string> = {
  type?: Type;
  name: NameType;
  disabled?: boolean;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconSize?: number;
  text: string;
  key?: string;
  toggle?: boolean;
  tooltip?: string;
};

export type MenuItem<NameType = string> =
  | MenuItemObject<NameType>
  | MenuItemObject<string, typeof Menu.label>
  | typeof Menu.line;

function isLabel<T>(
  item: MenuItemObject<T> | MenuItemObject<string, typeof Menu.label>,
): item is MenuItemObject<string, typeof Menu.label> {
  return item.type === Menu.label;
}

type MenuProps<NameType> = {
  header?: ReactNode;
  footer?: ReactNode;
  items: Array<MenuItem<NameType>>;
  onMenuSelect?: (itemName: NameType) => void;
  style?: CSSProperties;
  className?: string;
  getItemStyle?: (item: MenuItemObject<NameType>) => CSSProperties;
  slot?: ComponentProps<typeof Button>['slot'];
};

export function Menu<const NameType = string>({
  header,
  footer,
  items: allItems,
  onMenuSelect,
  style,
  className,
  getItemStyle,
  slot,
}: MenuProps<NameType>) {
  const elRef = useRef<HTMLDivElement>(null);
  const items = allItems.filter(x => x);
  const filteredItems = items.filter(
    item => item && item !== Menu.line && item.type !== Menu.label,
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const currentIndex = filteredItems.indexOf(items[hoveredIndex || 0]);
  const transformIndex = (idx: number) => items.indexOf(filteredItems[idx]);

  // Keyboard navigation starts on the first selectable item, so a leading
  // heading or line is never hovered
  function hoverPrevious() {
    if (filteredItems.length === 0) {
      return;
    }
    setHoveredIndex(
      hoveredIndex === null
        ? transformIndex(0)
        : transformIndex(Math.max(currentIndex - 1, 0)),
    );
  }

  function hoverNext() {
    if (filteredItems.length === 0) {
      return;
    }
    setHoveredIndex(
      hoveredIndex === null
        ? transformIndex(0)
        : transformIndex(Math.min(currentIndex + 1, filteredItems.length - 1)),
    );
  }

  function selectItem() {
    const item = items[hoveredIndex || 0];
    if (
      hoveredIndex !== null &&
      item !== Menu.line &&
      !isLabel(item) &&
      !item.disabled
    ) {
      onMenuSelect?.(item.name);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        hoverPrevious();
        break;
      case 'ArrowDown':
        e.preventDefault();
        hoverNext();
        break;
      case 'Enter':
        e.preventDefault();
        selectItem();
        break;
      default:
    }
  }

  useEffect(() => {
    const activeElement = document.activeElement;

    if (
      activeElement &&
      (['input', 'select', 'textarea'].includes(
        activeElement.tagName.toLowerCase(),
      ) ||
        activeElement.hasAttribute('contenteditable') ||
        activeElement.getAttribute('role') === 'textbox')
    ) {
      return;
    }

    const el = elRef.current;
    el?.focus();
  }, []);

  return (
    <View
      role="menu"
      className={className}
      style={{
        outline: 'none',
        padding: 4,
        borderRadius: radius.sm,
        overflow: 'hidden',
        ...style,
      }}
      tabIndex={0}
      onKeyDown={onKeyDown}
      innerRef={elRef}
    >
      {header}
      {items.map((item, idx) => {
        if (item === Menu.line) {
          return (
            <View key={idx} style={{ margin: '4px 6px' }}>
              <View style={{ borderTop: '1px solid ' + theme.menuBorder }} />
            </View>
          );
        } else if (isLabel(item)) {
          return (
            <Text
              key={idx}
              style={{
                color: theme.menuItemTextHeader,
                fontSize: 11.5,
                fontWeight: 500,
                lineHeight: '14px',
                margin: '8px 10px 4px',
              }}
            >
              {item.name}
            </Text>
          );
        }

        const Icon = item.icon;

        return (
          <Button
            excludeFromTabOrder
            key={String(item.name)}
            variant="bare"
            slot={slot}
            style={{
              cursor: 'default',
              padding: '6px 10px',
              borderRadius: radius.sm,
              lineHeight: '18px',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              color: theme.menuItemText,
              ...(item.disabled && { color: theme.buttonBareDisabledText }),
              ...(!item.disabled &&
                hoveredIndex === idx && {
                  backgroundColor: theme.menuItemBackgroundHover,
                  color: theme.menuItemTextHover,
                }),
              ...(!isLabel(item) && getItemStyle?.(item)),
            }}
            onHoverStart={() => setHoveredIndex(idx)}
            onHoverEnd={() => setHoveredIndex(null)}
            onPress={() => {
              if (
                !item.disabled &&
                item.toggle === undefined &&
                !isLabel(item)
              ) {
                onMenuSelect?.(item.name);
              }
            }}
          >
            {/* Force it to line up evenly */}
            {item.toggle === undefined ? (
              <>
                {Icon && (
                  <Icon
                    width={item.iconSize || 10}
                    height={item.iconSize || 10}
                    style={{ marginRight: 8, width: item.iconSize || 10 }}
                  />
                )}
                <Text title={item.tooltip}>{item.text}</Text>
                <View style={{ flex: 1 }} />
              </>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <label htmlFor={String(item.name)} title={item.tooltip}>
                  {item.text}
                </label>
                <Toggle
                  id={String(item.name)}
                  isOn={item.toggle}
                  style={{ marginLeft: 12 }}
                  onToggle={() =>
                    !item.disabled &&
                    !isLabel(item) &&
                    item.toggle !== undefined &&
                    onMenuSelect?.(item.name)
                  }
                />
              </View>
            )}
            {item.key && <Keybinding keyName={item.key} />}
          </Button>
        );
      })}
      {footer}
    </View>
  );
}
