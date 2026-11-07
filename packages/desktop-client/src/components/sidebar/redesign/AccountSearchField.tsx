import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgRemove } from '@actual-app/components/icons/v2';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type AccountSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
};

export function AccountSearchField({
  value,
  onChange,
  onClose,
}: AccountSearchFieldProps) {
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingInline: spacing.xs,
        marginBottom: spacing.sm,
      }}
    >
      <InitialFocus>
        <Input
          value={value}
          aria-label={t('Find account')}
          placeholder={t('Find account')}
          onChangeValue={onChange}
          onEscape={onClose}
          style={{
            flex: 1,
            height: 28,
            padding: '0 10px',
            fontSize: 12.5,
            borderRadius: radius.md,
          }}
        />
      </InitialFocus>
      <Button
        variant="bare"
        aria-label={t('Close search')}
        onPress={onClose}
        style={{
          width: 22,
          height: 22,
          padding: 0,
          borderRadius: radius.sm,
          color: theme.sidebarTextMuted,
        }}
      >
        <SvgRemove width={9} height={9} />
      </Button>
    </View>
  );
}
