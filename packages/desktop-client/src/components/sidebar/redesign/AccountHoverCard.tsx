import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import {
  SvgArrowButtonDown1,
  SvgArrowButtonUp1,
} from '@actual-app/components/icons/v2';
import { SpaceBetween } from '@actual-app/components/space-between';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, radius, spacing } from '@actual-app/components/tokens';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';
import type { AccountEntity } from '@actual-app/core/types/models';

import { BalanceHistoryGraph } from '#components/accounts/BalanceHistoryGraph';
import { Notes } from '#components/Notes';
import { useIsTestEnv } from '#hooks/useIsTestEnv';
import { useNotes } from '#hooks/useNotes';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { isTouchDevice } from '#util/isTouchDevice';

type AccountHoverCardProps = {
  account: AccountEntity;
  isDisabled: boolean;
  children: ReactElement;
};

export function AccountHoverCard({
  account,
  isDisabled,
  children,
}: AccountHoverCardProps) {
  const { t } = useTranslation();
  const isTestEnv = useIsTestEnv();
  const [showBalanceHistory, setShowBalanceHistory] = useSyncedPref(
    `side-nav.show-balance-history-${account.id}`,
  );
  const accountNote = useNotes(`account-${account.id}`);

  if (isTouchDevice() || isTestEnv) {
    return children;
  }

  return (
    <Tooltip
      content={
        <View style={{ padding: `${spacing.xs}px ${spacing.xxs}px` }}>
          <SpaceBetween
            gap={spacing.sm}
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              '& .hover-visible': {
                opacity: 0,
                transition: `opacity ${motion.base} ${motion.ease}`,
              },
              '&:hover .hover-visible, & .hover-visible[data-focus-visible]': {
                opacity: 1,
              },
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '-0.005em',
                color: theme.pageText,
              }}
            >
              {account.name}
            </Text>
            <Button
              aria-label={t('Toggle balance history')}
              variant="bare"
              style={{
                width: 22,
                height: 22,
                padding: 0,
                borderRadius: radius.sm,
                color: theme.pageTextLight,
              }}
              onClick={() =>
                setShowBalanceHistory(
                  showBalanceHistory === 'true' ? 'false' : 'true',
                )
              }
              className="hover-visible"
            >
              <SpaceBetween gap={spacing.xxs}>
                {showBalanceHistory === 'true' ? (
                  <SvgArrowButtonUp1 width={10} height={10} />
                ) : (
                  <SvgArrowButtonDown1 width={10} height={10} />
                )}
              </SpaceBetween>
            </Button>
          </SpaceBetween>
          {showBalanceHistory === 'true' && (
            <BalanceHistoryGraph
              accountId={account.id}
              style={{ minWidth: 350, minHeight: 70, marginTop: spacing.sm }}
            />
          )}
          {accountNote && (
            <Notes
              getStyle={() => ({
                borderTop: `1px solid ${theme.hairline}`,
                padding: 0,
                paddingTop: spacing.sm + spacing.xxs,
                marginTop: spacing.sm + spacing.xxs,
                color: theme.pageTextLight,
              })}
              notes={accountNote}
            />
          )}
        </View>
      }
      style={{ ...styles.tooltip, padding: '8px 12px', marginLeft: spacing.xs }}
      placement="right top"
      triggerProps={{
        delay: 1000,
        closeDelay: 250,
        isDisabled,
      }}
    >
      {children}
    </Tooltip>
  );
}
