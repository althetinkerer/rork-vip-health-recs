import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Pill, MapPin, Store, CheckCircle, ChevronLeft, Building, AlertCircle, Phone } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { useData } from '@/context/DataContext';

type WizardStep = 'LIST' | 'PHARMACY' | 'REVIEW' | 'SUCCESS';

// Embedded Mock Database for Pharmacies
const pharmacies = [
  { id: 'p1', name: 'CVS Pharmacy', address: '123 Main St, Springfield', phone: '(555) 123-4567', distance: '1.2 mi' },
  { id: 'p2', name: 'Walgreens Drug Store', address: '456 Oak Ave, Springfield', phone: '(555) 987-6543', distance: '2.4 mi' },
  { id: 'p3', name: 'VIP Clinical Dispensary', address: 'In-House Delivery (Suite 400)', phone: '(555) 777-8888', distance: '0.0 mi' },
];

export default function RequestRefillScreen() {
  const { medications } = useData();
  const router = useRouter();

  const [step, setStep] = useState<WizardStep>('LIST');
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract eligible active medications and map pseudo-refill counts for the UI demo loop
  const eligibleMeds = medications
    .filter(m => m.isActive)
    .map(m => {
      // Deterministically create a dummy 0-refill constraint for MVP showcase (checking length guarantees consistent logic)
      const mockRefills = m.name.toLowerCase().includes('lisinopril') ? 0 : 2;
      return { ...m, refillsRemaining: mockRefills };
    });

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    // Simulate complex network dispatch
    await new Promise(r => setTimeout(r, 2000));
    setIsProcessing(false);
    setStep('SUCCESS');
  };

  const traverseBack = () => {
    if (step === 'PHARMACY') setStep('LIST');
    else if (step === 'REVIEW') setStep('PHARMACY');
    else if (step === 'SUCCESS') router.navigate('/(tabs)/dashboard');
    else {
      if (router.canGoBack()) router.back();
      else router.navigate('/(tabs)/dashboard');
    }
  };

  // ------------------------------------------
  // RENDER: Step 1 - Choose Medication
  // ------------------------------------------
  const renderListStep = () => (
    <ScrollView contentContainerStyle={s.scrollPad}>
      <Text style={s.pageTitle}>Select Prescription</Text>
      <Text style={s.pageSubtitle}>Choose an active medication to securely send a refill request directly to a clinical pharmacy.</Text>
      
      {eligibleMeds.map((med) => {
        const canRefill = med.refillsRemaining > 0;
        return (
          <View key={med.id} style={[s.medCard, !canRefill && s.medCardDisabled]}>
            <View style={s.medHeader}>
              <View style={[s.iconBox, { backgroundColor: canRefill ? '#DCFCE7' : '#F1F5F9' }]}>
                <Pill size={24} color={canRefill ? '#15803D' : '#64748B'} />
              </View>
              <View style={s.medInfo}>
                <Text style={s.medName}>{med.name}</Text>
                <Text style={s.medDose}>{med.dosage} - {med.frequency}</Text>
              </View>
            </View>

            <View style={s.metricContainer}>
              <Text style={[s.refillCountText, { color: canRefill ? colors.success : colors.danger }]}>
                {med.refillsRemaining} Refills Remaining
              </Text>
              {!canRefill && (
                 <Text style={s.expiredWarning}>Doctor authorization required</Text>
              )}
            </View>

            {canRefill ? (
              <Pressable 
                style={s.refillBtn} 
                onPress={() => {
                  setSelectedMed(med);
                  setStep('PHARMACY');
                }}
              >
                <Text style={s.refillBtnText}>Start Refill Request</Text>
              </Pressable>
            ) : (
              <Pressable style={s.contactDoctorBtn}>
                 <Text style={s.contactDoctorText}>Contact Prescriber</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </ScrollView>
  );

  // ------------------------------------------
  // RENDER: Step 2 - Verify Pharmacy
  // ------------------------------------------
  const renderPharmacyStep = () => (
    <ScrollView contentContainerStyle={s.scrollPad}>
      <Text style={s.pageTitle}>Select Pharmacy</Text>
      <Text style={s.pageSubtitle}>Where would you like to route {selectedMed?.name}?</Text>

      {pharmacies.map(pharm => (
        <Pressable 
          key={pharm.id} 
          style={s.pharmCard}
          onPress={() => {
            setSelectedPharmacy(pharm);
            setStep('REVIEW');
          }}
        >
          <View style={s.pharmIconBox}>
            {pharm.id === 'p3' ? <Building size={24} color={colors.primary} /> : <Store size={24} color={colors.primary} />}
          </View>
          <View style={s.pharmInfo}>
            <Text style={s.pharmName}>{pharm.name}</Text>
            <Text style={s.pharmAddress}>{pharm.address}</Text>
            <View style={s.pharmMetaRow}>
              <Text style={s.pharmMetaText}>{pharm.distance}</Text>
              <Text style={s.pharmMetaSeparator}>•</Text>
              <Text style={s.pharmMetaText}>{pharm.phone}</Text>
            </View>
          </View>
          <View style={s.selectCircle} />
        </Pressable>
      ))}
    </ScrollView>
  );

  // ------------------------------------------
  // RENDER: Step 3 - Review & Transmit
  // ------------------------------------------
  const renderReviewStep = () => (
    <ScrollView contentContainerStyle={s.scrollPad}>
      <Text style={s.pageTitle}>Review Request</Text>
      <Text style={s.pageSubtitle}>Ensure everything is correct before securely transmitting to the pharmacy system.</Text>

      <View style={s.reviewCard}>
        <Text style={s.reviewCardTitle}>Medication Block</Text>
        <Text style={s.reviewPrimary}>{selectedMed?.name}</Text>
        <Text style={s.reviewSecondary}>{selectedMed?.dosage} ({selectedMed?.frequency})</Text>
        <Text style={s.reviewSecondary}>Prescribed by {selectedMed?.prescribedBy}</Text>
      </View>

      <View style={s.reviewCard}>
        <Text style={s.reviewCardTitle}>Destination Pharmacy</Text>
        <Text style={s.reviewPrimary}>{selectedPharmacy?.name}</Text>
        <Text style={s.reviewSecondary}>{selectedPharmacy?.address}</Text>
      </View>

      {isProcessing ? (
        <View style={s.processingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.processingText}>Transmitting secure HL7 payload...</Text>
        </View>
      ) : (
        <Pressable style={s.transmitBtn} onPress={handleConfirmOrder}>
          <Text style={s.transmitBtnText}>Confirm & Transmit Order</Text>
        </Pressable>
      )}
    </ScrollView>
  );

  // ------------------------------------------
  // RENDER: Step 4 - Success Screen
  // ------------------------------------------
  const renderSuccessStep = () => (
    <View style={[s.scrollPad, s.centerDiv]}>
      <View style={s.successCircle}>
        <CheckCircle size={64} color="#15803D" />
      </View>
      <Text style={s.successTitle}>Request Sent Natively!</Text>
      <Text style={s.successSubtitle}>
        Your refill request for {selectedMed?.name} was securely routed to {selectedPharmacy?.name}. You will be notified when it's ready for pickup.
      </Text>
      
      <Pressable style={s.doneBtn} onPress={() => router.navigate('/(tabs)/dashboard')}>
        <Text style={s.doneBtnText}>Return to Dashboard</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={s.screen}>
      <Stack.Screen 
        options={{
          headerTitle: 'Request Refill',
          headerTintColor: colors.primary,
          headerLeft: () => (
            <Pressable onPress={traverseBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ChevronLeft size={28} color={colors.primary} style={{ marginLeft: -8 }} />
              <Text style={{ color: colors.primary, fontSize: 17 }}>
                {step === 'LIST' ? 'Back' : step === 'SUCCESS' ? 'Done' : 'Cancel'}
              </Text>
            </Pressable>
          ),
        }}
      />
      {step === 'LIST' && renderListStep()}
      {step === 'PHARMACY' && renderPharmacyStep()}
      {step === 'REVIEW' && renderReviewStep()}
      {step === 'SUCCESS' && renderSuccessStep()}
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollPad: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  centerDiv: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  medCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  medCardDisabled: {
    opacity: 0.85,
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  medDose: {
    ...typography.subheadline,
    color: colors.textSecondary,
  },
  metricContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  refillCountText: {
    ...typography.headline,
    fontSize: 15,
  },
  expiredWarning: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  refillBtn: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refillBtnText: {
    ...typography.headline,
    color: colors.textInverse,
  },
  contactDoctorBtn: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactDoctorText: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  pharmCard: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  pharmIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F1FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  pharmInfo: {
    flex: 1,
  },
  pharmName: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  pharmAddress: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  pharmMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pharmMetaText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  pharmMetaSeparator: {
    marginHorizontal: 8,
    color: colors.border,
  },
  selectCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginLeft: spacing.sm,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  reviewCardTitle: {
    ...typography.subheadline,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  reviewPrimary: {
    ...typography.headline,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  reviewSecondary: {
    ...typography.body,
    color: colors.textSecondary,
  },
  transmitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.md,
  },
  transmitBtnText: {
    ...typography.headline,
    color: colors.textInverse,
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxxl,
  },
  processingText: {
    ...typography.headline,
    color: colors.primary,
    marginTop: spacing.md,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  doneBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
  },
  doneBtnText: {
    ...typography.headline,
    color: colors.textPrimary,
  }
});
