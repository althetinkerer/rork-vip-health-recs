import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { ADAHealthHistory } from '@/types';
import { useData } from '@/context/DataContext';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import CheckboxRow from '@/components/CheckboxRow';

const AVATAR_URL = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/62ucvr22l2ze5sr60nnf9';

const STEP_LABELS = [
  'Patient Information',
  'Dental History',
  'Medical Conditions',
  'Allergies',
  'Medications',
  "Women's Health / Additional",
  'Review & Consent',
];

const AVATAR_MESSAGES = [
  "Hi there! Let's start with your basic info so we can set up your profile.",
  "Great job! Now tell me about your dental history — it helps us give you the best care.",
  "Almost there! Let's go through your medical history to keep you safe.",
  "Do you have any allergies? This is really important for your safety.",
  "What medications are you currently taking? Include vitamins too!",
  "Just a few more questions — you're doing amazing!",
  "Last step! Please review everything and sign to complete.",
];

const COMPLETION_MESSAGE = "You're all set! Welcome to VIP Health Recs. I'll be here to guide you through your health journey!";

function createEmptyForm(): Omit<ADAHealthHistory, 'id' | 'completedAt'> {
  return {
    patientInfo: {
      lastName: '',
      firstName: '',
      middleInitial: '',
      dateOfBirth: '',
      sex: '',
      homeAddress: '',
      city: '',
      state: '',
      zip: '',
      homePhone: '',
      cellPhone: '',
      email: '',
      occupation: '',
      socialSecurityNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
    },
    dentalInfo: {
      reasonForVisit: '',
      previousDentist: '',
      dateOfLastVisit: '',
      dateOfLastXrays: '',
      hasJawPain: false,
      hasClickingJaw: false,
      hasSoreJawMuscles: false,
      hasDifficultyOpening: false,
      clenchesTeeth: false,
      grindsTeeth: false,
      hasBitingHabit: false,
      hasOrthodonticTreatment: false,
      hasPeriodontitis: false,
      hasBleedingGums: false,
      hasSensitiveTeeth: false,
      hasBadBreath: false,
      hasSoresOrGrowths: false,
      usesTobacco: false,
      tobaccoType: '',
      satisfiedWithSmile: true,
      additionalDentalConcerns: '',
    },
    medicalConditions: {
      heartDisease: false,
      heartAttack: false,
      heartMurmur: false,
      rheumaticFever: false,
      highBloodPressure: false,
      lowBloodPressure: false,
      mitralValveProlapse: false,
      chestPain: false,
      angina: false,
      stroke: false,
      pacemaker: false,
      artificialHeart: false,
      anemia: false,
      bleedingDisorder: false,
      hemophilia: false,
      leukemia: false,
      diabetes: false,
      diabetesType: '',
      thyroidDisease: false,
      hepatitis: false,
      hepatitisType: '',
      liverDisease: false,
      jaundice: false,
      hivPositive: false,
      aids: false,
      arthritis: false,
      rheumatism: false,
      cortisoneTherapy: false,
      asthma: false,
      hayfever: false,
      sinusProblems: false,
      allergies: false,
      tuberculosis: false,
      emphysema: false,
      respiratoryProblems: false,
      epilepsy: false,
      seizures: false,
      fainting: false,
      nervousness: false,
      psychiatricTreatment: false,
      kidneyDisease: false,
      ulcers: false,
      stomachProblems: false,
      cancer: false,
      cancerType: '',
      radiationTherapy: false,
      chemotherapy: false,
      prostheticJoint: false,
      prostheticJointType: '',
      glaucoma: false,
      contactLenses: false,
      skinRash: false,
      otherConditions: '',
    },
    allergyInfo: {
      localAnesthetics: false,
      penicillin: false,
      antibiotics: false,
      sulfa: false,
      barbiturates: false,
      sedatives: false,
      aspirin: false,
      ibuprofen: false,
      codeine: false,
      latex: false,
      metals: false,
      acrylic: false,
      otherAllergies: '',
    },
    medicationInfo: {
      currentMedications: '',
      overTheCounterMeds: '',
      vitaminsOrSupplements: '',
    },
    womenHealth: {
      isPregnant: null,
      isNursing: null,
      takesBirthControl: null,
      dueDate: '',
    },
    additionalInfo: {
      hasBeenHospitalized: false,
      hospitalizationReason: '',
      hasBloodTransfusion: false,
      hasDrugAlcoholDependency: false,
      useRecreationalDrugs: false,
      hasSpecialDiet: false,
      dietDetails: '',
      physicianName: '',
      physicianPhone: '',
      dateOfLastPhysical: '',
    },
    consent: {
      patientSignature: '',
      signatureDate: '',
      parentGuardianSignature: '',
    },
  };
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const percent = Math.round(((current + 1) / total) * 100);

  React.useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: (current + 1) / total,
      friction: 12,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [current, total, progressAnim]);

  const widthInterp = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={progressStyles.wrapper}>
      <View style={progressStyles.labelRow}>
        <Text style={progressStyles.stepText}>Step {current + 1} of {total}</Text>
        <Text style={progressStyles.percentText}>{percent}%</Text>
      </View>
      <View style={progressStyles.track}>
        <Animated.View style={[progressStyles.fill, { width: widthInterp }]}>
          <View style={progressStyles.shine} />
        </Animated.View>
      </View>
      <View style={progressStyles.dotsRow}>
        {STEP_LABELS.map((label, i) => (
          <View
            key={label}
            style={[
              progressStyles.dot,
              i <= current && progressStyles.dotActive,
              i < current && progressStyles.dotDone,
            ]}
          >
            {i < current && <Check size={8} color={colors.textInverse} strokeWidth={3} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const progressStyles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
  percentText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700' as const,
  },
  track: {
    height: 6,
    backgroundColor: colors.primaryFaded,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  dotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaded,
  },
  dotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

function AvatarBubble({ message, animKey }: { message: string; animKey: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  React.useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(10);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [animKey, fadeAnim, slideAnim]);

  return (
    <View style={avatarStyles.container}>
      <Image
        source={{ uri: AVATAR_URL }}
        style={avatarStyles.avatar}
        resizeMode="contain"
      />
      <Animated.View
        style={[
          avatarStyles.messageContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={avatarStyles.messageText}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    marginBottom: spacing.sm,
  },
  messageContainer: {
    paddingHorizontal: spacing.md,
  },
  messageText: {
    ...typography.callout,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500' as const,
  },
});

export default function OnboardingScreen() {
  const { completeOnboarding } = useData();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(createEmptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const completionScale = useRef(new Animated.Value(0)).current;
  const completionFade = useRef(new Animated.Value(0)).current;

  const animateTransition = useCallback((next: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setStep(next);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [fadeAnim]);

  const updatePatientInfo = useCallback((key: string, value: string) => {
    setForm(prev => ({ ...prev, patientInfo: { ...prev.patientInfo, [key]: value } }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }, [errors]);

  const updateDentalInfo = useCallback((key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, dentalInfo: { ...prev.dentalInfo, [key]: value } }));
  }, []);

  const toggleMedCondition = useCallback((key: string) => {
    setForm(prev => ({
      ...prev,
      medicalConditions: {
        ...prev.medicalConditions,
        [key]: !prev.medicalConditions[key as keyof typeof prev.medicalConditions],
      },
    }));
  }, []);

  const toggleAllergy = useCallback((key: string) => {
    setForm(prev => ({
      ...prev,
      allergyInfo: {
        ...prev.allergyInfo,
        [key]: !prev.allergyInfo[key as keyof typeof prev.allergyInfo],
      },
    }));
  }, []);

  const updateMedicationInfo = useCallback((key: string, value: string) => {
    setForm(prev => ({ ...prev, medicationInfo: { ...prev.medicationInfo, [key]: value } }));
  }, []);

  const updateAdditionalInfo = useCallback((key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, additionalInfo: { ...prev.additionalInfo, [key]: value } }));
  }, []);

  const updateWomenHealth = useCallback((key: string, value: boolean | null | string) => {
    setForm(prev => ({ ...prev, womenHealth: { ...prev.womenHealth, [key]: value } }));
  }, []);

  const updateConsent = useCallback((key: string, value: string) => {
    setForm(prev => ({ ...prev, consent: { ...prev.consent, [key]: value } }));
  }, []);

  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!form.patientInfo.firstName.trim()) newErrors.firstName = 'Required';
      if (!form.patientInfo.lastName.trim()) newErrors.lastName = 'Required';
      if (!form.patientInfo.dateOfBirth.trim()) newErrors.dateOfBirth = 'Required';
      if (!form.patientInfo.cellPhone.trim()) newErrors.cellPhone = 'Required';
      if (!form.patientInfo.emergencyContactName.trim()) newErrors.emergencyContactName = 'Required';
      if (!form.patientInfo.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Required';
    }
    if (step === 6) {
      if (!form.consent.patientSignature.trim()) newErrors.patientSignature = 'Signature is required';
      if (!form.consent.signatureDate.trim()) newErrors.signatureDate = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, form]);

  const handleNext = useCallback(() => {
    if (!validateStep()) return;
    if (step < STEP_LABELS.length - 1) {
      animateTransition(step + 1);
    }
  }, [step, validateStep, animateTransition]);

  const handleBack = useCallback(() => {
    if (step > 0) animateTransition(step - 1);
  }, [step, animateTransition]);

  const showCompletionScreen = useCallback(() => {
    setCompleted(true);
    Animated.parallel([
      Animated.spring(completionScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(completionFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [completionScale, completionFade]);

  const handleSubmit = useCallback(async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const history: ADAHealthHistory = {
        id: `hh-${Date.now()}`,
        completedAt: new Date().toISOString(),
        ...form,
      };
      showCompletionScreen();
      setTimeout(async () => {
        try {
          await completeOnboarding(history);
          console.log('ADA Health History submitted successfully');
        } catch (e) {
          console.log('Submit error:', e);
        }
      }, 3000);
    } catch (e) {
      console.log('Submit error:', e);
      Alert.alert('Error', 'Failed to submit health history. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [form, validateStep, completeOnboarding, showCompletionScreen]);

  const renderPatientInfo = () => (
    <View>
      <Text style={styles.sectionTitle}>Patient Information</Text>
      <Text style={styles.sectionSubtitle}>Please provide your personal details as they appear on your ID.</Text>
      <View style={styles.row}>
        <Input label="First Name *" value={form.patientInfo.firstName} onChangeText={(v) => updatePatientInfo('firstName', v)} error={errors.firstName} containerStyle={styles.halfInput} placeholder="John" />
        <Input label="Last Name *" value={form.patientInfo.lastName} onChangeText={(v) => updatePatientInfo('lastName', v)} error={errors.lastName} containerStyle={styles.halfInput} placeholder="Doe" />
      </View>
      <View style={styles.row}>
        <Input label="M.I." value={form.patientInfo.middleInitial} onChangeText={(v) => updatePatientInfo('middleInitial', v)} containerStyle={styles.quarterInput} placeholder="A" maxLength={1} />
        <Input label="Date of Birth *" value={form.patientInfo.dateOfBirth} onChangeText={(v) => updatePatientInfo('dateOfBirth', v)} error={errors.dateOfBirth} containerStyle={styles.threeQuarterInput} placeholder="MM/DD/YYYY" />
      </View>

      <Text style={styles.fieldLabel}>SEX</Text>
      <View style={styles.sexRow}>
        {(['Male', 'Female', 'Other'] as const).map(s => (
          <PrimaryButton key={s} title={s} variant={form.patientInfo.sex === s ? 'primary' : 'outline'} onPress={() => updatePatientInfo('sex', s)} style={styles.sexButton} />
        ))}
      </View>

      <Input label="Home Address" value={form.patientInfo.homeAddress} onChangeText={(v) => updatePatientInfo('homeAddress', v)} placeholder="123 Main Street" />
      <View style={styles.row}>
        <Input label="City" value={form.patientInfo.city} onChangeText={(v) => updatePatientInfo('city', v)} containerStyle={styles.halfInput} placeholder="San Francisco" />
        <Input label="State" value={form.patientInfo.state} onChangeText={(v) => updatePatientInfo('state', v)} containerStyle={styles.quarterInput} placeholder="CA" maxLength={2} />
        <Input label="Zip" value={form.patientInfo.zip} onChangeText={(v) => updatePatientInfo('zip', v)} containerStyle={styles.quarterInput} placeholder="94102" keyboardType="numeric" />
      </View>

      <View style={styles.row}>
        <Input label="Home Phone" value={form.patientInfo.homePhone} onChangeText={(v) => updatePatientInfo('homePhone', v)} containerStyle={styles.halfInput} placeholder="(415) 555-0100" keyboardType="phone-pad" />
        <Input label="Cell Phone *" value={form.patientInfo.cellPhone} onChangeText={(v) => updatePatientInfo('cellPhone', v)} error={errors.cellPhone} containerStyle={styles.halfInput} placeholder="(415) 555-0101" keyboardType="phone-pad" />
      </View>

      <Input label="Email" value={form.patientInfo.email} onChangeText={(v) => updatePatientInfo('email', v)} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" />
      <Input label="Occupation" value={form.patientInfo.occupation} onChangeText={(v) => updatePatientInfo('occupation', v)} placeholder="Software Engineer" />

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Emergency Contact</Text>
      <Input label="Contact Name *" value={form.patientInfo.emergencyContactName} onChangeText={(v) => updatePatientInfo('emergencyContactName', v)} error={errors.emergencyContactName} placeholder="Jane Doe" />
      <View style={styles.row}>
        <Input label="Phone *" value={form.patientInfo.emergencyContactPhone} onChangeText={(v) => updatePatientInfo('emergencyContactPhone', v)} error={errors.emergencyContactPhone} containerStyle={styles.halfInput} placeholder="(415) 555-0102" keyboardType="phone-pad" />
        <Input label="Relationship" value={form.patientInfo.emergencyContactRelation} onChangeText={(v) => updatePatientInfo('emergencyContactRelation', v)} containerStyle={styles.halfInput} placeholder="Spouse" />
      </View>
    </View>
  );

  const renderDentalHistory = () => (
    <View>
      <Text style={styles.sectionTitle}>Dental History</Text>
      <Text style={styles.sectionSubtitle}>Help us understand your dental background.</Text>

      <Input label="Reason for Today's Visit" value={form.dentalInfo.reasonForVisit} onChangeText={(v) => updateDentalInfo('reasonForVisit', v)} placeholder="Routine cleaning, toothache, etc." multiline />
      <Input label="Previous Dentist" value={form.dentalInfo.previousDentist} onChangeText={(v) => updateDentalInfo('previousDentist', v)} placeholder="Dr. Smith" />
      <View style={styles.row}>
        <Input label="Date of Last Visit" value={form.dentalInfo.dateOfLastVisit} onChangeText={(v) => updateDentalInfo('dateOfLastVisit', v)} containerStyle={styles.halfInput} placeholder="MM/DD/YYYY" />
        <Input label="Last X-Rays" value={form.dentalInfo.dateOfLastXrays} onChangeText={(v) => updateDentalInfo('dateOfLastXrays', v)} containerStyle={styles.halfInput} placeholder="MM/DD/YYYY" />
      </View>

      <View style={styles.divider} />
      <Text style={styles.groupTitle}>Do you currently have any of the following?</Text>
      <View style={styles.checkboxGrid}>
        <CheckboxRow label="Jaw pain or soreness" checked={form.dentalInfo.hasJawPain} onToggle={() => updateDentalInfo('hasJawPain', !form.dentalInfo.hasJawPain)} />
        <CheckboxRow label="Clicking/popping jaw" checked={form.dentalInfo.hasClickingJaw} onToggle={() => updateDentalInfo('hasClickingJaw', !form.dentalInfo.hasClickingJaw)} />
        <CheckboxRow label="Sore jaw muscles" checked={form.dentalInfo.hasSoreJawMuscles} onToggle={() => updateDentalInfo('hasSoreJawMuscles', !form.dentalInfo.hasSoreJawMuscles)} />
        <CheckboxRow label="Difficulty opening mouth" checked={form.dentalInfo.hasDifficultyOpening} onToggle={() => updateDentalInfo('hasDifficultyOpening', !form.dentalInfo.hasDifficultyOpening)} />
        <CheckboxRow label="Clench teeth" checked={form.dentalInfo.clenchesTeeth} onToggle={() => updateDentalInfo('clenchesTeeth', !form.dentalInfo.clenchesTeeth)} />
        <CheckboxRow label="Grind teeth" checked={form.dentalInfo.grindsTeeth} onToggle={() => updateDentalInfo('grindsTeeth', !form.dentalInfo.grindsTeeth)} />
        <CheckboxRow label="Biting habit (cheeks/lips)" checked={form.dentalInfo.hasBitingHabit} onToggle={() => updateDentalInfo('hasBitingHabit', !form.dentalInfo.hasBitingHabit)} />
        <CheckboxRow label="Previous orthodontic treatment" checked={form.dentalInfo.hasOrthodonticTreatment} onToggle={() => updateDentalInfo('hasOrthodonticTreatment', !form.dentalInfo.hasOrthodonticTreatment)} />
        <CheckboxRow label="Periodontal (gum) disease" checked={form.dentalInfo.hasPeriodontitis} onToggle={() => updateDentalInfo('hasPeriodontitis', !form.dentalInfo.hasPeriodontitis)} />
        <CheckboxRow label="Bleeding gums" checked={form.dentalInfo.hasBleedingGums} onToggle={() => updateDentalInfo('hasBleedingGums', !form.dentalInfo.hasBleedingGums)} />
        <CheckboxRow label="Sensitive teeth" checked={form.dentalInfo.hasSensitiveTeeth} onToggle={() => updateDentalInfo('hasSensitiveTeeth', !form.dentalInfo.hasSensitiveTeeth)} />
        <CheckboxRow label="Persistent bad breath" checked={form.dentalInfo.hasBadBreath} onToggle={() => updateDentalInfo('hasBadBreath', !form.dentalInfo.hasBadBreath)} />
        <CheckboxRow label="Sores or growths in mouth" checked={form.dentalInfo.hasSoresOrGrowths} onToggle={() => updateDentalInfo('hasSoresOrGrowths', !form.dentalInfo.hasSoresOrGrowths)} />
        <CheckboxRow label="Use tobacco products" checked={form.dentalInfo.usesTobacco} onToggle={() => updateDentalInfo('usesTobacco', !form.dentalInfo.usesTobacco)} />
      </View>

      {form.dentalInfo.usesTobacco && (
        <Input label="Tobacco Type" value={form.dentalInfo.tobaccoType ?? ''} onChangeText={(v) => updateDentalInfo('tobaccoType', v)} placeholder="Cigarettes, chewing, vaping, etc." />
      )}

      <CheckboxRow label="Satisfied with your smile" checked={form.dentalInfo.satisfiedWithSmile} onToggle={() => updateDentalInfo('satisfiedWithSmile', !form.dentalInfo.satisfiedWithSmile)} />

      <Input label="Additional Dental Concerns" value={form.dentalInfo.additionalDentalConcerns ?? ''} onChangeText={(v) => updateDentalInfo('additionalDentalConcerns', v)} placeholder="Any other concerns..." multiline />
    </View>
  );

  const renderMedicalConditions = () => {
    const cardiovascular: Array<{ key: string; label: string }> = [
      { key: 'heartDisease', label: 'Heart disease' },
      { key: 'heartAttack', label: 'Heart attack' },
      { key: 'heartMurmur', label: 'Heart murmur' },
      { key: 'rheumaticFever', label: 'Rheumatic fever' },
      { key: 'highBloodPressure', label: 'High blood pressure' },
      { key: 'lowBloodPressure', label: 'Low blood pressure' },
      { key: 'mitralValveProlapse', label: 'Mitral valve prolapse' },
      { key: 'chestPain', label: 'Chest pain / Angina' },
      { key: 'stroke', label: 'Stroke' },
      { key: 'pacemaker', label: 'Pacemaker' },
      { key: 'artificialHeart', label: 'Artificial heart valve' },
    ];

    const blood: Array<{ key: string; label: string }> = [
      { key: 'anemia', label: 'Anemia' },
      { key: 'bleedingDisorder', label: 'Bleeding disorder' },
      { key: 'hemophilia', label: 'Hemophilia' },
      { key: 'leukemia', label: 'Leukemia' },
    ];

    const endocrine: Array<{ key: string; label: string }> = [
      { key: 'diabetes', label: 'Diabetes' },
      { key: 'thyroidDisease', label: 'Thyroid disease' },
    ];

    const liver: Array<{ key: string; label: string }> = [
      { key: 'hepatitis', label: 'Hepatitis' },
      { key: 'liverDisease', label: 'Liver disease' },
      { key: 'jaundice', label: 'Jaundice' },
    ];

    const immune: Array<{ key: string; label: string }> = [
      { key: 'hivPositive', label: 'HIV positive' },
      { key: 'aids', label: 'AIDS' },
    ];

    const musculoskeletal: Array<{ key: string; label: string }> = [
      { key: 'arthritis', label: 'Arthritis' },
      { key: 'rheumatism', label: 'Rheumatism' },
      { key: 'cortisoneTherapy', label: 'Cortisone therapy' },
      { key: 'prostheticJoint', label: 'Prosthetic joint' },
    ];

    const respiratory: Array<{ key: string; label: string }> = [
      { key: 'asthma', label: 'Asthma' },
      { key: 'hayfever', label: 'Hay fever' },
      { key: 'sinusProblems', label: 'Sinus problems' },
      { key: 'allergies', label: 'Allergies' },
      { key: 'tuberculosis', label: 'Tuberculosis' },
      { key: 'emphysema', label: 'Emphysema' },
      { key: 'respiratoryProblems', label: 'Other respiratory problems' },
    ];

    const neurological: Array<{ key: string; label: string }> = [
      { key: 'epilepsy', label: 'Epilepsy' },
      { key: 'seizures', label: 'Seizures' },
      { key: 'fainting', label: 'Fainting spells' },
      { key: 'nervousness', label: 'Nervousness / Anxiety' },
      { key: 'psychiatricTreatment', label: 'Psychiatric treatment' },
    ];

    const other: Array<{ key: string; label: string }> = [
      { key: 'kidneyDisease', label: 'Kidney disease' },
      { key: 'ulcers', label: 'Ulcers' },
      { key: 'stomachProblems', label: 'Stomach problems' },
      { key: 'cancer', label: 'Cancer / Tumors' },
      { key: 'radiationTherapy', label: 'Radiation therapy' },
      { key: 'chemotherapy', label: 'Chemotherapy' },
      { key: 'glaucoma', label: 'Glaucoma' },
      { key: 'contactLenses', label: 'Contact lenses' },
      { key: 'skinRash', label: 'Skin rash / Hives' },
    ];

    const renderGroup = (title: string, items: Array<{ key: string; label: string }>) => (
      <View key={title}>
        <Text style={styles.groupTitle}>{title}</Text>
        <View style={styles.checkboxGrid}>
          {items.map(item => (
            <CheckboxRow
              key={item.key}
              label={item.label}
              checked={!!form.medicalConditions[item.key as keyof typeof form.medicalConditions]}
              onToggle={() => toggleMedCondition(item.key)}
            />
          ))}
        </View>
      </View>
    );

    return (
      <View>
        <Text style={styles.sectionTitle}>Medical History</Text>
        <Text style={styles.sectionSubtitle}>Check any conditions that apply to you, past or present.</Text>
        {renderGroup('Cardiovascular', cardiovascular)}
        {renderGroup('Blood Disorders', blood)}
        {renderGroup('Endocrine', endocrine)}
        {form.medicalConditions.diabetes && (
          <View style={styles.subFieldRow}>
            {(['Type 1', 'Type 2'] as const).map(t => (
              <PrimaryButton key={t} title={t} variant={form.medicalConditions.diabetesType === t ? 'primary' : 'outline'} onPress={() => setForm(prev => ({ ...prev, medicalConditions: { ...prev.medicalConditions, diabetesType: t } }))} style={styles.subButton} />
            ))}
          </View>
        )}
        {renderGroup('Liver / GI', liver)}
        {form.medicalConditions.hepatitis && (
          <View style={styles.subFieldRow}>
            {(['A', 'B', 'C'] as const).map(t => (
              <PrimaryButton key={t} title={`Type ${t}`} variant={form.medicalConditions.hepatitisType === t ? 'primary' : 'outline'} onPress={() => setForm(prev => ({ ...prev, medicalConditions: { ...prev.medicalConditions, hepatitisType: t } }))} style={styles.subButton} />
            ))}
          </View>
        )}
        {renderGroup('Immune', immune)}
        {renderGroup('Musculoskeletal', musculoskeletal)}
        {renderGroup('Respiratory / Allergies', respiratory)}
        {renderGroup('Neurological', neurological)}
        {renderGroup('Other', other)}
        {form.medicalConditions.cancer && (
          <Input label="Cancer Type" value={form.medicalConditions.cancerType ?? ''} onChangeText={(v) => setForm(prev => ({ ...prev, medicalConditions: { ...prev.medicalConditions, cancerType: v } }))} placeholder="Specify type" />
        )}
        <Input label="Other Conditions" value={form.medicalConditions.otherConditions ?? ''} onChangeText={(v) => setForm(prev => ({ ...prev, medicalConditions: { ...prev.medicalConditions, otherConditions: v } }))} placeholder="List any other conditions..." multiline />
      </View>
    );
  };

  const renderAllergies = () => {
    const allergyItems: Array<{ key: string; label: string }> = [
      { key: 'localAnesthetics', label: 'Local anesthetics (Novocaine)' },
      { key: 'penicillin', label: 'Penicillin' },
      { key: 'antibiotics', label: 'Other antibiotics' },
      { key: 'sulfa', label: 'Sulfa drugs' },
      { key: 'barbiturates', label: 'Barbiturates / Sleeping pills' },
      { key: 'sedatives', label: 'Sedatives' },
      { key: 'aspirin', label: 'Aspirin' },
      { key: 'ibuprofen', label: 'Ibuprofen (Advil/Motrin)' },
      { key: 'codeine', label: 'Codeine / Narcotics' },
      { key: 'latex', label: 'Latex' },
      { key: 'metals', label: 'Metals' },
      { key: 'acrylic', label: 'Acrylic' },
    ];

    return (
      <View>
        <Text style={styles.sectionTitle}>Drug & Material Allergies</Text>
        <Text style={styles.sectionSubtitle}>Check any substances you are allergic to.</Text>
        <View style={styles.checkboxGrid}>
          {allergyItems.map(item => (
            <CheckboxRow
              key={item.key}
              label={item.label}
              checked={!!form.allergyInfo[item.key as keyof typeof form.allergyInfo]}
              onToggle={() => toggleAllergy(item.key)}
            />
          ))}
        </View>
        <Input label="Other Allergies" value={form.allergyInfo.otherAllergies ?? ''} onChangeText={(v) => setForm(prev => ({ ...prev, allergyInfo: { ...prev.allergyInfo, otherAllergies: v } }))} placeholder="List other allergies..." multiline />
      </View>
    );
  };

  const renderMedications = () => (
    <View>
      <Text style={styles.sectionTitle}>Current Medications</Text>
      <Text style={styles.sectionSubtitle}>List all medications, supplements, and over-the-counter drugs you take.</Text>
      <Input label="Prescription Medications" value={form.medicationInfo.currentMedications} onChangeText={(v) => updateMedicationInfo('currentMedications', v)} placeholder="Lisinopril 10mg daily, Atorvastatin 20mg..." multiline numberOfLines={4} />
      <Input label="Over-the-Counter Medications" value={form.medicationInfo.overTheCounterMeds} onChangeText={(v) => updateMedicationInfo('overTheCounterMeds', v)} placeholder="Ibuprofen, Tylenol, Benadryl..." multiline numberOfLines={3} />
      <Input label="Vitamins / Supplements" value={form.medicationInfo.vitaminsOrSupplements} onChangeText={(v) => updateMedicationInfo('vitaminsOrSupplements', v)} placeholder="Vitamin D, Fish Oil, Multivitamin..." multiline numberOfLines={3} />
    </View>
  );

  const renderWomenHealthAndAdditional = () => (
    <View>
      <Text style={styles.sectionTitle}>Women's Health</Text>
      <Text style={styles.sectionSubtitle}>If applicable, please answer the following.</Text>

      <Text style={styles.fieldLabel}>ARE YOU PREGNANT?</Text>
      <View style={styles.sexRow}>
        {([true, false] as const).map(v => (
          <PrimaryButton key={String(v)} title={v ? 'Yes' : 'No'} variant={form.womenHealth.isPregnant === v ? 'primary' : 'outline'} onPress={() => updateWomenHealth('isPregnant', v)} style={styles.sexButton} />
        ))}
        <PrimaryButton title="N/A" variant={form.womenHealth.isPregnant === null ? 'secondary' : 'outline'} onPress={() => updateWomenHealth('isPregnant', null)} style={styles.sexButton} />
      </View>
      {form.womenHealth.isPregnant === true && (
        <Input label="Due Date" value={form.womenHealth.dueDate ?? ''} onChangeText={(v) => updateWomenHealth('dueDate', v)} placeholder="MM/DD/YYYY" />
      )}

      <Text style={styles.fieldLabel}>ARE YOU NURSING?</Text>
      <View style={styles.sexRow}>
        {([true, false] as const).map(v => (
          <PrimaryButton key={String(v)} title={v ? 'Yes' : 'No'} variant={form.womenHealth.isNursing === v ? 'primary' : 'outline'} onPress={() => updateWomenHealth('isNursing', v)} style={styles.sexButton} />
        ))}
        <PrimaryButton title="N/A" variant={form.womenHealth.isNursing === null ? 'secondary' : 'outline'} onPress={() => updateWomenHealth('isNursing', null)} style={styles.sexButton} />
      </View>

      <Text style={styles.fieldLabel}>TAKING BIRTH CONTROL?</Text>
      <View style={styles.sexRow}>
        {([true, false] as const).map(v => (
          <PrimaryButton key={String(v)} title={v ? 'Yes' : 'No'} variant={form.womenHealth.takesBirthControl === v ? 'primary' : 'outline'} onPress={() => updateWomenHealth('takesBirthControl', v)} style={styles.sexButton} />
        ))}
        <PrimaryButton title="N/A" variant={form.womenHealth.takesBirthControl === null ? 'secondary' : 'outline'} onPress={() => updateWomenHealth('takesBirthControl', null)} style={styles.sexButton} />
      </View>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Additional Information</Text>

      <CheckboxRow label="Have you been hospitalized in the past 5 years?" checked={form.additionalInfo.hasBeenHospitalized} onToggle={() => updateAdditionalInfo('hasBeenHospitalized', !form.additionalInfo.hasBeenHospitalized)} />
      {form.additionalInfo.hasBeenHospitalized && (
        <Input label="Reason for Hospitalization" value={form.additionalInfo.hospitalizationReason ?? ''} onChangeText={(v) => updateAdditionalInfo('hospitalizationReason', v)} placeholder="Describe reason..." />
      )}

      <CheckboxRow label="Have you had a blood transfusion?" checked={form.additionalInfo.hasBloodTransfusion} onToggle={() => updateAdditionalInfo('hasBloodTransfusion', !form.additionalInfo.hasBloodTransfusion)} />
      <CheckboxRow label="Drug or alcohol dependency?" checked={form.additionalInfo.hasDrugAlcoholDependency} onToggle={() => updateAdditionalInfo('hasDrugAlcoholDependency', !form.additionalInfo.hasDrugAlcoholDependency)} />
      <CheckboxRow label="Use recreational drugs?" checked={form.additionalInfo.useRecreationalDrugs} onToggle={() => updateAdditionalInfo('useRecreationalDrugs', !form.additionalInfo.useRecreationalDrugs)} />
      <CheckboxRow label="Special diet?" checked={form.additionalInfo.hasSpecialDiet} onToggle={() => updateAdditionalInfo('hasSpecialDiet', !form.additionalInfo.hasSpecialDiet)} />
      {form.additionalInfo.hasSpecialDiet && (
        <Input label="Diet Details" value={form.additionalInfo.dietDetails ?? ''} onChangeText={(v) => updateAdditionalInfo('dietDetails', v)} placeholder="Vegetarian, keto, etc." />
      )}

      <View style={styles.divider} />
      <Text style={styles.groupTitle}>Physician Information</Text>
      <Input label="Physician Name" value={form.additionalInfo.physicianName} onChangeText={(v) => updateAdditionalInfo('physicianName', v)} placeholder="Dr. Smith" />
      <Input label="Physician Phone" value={form.additionalInfo.physicianPhone} onChangeText={(v) => updateAdditionalInfo('physicianPhone', v)} placeholder="(415) 555-0100" keyboardType="phone-pad" />
      <Input label="Date of Last Physical" value={form.additionalInfo.dateOfLastPhysical} onChangeText={(v) => updateAdditionalInfo('dateOfLastPhysical', v)} placeholder="MM/DD/YYYY" />
    </View>
  );

  const renderReviewConsent = () => {
    const flaggedConditions = Object.entries(form.medicalConditions)
      .filter(([key, val]) => val === true && key !== 'otherConditions' && key !== 'diabetesType' && key !== 'hepatitisType' && key !== 'cancerType' && key !== 'prostheticJointType')
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()));

    const flaggedAllergies = Object.entries(form.allergyInfo)
      .filter(([key, val]) => val === true && key !== 'otherAllergies')
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()));

    return (
      <View>
        <Text style={styles.sectionTitle}>Review & Consent</Text>
        <Text style={styles.sectionSubtitle}>Please review your information and sign below.</Text>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>Patient</Text>
          <Text style={styles.reviewValue}>{form.patientInfo.firstName} {form.patientInfo.lastName}</Text>
          <Text style={styles.reviewDetail}>DOB: {form.patientInfo.dateOfBirth || 'Not provided'}</Text>
          <Text style={styles.reviewDetail}>Phone: {form.patientInfo.cellPhone || 'Not provided'}</Text>
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>Dental Visit</Text>
          <Text style={styles.reviewDetail}>Reason: {form.dentalInfo.reasonForVisit || 'Not specified'}</Text>
          <Text style={styles.reviewDetail}>Last visit: {form.dentalInfo.dateOfLastVisit || 'Not provided'}</Text>
        </View>

        {flaggedConditions.length > 0 && (
          <View style={[styles.reviewCard, styles.alertCard]}>
            <Text style={styles.reviewTitle}>Medical Conditions ({flaggedConditions.length})</Text>
            <Text style={styles.reviewDetail}>{flaggedConditions.join(', ')}</Text>
          </View>
        )}

        {flaggedAllergies.length > 0 && (
          <View style={[styles.reviewCard, styles.alertCard]}>
            <Text style={styles.reviewTitle}>Allergies ({flaggedAllergies.length})</Text>
            <Text style={styles.reviewDetail}>{flaggedAllergies.join(', ')}</Text>
          </View>
        )}

        {form.medicationInfo.currentMedications ? (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Medications</Text>
            <Text style={styles.reviewDetail}>{form.medicationInfo.currentMedications}</Text>
          </View>
        ) : null}

        <View style={styles.divider} />
        <Text style={styles.consentText}>
          I certify that I have read and understand the above. I acknowledge that my responses are accurate to the best of my knowledge and that I will inform my dental provider of any changes in my medical status. I authorize the dental team to perform necessary services including diagnostic procedures, treatment, and medications.
        </Text>

        <Input label="Patient Signature (Type Full Name) *" value={form.consent.patientSignature} onChangeText={(v) => updateConsent('patientSignature', v)} error={errors.patientSignature} placeholder="John A. Doe" />
        <Input label="Date *" value={form.consent.signatureDate} onChangeText={(v) => updateConsent('signatureDate', v)} error={errors.signatureDate} placeholder="MM/DD/YYYY" />
        <Input label="Parent/Guardian Signature (if minor)" value={form.consent.parentGuardianSignature ?? ''} onChangeText={(v) => updateConsent('parentGuardianSignature', v)} placeholder="Guardian name" />
      </View>
    );
  };

  const stepRenderers = [
    renderPatientInfo,
    renderDentalHistory,
    renderMedicalConditions,
    renderAllergies,
    renderMedications,
    renderWomenHealthAndAdditional,
    renderReviewConsent,
  ];

  if (completed) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.completionSafeArea} edges={['top', 'bottom']}>
          <View style={styles.completionContainer}>
            <View style={styles.completionProgressDone}>
              <View style={styles.completionTrack}>
                <View style={styles.completionFill} />
              </View>
              <Text style={styles.completionPercentText}>100% Complete</Text>
            </View>

            <Animated.View
              style={[
                styles.completionContent,
                {
                  opacity: completionFade,
                  transform: [{ scale: completionScale }],
                },
              ]}
            >
              <View style={styles.completionAvatarRing}>
                <Image
                  source={{ uri: AVATAR_URL }}
                  style={styles.completionAvatar}
                />
                <View style={styles.completionCheckBadge}>
                  <Check size={16} color={colors.textInverse} strokeWidth={3} />
                </View>
              </View>

              <View style={styles.completionBubble}>
                <Text style={styles.completionBubbleText}>{COMPLETION_MESSAGE}</Text>
              </View>

              <View style={styles.completionStatsRow}>
                <View style={styles.completionStat}>
                  <Sparkles size={20} color={colors.primary} />
                  <Text style={styles.completionStatValue}>7/7</Text>
                  <Text style={styles.completionStatLabel}>Steps Done</Text>
                </View>
                <View style={styles.completionStatDivider} />
                <View style={styles.completionStat}>
                  <Check size={20} color={colors.success} />
                  <Text style={styles.completionStatValue}>Verified</Text>
                  <Text style={styles.completionStatLabel}>Health History</Text>
                </View>
              </View>

              <Text style={styles.completionRedirect}>Taking you to your dashboard...</Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ProgressBar current={step} total={STEP_LABELS.length} />
        <AvatarBubble message={AVATAR_MESSAGES[step]} animKey={step} />
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {stepRenderers[step]()}
          </Animated.View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <View style={styles.buttonRow}>
            {step > 0 && (
              <PrimaryButton
                title="Back"
                variant="outline"
                onPress={handleBack}
                icon={<ArrowLeft size={16} color={colors.primary} />}
                style={styles.backButton}
              />
            )}
            {step < STEP_LABELS.length - 1 ? (
              <PrimaryButton
                title="Continue"
                onPress={handleNext}
                icon={<ArrowRight size={16} color={colors.textInverse} />}
                style={styles.nextButton}
              />
            ) : (
              <PrimaryButton
                title="Submit Health History"
                onPress={handleSubmit}
                loading={submitting}
                icon={<Check size={16} color={colors.textInverse} />}
                style={styles.nextButton}
              />
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.callout,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  groupTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  quarterInput: {
    flex: 0.35,
  },
  threeQuarterInput: {
    flex: 0.65,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sexRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sexButton: {
    flex: 1,
    minHeight: 42,
    paddingVertical: 8,
  },
  subFieldRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  subButton: {
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    minHeight: 38,
  },
  checkboxGrid: {
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xl,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backButton: {
    flex: 0.4,
  },
  nextButton: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  alertCard: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning + '40',
  },
  reviewTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  reviewValue: {
    ...typography.title3,
    color: colors.primary,
  },
  reviewDetail: {
    ...typography.callout,
    color: colors.textSecondary,
    marginTop: 2,
  },
  consentText: {
    ...typography.callout,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  completionSafeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  completionProgressDone: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
  },
  completionTrack: {
    height: 6,
    backgroundColor: colors.primaryFaded,
    borderRadius: 3,
    overflow: 'hidden',
  },
  completionFill: {
    height: 6,
    width: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  completionPercentText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  completionContent: {
    alignItems: 'center',
    gap: spacing.xxl,
  },
  completionAvatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.success,
    alignItems: 'center',
    backgroundColor: colors.primaryFaded,
    position: 'relative',
    overflow: 'hidden',
  },
  completionAvatar: {
    width: 148,
    height: 148,
    marginTop: -4,
  },
  completionCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  completionBubble: {
    backgroundColor: colors.primaryFaded,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    ...shadow.md,
  },
  completionBubbleText: {
    ...typography.body,
    color: colors.primaryDark,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  completionStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    gap: spacing.xl,
    ...shadow.sm,
  },
  completionStat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  completionStatValue: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  completionStatLabel: {
    ...typography.small,
    color: colors.textTertiary,
  },
  completionStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
  completionRedirect: {
    ...typography.callout,
    color: colors.textTertiary,
    fontStyle: 'italic' as const,
  },
});
