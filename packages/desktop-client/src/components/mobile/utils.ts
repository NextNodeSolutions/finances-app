import type { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { elevation, radius } from '@actual-app/components/tokens';
import type {
  AccountEntity,
  PayeeEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';
import { css } from '@emotion/css';

type GetPrettyPayeeProps = {
  t: ReturnType<typeof useTranslation>['t'];
  transaction?: TransactionEntity;
  payee?: PayeeEntity;
  transferAccount?: AccountEntity;
};

export function getPrettyPayee({
  t,
  transaction,
  payee,
  transferAccount,
}: GetPrettyPayeeProps) {
  if (!transaction) {
    return '';
  }

  if (transferAccount) {
    return t('Transfer {{direction}} {{accountName}}', {
      direction: transaction?.amount > 0 ? t('from') : t('to'),
      accountName: transferAccount.name,
    });
  } else if (transaction.is_parent) {
    return t('Split');
  } else if (payee) {
    return payee.name;
  }

  return '';
}

/**
 * Returns `search` with the `filter` param set to `filter` — or removed when
 * it is empty — leaving any other params intact.
 */
export function withFilterParam(search: string, filter: string) {
  const params = new URLSearchParams(search);
  if (filter) {
    params.set('filter', filter);
  } else {
    params.delete('filter');
  }
  const next = params.toString();
  return next ? `?${next}` : '';
}

// Shared surface recipes for the narrow (phone) layout, so every list, card
// and figure on mobile reads as one private-ledger system.

// White card grouping list rows on the porcelain canvas.
export const mobileCardStyle: CSSProperties = {
  backgroundColor: theme.cardBackground,
  border: `1px solid ${theme.hairline}`,
  borderRadius: radius.lg,
  boxShadow: elevation.card,
  overflow: 'hidden',
};

// Rows of a grid list inside a card draw their own bottom rule; the card's
// border already closes the last one.
export const cardRowsClassName = css({
  '& > [role="row"]:last-child > [role="gridcell"] > div': {
    borderBottomWidth: 0,
  },
});

// Small uppercase mono label naming a figure or a group of figures.
export const mobileFigureLabelStyle: CSSProperties = {
  ...styles.monoLabel,
  color: theme.tableHeaderText,
};

// Gap left between two neighbouring amount chips in a budget row.
export const AMOUNT_CHIP_GUTTER = 6;
// Horizontal inset of the figure inside an amount chip; column totals above
// the chips use it to land on the same right edge.
export const AMOUNT_CHIP_INSET = 6;
// The chip keeps a transparent edge at rest so the figure does not move when
// the edge shows on press; the padding gives that pixel back.
const AMOUNT_CHIP_BORDER = 1;

// Tappable amount chip (budgeted, spent, balance): at rest only the mono
// figure shows, so a budget row reads as a ledger line rather than a row of
// fields. Every chip fills its column so the figures of a column share their
// right edge; a long figure may still widen its chip up to the column width.
export const mobileAmountChipStyle: CSSProperties = {
  minWidth: `calc(100% - ${AMOUNT_CHIP_GUTTER}px)`,
  justifyContent: 'flex-end',
  borderRadius: radius.sm,
  color: theme.tableText,
  padding: `3px ${AMOUNT_CHIP_INSET - AMOUNT_CHIP_BORDER}px`,
  minHeight: 26,
};

// Touch, hover and keyboard focus draw the chip as a tray-filled cell with a
// hairline edge, so the figure shows it is the control.
const amountChipActiveStyle = {
  backgroundColor: theme.trayBackground,
  borderColor: theme.hairline,
};
export const mobileAmountChipClassName = css({
  border: `${AMOUNT_CHIP_BORDER}px solid transparent`,
  '&[data-hovered], &[data-pressed], &[data-focus-visible]':
    amountChipActiveStyle,
});

// A negative balance sits in the same garnet-tinted chip as on the desktop
// budget, sized to its figure; its right edge stays on the column's edge.
export const mobileNegativeAmountChipStyle: CSSProperties = {
  minWidth: 'auto',
  backgroundColor: theme.errorBackground,
  color: theme.errorText,
};

// Filter bar above a mobile list: porcelain band, hairline rule beneath.
export const mobileSearchBarStyle: CSSProperties = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.mobilePageBackground,
  padding: '12px 12px 10px',
  width: '100%',
  borderBottom: `1px solid ${theme.hairline}`,
};

export const mobileSearchInputStyle: CSSProperties = {
  backgroundColor: theme.formInputBackground,
  borderColor: theme.formInputBorder,
  borderRadius: radius.md,
};

// Sticky action footer of a mobile edit form: a white band under a hairline.
export const mobileFormFooterStyle: CSSProperties = {
  paddingLeft: styles.mobileEditingPadding,
  paddingRight: styles.mobileEditingPadding,
  paddingTop: 12,
  paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
  backgroundColor: theme.titlebarBackground,
  borderTop: `1px solid ${theme.hairline}`,
};

export const mobileFooterButtonStyle: CSSProperties = {
  height: 44,
  borderRadius: radius.md,
  fontWeight: 500,
};

// Header title set in the display serif. A title that opens a menu (month,
// account) is followed by a small chevron rather than underlined, so it
// reads as a menu trigger and not as a link.
export const mobileHeaderTitleStyle: CSSProperties = {
  ...styles.display,
  fontSize: 20,
  lineHeight: '26px',
  color: theme.mobileHeaderText,
};

export const MOBILE_HEADER_TITLE_CHEVRON_SIZE = 10;

export const mobileHeaderTitleChevronStyle: CSSProperties = {
  flexShrink: 0,
  marginLeft: 6,
  color: theme.mobileHeaderTextSubdued,
};

// Square bare icon button used in the mobile header clusters.
export const mobileHeaderIconButtonStyle: CSSProperties = {
  width: 36,
  height: 36,
  margin: '0 6px',
  padding: 0,
  borderRadius: radius.md,
  color: theme.mobileHeaderText,
};
