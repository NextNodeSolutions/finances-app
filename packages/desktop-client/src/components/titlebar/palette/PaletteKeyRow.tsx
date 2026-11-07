import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type PaletteKeyRowProps = {
  label: string;
  /** The shortcut that does the same, shown as a keycap. */
  keys?: string;
};

/** A palette action with its keyboard shortcut on the right. */
export function PaletteKeyRow({ label, keys }: PaletteKeyRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
      }}
    >
      <Text>{label}</Text>
      {keys && (
        <Text
          aria-hidden
          style={{
            ...styles.tnum,
            fontSize: 11,
            lineHeight: '16px',
            padding: '0 5px',
            borderRadius: radius.xs,
            border: `1px solid ${theme.hairline}`,
            color: theme.pageTextSubdued,
          }}
        >
          {keys}
        </Text>
      )}
    </View>
  );
}
