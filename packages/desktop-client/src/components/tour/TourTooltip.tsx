import { useTranslation } from 'react-i18next';
import type { TooltipRenderProps } from 'react-joyride';

import { SvgDelete } from '@actual-app/components/icons/v0';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { elevation, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { TourTooltipButton } from './TourTooltipButton';

export function TourTooltip({
  backProps,
  closeProps,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  const { t } = useTranslation();

  return (
    <View
      {...tooltipProps}
      data-testid="tour-tooltip"
      style={{
        backgroundColor: theme.menuBackground,
        border: `1px solid ${theme.menuBorder}`,
        borderRadius: radius.lg,
        color: theme.pageTextLight,
        fontSize: 13,
        lineHeight: '20px',
        maxWidth: 360,
        padding: '16px 18px',
        boxShadow: elevation.popover,
      }}
    >
      <TourTooltipButton
        handleProps={closeProps}
        style={{
          color: theme.pageTextSubdued,
          width: 24,
          height: 24,
          padding: 0,
          borderRadius: radius.sm,
          position: 'absolute',
          right: 10,
          top: 10,
        }}
      >
        <SvgDelete style={{ width: 8, height: 8 }} />
      </TourTooltipButton>

      {step.title != null && (
        <Text
          style={{
            fontSize: 13.5,
            lineHeight: '20px',
            fontWeight: 600,
            color: theme.pageText,
            marginBottom: 6,
            paddingRight: 28,
          }}
        >
          {step.title}
        </Text>
      )}

      <Text>{step.content}</Text>

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 6,
          marginTop: 16,
        }}
      >
        <Text
          style={{
            ...styles.tnum,
            fontSize: 11.5,
            color: theme.pageTextSubdued,
            flex: 1,
          }}
        >
          {t('{{current}} of {{total}}', {
            current: index + 1,
            total: size,
          })}
        </Text>
        {!isLastStep && (
          <TourTooltipButton
            handleProps={skipProps}
            style={{ color: theme.pageTextSubdued }}
          />
        )}
        {index > 0 && <TourTooltipButton handleProps={backProps} />}
        <TourTooltipButton handleProps={primaryProps} variant="primary" />
      </View>
    </View>
  );
}
