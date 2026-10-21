import React from 'react';
import { Trans } from 'react-i18next';
import { animated, useTransition } from 'react-spring';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { elevation, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { useSelector } from '#redux';

import { AnimatedRefresh } from './AnimatedRefresh';

export function BankSyncStatus() {
  const accountsSyncing = useSelector(state => state.account.accountsSyncing);
  const accountsSyncingCount = accountsSyncing.length;
  const count = accountsSyncingCount;

  const transitions = useTransition(
    accountsSyncingCount > 0 ? 'syncing' : null,
    {
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
    },
  );

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        marginTop: 12,
        alignItems: 'center',
        zIndex: 501,
        pointerEvents: 'none',
      }}
    >
      {transitions(
        (style, item) =>
          item && (
            <animated.div key={item} style={style}>
              <View
                style={{
                  borderRadius: radius.pill,
                  backgroundColor: theme.menuBackground,
                  border: `1px solid ${theme.menuBorder}`,
                  boxShadow: elevation.popover,
                  color: theme.pageText,
                  padding: '6px 14px 6px 12px',
                  gap: 8,
                  fontSize: 12.5,
                  fontWeight: 500,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <AnimatedRefresh
                  animating
                  width={12}
                  height={12}
                  iconStyle={{ color: theme.pageTextLight }}
                />
                <Text>
                  <Trans count={accountsSyncingCount}>
                    Syncing... {{ count }} accounts remaining
                  </Trans>
                </Text>
              </View>
            </animated.div>
          ),
      )}
    </View>
  );
}
