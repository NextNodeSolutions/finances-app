import { useRef, useState } from 'react';
import { Dialog, DialogTrigger } from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgExpandArrow } from '@actual-app/components/icons/v0';
import { Menu } from '@actual-app/components/menu';
import { Popover } from '@actual-app/components/popover';
import { theme } from '@actual-app/components/theme';
import { elevation, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { DashboardPageEntity } from '@actual-app/core/types/models';

import { useNavigate } from '#hooks/useNavigate';
import { useCreateDashboardPageMutation } from '#reports/mutations';

type DashboardSelectorProps = {
  dashboards: readonly DashboardPageEntity[];
  currentDashboard: DashboardPageEntity;
};

/**
 * The Dashboard tab of the reports header, while a dashboard is open. It names
 * the open dashboard and opens the menu that switches between dashboards.
 */
export function DashboardSelector({
  dashboards,
  currentDashboard,
}: DashboardSelectorProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const triggerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const createDashboardPageMutation = useCreateDashboardPageMutation();

  const handleAddDashboard = async () => {
    const defaultName = t('New dashboard');
    createDashboardPageMutation.mutate(
      { name: defaultName },
      {
        onSuccess: id => {
          void navigate(`/reports/${id}`);
        },
      },
    );
  };

  return (
    <DialogTrigger>
      <Button
        ref={triggerRef}
        variant="bare"
        aria-current="page"
        onPress={() => setMenuOpen(true)}
        style={{
          flexShrink: 1,
          minWidth: 0,
          gap: spacing.sm,
          padding: '4px 10px 4px 12px',
          borderRadius: radius.sm,
          border: `1px solid ${theme.hairline}`,
          backgroundColor: theme.buttonNormalBackground,
          boxShadow: elevation.xs,
          color: theme.pageText,
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        <Trans>Dashboard</Trans>
        <View
          style={{
            flexShrink: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: theme.pageTextLight,
          }}
        >
          {currentDashboard.name}
        </View>
        <SvgExpandArrow
          width={7}
          height={7}
          style={{ flexShrink: 0, color: theme.pageTextSubdued }}
        />
      </Button>

      {menuOpen && (
        <Popover
          triggerRef={triggerRef}
          isOpen
          onOpenChange={setMenuOpen}
          placement="bottom start"
        >
          <Dialog>
            <Menu
              slot="close"
              onMenuSelect={item => {
                if (item === 'add-new') {
                  void handleAddDashboard();
                } else {
                  void navigate(`/reports/${item}`);
                }
                setMenuOpen(false);
              }}
              items={[
                ...dashboards.map(dashboard => ({
                  name: dashboard.id,
                  text: dashboard.name,
                })),
                Menu.line,
                {
                  name: 'add-new',
                  text: t('Add new dashboard'),
                },
              ]}
            />
          </Dialog>
        </Popover>
      )}
    </DialogTrigger>
  );
}
