import { Dialog, DialogTrigger } from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';

import { Button, ButtonWithLoading } from '@actual-app/components/button';
import {
  SvgCheveronDown,
  SvgCheveronRight,
  SvgDotsHorizontalTriple,
} from '@actual-app/components/icons/v1';
import { Menu } from '@actual-app/components/menu';
import { Paragraph } from '@actual-app/components/paragraph';
import { Popover } from '@actual-app/components/popover';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Warning } from '#components/alerts';
import { Link } from '#components/common/Link';
import { pillStyle } from '#components/schedules/StatusBadge';
import { sectionHeadingStyle } from '#components/settings/SettingsGroup';

import type { BuiltInBankSyncProviderState } from './useBuiltInBankSyncProviders';

const providerCardStyle = {
  border: `1px solid ${theme.hairline}`,
  borderRadius: radius.lg,
  padding: spacing.lg + spacing.xs,
  backgroundColor: theme.cardBackground,
};

const badgeStyle = {
  ...pillStyle,
  alignSelf: 'flex-start',
} as const;

const statusDotStyle = {
  width: 6,
  height: 6,
  borderRadius: radius.pill,
  backgroundColor: 'currentColor',
};

type BuiltInProvidersProps = {
  providers: BuiltInBankSyncProviderState[];
  syncServerStatus: 'offline' | 'no-server' | 'online';
  permissionWarning: 'general' | 'file-owner' | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function BuiltInProviders({
  providers,
  syncServerStatus,
  permissionWarning,
  isCollapsed = false,
  onToggleCollapse,
}: BuiltInProvidersProps) {
  const { t } = useTranslation();

  const Cheveron = isCollapsed ? SvgCheveronRight : SvgCheveronDown;
  const title = (
    <Text style={sectionHeadingStyle}>
      <Trans>Providers</Trans>
    </Text>
  );

  if (onToggleCollapse && isCollapsed) {
    return (
      <Button
        variant="bare"
        aria-expanded={false}
        onPress={onToggleCollapse}
        style={{ alignSelf: 'flex-start' }}
      >
        {title}
        <Cheveron width={20} height={20} style={{ marginLeft: 5 }} />
      </Button>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        {onToggleCollapse ? (
          <Button
            variant="bare"
            aria-expanded
            onPress={onToggleCollapse}
            style={{ alignSelf: 'flex-start' }}
          >
            {title}
            <Cheveron width={20} height={20} style={{ marginLeft: 5 }} />
          </Button>
        ) : (
          title
        )}
        <Paragraph
          style={{
            ...styles.smallText,
            lineHeight: '18px',
            color: theme.pageTextLight,
            margin: 0,
          }}
        >
          <Trans>
            Set up a bank sync provider, then link new accounts or connect an
            existing Actual account.
          </Trans>
        </Paragraph>
      </View>

      {syncServerStatus !== 'online' ? (
        <View style={{ ...providerCardStyle, alignItems: 'flex-start' }}>
          <Button isDisabled>
            <Trans>Set up bank sync</Trans>
          </Button>
          <Paragraph
            style={{
              ...styles.smallText,
              color: theme.pageTextLight,
              marginTop: spacing.md,
              marginBottom: 0,
            }}
          >
            <Trans>
              Connect to an Actual server to set up{' '}
              <Link
                variant="external"
                to="https://actualbudget.org/docs/advanced/bank-sync"
                linkColor="muted"
              >
                automatic syncing
              </Link>
              .
            </Trans>
          </Paragraph>
        </View>
      ) : (
        <View
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
          }}
        >
          {providers.map(provider => (
            <View
              key={provider.id}
              data-testid={`bank-sync-provider-${provider.id}`}
              style={{ ...providerCardStyle, gap: spacing.lg }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    gap: 6,
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Text style={sectionHeadingStyle}>
                      {provider.displayName}
                    </Text>
                    {provider.isConfigured && provider.credentialSource && (
                      <Text
                        style={{
                          ...badgeStyle,
                          backgroundColor: theme.pillBackground,
                          color: theme.pillText,
                        }}
                      >
                        {provider.credentialSource === 'global' ? (
                          <Trans>global</Trans>
                        ) : (
                          <Trans>this budget only</Trans>
                        )}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      ...badgeStyle,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: provider.isConfigured
                        ? theme.noticeBackground
                        : theme.pillBackgroundLight,
                      color: provider.isConfigured
                        ? theme.noticeText
                        : theme.pageTextLight,
                    }}
                  >
                    <View aria-hidden style={statusDotStyle} />
                    <Text>
                      {provider.isConfigured ? (
                        <Trans>Configured</Trans>
                      ) : (
                        <Trans>Not configured</Trans>
                      )}
                    </Text>
                  </View>
                </View>

                {provider.isConfigured && (
                  <DialogTrigger>
                    <Button
                      variant="bare"
                      aria-label={t('{{provider}} menu', {
                        provider: provider.displayName,
                      })}
                    >
                      <SvgDotsHorizontalTriple
                        width={15}
                        height={15}
                        style={{ transform: 'rotateZ(90deg)' }}
                      />
                    </Button>

                    <Popover>
                      <Dialog>
                        <Menu
                          onMenuSelect={item => {
                            if (item === 'reconfigure') {
                              void provider.onReset();
                            }
                          }}
                          items={[
                            {
                              name: 'reconfigure',
                              text: t('Reset {{provider}} credentials', {
                                provider: provider.displayName,
                              }),
                            },
                          ]}
                        />
                      </Dialog>
                    </Popover>
                  </DialogTrigger>
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="bare"
                  isDisabled={!provider.canConfigure}
                  onPress={() => provider.onConfigure()}
                >
                  {provider.isConfigured ? (
                    <Trans>Edit setup</Trans>
                  ) : (
                    <Trans>Set up</Trans>
                  )}
                </Button>
                <ButtonWithLoading
                  variant="primary"
                  isDisabled={!provider.isConfigured}
                  isLoading={provider.isLoading}
                  onPress={() => provider.onLink()}
                >
                  <Trans>Link bank account</Trans>
                </ButtonWithLoading>
              </View>
              {provider.supportsPerBudgetFile &&
                provider.credentialSource === 'global' &&
                !provider.canConfigure && (
                  <Text
                    style={{ ...styles.smallText, color: theme.pageTextLight }}
                  >
                    <Trans>
                      Reset credentials before setting credentials for this
                      budget file.
                    </Trans>
                  </Text>
                )}
            </View>
          ))}
        </View>
      )}

      {permissionWarning && (
        <Warning>
          {permissionWarning === 'file-owner' ? (
            <Trans>
              You don&apos;t have the required permissions to configure all bank
              sync providers. You can set up Pluggy.ai because you are the owner
              of this budget file.
            </Trans>
          ) : (
            <Trans>
              You don&apos;t have the required permissions to configure bank
              sync providers. Please contact an Admin.
            </Trans>
          )}
        </Warning>
      )}
    </View>
  );
}
