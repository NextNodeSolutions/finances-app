import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { ROW_HEIGHT } from '#components/table';

import type { RegisterSection } from './registerRows';

// Lines the label up with the date column, after the selection cell.
const SECTION_LABEL_INSET = 25;

type RegisterSectionRowProps = {
  section: RegisterSection;
};

/** The `UPCOMING` / `POSTED` separator between preview and posted rows. */
export function RegisterSectionRow({ section }: RegisterSectionRowProps) {
  const { t } = useTranslation();

  return (
    <View
      role="presentation"
      tabIndex={-1}
      style={{
        height: ROW_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: SECTION_LABEL_INSET,
        backgroundColor: theme.tableHeaderBackground,
        borderTop: `1px solid ${theme.tableBorder}`,
        borderBottom: `1px solid ${theme.tableBorder}`,
        userSelect: 'none',
      }}
    >
      <Text
        aria-hidden
        style={{ ...styles.monoLabel, color: theme.tableHeaderText }}
      >
        {section === 'upcoming' ? t('Upcoming') : t('Posted')}
      </Text>
    </View>
  );
}
