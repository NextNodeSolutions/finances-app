import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDotsHorizontalTriple } from '@actual-app/components/icons/v1';
import { Popover } from '@actual-app/components/popover';
import type { PayeeEntity } from '@actual-app/core/types/models';

import { SelectionBar } from '#components/common/SelectionBar';

import { PayeeMenu } from './PayeeMenu';

type PayeeSelectionBarProps = {
  payeesById: Record<PayeeEntity['id'], PayeeEntity>;
  selectedPayees: Set<PayeeEntity['id']>;
  onDelete: () => void;
  onMerge: () => Promise<void>;
  onFavorite: () => void;
  onLearn: () => void;
};

/** Bulk actions for the selected payees, floating over the table. */
export function PayeeSelectionBar({
  payeesById,
  selectedPayees,
  onDelete,
  onMerge,
  onFavorite,
  onLearn,
}: PayeeSelectionBarProps) {
  const { t } = useTranslation();
  const moreRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Transfer payees belong to their accounts and are never edited here.
  const hasLockedPayee = [...selectedPayees].some(
    id => payeesById[id] == null || payeesById[id].transfer_acct != null,
  );

  return (
    <SelectionBar
      ariaLabel={t('Selected payees')}
      summary={t('{{count}} selected', { count: selectedPayees.size })}
    >
      <Button
        isDisabled={hasLockedPayee || selectedPayees.size < 2}
        onPress={() => void onMerge()}
      >
        <Trans>Merge</Trans>
      </Button>
      <Button isDisabled={hasLockedPayee} onPress={onDelete}>
        <Trans>Delete</Trans>
      </Button>
      <Button
        ref={moreRef}
        variant="bare"
        aria-label={t('More actions')}
        onPress={() => setIsMenuOpen(true)}
      >
        <SvgDotsHorizontalTriple width={14} height={14} />
      </Button>
      <Popover
        triggerRef={moreRef}
        isOpen={isMenuOpen}
        placement="top end"
        style={{ width: 250 }}
        onOpenChange={() => setIsMenuOpen(false)}
      >
        <PayeeMenu
          payeesById={payeesById}
          selectedPayees={selectedPayees}
          onClose={() => setIsMenuOpen(false)}
          onDelete={onDelete}
          onMerge={onMerge}
          onFavorite={onFavorite}
          onLearn={onLearn}
        />
      </Popover>
    </SelectionBar>
  );
}
