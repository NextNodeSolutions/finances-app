import React from 'react';

import {
  SvgAlertTriangle,
  SvgCalendar3,
  SvgCheckCircle1,
  SvgCheckCircleHollow,
  SvgEditSkull1,
  SvgFavoriteStar,
  SvgLockClosed,
  SvgValidationCheck,
} from '@actual-app/components/icons/v2';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { ScheduleStatusType } from '@actual-app/core/shared/schedules';
import { titleFirst } from '@actual-app/core/shared/util';

import { getStatusLabel } from '#util/schedule';

// Shape and type of the small pills (statuses, stages, roles, counts): a
// tinted chip, never a full capsule. Callers add the tint and ink.
export const pillStyle = {
  borderRadius: radius.sm,
  padding: '2px 8px',
  fontSize: 11.5,
  lineHeight: '16px',
  fontWeight: 500,
  whiteSpace: 'nowrap',
} as const;

// Consists of Schedule Statuses + Transaction statuses
export type StatusTypes =
  | ScheduleStatusType
  | 'cleared'
  | 'pending'
  | 'reconciled';

export const defaultStatusProps = {
  color: theme.buttonNormalDisabledText,
  backgroundColor: theme.tableRowHeaderBackground,
  Icon: SvgCheckCircleHollow,
};

export function getStatusProps(status: StatusTypes | null | undefined) {
  switch (status) {
    case 'missed':
      return {
        color: theme.errorText,
        backgroundColor: theme.errorBackground,
        Icon: SvgEditSkull1,
      };
    case 'due':
      return {
        color: theme.warningText,
        backgroundColor: theme.warningBackground,
        Icon: SvgAlertTriangle,
      };
    case 'upcoming':
      return {
        color: theme.upcomingText,
        backgroundColor: theme.upcomingBackground,
        Icon: SvgCalendar3,
      };
    case 'paid':
      return {
        color: theme.noticeText,
        backgroundColor: theme.noticeBackground,
        Icon: SvgValidationCheck,
      };
    case 'completed':
      return {
        color: theme.tableTextLight,
        backgroundColor: theme.pillBackgroundLight,
        Icon: SvgFavoriteStar,
      };
    case 'pending':
      return {
        color: theme.noticeText,
        backgroundColor: theme.noticeBackgroundLight,
        Icon: SvgCalendar3,
      };
    case 'scheduled':
      return {
        color: theme.pillText,
        backgroundColor: theme.pillBackground,
        Icon: SvgCalendar3,
      };
    case 'cleared':
      return {
        color: theme.noticeTextLight,
        backgroundColor: theme.tableRowHeaderBackground,
        Icon: SvgCheckCircle1,
      };
    case 'reconciled':
      return {
        color: theme.noticeTextLight,
        backgroundColor: theme.tableRowHeaderBackground,
        Icon: SvgLockClosed,
      };
    default:
      return defaultStatusProps;
  }
}

const STATUS_DOT_SIZE = 6;

export function StatusBadge({ status }: { status: ScheduleStatusType }) {
  const { color, backgroundColor } = getStatusProps(status);
  return (
    <View
      style={{
        color,
        backgroundColor,
        ...pillStyle,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs + spacing.xxs,
        flexShrink: 0,
      }}
    >
      <View
        aria-hidden
        style={{
          width: STATUS_DOT_SIZE,
          height: STATUS_DOT_SIZE,
          borderRadius: radius.pill,
          backgroundColor: 'currentColor',
          flexShrink: 0,
        }}
      />
      <Text>{titleFirst(getStatusLabel(status))}</Text>
    </View>
  );
}
