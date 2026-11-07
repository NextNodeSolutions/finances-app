import type { ReactNode } from 'react';
import { Trans } from 'react-i18next';

import {
  ModeButton,
  ModeButtonGroup,
} from '@actual-app/components/mode-button';

import { useNavigate } from '#hooks/useNavigate';

type ReportsTabsProps =
  | {
      activeTab: 'dashboard';
      /** The open dashboard's tab, which also switches dashboards. */
      dashboardTab: ReactNode;
    }
  | { activeTab: 'statements' };

/** The Dashboard / Statements pair under the reports title. */
export function ReportsTabs(props: ReportsTabsProps) {
  const navigate = useNavigate();
  const isStatements = props.activeTab === 'statements';

  return (
    <ModeButtonGroup style={{ flexShrink: 1, minWidth: 0 }}>
      {props.activeTab === 'dashboard' ? (
        props.dashboardTab
      ) : (
        <ModeButton selected={false} onSelect={() => void navigate('/reports')}>
          <Trans>Dashboard</Trans>
        </ModeButton>
      )}
      <ModeButton
        selected={isStatements}
        onSelect={() => {
          if (!isStatements) {
            void navigate('/reports/statements');
          }
        }}
      >
        <Trans>Statements</Trans>
      </ModeButton>
    </ModeButtonGroup>
  );
}
