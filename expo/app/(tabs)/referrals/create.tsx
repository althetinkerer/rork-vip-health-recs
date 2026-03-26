import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, ArrowLeft, Check, Paperclip } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import Card from '@/components/Card';
import { Referral, ReferralDirection, Provider } from '@/types';

type Step = 0 | 1 | 2 | 3 | 4;
const STEP_LABELS = ['Direction', 'Providers', 'Patient & Reason', 'Attachments', 'Review'];

export default function CreateReferralScreen() {
  const router = useRouter();
  const { providers, addReferral } = useData();
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<ReferralDirection>('MED_TO_DENTAL');
  const [fromProviderId, setFromProviderId] = useState('');
  const [toProviderId, setToProviderId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientDOB, setPatientDOB] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const medicalProviders = useMemo(() => providers.filter(p => p.type === 'MEDICAL'), [providers]);
  const dentalProviders = useMemo(() => providers.filter(p => p.type === 'DENTAL'), [providers]);

  const fromProviders = direction === 'MED_TO_DENTAL' ? medicalProviders : dentalProviders;
  const toProviders = direction === 'MED_TO_DENTAL' ? dentalProviders : medicalProviders;

  const fromProvider = providers.find(p => p.id === fromProviderId);
  const toProvider = providers.find(p => p.id === toProviderId);

  const canNext = (): boolean => {
    switch (step) {
      case 0: return true;
      case 1: return !!fromProviderId && !!toProviderId;
      case 2: return !!patientName.trim() && !!reason.trim();
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 2) {
      const e: Record<string, string> = {};
      if (!patientName.trim()) e.patientName = 'Patient name is required';
      if (!reason.trim()) e.reason = 'Reason is required';
      if (Object.keys(e).length > 0) {
        setErrors(e);
        return;
      }
      setErrors({});
    }
    if (step < 4) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 0) setStep((step - 1) as Step);
  };

  const handleAddAttachment = () => {
    const name = `document_${attachments.length + 1}.pdf`;
    setAttachments([...attachments, name]);
    Alert.alert('Attachment Added', `${name} attached (mock).`);
  };

  const handleSubmit = () => {
    const newRef: Referral = {
      id: `ref-${Date.now()}`,
      direction,
      patientName: patientName.trim(),
      patientDOB: patientDOB.trim() || undefined,
      reason: reason.trim(),
      notes: notes.trim(),
      fromProviderId,
      toProviderId,
      attachments,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addReferral(newRef);
    Alert.alert('Referral Sent', 'Your referral has been submitted successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const renderProviderOption = (provider: Provider, selected: boolean, onSelect: () => void) => (
    <Pressable
      key={provider.id}
      style={[styles.provOption, selected && styles.provOptionSelected]}
      onPress={onSelect}
    >
      <View style={styles.provInfo}>
        <Text style={styles.provName}>{provider.name}</Text>
        <Text style={styles.provSpec}>{provider.specialty}</Text>
      </View>
      {selected && (
        <View style={styles.checkCircle}>
          <Check size={14} color={colors.textInverse} />
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.stepper}>
        {STEP_LABELS.map((label, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              i <= step && styles.stepDotActive,
              i === step && styles.stepDotCurrent,
            ]}>
              {i < step ? (
                <Check size={12} color={colors.textInverse} />
              ) : (
                <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Referral Direction</Text>
            <Pressable
              style={[styles.dirOption, direction === 'MED_TO_DENTAL' && styles.dirOptionSelected]}
              onPress={() => { setDirection('MED_TO_DENTAL'); setFromProviderId(''); setToProviderId(''); }}
            >
              <View style={[styles.dirIcon, { backgroundColor: colors.medical + '15' }]}>
                <ArrowRight size={20} color={colors.medical} />
              </View>
              <View style={styles.dirInfo}>
                <Text style={styles.dirTitle}>Medical → Dental</Text>
                <Text style={styles.dirDesc}>Refer patient from medical to dental provider</Text>
              </View>
            </Pressable>
            <Pressable
              style={[styles.dirOption, direction === 'DENTAL_TO_MED' && styles.dirOptionSelected]}
              onPress={() => { setDirection('DENTAL_TO_MED'); setFromProviderId(''); setToProviderId(''); }}
            >
              <View style={[styles.dirIcon, { backgroundColor: colors.dental + '15' }]}>
                <ArrowLeft size={20} color={colors.dental} />
              </View>
              <View style={styles.dirInfo}>
                <Text style={styles.dirTitle}>Dental → Medical</Text>
                <Text style={styles.dirDesc}>Refer patient from dental to medical provider</Text>
              </View>
            </Pressable>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select From Provider</Text>
            {fromProviders.map(p => renderProviderOption(p, fromProviderId === p.id, () => setFromProviderId(p.id)))}

            <Text style={[styles.stepTitle, { marginTop: spacing.xxl }]}>Select To Provider</Text>
            {toProviders.map(p => renderProviderOption(p, toProviderId === p.id, () => setToProviderId(p.id)))}
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Patient & Reason</Text>
            <Input label="Patient Name" value={patientName} onChangeText={setPatientName} placeholder="Full name" error={errors.patientName} />
            <Input label="Date of Birth (optional)" value={patientDOB} onChangeText={setPatientDOB} placeholder="YYYY-MM-DD" />
            <Input label="Reason for Referral" value={reason} onChangeText={setReason} placeholder="Describe the clinical reason..." multiline numberOfLines={3} error={errors.reason} />
            <Input label="Additional Notes" value={notes} onChangeText={setNotes} placeholder="Any additional information..." multiline numberOfLines={3} />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Attachments</Text>
            <Text style={styles.stepDesc}>Add relevant documents, labs, or imaging.</Text>
            {attachments.map((a, i) => (
              <View key={i} style={styles.attachItem}>
                <Paperclip size={14} color={colors.primary} />
                <Text style={styles.attachName}>{a}</Text>
              </View>
            ))}
            <PrimaryButton
              title="Add Attachment (Mock)"
              onPress={handleAddAttachment}
              variant="outline"
              icon={<Paperclip size={16} color={colors.primary} />}
              style={styles.attachBtn}
            />
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & Send</Text>
            <Card style={styles.reviewCard}>
              <ReviewRow label="Direction" value={direction === 'MED_TO_DENTAL' ? 'Medical → Dental' : 'Dental → Medical'} />
              <ReviewRow label="From" value={fromProvider?.name ?? '—'} />
              <ReviewRow label="To" value={toProvider?.name ?? '—'} />
              <ReviewRow label="Patient" value={patientName} />
              {patientDOB ? <ReviewRow label="DOB" value={patientDOB} /> : null}
              <ReviewRow label="Reason" value={reason} />
              {notes ? <ReviewRow label="Notes" value={notes} /> : null}
              <ReviewRow label="Attachments" value={attachments.length > 0 ? attachments.join(', ') : 'None'} />
            </Card>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {step > 0 && (
          <PrimaryButton title="Back" onPress={handleBack} variant="outline" style={styles.backBtn} />
        )}
        {step < 4 ? (
          <PrimaryButton title="Next" onPress={handleNext} disabled={!canNext()} style={styles.nextBtn} />
        ) : (
          <PrimaryButton title="Send Referral" onPress={handleSubmit} style={styles.nextBtn} />
        )}
      </View>
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={reviewStyles.row}>
      <Text style={reviewStyles.label}>{label}</Text>
      <Text style={reviewStyles.value}>{value}</Text>
    </View>
  );
}

const reviewStyles = StyleSheet.create({
  row: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { ...typography.caption, color: colors.textTertiary, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  value: { ...typography.body, color: colors.textPrimary, marginTop: 2 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  stepper: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    justifyContent: 'space-between',
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.border,
  },
  stepDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDotCurrent: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  stepNum: { ...typography.small, color: colors.textTertiary, fontWeight: '600' as const },
  stepNumActive: { color: colors.textInverse },
  stepLabel: { ...typography.small, color: colors.textTertiary },
  stepLabelActive: { color: colors.primary, fontWeight: '600' as const },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: 120 },
  stepContent: {},
  stepTitle: { ...typography.title3, color: colors.textPrimary, marginBottom: spacing.lg },
  stepDesc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  dirOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 2, borderColor: 'transparent', ...shadow.sm,
  },
  dirOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryFaded },
  dirIcon: {
    width: 48, height: 48, borderRadius: borderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  dirInfo: { flex: 1 },
  dirTitle: { ...typography.headline, color: colors.textPrimary },
  dirDesc: { ...typography.callout, color: colors.textSecondary, marginTop: 2 },
  provOption: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.sm,
    borderWidth: 1.5, borderColor: colors.border, ...shadow.sm,
  },
  provOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryFaded },
  provInfo: { flex: 1 },
  provName: { ...typography.headline, color: colors.textPrimary },
  provSpec: { ...typography.callout, color: colors.textSecondary, marginTop: 1 },
  checkCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  attachItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  attachName: { ...typography.callout, color: colors.primary },
  attachBtn: { marginTop: spacing.md },
  reviewCard: { gap: 0 },
  bottomBar: {
    flexDirection: 'row', gap: spacing.md,
    padding: spacing.xl, backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  backBtn: { flex: 1 },
  nextBtn: { flex: 2 },
});
