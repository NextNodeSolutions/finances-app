import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion } from '@actual-app/components/tokens';

type SparklineRangeLabelProps = {
  label: string;
  isActive: boolean;
};

/** One of the two range marks under the sparkline; the active one is ink. */
export function SparklineRangeLabel({
  label,
  isActive,
}: SparklineRangeLabelProps) {
  return (
    <Text
      style={{
        ...styles.monoLabel,
        color: isActive ? theme.pageTextDark : theme.pageTextSubdued,
        transition: `color ${motion.base} ${motion.ease}`,
      }}
    >
      {label}
    </Text>
  );
}
