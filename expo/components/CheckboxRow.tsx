import React, { useRef } from 'react';
import { StyleSheet, Text, Pressable, Animated, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export default function CheckboxRow({ label, checked, onToggle }: CheckboxRowProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable onPress={handlePress} style={styles.row}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Check size={13} color={colors.textInverse} strokeWidth={3} />}
        </View>
        <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  labelChecked: {
    color: colors.primary,
    fontWeight: '500' as const,
  },
});
