import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgPencil1 } from '@actual-app/components/icons/v2';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { DashboardPageEntity } from '@actual-app/core/types/models';

import { useRenameDashboardPageMutation } from '#reports/mutations';

const pageTitleStyle: CSSProperties = {
  ...styles.display,
  fontSize: 28,
  lineHeight: '34px',
};

type DashboardHeaderProps = {
  dashboard: DashboardPageEntity;
};

export function DashboardHeader({ dashboard }: DashboardHeaderProps) {
  const { t } = useTranslation();
  const [editingName, setEditingName] = useState(false);

  const renameDashboardPageMutation = useRenameDashboardPageMutation();

  const handleSaveName = async (newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName === dashboard.name) {
      setEditingName(false);
      return;
    }

    renameDashboardPageMutation.mutate(
      { id: dashboard.id, name: trimmedName },
      {
        onSuccess: () => {
          setEditingName(false);
        },
      },
    );
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        gap: 8,
        '& .hover-visible': {
          opacity: 0,
          transition: `opacity ${motion.base} ${motion.ease}`,
        },
        '&:hover .hover-visible': {
          opacity: 1,
        },
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 'auto',
        minWidth: 0,
        display: 'flex',
        justifyContent: 'flex-start',
      }}
    >
      <View
        style={{
          ...pageTitleStyle,
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: 'auto',
        }}
      >
        <Trans>Reports</Trans>:
      </View>
      {editingName ? (
        <InitialFocus>
          <Input
            defaultValue={dashboard.name}
            onEnter={handleSaveName}
            onUpdate={handleSaveName}
            onEscape={() => setEditingName(false)}
            style={{
              ...pageTitleStyle,
              marginTop: -3,
              marginBottom: -4,
              paddingTop: 2,
              paddingBottom: 2,
            }}
          />
        </InitialFocus>
      ) : (
        <>
          <View
            style={{
              ...pageTitleStyle,
              color: theme.pageTextLight,
              flexGrow: 0,
              flexShrink: 1,
              flexBasis: 'auto',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
            }}
          >
            {dashboard.name}
          </View>
          <Button
            variant="bare"
            aria-label={t('Rename dashboard')}
            className="hover-visible"
            style={{
              marginRight: 5,
              padding: 6,
            }}
            onPress={() => setEditingName(true)}
          >
            <SvgPencil1
              style={{
                width: 12,
                height: 12,
                flexGrow: 0,
                flexShrink: 0,
                flexBasis: 'auto',
                color: theme.pageTextSubdued,
              }}
            />
          </Button>
        </>
      )}
    </View>
  );
}
