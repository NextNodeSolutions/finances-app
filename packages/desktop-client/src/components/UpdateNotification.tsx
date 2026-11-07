import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgClose } from '@actual-app/components/icons/v1';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { elevation, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { setAppState, updateApp } from '#app/appSlice';
import { useDispatch, useSelector } from '#redux';

import { Link } from './common/Link';

export function UpdateNotification() {
  const { t } = useTranslation();
  const updateInfo = useSelector(state => state.app.updateInfo);
  const showUpdateNotification = useSelector(
    state => state.app.showUpdateNotification,
  );

  const dispatch = useDispatch();
  const onRestart = () => {
    void dispatch(updateApp());
  };

  if (updateInfo && showUpdateNotification) {
    const notes = updateInfo.releaseNotes;

    return (
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          margin: '20px',
          backgroundColor: theme.menuBackground,
          color: theme.pageText,
          border: `1px solid ${theme.menuBorder}`,
          boxShadow: elevation.popover,
          padding: '10px 10px 10px 14px',
          borderRadius: radius.lg,
          fontSize: 13,
          zIndex: 10000,
          maxWidth: 450,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            aria-hidden
            style={{
              width: 7,
              height: 7,
              marginRight: 10,
              borderRadius: radius.pill,
              backgroundColor: theme.noticeTextLight,
            }}
          />
          <View style={{ marginRight: 12, fontWeight: 600 }}>
            <Text>
              <Trans>App updated to {{ version: updateInfo.version }}</Trans>
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={{ marginTop: -1, color: theme.pageTextLight }}>
            <Text>
              <Link
                variant="text"
                onClick={onRestart}
                style={{
                  color: theme.accentText,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                <Trans>Restart</Trans>
              </Link>{' '}
              (
              <Link
                variant="text"
                style={{
                  color: theme.pageTextLight,
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                }}
                onClick={() =>
                  window.Actual.openURLInBrowser(
                    'https://actualbudget.org/docs/releases',
                  )
                }
              >
                <Trans context="release notes">notes</Trans>
              </Link>
              )
              <Button
                variant="bare"
                aria-label={t('Close')}
                style={{
                  display: 'inline-flex',
                  verticalAlign: 'middle',
                  width: 22,
                  height: 22,
                  padding: 0,
                  marginLeft: 6,
                  borderRadius: radius.sm,
                }}
                onPress={() => {
                  // Set a flag to never show an update notification again for this session
                  dispatch(
                    setAppState({
                      updateInfo: null,
                      showUpdateNotification: false,
                    }),
                  );
                }}
              >
                <SvgClose width={9} style={{ color: theme.pageTextSubdued }} />
              </Button>
            </Text>
          </View>
        </View>
        {notes && (
          <View
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: `1px solid ${theme.hairline}`,
              color: theme.pageTextLight,
            }}
          >
            {notes}
          </View>
        )}
      </View>
    );
  }

  return null;
}
