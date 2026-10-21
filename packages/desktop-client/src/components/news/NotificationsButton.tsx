import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgNotificationsOutline } from '@actual-app/components/icons/v1';
import type { CSSProperties } from '@actual-app/components/styles';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';

import { useNavigate } from '#hooks/useNavigate';
import { useNewsFeed } from '#hooks/useNewsFeed';

// Keeps the badge small; the feed only ever holds a couple of dozen entries.
const MAX_DISPLAYED_COUNT = 9;

type NotificationsButtonProps = {
  style?: CSSProperties;
};

/**
 * Titlebar bell that opens the Notifications page and shows how many entries
 * (releases and posts) the user hasn't seen yet. Hidden while the news feed
 * is disabled (the user turned it off in settings).
 */
export function NotificationsButton({ style }: NotificationsButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isEnabled, unseenCount } = useNewsFeed();

  if (!isEnabled) {
    return null;
  }

  const label =
    unseenCount > 0
      ? t('Notifications: {{count}} unread', { count: unseenCount })
      : t('Notifications');
  const displayedCount =
    unseenCount > MAX_DISPLAYED_COUNT
      ? t('{{max}}+', { max: MAX_DISPLAYED_COUNT })
      : String(unseenCount);

  return (
    <Tooltip placement="bottom end" content={label}>
      <View style={{ position: 'relative' }}>
        <Button
          variant="bare"
          aria-label={label}
          onPress={() => void navigate('/notifications')}
          data-testid="notifications-button"
          style={style}
        >
          <SvgNotificationsOutline style={{ width: 15, height: 15 }} />
        </Button>
        {unseenCount > 0 && (
          <Text
            data-testid="notifications-unseen-count"
            style={{
              ...styles.tnum,
              position: 'absolute',
              top: 1,
              right: -1,
              minWidth: 15,
              height: 15,
              lineHeight: '15px',
              padding: '0 4px',
              borderRadius: radius.pill,
              fontSize: 9.5,
              fontWeight: 500,
              letterSpacing: 0,
              textAlign: 'center',
              // Signal orange is reserved for what needs attention; the ring
              // cuts the badge out of the bell beneath it.
              backgroundColor: theme.signal,
              color: theme.titlebarBackground,
              boxShadow: `0 0 0 2px ${theme.titlebarBackground}`,
              pointerEvents: 'none',
            }}
          >
            {displayedCount}
          </Text>
        )}
      </View>
    </Tooltip>
  );
}
