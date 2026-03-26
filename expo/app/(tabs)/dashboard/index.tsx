import React, { useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Calendar, ChevronRight, FileText, AlertTriangle } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import { mockStats } from '@/mocks/data';
import StatTile from '@/components/StatTile';
import SectionHeader from '@/components/SectionHeader';
import Card from '@/components/Card';
import StatusBadge from '@/components/StatusBadge';

export default function DashboardScreen() {
  const router = useRouter();
  const { appointments, medications, referrals, records, refetchAll } = useData();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refetchAll();
    setTimeout(() => setRefreshing(false), 800);
  }, [refetchAll]);

  const upcomingAppts = appointments
    .filter(a => a.status === 'UPCOMING')
    .slice(0, 2);

  const lowStockMeds = medications.filter(
    m => m.isActive && m.pillsRemaining !== undefined && m.totalPills !== undefined && m.pillsRemaining < m.totalPills * 0.2
  );

  const pendingReferrals = referrals.filter(
    r => r.status === 'RECEIVED' || r.status === 'IN_REVIEW'
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.headerTitle}>Health Dashboard</Text>
          </View>
          <Pressable style={styles.notifButton} hitSlop={8}>
            <Bell size={22} color={colors.textPrimary} />
            {pendingReferrals.length > 0 && <View style={styles.notifDot} />}
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            {mockStats.slice(0, 2).map((stat, i) => (
              <StatTile key={stat.id} stat={stat} index={i} />
            ))}
          </View>
          <View style={styles.statsRow}>
            {mockStats.slice(2, 4).map((stat, i) => (
              <StatTile key={stat.id} stat={stat} index={i + 2} />
            ))}
          </View>
        </View>

        {lowStockMeds.length > 0 && (
          <Pressable
            style={styles.alertBanner}
            onPress={() => router.push('/(tabs)/medications')}
          >
            <AlertTriangle size={18} color={colors.warning} />
            <Text style={styles.alertText}>
              {lowStockMeds.length} medication{lowStockMeds.length > 1 ? 's' : ''} running low
            </Text>
            <ChevronRight size={16} color={colors.warning} />
          </Pressable>
        )}

        <SectionHeader
          title="Upcoming Appointments"
          actionLabel="See all"
          onAction={() => router.push('/(tabs)/appointments')}
        />
        {upcomingAppts.length === 0 ? (
          <Card style={styles.cardMargin}>
            <Text style={styles.emptyText}>No upcoming appointments</Text>
          </Card>
        ) : (
          upcomingAppts.map(apt => (
            <Card
              key={apt.id}
              style={styles.cardMargin}
              onPress={() => router.push(`/(tabs)/appointments/${apt.id}`)}
              variant="elevated"
            >
              <View style={styles.apptRow}>
                <View style={[styles.apptIcon, { backgroundColor: apt.type === 'VIRTUAL' ? colors.primaryFaded : colors.successLight }]}>
                  <Calendar size={18} color={apt.type === 'VIRTUAL' ? colors.primary : colors.success} />
                </View>
                <View style={styles.apptInfo}>
                  <Text style={styles.apptTitle}>{apt.title}</Text>
                  <Text style={styles.apptProvider}>{apt.providerName}</Text>
                  <Text style={styles.apptTime}>{apt.date} · {apt.time}</Text>
                </View>
                <StatusBadge status={apt.status} />
              </View>
            </Card>
          ))
        )}

        {pendingReferrals.length > 0 && (
          <>
            <SectionHeader
              title="Referrals Needing Action"
              actionLabel="View all"
              onAction={() => router.push('/(tabs)/referrals')}
            />
            {pendingReferrals.slice(0, 2).map(ref => (
              <Card
                key={ref.id}
                style={styles.cardMargin}
                onPress={() => router.push(`/(tabs)/referrals/${ref.id}`)}
              >
                <View style={styles.refRow}>
                  <View style={styles.refInfo}>
                    <Text style={styles.refPatient}>{ref.patientName}</Text>
                    <Text style={styles.refReason} numberOfLines={1}>{ref.reason}</Text>
                  </View>
                  <StatusBadge status={ref.status} />
                </View>
              </Card>
            ))}
          </>
        )}

        <SectionHeader
          title="Recent Records"
          actionLabel="See all"
          onAction={() => router.push('/(tabs)/records')}
        />
        {records.slice(0, 3).map(rec => (
          <Card
            key={rec.id}
            style={styles.cardMargin}
            onPress={() => router.push(`/(tabs)/records/${rec.id}`)}
          >
            <View style={styles.recRow}>
              <View style={styles.recIcon}>
                <FileText size={16} color={colors.primary} />
              </View>
              <View style={styles.recInfo}>
                <Text style={styles.recTitle} numberOfLines={1}>{rec.title}</Text>
                <Text style={styles.recMeta}>{rec.providerName} · {rec.date}</Text>
              </View>
            </View>
          </Card>
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeTop: {
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  greeting: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  statsGrid: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  alertText: {
    ...typography.callout,
    color: '#92400E',
    fontWeight: '600' as const,
    flex: 1,
  },
  cardMargin: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  apptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  apptIcon: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apptInfo: {
    flex: 1,
  },
  apptTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  apptProvider: {
    ...typography.callout,
    color: colors.textSecondary,
    marginTop: 1,
  },
  apptTime: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  refInfo: {
    flex: 1,
  },
  refPatient: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  refReason: {
    ...typography.callout,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  recIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recInfo: {
    flex: 1,
  },
  recTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  recMeta: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  bottomPad: {
    height: 20,
  },
});
