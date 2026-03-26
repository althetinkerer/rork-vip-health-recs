import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}

export default function Chip({ label, selected, onPress, color }: ChipProps) {
  const activeColor = color || colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && { backgroundColor: activeColor + '15', borderColor: activeColor },
      ]}
    >
      <Text style={[styles.label, selected && { color: activeColor, fontWeight: '600' as const }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: {
    ...typography.callout,
    color: colors.textSecondary,
  },
});
