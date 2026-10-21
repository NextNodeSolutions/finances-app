import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgAdd } from '@actual-app/components/icons/v1';

import { mobileHeaderIconButtonStyle } from '#components/mobile/utils';
import { useNavigate } from '#hooks/useNavigate';

type AddTransactionButtonProps = {
  to?: string;
  accountId?: string;
  categoryId?: string;
};

export function AddTransactionButton({
  to = '/transactions/new',
  accountId,
  categoryId,
}: AddTransactionButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Button
      variant="bare"
      aria-label={t('Add transaction')}
      style={mobileHeaderIconButtonStyle}
      onPress={() => {
        void navigate(to, { state: { accountId, categoryId } });
      }}
    >
      <SvgAdd width={18} height={18} />
    </Button>
  );
}
