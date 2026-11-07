import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type SkeletonProps = {
  width?: CSSProperties['width'];
  height: number;
  style?: CSSProperties;
};

/**
 * A still placeholder at the final size of what is loading: a hairline box
 * with a quiet fill, never a spinner or a shimmer.
 */
export function Skeleton({ width = '100%', height, style }: SkeletonProps) {
  return (
    <View
      aria-hidden
      style={{
        width,
        height,
        flexShrink: 0,
        borderRadius: radius.sm,
        border: `1px solid ${theme.hairlineSubtle}`,
        backgroundColor: theme.tableRowBackgroundHover,
        ...style,
      }}
    />
  );
}
