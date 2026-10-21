import { useTranslation } from 'react-i18next';

import { BankSyncFeatureRow } from './BankSyncFeatureRow';
import { SettingsGroup } from './SettingsGroup';
import { TagsFeatureRow } from './TagsFeatureRow';

/** The features a budget can do without: bank sync and tags. */
export function OptionalFeatures() {
  const { t } = useTranslation();

  return (
    <SettingsGroup title={t('Features')}>
      <BankSyncFeatureRow />
      <TagsFeatureRow />
    </SettingsGroup>
  );
}
