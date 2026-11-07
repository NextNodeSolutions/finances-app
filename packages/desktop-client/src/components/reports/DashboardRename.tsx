import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgPencil1 } from '@actual-app/components/icons/v2';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { theme } from '@actual-app/components/theme';
import type { DashboardPageEntity } from '@actual-app/core/types/models';

import { useRenameDashboardPageMutation } from '#reports/mutations';

const NAME_INPUT_WIDTH = '24ch';

type DashboardRenameProps = {
  dashboard: DashboardPageEntity;
};

/** Renames the open dashboard in place, beside its tab. */
export function DashboardRename({ dashboard }: DashboardRenameProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const renameDashboardPageMutation = useRenameDashboardPageMutation();

  const onSaveName = (newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName === dashboard.name) {
      setIsEditing(false);
      return;
    }

    renameDashboardPageMutation.mutate(
      { id: dashboard.id, name: trimmedName },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  if (isEditing) {
    return (
      <InitialFocus>
        <Input
          aria-label={t('Dashboard name')}
          defaultValue={dashboard.name}
          onEnter={onSaveName}
          onUpdate={onSaveName}
          onEscape={() => setIsEditing(false)}
          style={{ width: NAME_INPUT_WIDTH, fontSize: 13 }}
        />
      </InitialFocus>
    );
  }

  return (
    <Button
      variant="bare"
      aria-label={t('Rename dashboard')}
      style={{ padding: 6 }}
      onPress={() => setIsEditing(true)}
    >
      <SvgPencil1
        style={{ width: 12, height: 12, color: theme.pageTextSubdued }}
      />
    </Button>
  );
}
