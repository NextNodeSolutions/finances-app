import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { SidePanel } from '#components/common/SidePanel';

import { PanelGroup } from './PanelGroup';

const FIELD_COUNT = 7;
const LABEL_WIDTH = 96;
const CONTROL_HEIGHT = 30;

type TransactionPanelSkeletonProps = {
  testId: string;
  onClose: () => void;
};

/** Static field placeholders while the transaction loads (no shimmer). */
export function TransactionPanelSkeleton({
  testId,
  onClose,
}: TransactionPanelSkeletonProps) {
  const { t } = useTranslation();

  return (
    <SidePanel title={t('Transaction')} testId={testId} onClose={onClose}>
      <PanelGroup>
        <View aria-busy aria-label={t('Loading transaction')} role="status">
          {Array.from({ length: FIELD_COUNT }, (_, index) => (
            <View
              key={index}
              aria-hidden
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingBlock: spacing.xs,
              }}
            >
              <View
                style={{
                  width: LABEL_WIDTH * 0.6,
                  marginRight: LABEL_WIDTH * 0.4,
                  height: 8,
                  borderRadius: radius.xs,
                  backgroundColor: theme.trayBackground,
                }}
              />
              <View
                style={{
                  flex: 1,
                  height: CONTROL_HEIGHT,
                  borderRadius: radius.md,
                  backgroundColor: theme.trayBackground,
                }}
              />
            </View>
          ))}
        </View>
      </PanelGroup>
    </SidePanel>
  );
}
