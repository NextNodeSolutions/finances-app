import { Trans, useTranslation } from 'react-i18next';

import { useQuery } from '@tanstack/react-query';

import { tagQueries } from '#tags/queries';

import { OptionalFeatureRow } from './OptionalFeatureRow';

/** The tags switch. Switching off keeps every tag and every note. */
export function TagsFeatureRow() {
  const { t } = useTranslation();
  // Hidden tags are kept too, so they count.
  const { data: tags = [] } = useQuery(tagQueries.list());

  return (
    <OptionalFeatureRow
      feature="tags"
      title={t('Tags')}
      description={
        <Trans>
          Turn #words in notes into tags you can filter and report on.
        </Trans>
      }
      consequence={
        tags.length > 0 &&
        t(
          '{{count}} tags are kept. Notes keep their text; the # words show as plain text.',
          { count: tags.length },
        )
      }
    />
  );
}
