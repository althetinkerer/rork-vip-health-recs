import React, { useCallback, useRef, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, Pressable, ScrollView,
  Animated, TouchableWithoutFeedback, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  X, BellOff, Calendar, Trophy, Pill, FileText,
  ArrowLeftRight, Shield, CheckCheck, ChevronRight,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import { AppNotification, NotificationCategory } from '@/types/notifications';

// ── Category config ────────────────────────────────────────────────────────────

const categoryConfig: Record<
  NotificationCategory,
  { label: string; color: string; bg: string; Icon: React.ComponentType<{ size: number; color: string }> }
> = {
  appointment: { label: 'Appointments',  color: colors.primary,   bg: colors.primaryFaded,     Icon: Calendar       },
  rewards:     { label: 'Health Rewards', color: '#F59E0B',        bg: '#FEF3C7',               Icon: Trophy         },
  medications: { label: 'Medications',   color: '#8B5CF6',        bg: '#EDE9FE',               Icon: Pill           },
  records:     { label: 'Records',       color: '#22C55E',        bg: '#DCFCE7',               Icon: FileText       },
  referrals:   { label: 'Referrals',     color: '#EC4899',        bg: '#FCE7F3',               Icon: ArrowLeftRight },
  insurance:   { label: 'Insurance',     color: '#14B8A6',        bg: '#CCFBF1',               Icon: Shield         },
};

// ── Time formatting ────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'Just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  === 1) return 'Yesterday';
  return `${days} days ago`;
}

// ── Notification Row ───────────────────────────────────────────────────────────

interface NotifRowProps {
  notif: AppNotification;
  onPress: () => void;
  onDismiss: () => void;
}

function NotifRow({ notif, onPress, onDismiss }: NotifRowProps) {
  const cfg = categoryConfig[notif.category];
  const { Icon } = cfg;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handleDismiss = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 80, duration: 250, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onDismiss());
  }, [slideAnim, opacityAnim, onDismiss]);

  return (
    <Animated.View
      style={[
        s.notifRow,
        notif.read && s.notifRowRead,
        { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <Pressable style={s.notifMain} onPress={onPress} android_ripple={{ color: colors.borderLight }}>
        {/* Icon */}
        <View style={[s.notifIconBox, { backgroundColor: cfg.bg }]}>
          <Icon size={18} color={cfg.color} />
        </View>

        {/* Content */}
        <View style={s.notifContent}>
          <View style={s.notifTitleRow}>
            <Text style={[s.notifTitle, notif.read && s.notifTitleRead]} numberOfLines={1}>
              {notif.title}
            </Text>
            {!notif.read && <View style={s.unreadDot} />}
          </View>
          <Text style={s.notifBody} numberOfLines={2}>{notif.body}</Text>
          <Text style={s.notifTime}>{formatRelativeTime(notif.timestamp)}</Text>
        </View>

        {/* Chevron */}
        <ChevronRight size={14} color={colors.textTertiary} />
      </Pressable>

      {/* Dismiss */}
      <Pressable style={s.dismissBtn} onPress={handleDismiss} hitSlop={8}>
        <X size={12} color={colors.textTertiary} />
      </Pressable>
    </Animated.View>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ visible, onClose }: Props) {
  const { notifications, unreadCount, markRead, markAllRead, dismissNotification } = useData();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(600)).current;

  // Slide-in / slide-out when visibility changes
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 22,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleNotifPress = useCallback((notif: AppNotification) => {
    markRead(notif.id);
    void Haptics.selectionAsync();
    onClose();
    if (notif.actionRoute) {
      // Small delay to allow modal to close before navigating
      setTimeout(() => router.push(notif.actionRoute as any), 150);
    }
  }, [markRead, onClose, router]);

  const handleMarkAllRead = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markAllRead();
  }, [markAllRead]);

  // Group by category preserving order of first appearance
  const grouped = React.useMemo(() => {
    const order: NotificationCategory[] = [];
    const map = new Map<NotificationCategory, AppNotification[]>();
    for (const n of notifications) {
      if (!map.has(n.category)) {
        map.set(n.category, []);
        order.push(n.category);
      }
      map.get(n.category)!.push(n);
    }
    return order.map(cat => ({ cat, items: map.get(cat)! }));
  }, [notifications]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
          {/* Handle */}
          <View style={s.handleBar} />

          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={s.headerBadge}>
                  <Text style={s.headerBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </View>
            <View style={s.headerActions}>
              {unreadCount > 0 && (
                <Pressable style={s.markAllBtn} onPress={handleMarkAllRead}>
                  <CheckCheck size={14} color={colors.primary} />
                  <Text style={s.markAllText}>Mark all read</Text>
                </Pressable>
              )}
              <Pressable style={s.closeBtn} onPress={onClose} hitSlop={8}>
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Body */}
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View style={s.emptyState}>
                <View style={s.emptyIconCircle}>
                  <BellOff size={36} color={colors.textTertiary} />
                </View>
                <Text style={s.emptyTitle}>You're all caught up!</Text>
                <Text style={s.emptyBody}>No new alerts right now. Check back later for updates on your appointments, rewards, and health activity.</Text>
              </View>
            ) : (
              grouped.map(({ cat, items }) => {
                const cfg = categoryConfig[cat];
                return (
                  <View key={cat} style={s.group}>
                    {/* Category header */}
                    <View style={s.groupHeader}>
                      <View style={[s.groupDot, { backgroundColor: cfg.color }]} />
                      <Text style={[s.groupLabel, { color: cfg.color }]}>{cfg.label}</Text>
                      <View style={s.groupLine} />
                    </View>

                    {/* Rows */}
                    {items.map(n => (
                      <NotifRow
                        key={n.id}
                        notif={n}
                        onPress={() => handleNotifPress(n)}
                        onDismiss={() => dismissNotification(n.id)}
                      />
                    ))}
                  </View>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadow.lg,
  },
  handleBar: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginTop: spacing.md, marginBottom: spacing.xs,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { ...typography.title3, color: colors.textPrimary },
  headerBadge: {
    backgroundColor: colors.error, borderRadius: borderRadius.full,
    paddingHorizontal: 7, paddingVertical: 2, minWidth: 22, alignItems: 'center',
  },
  headerBadgeText: { ...typography.small, color: '#fff', fontWeight: '700' as const },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  markAllText: { ...typography.caption, color: colors.primary, fontWeight: '600' as const },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },

  // Groups
  group: { paddingTop: spacing.lg },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.xl, marginBottom: spacing.sm,
  },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupLabel: { ...typography.caption, fontWeight: '700' as const, textTransform: 'uppercase', letterSpacing: 0.5 },
  groupLine: { flex: 1, height: 1, backgroundColor: colors.borderLight },

  // Notification row
  notifRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.xl, marginBottom: spacing.xs,
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  notifRowRead: { opacity: 0.75 },
  notifMain: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, gap: spacing.md,
  },
  notifIconBox: {
    width: 40, height: 40, borderRadius: borderRadius.md,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notifContent: { flex: 1, gap: 2 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  notifTitle: { ...typography.callout, color: colors.textPrimary, fontWeight: '600' as const, flex: 1 },
  notifTitleRead: { fontWeight: '400' as const, color: colors.textSecondary },
  unreadDot: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary, flexShrink: 0,
  },
  notifBody: { ...typography.small, color: colors.textSecondary, lineHeight: 16 },
  notifTime: { ...typography.small, color: colors.textTertiary, marginTop: 2 },

  // Dismiss button
  dismissBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center',
    borderLeftWidth: 1, borderLeftColor: colors.borderLight,
  },

  // Empty state
  emptyState: {
    alignItems: 'center', paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxxl * 2, paddingBottom: spacing.xxxl,
  },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: { ...typography.title3, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  emptyBody: { ...typography.callout, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
