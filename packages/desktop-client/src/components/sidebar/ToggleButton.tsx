import React from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgPin } from '@actual-app/components/icons/v1';
import { SvgArrowButtonLeft1 } from '@actual-app/components/icons/v2';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type ToggleButtonProps = {
  isFloating: boolean;
  onFloat: ComponentPropsWithoutRef<typeof Button>['onPress'];
  style?: CSSProperties;
};

export function ToggleButton({
  style,
  isFloating,
  onFloat,
}: ToggleButtonProps) {
  const { t } = useTranslation();
  return (
    <View className="float" style={{ ...style, flexShrink: 0 }}>
      <Button
        variant="bare"
        aria-label={isFloating ? t('Pin sidebar') : t('Unpin sidebar')}
        onPress={onFloat}
        style={{
          width: 26,
          height: 26,
          padding: 0,
          borderRadius: radius.md,
          color: theme.sidebarTextMuted,
        }}
      >
        {isFloating ? (
          <SvgPin
            style={{
              width: 14,
              height: 14,
              transform: 'rotate(45deg)',
            }}
          />
        ) : (
          <SvgArrowButtonLeft1 style={{ width: 11, height: 11 }} />
        )}
      </Button>
    </View>
  );
}
