import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import {
  SvgCheveronDown,
  SvgCheveronRight,
} from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import {
  sectionBodyStyle,
  sectionHeadingStyle,
  sectionStyle,
} from './sectionStyles';

// The bare button's own inset, pulled back so the chevron sits on the
// content edge shared by the other section headings.
const DISCLOSURE_INSET = 6;
const CHEVRON_SIZE = 10;

type AdvancedOptionsProps = {
  children: ReactNode;
};

/** File-format and merge options, folded away until the user asks for them. */
export function AdvancedOptions({ children }: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const regionId = useId();
  const Chevron = isOpen ? SvgCheveronDown : SvgCheveronRight;

  return (
    <section style={sectionStyle}>
      <h2
        style={{
          ...sectionHeadingStyle,
          marginBottom: isOpen ? spacing.sm : 0,
        }}
      >
        <Button
          variant="bare"
          aria-expanded={isOpen}
          aria-controls={isOpen ? regionId : undefined}
          onPress={() => setIsOpen(wasOpen => !wasOpen)}
          style={{
            alignSelf: 'flex-start',
            gap: spacing.sm,
            padding: `${spacing.xs}px ${DISCLOSURE_INSET}px`,
            marginLeft: -DISCLOSURE_INSET,
            font: 'inherit',
            color: 'inherit',
          }}
        >
          <Chevron
            width={CHEVRON_SIZE}
            height={CHEVRON_SIZE}
            aria-hidden
            style={{ flexShrink: 0, color: theme.pageTextLight }}
          />
          <Trans>Advanced</Trans>
        </Button>
      </h2>
      {isOpen && (
        <View id={regionId} style={sectionBodyStyle}>
          {children}
        </View>
      )}
    </section>
  );
}
