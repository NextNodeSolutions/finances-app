import type { ReactNode } from 'react';
import { Dialog, DialogTrigger } from 'react-aria-components';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDotsHorizontalTriple } from '@actual-app/components/icons/v1';
import { Popover } from '@actual-app/components/popover';

import { headerIconButtonStyle, headerIconStyle } from './headerStyles';

type AccountMenuButtonProps = {
  /** The menu the button opens. */
  children: ReactNode;
};

/** The `⋯` header action, labelled `Account menu`. */
export function AccountMenuButton({ children }: AccountMenuButtonProps) {
  const { t } = useTranslation();

  return (
    <DialogTrigger>
      <Button
        variant="bare"
        aria-label={t('Account menu')}
        style={headerIconButtonStyle}
      >
        <SvgDotsHorizontalTriple
          style={{ ...headerIconStyle, transform: 'rotateZ(90deg)' }}
        />
      </Button>
      <Popover style={{ minWidth: 240 }}>
        <Dialog>{children}</Dialog>
      </Popover>
    </DialogTrigger>
  );
}
