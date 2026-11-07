import { View } from '@actual-app/components/view';

import { SettleRule } from '#components/common/SettleRule';

const MARK_OFFSET = -7;

/**
 * The settle rule in miniature, under a to-budget figure of exactly 0.00.
 * It hangs below the figure, so the figure stays on the row's baseline.
 */
export function StatementSettledMark() {
  return (
    <View
      style={{ position: 'absolute', left: 0, right: 0, bottom: MARK_OFFSET }}
    >
      <SettleRule isSettled hasJustSettled={false} label="" />
    </View>
  );
}
