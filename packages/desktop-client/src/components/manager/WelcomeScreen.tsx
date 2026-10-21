import React from 'react';
import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { Paragraph } from '@actual-app/components/paragraph';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { createBudget } from '#budgetfiles/budgetfilesSlice';
import { Link } from '#components/common/Link';
import { useServerURL } from '#components/ServerContext';
import { useNavigate } from '#hooks/useNavigate';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { ManagerCard } from './ManagerCard';
import { bodyTextStyle } from './subscribe/common';

export function WelcomeScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const serverURL = useServerURL();
  const { isNarrowWidth } = useResponsive();

  const buttonStyle = {
    fontSize: 14,
    height: 40,
    padding: '0 16px',
    flexShrink: 0,
    ...(isNarrowWidth && { minHeight: styles.mobileMinHeight }),
  };

  return (
    <ManagerCard
      style={{
        alignItems: 'center',
        gap: isNarrowWidth ? 24 : 16,
        maxWidth: 480,
        fontSize: 14,
        paddingBlock: isNarrowWidth ? 28 : 40,
      }}
    >
      <View style={{ alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <Text
          style={{
            ...styles.display,
            fontSize: 30,
            lineHeight: '36px',
            textAlign: 'center',
          }}
        >
          <Trans>Welcome to Actual</Trans>
        </Text>
        <Text style={{ ...bodyTextStyle, textAlign: 'center' }}>
          <Trans>Your finances - made simple</Trans>
        </Text>
      </View>

      <View style={{ alignItems: 'center', flexShrink: 0 }}>
        <Paragraph
          style={{
            ...bodyTextStyle,
            textAlign: 'center',
            maxWidth: 400,
            marginBottom: 0,
          }}
        >
          <Trans>
            Actual is a super fast, privacy-focused app for managing your
            finances. It is 100% free and open source: everything stays on your
            device, no data is collected, and there is nothing to sign up for.
          </Trans>
        </Paragraph>
      </View>

      <View
        style={{
          width: '100%',
          maxWidth: 400,
          gap: 8,
          flexShrink: 0,
          marginTop: 8,
        }}
      >
        <Button
          variant="primary"
          autoFocus={!isNarrowWidth}
          style={buttonStyle}
          onPress={() => dispatch(createBudget({}))}
        >
          <Trans>Start budgeting</Trans>
        </Button>
        <Button
          style={buttonStyle}
          onPress={() => dispatch(createBudget({ testMode: true }))}
        >
          <Trans>Try the demo</Trans>
        </Button>
        {!serverURL && (
          <Button
            style={buttonStyle}
            onPress={() => navigate('/config-server')}
          >
            <Trans>Connect to a sync server</Trans>
          </Button>
        )}
      </View>

      <View
        style={{
          alignItems: 'center',
          gap: isNarrowWidth ? 12 : 4,
          flexShrink: 0,
          width: '100%',
          maxWidth: 400,
          marginTop: 8,
          paddingTop: 20,
          borderTop: `1px solid ${theme.hairlineSubtle}`,
        }}
      >
        <Text style={{ fontSize: 13, color: theme.pageTextLight }}>
          <Trans>Coming from another budgeting app?</Trans>
        </Text>
        <Button
          variant="bare"
          style={{ color: theme.accentText, fontWeight: 500 }}
          onPress={() => dispatch(pushModal({ modal: { name: 'import' } }))}
        >
          <Trans>Import my budget</Trans>
        </Button>
        <Paragraph
          style={{
            color: theme.pageTextSubdued,
            fontSize: 12.5,
            textAlign: 'center',
            maxWidth: 400,
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          <Trans>
            New to budgeting? Take the{' '}
            <Link
              variant="external"
              to="https://actualbudget.org/docs/tour/"
              linkColor="purple"
            >
              guided tour
            </Link>{' '}
            to learn how Actual works.
          </Trans>
        </Paragraph>
      </View>
    </ManagerCard>
  );
}
