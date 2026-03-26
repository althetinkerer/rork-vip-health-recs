import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Animated } from 'react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';

interface AvatarGuideProps {
  message: string;
  size?: 'small' | 'medium' | 'large';
  showBubble?: boolean;
  layout?: 'horizontal' | 'vertical';
}

const AVATAR_URL = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/62ucvr22l2ze5sr60nnf9';

export default function AvatarGuide({ message, size = 'medium', showBubble = true, layout = 'horizontal' }: AvatarGuideProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(10);
    scaleAnim.setValue(0.9);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [message, fadeAnim, slideAnim, scaleAnim]);

  const containerSize = size === 'small' ? 48 : size === 'medium' ? 64 : 90;

  if (layout === 'vertical') {
    return (
      <View style={styles.verticalContainer}>
        <Image
          source={{ uri: AVATAR_URL }}
          style={{ width: containerSize, height: containerSize }}
          resizeMode="contain"
        />

        {showBubble && (
          <Animated.View
            style={[
              styles.verticalBubbleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.verticalBubbleTail} />
            <View style={styles.verticalBubble}>
              <Text style={styles.bubbleText}>{message}</Text>
            </View>
          </Animated.View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: AVATAR_URL }}
        style={{ width: containerSize, height: containerSize }}
        resizeMode="contain"
      />

      {showBubble && (
        <Animated.View
          style={[
            styles.bubbleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{message}</Text>
          </View>
          <View style={styles.bubbleTail} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  verticalContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },

  bubbleContainer: {
    flex: 1,
    marginTop: spacing.xs,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderTopLeftRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadow.md,
    borderWidth: 1,
    borderColor: colors.primaryFaded,
  },
  bubbleText: {
    ...typography.callout,
    color: colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  bubbleTail: {
    position: 'absolute',
    left: -6,
    top: 12,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.surface,
  },
  verticalBubbleContainer: {
    alignItems: 'center',
  },
  verticalBubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.surface,
  },
  verticalBubble: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadow.md,
    borderWidth: 1,
    borderColor: colors.primaryFaded,
  },
});
