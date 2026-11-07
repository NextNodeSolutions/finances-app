import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDocument } from '@actual-app/components/icons/v1';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

const FILE_ICON_SIZE = 14;

type ImportFileRowProps = {
  filename: string;
  parseError: string | null;
  onSelectNewFile: () => void;
};

/** The file being imported and, when it could not be read, why and what to do. */
export function ImportFileRow({
  filename,
  parseError,
  onSelectNewFile,
}: ImportFileRowProps) {
  return (
    <View style={{ gap: spacing.xs, paddingBottom: spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        }}
      >
        <SvgDocument
          width={FILE_ICON_SIZE}
          height={FILE_ICON_SIZE}
          aria-hidden
          style={{ flexShrink: 0, color: theme.pageTextLight }}
        />
        <Text
          title={filename}
          style={{
            flex: 1,
            minWidth: 0,
            fontWeight: 500,
            color: theme.pageTextDark,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {getBaseName(filename)}
        </Text>
        {parseError != null && (
          <Button onPress={onSelectNewFile}>
            <Trans>Select new file...</Trans>
          </Button>
        )}
      </View>
      {parseError != null && (
        <Text style={{ color: theme.errorText }}>
          <strong>
            <Trans>Error:</Trans>
          </strong>{' '}
          {parseError}
        </Text>
      )}
    </View>
  );
}

function getBaseName(filepath: string): string {
  return filepath.split(/[\\/]/).pop() || filepath;
}
