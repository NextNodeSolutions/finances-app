import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { useOptionalFeature } from '#hooks/useOptionalFeature';

type SyncErrorRollupProps = {
  count: number;
};

export function SyncErrorRollup({ count }: SyncErrorRollupProps) {
  const { t } = useTranslation();
  const [isBankSyncOn] = useOptionalFeature('bankSync');

  if (count === 0 || !isBankSyncOn) {
    return null;
  }

  return (
    <View
      title={
        count === 1
          ? t('1 account needs attention')
          : t('{{count}} accounts need attention', { count })
      }
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        height: 16,
        paddingInline: 6,
        borderRadius: radius.pill,
        backgroundColor: theme.signalSubtle,
        flexShrink: 0,
      }}
    >
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: radius.pill,
          backgroundColor: theme.signal,
        }}
      />
      <Text
        style={{
          ...styles.tnum,
          fontSize: 10.5,
          fontWeight: 500,
          color: theme.signalText,
        }}
      >
        {count}
      </Text>
    </View>
  );
}
