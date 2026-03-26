import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';
import { ReferralStatus, AppointmentStatus } from '@/types';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: colors.border, text: colors.textSecondary, label: 'Draft' },
  SENT: { bg: colors.infoLight, text: colors.info, label: 'Sent' },
  RECEIVED: { bg: colors.warningLight, text: colors.warning, label: 'Received' },
  IN_REVIEW: { bg: '#FEF3C7', text: '#D97706', label: 'In Review' },
  ACCEPTED: { bg: colors.successLight, text: colors.success, label: 'Accepted' },
  SCHEDULED: { bg: colors.primaryFaded, text: colors.primary, label: 'Scheduled' },
  COMPLETED: { bg: colors.successLight, text: colors.success, label: 'Completed' },
  DECLINED: { bg: colors.errorLight, text: colors.error, label: 'Declined' },
  UPCOMING: { bg: colors.primaryFaded, text: colors.primary, label: 'Upcoming' },
  CANCELLED: { bg: colors.errorLight, text: colors.error, label: 'Cancelled' },
};

interface StatusBadgeProps {
  status: ReferralStatus | AppointmentStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '600' as const,
  },
});
