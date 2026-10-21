import type { ReactNode } from 'react';
import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { reportPageGutter } from './chart-theme';

type ReportsHeaderProps = {
  /** The Dashboard / Statements tabs, with anything that edits the open tab. */
  tabs: ReactNode;
  /** Buttons on the right of the tabs row. */
  actions?: ReactNode;
};

/** Desktop header of the reports area: the title, then the tabs row. */
export function ReportsHeader({ tabs, actions }: ReportsHeaderProps) {
  return (
    <View
      style={{
        gap: spacing.md,
        marginLeft: reportPageGutter,
        marginRight: reportPageGutter,
        marginBottom: spacing.sm,
      }}
    >
      <h1
        className={css({
          ...styles.display,
          margin: 0,
          fontSize: 28,
          lineHeight: '34px',
          color: theme.pageText,
        })}
      >
        <Trans>Reports</Trans>
      </h1>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
          minHeight: 34,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            minWidth: 0,
          }}
        >
          {tabs}
        </View>
        {actions && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              marginLeft: 'auto',
            }}
          >
            {actions}
          </View>
        )}
      </View>
    </View>
  );
}
