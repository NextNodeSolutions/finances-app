import React from 'react';
import { animated, useTransition } from 'react-spring';

import { Block } from '@actual-app/components/block';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { useSelector } from '#redux';

import { Background } from './Background';

type AppBackgroundProps = {
  isLoading?: boolean;
};

export function AppBackground({ isLoading }: AppBackgroundProps) {
  const loadingText = useSelector(state => state.app.loadingText);
  const showLoading = isLoading || loadingText !== null;
  const transitions = useTransition(loadingText, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return (
    <>
      <Background />

      {showLoading &&
        transitions((style, item) => (
          <animated.div key={item} style={style}>
            <View
              className={css({
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: 50,
                paddingTop: 200,
                color: theme.pageText,
                alignItems: 'center',
              })}
            >
              <Block
                style={{
                  ...styles.display,
                  marginBottom: 20,
                  fontSize: 22,
                  lineHeight: '28px',
                }}
              >
                {loadingText}
              </Block>
              <AnimatedLoading width={20} color={theme.pageTextLight} />
            </View>
          </animated.div>
        ))}
    </>
  );
}
