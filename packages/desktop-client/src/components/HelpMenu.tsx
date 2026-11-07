import { useRef } from 'react';
import type { SVGProps } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { SvgHelp } from '@actual-app/components/icons/v2';
import { Menu } from '@actual-app/components/menu';
import type { MenuItem } from '@actual-app/components/menu';
import { Popover } from '@actual-app/components/popover';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { useToggle } from 'usehooks-ts';

import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useIsTestEnv } from '#hooks/useIsTestEnv';
import { useLocalPref } from '#hooks/useLocalPref';
import { useNavigate } from '#hooks/useNavigate';
import { useNewsFeed } from '#hooks/useNewsFeed';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { openDocsForCurrentPage } from './titlebar/openDocsForCurrentPage';
import { useAppUpdates } from './titlebar/useAppUpdates';
import { useTour } from './tour/TourProvider';

const RELEASES_URL = 'https://actualbudget.org/docs/releases';
const UNREAD_DOT_SIZE = 6;

type HelpMenuItem =
  | 'whats-new'
  | 'apply-update'
  | 'new-version'
  | 'docs'
  | 'discord'
  | 'keyboard-shortcuts'
  | 'start-tour'
  | 'goal-templates';

// The unread mark for What's new: the accent marks something new to read,
// signal orange stays reserved for what needs attention.
function UnreadDot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 6 6" aria-hidden {...props}>
      <circle cx="3" cy="3" r="3" fill={theme.accent} />
    </svg>
  );
}

export function HelpMenu() {
  const { t } = useTranslation();
  const showGoalTemplates = useFeatureFlag('goalTemplatesEnabled');
  const [isMenuOpen, toggleMenuOpen, setMenuOpen] = useToggle();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const page = useLocation().pathname;
  const { startTour } = useTour();
  const { isEnabled: isNewsEnabled, unseenCount } = useNewsFeed();
  const { isReloadReady, outdatedVersion } = useAppUpdates();
  const isTestEnv = useIsTestEnv();
  const { isNarrowWidth } = useResponsive();
  const [isIntroSeen, setIntroSeen] = useLocalPref('tour.introSeen');

  // A first visit marks the tour once, instead of a toast at boot.
  const isTourNew = !isIntroSeen && !isTestEnv && !isNarrowWidth;
  const hasUnread = unseenCount > 0 || isReloadReady || isTourNew;

  const handleItemSelect = (item: HelpMenuItem) => {
    switch (item) {
      case 'whats-new':
        void navigate('/notifications');
        break;
      case 'apply-update':
        void window.Actual.applyAppUpdate();
        break;
      case 'new-version':
        window.Actual.openURLInBrowser(RELEASES_URL);
        break;
      case 'docs':
        openDocsForCurrentPage();
        break;
      case 'discord':
        window.Actual.openURLInBrowser('https://discord.gg/pRYNYr4W5A');
        break;
      case 'keyboard-shortcuts':
        dispatch(pushModal({ modal: { name: 'keyboard-shortcuts' } }));
        break;
      case 'start-tour':
        startTour();
        break;
      case 'goal-templates':
        dispatch(pushModal({ modal: { name: 'goal-templates' } }));
        break;
      default:
        throw new Error(`Unrecognized menu option: ${String(item)}`);
    }
  };

  const onOpenChange = (isOpen: boolean) => {
    setMenuOpen(isOpen);
    if (!isOpen && isTourNew) {
      setIntroSeen(true);
    }
  };

  useHotkeys('?', () => setMenuOpen(true), { useKey: true });

  const noticeItems: Array<MenuItem<HelpMenuItem>> = [
    ...(isNewsEnabled
      ? [
          {
            name: 'whats-new' as const,
            text: t("What's new"),
            icon: unseenCount > 0 ? UnreadDot : undefined,
            iconSize: UNREAD_DOT_SIZE,
            key: unseenCount > 0 ? String(unseenCount) : undefined,
          },
        ]
      : []),
    ...(isReloadReady
      ? [
          {
            name: 'apply-update' as const,
            text: t('Update now'),
            icon: UnreadDot,
            iconSize: UNREAD_DOT_SIZE,
          },
        ]
      : []),
    ...(outdatedVersion
      ? [
          {
            name: 'new-version' as const,
            text: t('Version {{version}} is available', {
              version: outdatedVersion,
            }),
          },
        ]
      : []),
  ];

  // Notices come first, set apart from the menu's standing items.
  const noticeGroup: Array<MenuItem<HelpMenuItem>> =
    noticeItems.length > 0 ? [...noticeItems, Menu.line] : [];

  return (
    <View>
      <Button
        variant="bare"
        ref={menuButtonRef}
        onPress={toggleMenuOpen}
        data-testid="help-menu-button"
        aria-label={hasUnread ? t('Help, with something new') : undefined}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 30,
          padding: '0 10px 0 8px',
          borderRadius: radius.md,
          fontWeight: 500,
          color: theme.pageTextLight,
        }}
      >
        <SvgHelp width={14} height={14} />
        <Trans>Help</Trans>
        {hasUnread && (
          <View
            aria-hidden
            style={{
              position: 'absolute',
              top: 5,
              left: 17,
              width: UNREAD_DOT_SIZE,
              height: UNREAD_DOT_SIZE,
              borderRadius: radius.pill,
              backgroundColor: theme.accent,
              boxShadow: `0 0 0 2px ${theme.titlebarBackground}`,
            }}
          />
        )}
      </Button>

      <Popover
        placement="bottom end"
        offset={12}
        triggerRef={menuButtonRef}
        isOpen={isMenuOpen}
        onOpenChange={onOpenChange}
      >
        <Menu
          onMenuSelect={(item: HelpMenuItem) => {
            onOpenChange(false);
            handleItemSelect(item);
          }}
          items={[
            ...noticeGroup,
            {
              name: 'docs',
              text: t('Documentation'),
            },
            {
              name: 'discord',
              text: t('Community support (Discord)'),
            },
            { name: 'keyboard-shortcuts', text: t('Keyboard shortcuts') },
            {
              name: 'start-tour',
              text: t('Take a tour'),
              key: isTourNew ? t('New') : undefined,
            },
            ...(showGoalTemplates && page === '/budget'
              ? [{ name: 'goal-templates' as const, text: t('Goal templates') }]
              : []),
          ]}
        />
      </Popover>
    </View>
  );
}
