import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Check } from 'lucide-react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const percentComplete = Math.round(((currentStep + 1) / totalSteps) * 100);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: (currentStep + 1) / totalSteps,
      friction: 12,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps, progressAnim]);

  const widthInterpolation = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{currentStep + 1}/{totalSteps}</Text>
        </View>
        <Text style={styles.percentText}>{percentComplete}%</Text>
      </View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: widthInterpolation }]}>
          <View style={styles.barShine} />
        </Animated.View>
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.stepLabel} numberOfLines={1}>{labels[currentStep]}</Text>
        {currentStep > 0 && (
          <View style={styles.completedBadge}>
            <Check size={10} color={colors.success} strokeWidth={3} />
            <Text style={styles.completedText}>{currentStep} done</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  stepBadgeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700' as const,
  },
  percentText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700' as const,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  barShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    fontWeight: '500' as const,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  completedText: {
    ...typography.small,
    color: colors.success,
    fontWeight: '600' as const,
  },
});
