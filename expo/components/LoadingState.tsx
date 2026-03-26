import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
