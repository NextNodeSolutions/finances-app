import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';

type CountPillProps = {
  count: number;
};

export function CountPill({ count }: CountPillProps) {
  return (
    <Text
      style={{
        ...styles.tnum,
        fontSize: 10.5,
        fontWeight: 500,
        lineHeight: '16px',
        minWidth: 16,
        height: 16,
        padding: '0 5px',
        textAlign: 'center',
        borderRadius: radius.pill,
        backgroundColor: theme.pillBackground,
        color: theme.pillText,
        flexShrink: 0,
      }}
    >
      {count}
    </Text>
  );
}
