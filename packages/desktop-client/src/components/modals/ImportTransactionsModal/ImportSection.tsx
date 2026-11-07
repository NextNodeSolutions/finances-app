import { useId } from 'react';
import type { ReactNode } from 'react';

import { View } from '@actual-app/components/view';

import {
  sectionBodyStyle,
  sectionHeadingStyle,
  sectionStyle,
} from './sectionStyles';

type ImportSectionProps = {
  title: ReactNode;
  children: ReactNode;
};

/** One titled step of the import, set off from the previous one by a hairline. */
export function ImportSection({ title, children }: ImportSectionProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} style={sectionStyle}>
      <h2 id={headingId} style={sectionHeadingStyle}>
        {title}
      </h2>
      <View style={sectionBodyStyle}>{children}</View>
    </section>
  );
}
