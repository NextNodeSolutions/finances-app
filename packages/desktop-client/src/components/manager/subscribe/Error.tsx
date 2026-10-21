// @ts-strict-ignore
import React from 'react';
import { Trans } from 'react-i18next';
import { useLocation } from 'react-router';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';

import { ManagerCard } from '#components/manager/ManagerCard';
import { useNavigate } from '#hooks/useNavigate';

import { bodyTextStyle } from './common';

function getErrorMessage(reason) {
  switch (reason) {
    case 'network-failure':
      return 'Unable to access server. Make sure the configured URL for the server is accessible.';
    default:
      return 'Server returned an error while checking its status.';
  }
}

export function Error() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = (location.state || {}) as { error? };

  function onTryAgain() {
    void navigate('/');
  }

  return (
    <ManagerCard style={{ maxWidth: 450, alignItems: 'center' }}>
      <Text style={{ ...bodyTextStyle, color: theme.pageText }}>
        {getErrorMessage(error)}
      </Text>
      <Button onPress={onTryAgain} style={{ marginTop: 20 }}>
        <Trans>Try again</Trans>
      </Button>
    </ManagerCard>
  );
}
