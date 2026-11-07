import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgCheveronLeft } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';

import { mobileHeaderIconButtonStyle } from '#components/mobile/utils';
import { useNavigate } from '#hooks/useNavigate';

type MobileBackButtonProps = ComponentPropsWithoutRef<typeof Button>;

export function MobileBackButton({
  onPress,
  style,
  ...props
}: MobileBackButtonProps) {
  const navigate = useNavigate();
  return (
    <Button
      variant="bare"
      style={{
        ...mobileHeaderIconButtonStyle,
        // Also used outside the page header; keep the button's own color.
        color: undefined,
        width: 'auto',
        padding: '0 10px 0 2px',
        ...style,
      }}
      onPress={onPress || (() => navigate(-1))}
      {...props}
    >
      <SvgCheveronLeft style={{ width: 22, height: 22, flexShrink: 0 }} />
      <Text
        style={{
          ...styles.text,
          fontSize: 15,
          fontWeight: 500,
          marginLeft: 1,
        }}
      >
        <Trans>Back</Trans>
      </Text>
    </Button>
  );
}
