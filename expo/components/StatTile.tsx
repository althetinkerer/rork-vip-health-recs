import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Animated, Pressable } from 'react-native';
import { Activity, Heart, Moon, Footprints } from 'lucide-react-native';
import { colors, borderRadius, shadow, spacing, typography } from '@/constants/theme';
import { HealthStat } from '@/types';

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Heart,
  Activity,
  Moon,
  Footprints,
};

interface StatTileProps {
  stat: HealthStat;
  index: number;
  onPress?: () => void;
}

export default function StatTile({ stat, index, onPress }: StatTileProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const IconComponent = iconMap[stat.icon] || Activity;
  const trendArrow = stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→';
  const trendColor = stat.trend === 'up' ? colors.success : stat.trend === 'down' ? colors.error : colors.textTertiary;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], flex: 1 }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.tile,
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: stat.color + '15' }]}>
          <IconComponent size={18} color={stat.color} />
        </View>
        <Text style={styles.label}>{stat.label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={[styles.unit, { color: colors.textTertiary }]}>{stat.unit}</Text>
        </View>
        {stat.trend && (
          <Text style={[styles.trend, { color: trendColor }]}>
            {trendArrow} {stat.trend}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  value: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  unit: {
    ...typography.small,
  },
  trend: {
    ...typography.small,
    marginTop: 2,
    fontWeight: '600' as const,
  },
});
