import React from 'react';
import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { Link } from '#components/common/Link';
import { useServerURL } from '#components/ServerContext';

export function ServerURL() {
  const url = useServerURL();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'baseline',
        flexDirection: 'row',
        gap: 12,
        fontSize: 12.5,
        color: theme.pageTextLight,
        '& strong': { fontWeight: 500, color: theme.pageText },
        marginBottom: 'calc(18px + env(safe-area-inset-bottom))',
        zIndex: 5000,
      }}
    >
      <Text>
        {url ? (
          <Trans>
            Using server: <strong>{url}</strong>
          </Trans>
        ) : (
          <Trans>Using this device only</Trans>
        )}
      </Text>
      <Link
        variant="internal"
        to="/config-server"
        style={{
          fontSize: 12.5,
          fontWeight: 500,
          color: theme.accentText,
          textDecoration: 'none',
          ':hover': { textDecoration: 'underline', textUnderlineOffset: 2 },
        }}
      >
        {url ? <Trans>Change</Trans> : <Trans>Set up sync</Trans>}
      </Link>
    </View>
  );
}
