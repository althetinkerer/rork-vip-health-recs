import React from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight, ArrowLeft, Phone, Mail, MapPin, Calendar,
  FileText, Paperclip, CheckCircle, Clock, Send, Eye
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import Card from '@/components/Card';
import StatusBadge from '@/components/StatusBadge';
import PrimaryButton from '@/components/PrimaryButton';
import { ReferralStatus } from '@/types';

const STATUS_STEPS: { status: ReferralStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'DRAFT', label: 'Draft', icon: <FileText size={14} color={colors.textTertiary} /> },
  { status: 'SENT', label: 'Sent', icon: <Send size={14} color={colors.info} /> },
  { status: 'RECEIVED', label: 'Received', icon: <Eye size={14} color={colors.warning} /> },
  { status: 'IN_REVIEW', label: 'In Review', icon: <Clock size={14} color="#D97706" /> },
  { status: 'ACCEPTED', label: 'Accepted', icon: <CheckCircle size={14} color={colors.success} /> },
  { status: 'SCHEDULED', label: 'Scheduled', icon: <Calendar size={14} color={colors.primary} /> },
  { status: 'COMPLETED', label: 'Completed', icon: <CheckCircle size={14} color={colors.success} /> },
];

const statusOrder: ReferralStatus[] = ['DRAFT', 'SENT', 'RECEIVED', 'IN_REVIEW', 'ACCEPTED', 'SCHEDULED', 'COMPLETED'];

export default function ReferralDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { referrals, providers, updateReferral } = useData();
  const referral = referrals.find(r => r.id === id);

  if (!referral) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Referral not found</Text>
      </View>
    );
  }

  const fromProvider = providers.find(p => p.id === referral.fromProviderId);
  const toProvider = providers.find(p => p.id === referral.toProviderId);
  const isMedToDental = referral.direction === 'MED_TO_DENTAL';
  const dirColor = isMedToDental ? colors.medical : colors.dental;
  const currentIdx = statusOrder.indexOf(referral.status);
  const isDeclined = referral.status === 'DECLINED';

  const handleAccept = () => {
    updateReferral({ id: referral.id, updates: { status: 'ACCEPTED' } });
    Alert.alert('Accepted', 'Referral has been accepted.');
  };

  const handleDecline = () => {
    Alert.alert('Decline Referral', 'Are you sure you want to decline?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          updateReferral({ id: referral.id, updates: { status: 'DECLINED' } });
          router.back();
        },
      },
    ]);
  };

  const handleSchedule = () => {
    updateReferral({
      id: referral.id,
      updates: { status: 'SCHEDULED', scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString() },
    });
    Alert.alert('Scheduled', 'Referral appointment has been scheduled.');
  };

  const handleComplete = () => {
    updateReferral({ id: referral.id, updates: { status: 'COMPLETED' } });
    Alert.alert('Completed', 'Referral has been marked as completed.');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={[styles.dirBadge, { backgroundColor: dirColor + '15' }]}>
            {isMedToDental ? (
              <ArrowRight size={14} color={dirColor} />
            ) : (
              <ArrowLeft size={14} color={dirColor} />
            )}
            <Text style={[styles.dirText, { color: dirColor }]}>
              {isMedToDental ? 'Medical → Dental' : 'Dental → Medical'}
            </Text>
          </View>
          <StatusBadge status={referral.status} />
        </View>
        <Text style={styles.patientName}>{referral.patientName}</Text>
        {referral.patientDOB && (
          <Text style={styles.patientDob}>DOB: {referral.patientDOB}</Text>
        )}
      </Card>

      {!isDeclined && (
        <Card style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Status Timeline</Text>
          {STATUS_STEPS.map((step, i) => {
            const stepIdx = statusOrder.indexOf(step.status);
            const isActive = stepIdx <= currentIdx;
            const isCurrent = step.status === referral.status;

            return (
              <View key={step.status} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    isActive && styles.timelineDotActive,
                    isCurrent && styles.timelineDotCurrent,
                  ]}>
                    {step.icon}
                  </View>
                  {i < STATUS_STEPS.length - 1 && (
                    <View style={[styles.timelineLine, isActive && styles.timelineLineActive]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineLabel,
                    isActive && styles.timelineLabelActive,
                    isCurrent && styles.timelineLabelCurrent,
                  ]}>
                    {step.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      <Card style={styles.reasonCard}>
        <Text style={styles.sectionLabel}>Reason for Referral</Text>
        <Text style={styles.reasonText}>{referral.reason}</Text>
        {referral.notes ? (
          <>
            <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Notes</Text>
            <Text style={styles.reasonText}>{referral.notes}</Text>
          </>
        ) : null}
      </Card>

      {fromProvider && (
        <ProviderCard label="From Provider" provider={fromProvider} />
      )}
      {toProvider && (
        <ProviderCard label="To Provider" provider={toProvider} />
      )}

      {referral.attachments.length > 0 && (
        <Card style={styles.attachCard}>
          <Text style={styles.sectionLabel}>Attachments</Text>
          {referral.attachments.map((a, i) => (
            <View key={i} style={styles.attachRow}>
              <Paperclip size={14} color={colors.primary} />
              <Text style={styles.attachName}>{a}</Text>
            </View>
          ))}
        </Card>
      )}

      {referral.scheduledDate && (
        <Card style={styles.schedCard}>
          <View style={styles.schedRow}>
            <Calendar size={18} color={colors.primary} />
            <View>
              <Text style={styles.schedLabel}>Scheduled Date</Text>
              <Text style={styles.schedDate}>{new Date(referral.scheduledDate).toLocaleDateString()}</Text>
            </View>
          </View>
        </Card>
      )}

      <View style={styles.actions}>
        {referral.status === 'RECEIVED' && (
          <>
            <PrimaryButton title="Accept Referral" onPress={handleAccept} />
            <PrimaryButton title="Decline Referral" onPress={handleDecline} variant="danger" />
          </>
        )}
        {referral.status === 'ACCEPTED' && (
          <PrimaryButton title="Mark as Scheduled" onPress={handleSchedule} variant="secondary" />
        )}
        {referral.status === 'SCHEDULED' && (
          <PrimaryButton title="Mark as Completed" onPress={handleComplete} />
        )}
      </View>

      <View style={styles.metaSection}>
        <Text style={styles.metaText}>Created: {new Date(referral.createdAt).toLocaleString()}</Text>
        <Text style={styles.metaText}>Updated: {new Date(referral.updatedAt).toLocaleString()}</Text>
      </View>
    </ScrollView>
  );
}

function ProviderCard({ label, provider }: { label: string; provider: { name: string; specialty: string; phone: string; email: string; address: string } }) {
  return (
    <Card style={provStyles.card}>
      <Text style={provStyles.label}>{label}</Text>
      <Text style={provStyles.name}>{provider.name}</Text>
      <Text style={provStyles.specialty}>{provider.specialty}</Text>
      <View style={provStyles.row}>
        <Phone size={13} color={colors.textTertiary} />
        <Text style={provStyles.detail}>{provider.phone}</Text>
      </View>
      <View style={provStyles.row}>
        <Mail size={13} color={colors.textTertiary} />
        <Text style={provStyles.detail}>{provider.email}</Text>
      </View>
      <View style={provStyles.row}>
        <MapPin size={13} color={colors.textTertiary} />
        <Text style={provStyles.detail}>{provider.address}</Text>
      </View>
    </Card>
  );
}

const provStyles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  label: {
    ...typography.caption, color: colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: spacing.sm,
  },
  name: { ...typography.headline, color: colors.textPrimary },
  specialty: { ...typography.callout, color: colors.primary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  detail: { ...typography.callout, color: colors.textSecondary, flex: 1 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { ...typography.body, color: colors.textSecondary },
  headerCard: { marginBottom: spacing.lg },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  dirBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  dirText: { ...typography.caption, fontWeight: '600' as const },
  patientName: { ...typography.title3, color: colors.textPrimary },
  patientDob: { ...typography.callout, color: colors.textSecondary, marginTop: 2 },
  timelineCard: { marginBottom: spacing.lg },
  timelineTitle: {
    ...typography.caption, color: colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: spacing.lg,
  },
  timelineRow: { flexDirection: 'row', minHeight: 36 },
  timelineLeft: { width: 32, alignItems: 'center' },
  timelineDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  timelineDotActive: { borderColor: colors.primary, backgroundColor: colors.primaryFaded },
  timelineDotCurrent: { borderColor: colors.primary, backgroundColor: colors.primary },
  timelineLine: {
    width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2,
  },
  timelineLineActive: { backgroundColor: colors.primary },
  timelineContent: { flex: 1, paddingLeft: spacing.md, paddingBottom: spacing.sm },
  timelineLabel: { ...typography.callout, color: colors.textTertiary },
  timelineLabelActive: { color: colors.textSecondary },
  timelineLabelCurrent: { color: colors.primary, fontWeight: '600' as const },
  reasonCard: { marginBottom: spacing.md },
  sectionLabel: {
    ...typography.caption, color: colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: spacing.sm,
  },
  reasonText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  attachCard: { marginBottom: spacing.md },
  attachRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  attachName: { ...typography.callout, color: colors.primary },
  schedCard: { marginBottom: spacing.lg },
  schedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  schedLabel: { ...typography.caption, color: colors.textTertiary },
  schedDate: { ...typography.headline, color: colors.primary, marginTop: 1 },
  actions: { gap: spacing.md, marginBottom: spacing.xxl },
  metaSection: {
    paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  metaText: { ...typography.small, color: colors.textTertiary, marginBottom: 2 },
});
