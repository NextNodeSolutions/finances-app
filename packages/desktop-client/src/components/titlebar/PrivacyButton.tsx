import { useHotkeys } from 'react-hotkeys-hook';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgViewHide, SvgViewShow } from '@actual-app/components/icons/v2';
import type { CSSProperties } from '@actual-app/components/styles';
import { Tooltip } from '@actual-app/components/tooltip';

import { useSyncedPref } from '#hooks/useSyncedPref';

type PrivacyButtonProps = {
  style?: CSSProperties;
};

export function PrivacyButton({ style }: PrivacyButtonProps) {
  const { t } = useTranslation();
  const [isPrivacyEnabledPref, setPrivacyEnabledPref] =
    useSyncedPref('isPrivacyEnabled');
  const isPrivacyEnabled = String(isPrivacyEnabledPref) === 'true';

  const privacyIconStyle = { width: 15, height: 15 };

  useHotkeys(
    'shift+ctrl+p, shift+cmd+p, shift+meta+p',
    () => {
      setPrivacyEnabledPref(String(!isPrivacyEnabled));
    },
    {
      preventDefault: true,
      scopes: ['app'],
    },
    [setPrivacyEnabledPref, isPrivacyEnabled],
  );

  return (
    <Tooltip
      placement="bottom end"
      content={
        isPrivacyEnabled ? (
          <Trans>Disable privacy mode</Trans>
        ) : (
          <Trans>Enable privacy mode</Trans>
        )
      }
    >
      <Button
        variant="bare"
        aria-label={
          isPrivacyEnabled
            ? t('Disable privacy mode')
            : t('Enable privacy mode')
        }
        onPress={() => setPrivacyEnabledPref(String(!isPrivacyEnabled))}
        style={style}
      >
        {isPrivacyEnabled ? (
          <SvgViewHide style={privacyIconStyle} />
        ) : (
          <SvgViewShow style={privacyIconStyle} />
        )}
      </Button>
    </Tooltip>
  );
}
