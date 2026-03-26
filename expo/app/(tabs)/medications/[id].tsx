import React from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pill, User, Calendar, Clock, FileText, AlertTriangle } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { medications, updateMedication } = useData();
  const med = medications.find(m => m.id === id);

  if (!med) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Medication not found</Text>
      </View>
    );
  }

  const stockPct = med.pillsRemaining !== undefined && med.totalPills !== undefined && med.totalPills > 0
    ? (med.pillsRemaining / med.totalPills) * 100 : 100;
  const isLow = med.isActive && stockPct < 20;
  const barColor = isLow ? colors.error : stockPct < 50 ? colors.warning : colors.success;

  const handleDiscontinue = () => {
    Alert.alert('Discontinue', 'Mark this medication as inactive?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discontinue',
        style: 'destructive',
        onPress: () => {
          updateMedication({ id: med.id, updates: { isActive: false } });
          router.back();
        },
      },
    ]);
  };

  const handleRefill = () => {
    Alert.alert('Refill Requested', 'Refill request sent to your pharmacy (mock).');
    updateMedication({ id: med.id, updates: { pillsRemaining: med.totalPills ?? 90 } });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={[styles.pillIcon, { backgroundColor: med.isActive ? colors.primaryFaded : colors.surfaceSecondary }]}>
            <Pill size={24} color={med.isActive ? colors.primary : colors.textTertiary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{med.name}</Text>
            <Text style={styles.dosage}>{med.dosage}</Text>
            <View style={[styles.statusBadge, { backgroundColor: med.isActive ? colors.successLight : colors.surfaceSecondary }]}>
              <Text style={[styles.statusText, { color: med.isActive ? colors.success : colors.textTertiary }]}>
                {med.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {isLow && (
        <View style={styles.alertBanner}>
          <AlertTriangle size={18} color={colors.error} />
          <Text style={styles.alertText}>Low stock — only {med.pillsRemaining} pills remaining</Text>
        </View>
      )}

      {med.isActive && med.pillsRemaining !== undefined && med.totalPills !== undefined && (
        <Card style={styles.stockCard}>
          <Text style={styles.stockTitle}>Supply Level</Text>
          <View style={styles.stockBar}>
            <View style={[styles.stockFill, { width: `${Math.min(stockPct, 100)}%`, backgroundColor: barColor }]} />
          </View>
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>{med.pillsRemaining} of {med.totalPills} pills</Text>
            <Text style={[styles.stockPct, { color: barColor }]}>{Math.round(stockPct)}%</Text>
          </View>
        </Card>
      )}

      <Card style={styles.detailCard}>
        <DetailRow icon={<Clock size={18} color={colors.primary} />} label="Frequency" value={med.frequency} />
        <DetailRow icon={<User size={18} color={colors.primary} />} label="Prescribed By" value={med.prescribedBy} />
        <DetailRow icon={<Calendar size={18} color={colors.primary} />} label="Start Date" value={med.startDate} />
        {med.endDate && <DetailRow icon={<Calendar size={18} color={colors.primary} />} label="End Date" value={med.endDate} />}
        {med.refillDate && <DetailRow icon={<Calendar size={18} color={colors.warning} />} label="Refill Date" value={med.refillDate} />}
      </Card>

      {med.instructions && (
        <Card style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <FileText size={16} color={colors.primary} />
            <Text style={styles.notesLabel}>Instructions</Text>
          </View>
          <Text style={styles.notesText}>{med.instructions}</Text>
        </Card>
      )}

      {med.isActive && (
        <View style={styles.actions}>
          {isLow && <PrimaryButton title="Request Refill" onPress={handleRefill} />}
          <PrimaryButton title="Discontinue Medication" onPress={handleDiscontinue} variant="danger" />
        </View>
      )}
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      {icon}
      <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { ...typography.body, color: colors.textSecondary },
  headerCard: { marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  pillIcon: {
    width: 56, height: 56, borderRadius: borderRadius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1, gap: 4 },
  title: { ...typography.title3, color: colors.textPrimary },
  dosage: { ...typography.body, color: colors.textSecondary },
  statusBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm, alignSelf: 'flex-start', marginTop: 2,
  },
  statusText: { ...typography.caption, fontWeight: '600' as const },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.errorLight, padding: spacing.lg,
    borderRadius: borderRadius.md, marginBottom: spacing.lg,
  },
  alertText: { ...typography.callout, color: colors.error, fontWeight: '600' as const, flex: 1 },
  stockCard: { marginBottom: spacing.lg },
  stockTitle: {
    ...typography.caption, color: colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: spacing.sm,
  },
  stockBar: {
    height: 8, backgroundColor: colors.borderLight,
    borderRadius: 4, overflow: 'hidden', marginBottom: spacing.sm,
  },
  stockFill: { height: 8, borderRadius: 4 },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stockLabel: { ...typography.small, color: colors.textSecondary },
  stockPct: { ...typography.caption, fontWeight: '700' as const },
  detailCard: { marginBottom: spacing.lg, gap: spacing.lg },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  detailInfo: { flex: 1 },
  detailLabel: {
    ...typography.caption, color: colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5,
  },
  detailValue: { ...typography.body, color: colors.textPrimary, marginTop: 2 },
  notesCard: { marginBottom: spacing.xxl },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  notesLabel: {
    ...typography.caption, color: colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5,
  },
  notesText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  actions: { gap: spacing.md },
});
