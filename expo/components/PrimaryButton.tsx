import React, { useRef } from 'react';
import { StyleSheet, Text, Pressable, Animated, ActivityIndicator, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export default function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  style,
  icon,
}: PrimaryButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, friction: 8, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
  };

  const bgColor = variant === 'primary' ? colors.primary
    : variant === 'secondary' ? colors.primaryFaded
    : variant === 'danger' ? colors.error
    : 'transparent';

  const textColor = variant === 'primary' ? colors.textInverse
    : variant === 'secondary' ? colors.primary
    : variant === 'danger' ? colors.textInverse
    : colors.primary;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          { backgroundColor: bgColor },
          variant === 'outline' && styles.outline,
          disabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.label, { color: textColor }]}>{title}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    minHeight: 50,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.headline,
  },
});
