import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Pressable
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowRight, ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { ADAHealthHistory } from '@/types';
import { useData } from '@/context/DataContext';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import CheckboxRow from '@/components/CheckboxRow';

const AVATAR_IMAGE = require('../assets/images/hygienist_guide.png');

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function createEmptyForm(): Omit<ADAHealthHistory, 'id' | 'completedAt'> {
  // ... same as before ...
  return {
    patientInfo: { lastName: '', firstName: '', middleInitial: '', dateOfBirth: '', sex: '', homeAddress: '', city: '', state: '', zip: '', homePhone: '', cellPhone: '', email: '', occupation: '', socialSecurityNumber: '', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '' },
    dentalInfo: { reasonForVisit: '', previousDentist: '', dateOfLastVisit: '', dateOfLastXrays: '', hasJawPain: false, hasClickingJaw: false, hasSoreJawMuscles: false, hasDifficultyOpening: false, clenchesTeeth: false, grindsTeeth: false, hasBitingHabit: false, hasOrthodonticTreatment: false, hasPeriodontitis: false, hasBleedingGums: false, hasSensitiveTeeth: false, hasBadBreath: false, hasSoresOrGrowths: false, usesTobacco: false, tobaccoType: '', satisfiedWithSmile: true, additionalDentalConcerns: '' },
    medicalConditions: { heartDisease: false, heartAttack: false, heartMurmur: false, rheumaticFever: false, highBloodPressure: false, lowBloodPressure: false, mitralValveProlapse: false, chestPain: false, angina: false, stroke: false, pacemaker: false, artificialHeart: false, anemia: false, bleedingDisorder: false, hemophilia: false, leukemia: false, diabetes: false, diabetesType: '', thyroidDisease: false, hepatitis: false, hepatitisType: '', liverDisease: false, jaundice: false, hivPositive: false, aids: false, arthritis: false, rheumatism: false, cortisoneTherapy: false, asthma: false, hayfever: false, sinusProblems: false, allergies: false, tuberculosis: false, emphysema: false, respiratoryProblems: false, epilepsy: false, seizures: false, fainting: false, nervousness: false, psychiatricTreatment: false, kidneyDisease: false, ulcers: false, stomachProblems: false, cancer: false, cancerType: '', radiationTherapy: false, chemotherapy: false, prostheticJoint: false, prostheticJointType: '', glaucoma: false, contactLenses: false, skinRash: false, otherConditions: '' },
    allergyInfo: { localAnesthetics: false, penicillin: false, antibiotics: false, sulfa: false, barbiturates: false, sedatives: false, aspirin: false, ibuprofen: false, codeine: false, latex: false, metals: false, acrylic: false, otherAllergies: '' },
    medicationInfo: { currentMedications: '', overTheCounterMeds: '', vitaminsOrSupplements: '' },
    womenHealth: { isPregnant: null, isNursing: null, takesBirthControl: null, dueDate: '' },
    additionalInfo: { hasBeenHospitalized: false, hospitalizationReason: '', hasBloodTransfusion: false, hasDrugAlcoholDependency: false, useRecreationalDrugs: false, hasSpecialDiet: false, dietDetails: '', physicianName: '', physicianPhone: '', dateOfLastPhysical: '' },
    consent: { patientSignature: '', signatureDate: '', parentGuardianSignature: '' },
  };
}

export default function OnboardingScreen() {
  const { completeOnboarding } = useData();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(createEmptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // --- Handlers ---
  const updatePatientInfo = (k: string, v: string) => { setForm(p => ({ ...p, patientInfo: { ...p.patientInfo, [k]: v } })); setErrors(e => ({...e, [k]: ''})); };
  const updateDentalInfo = (k: string, v: any) => setForm(p => ({ ...p, dentalInfo: { ...p.dentalInfo, [k]: v } }));
  const toggleMedCondition = (k: string) => setForm(p => ({ ...p, medicalConditions: { ...p.medicalConditions, [k]: !p.medicalConditions[k as keyof typeof p.medicalConditions] } }));
  const toggleAllergy = (k: string) => setForm(p => ({ ...p, allergyInfo: { ...p.allergyInfo, [k]: !p.allergyInfo[k as keyof typeof p.allergyInfo] } }));
  const updateMedicationInfo = (k: string, v: string) => setForm(p => ({ ...p, medicationInfo: { ...p.medicationInfo, [k]: v } }));
  const updateWomenHealth = (k: string, v: any) => setForm(p => ({ ...p, womenHealth: { ...p.womenHealth, [k]: v } }));
  const updateAdditionalInfo = (k: string, v: any) => setForm(p => ({ ...p, additionalInfo: { ...p.additionalInfo, [k]: v } }));
  const updateConsent = (k: string, v: string) => { setForm(p => ({ ...p, consent: { ...p.consent, [k]: v } })); setErrors(e => ({...e, [k]: ''})); };

  // --- Steps Definition ---
  const stepsData = [
    {
      id: 'name', title: 'Personal Info', subtitle: 'What is your legal name?',
      validate: () => {
        let e: Record<string, string> = {};
        if (!form.patientInfo.firstName) e.firstName = 'Required';
        if (!form.patientInfo.lastName) e.lastName = 'Required';
        setErrors(e); return Object.keys(e).length === 0;
      },
      render: () => (
        <View style={styles.cardContent}>
          <Input label="First Name *" value={form.patientInfo.firstName} onChangeText={(v) => updatePatientInfo('firstName', v)} error={errors.firstName} />
          <Input label="Last Name *" value={form.patientInfo.lastName} onChangeText={(v) => updatePatientInfo('lastName', v)} error={errors.lastName} />
          <Input label="M.I." value={form.patientInfo.middleInitial} onChangeText={(v) => updatePatientInfo('middleInitial', v)} maxLength={1} />
        </View>
      )
    },
    {
      id: 'demographics', title: 'Demographics', subtitle: 'Tell us a bit about yourself',
      validate: () => {
        let e: Record<string, string> = {};
        if (!form.patientInfo.dateOfBirth) e.dateOfBirth = 'Required';
        setErrors(e); return Object.keys(e).length === 0;
      },
      render: () => (
        <View style={styles.cardContent}>
          <Input label="Date of Birth *" value={form.patientInfo.dateOfBirth} onChangeText={(v) => updatePatientInfo('dateOfBirth', v)} error={errors.dateOfBirth} placeholder="MM/DD/YYYY" />
          <Text style={styles.fieldLabel}>SEX</Text>
          <View style={styles.sexRow}>
            {['Male', 'Female', 'Other'].map(s => (
              <PrimaryButton key={s} title={s} variant={form.patientInfo.sex === s ? 'primary' : 'outline'} onPress={() => updatePatientInfo('sex', s)} style={styles.sexButton} />
            ))}
          </View>
        </View>
      )
    },
    {
      id: 'contact', title: 'Contact Details', subtitle: 'How can we reach you?',
      validate: () => {
        let e: Record<string, string> = {};
        if (!form.patientInfo.cellPhone) e.cellPhone = 'Required';
        setErrors(e); return Object.keys(e).length === 0;
      },
      render: () => (
        <View style={styles.cardContent}>
          <Input label="Cell Phone *" value={form.patientInfo.cellPhone} onChangeText={(v) => updatePatientInfo('cellPhone', v)} error={errors.cellPhone} keyboardType="phone-pad" />
          <Input label="Home Phone" value={form.patientInfo.homePhone} onChangeText={(v) => updatePatientInfo('homePhone', v)} keyboardType="phone-pad" />
          <Input label="Email" value={form.patientInfo.email} onChangeText={(v) => updatePatientInfo('email', v)} keyboardType="email-address" autoCapitalize="none" />
        </View>
      )
    },
    {
      id: 'address', title: 'Address & Occupation', subtitle: 'Where are you living?',
      validate: () => true,
      render: () => (
        <View style={styles.cardContent}>
          <Input label="Home Address" value={form.patientInfo.homeAddress} onChangeText={(v) => updatePatientInfo('homeAddress', v)} />
          <View style={styles.row}>
            <Input label="City" value={form.patientInfo.city} onChangeText={(v) => updatePatientInfo('city', v)} containerStyle={styles.halfInput} />
            <Input label="State" value={form.patientInfo.state} onChangeText={(v) => updatePatientInfo('state', v)} containerStyle={styles.quarterInput} />
            <Input label="Zip" value={form.patientInfo.zip} onChangeText={(v) => updatePatientInfo('zip', v)} containerStyle={styles.quarterInput} keyboardType="numeric" />
          </View>
          <Input label="Occupation" value={form.patientInfo.occupation} onChangeText={(v) => updatePatientInfo('occupation', v)} />
        </View>
      )
    },
    {
      id: 'emergency', title: 'Emergency Contact', subtitle: 'Who should we contact in an emergency?',
      validate: () => {
        let e: Record<string, string> = {};
        if (!form.patientInfo.emergencyContactName) e.emergencyContactName = 'Required';
        if (!form.patientInfo.emergencyContactPhone) e.emergencyContactPhone = 'Required';
        setErrors(e); return Object.keys(e).length === 0;
      },
      render: () => (
        <View style={styles.cardContent}>
          <Input label="Contact Name *" value={form.patientInfo.emergencyContactName} onChangeText={(v) => updatePatientInfo('emergencyContactName', v)} error={errors.emergencyContactName} />
          <Input label="Phone *" value={form.patientInfo.emergencyContactPhone} onChangeText={(v) => updatePatientInfo('emergencyContactPhone', v)} error={errors.emergencyContactPhone} keyboardType="phone-pad" />
          <Input label="Relationship" value={form.patientInfo.emergencyContactRelation} onChangeText={(v) => updatePatientInfo('emergencyContactRelation', v)} />
        </View>
      )
    },
    {
      id: 'dental_visit', title: 'Dental Visit', subtitle: 'Why are you visiting VIP Health today?',
      validate: () => true,
      render: () => (
        <View style={styles.cardContent}>
          <Input label="Reason for Today's Visit" value={form.dentalInfo.reasonForVisit} onChangeText={(v) => updateDentalInfo('reasonForVisit', v)} multiline />
          <Input label="Previous Dentist" value={form.dentalInfo.previousDentist} onChangeText={(v) => updateDentalInfo('previousDentist', v)} />
          <View style={styles.row}>
            <Input label="Date of Last Visit" value={form.dentalInfo.dateOfLastVisit} onChangeText={(v) => updateDentalInfo('dateOfLastVisit', v)} containerStyle={styles.halfInput} placeholder="MM/DD/YYYY" />
            <Input label="Last X-Rays" value={form.dentalInfo.dateOfLastXrays} onChangeText={(v) => updateDentalInfo('dateOfLastXrays', v)} containerStyle={styles.halfInput} placeholder="MM/DD/YYYY" />
          </View>
        </View>
      )
    },
    {
      id: 'dental_conditions', title: 'Dental Conditions', subtitle: 'Do you currently have any of the following?',
      validate: () => true,
      render: () => (
        <View style={styles.cardContent}>
          <CheckboxRow label="Jaw pain or soreness" checked={form.dentalInfo.hasJawPain} onToggle={() => updateDentalInfo('hasJawPain', !form.dentalInfo.hasJawPain)} />
          <CheckboxRow label="Clicking/popping jaw" checked={form.dentalInfo.hasClickingJaw} onToggle={() => updateDentalInfo('hasClickingJaw', !form.dentalInfo.hasClickingJaw)} />
          <CheckboxRow label="Sore jaw muscles" checked={form.dentalInfo.hasSoreJawMuscles} onToggle={() => updateDentalInfo('hasSoreJawMuscles', !form.dentalInfo.hasSoreJawMuscles)} />
          <CheckboxRow label="Difficulty opening mouth" checked={form.dentalInfo.hasDifficultyOpening} onToggle={() => updateDentalInfo('hasDifficultyOpening', !form.dentalInfo.hasDifficultyOpening)} />
          <CheckboxRow label="Periodontal (gum) disease" checked={form.dentalInfo.hasPeriodontitis} onToggle={() => updateDentalInfo('hasPeriodontitis', !form.dentalInfo.hasPeriodontitis)} />
          <CheckboxRow label="Bleeding gums" checked={form.dentalInfo.hasBleedingGums} onToggle={() => updateDentalInfo('hasBleedingGums', !form.dentalInfo.hasBleedingGums)} />
          <CheckboxRow label="Sensitive teeth" checked={form.dentalInfo.hasSensitiveTeeth} onToggle={() => updateDentalInfo('hasSensitiveTeeth', !form.dentalInfo.hasSensitiveTeeth)} />
        </View>
      )
    },
    {
      id: 'dental_habits', title: 'Habits & Additional Dental', subtitle: 'Please check any that apply to you.',
      validate: () => true,
      render: () => (
        <View style={styles.cardContent}>
          <CheckboxRow label="Clench teeth" checked={form.dentalInfo.clenchesTeeth} onToggle={() => updateDentalInfo('clenchesTeeth', !form.dentalInfo.clenchesTeeth)} />
          <CheckboxRow label="Grind teeth" checked={form.dentalInfo.grindsTeeth} onToggle={() => updateDentalInfo('grindsTeeth', !form.dentalInfo.grindsTeeth)} />
          <CheckboxRow label="Use tobacco products" checked={form.dentalInfo.usesTobacco} onToggle={() => updateDentalInfo('usesTobacco', !form.dentalInfo.usesTobacco)} />
          {form.dentalInfo.usesTobacco && (
            <Input label="Tobacco Type" value={form.dentalInfo.tobaccoType ?? ''} onChangeText={(v) => updateDentalInfo('tobaccoType', v)} />
          )}
          <CheckboxRow label="Satisfied with your smile" checked={form.dentalInfo.satisfiedWithSmile} onToggle={() => updateDentalInfo('satisfiedWithSmile', !form.dentalInfo.satisfiedWithSmile)} />
          <Input label="Additional Dental Concerns" value={form.dentalInfo.additionalDentalConcerns ?? ''} onChangeText={(v) => updateDentalInfo('additionalDentalConcerns', v)} multiline />
        </View>
      )
    },
    {
      id: 'med_cardio', title: 'Cardio & Blood History', subtitle: 'Check any conditions that apply.',
      validate: () => true,
      render: () => (
        <View style={styles.cardContent}>
          <CheckboxRow label="Heart disease" checked={form.medicalConditions.heartDisease} onToggle={() => toggleMedCondition('heartDisease')} />
          <CheckboxRow label="High blood pressure" checked={form.medicalConditions.highBloodPressure} onToggle={() => toggleMedCondition('highBloodPressure')} />
          <CheckboxRow label="Chest pain / Angina" checked={form.medicalConditions.chestPain} onToggle={() => toggleMedCondition('chestPain')} />
          <CheckboxRow label="Pacemaker" checked={form.medicalConditions.pacemaker} onToggle={() => toggleMedCondition('pacemaker')} />
          <CheckboxRow label="Bleeding disorder" checked={form.medicalConditions.bleedingDisorder} onToggle={() => toggleMedCondition('bleedingDisorder')} />
          <CheckboxRow label="Anemia" checked={form.medicalConditions.anemia} onToggle={() => toggleMedCondition('anemia')} />
        </View>
      )
    },
    {
      id: 'med_endocrine', title: 'Endocrine, Liver, Immune', subtitle: 'Check any conditions that apply.',
      validate: () => true,
      render: () => (
        <View style={styles.cardContent}>
          <CheckboxRow label="Diabetes" checked={form.medicalConditions.diabetes} onToggle={() => toggleMedCondition('diabetes')} />
          {form.medicalConditions.diabetes && (
            <View style={styles.sexRow}>
              {['Type 1', 'Type 2'].map(t => (
                <PrimaryButton key={t} title={t} variant={form.medicalConditions.diabetesType === t ? 'primary' : 'outline'} onPress={() => setForm(p => ({...p, medicalConditions: {...p.medicalConditions, diabetesType: t as any}}))} style={styles.sexButton} />
              ))}
            </View>
          )}
          <CheckboxRow label="Thyroid disease" checked={form.medicalConditions.thyroidDisease} onToggle={() => toggleMedCondition('thyroidDisease')} />
          <CheckboxRow label="Hepatitis" checked={form.medicalConditions.hepatitis} onToggle={() => toggleMedCondition('hepatitis')} />
          <CheckboxRow label="HIV/AIDS" checked={form.medicalConditions.hivPositive || form.medicalConditions.aids} onToggle={() => { toggleMedCondition('hivPositive'); toggleMedCondition('aids'); }} />
        </View>
      )
    },
    {
      id: 'allergies', title: 'Allergies', subtitle: 'Are you allergic to any of these?',
      validate: () => true,
      render: () => (
        <View style={styles.cardContent}>
          <CheckboxRow label="Local anesthetics (Novocaine)" checked={form.allergyInfo.localAnesthetics} onToggle={() => toggleAllergy('localAnesthetics')} />
          <CheckboxRow label="Penicillin" checked={form.allergyInfo.penicillin} onToggle={() => toggleAllergy('penicillin')} />
          <CheckboxRow label="Aspirin" checked={form.allergyInfo.aspirin} onToggle={() => toggleAllergy('aspirin')} />
          <CheckboxRow label="Latex" checked={form.allergyInfo.latex} onToggle={() => toggleAllergy('latex')} />
          <Input label="Other Allergies" value={form.allergyInfo.otherAllergies ?? ''} onChangeText={(v) => setForm(p => ({...p, allergyInfo: {...p.allergyInfo, otherAllergies: v}}))} multiline />
        </View>
      )
    },
    {
      id: 'medications', title: 'Medications', subtitle: 'What are you currently taking?',
      validate: () => true,
      render: () => (
        <View style={styles.cardContent}>
          <Input label="Prescription Medications" value={form.medicationInfo.currentMedications} onChangeText={(v) => updateMedicationInfo('currentMedications', v)} multiline numberOfLines={3} />
          <Input label="Over-the-Counter Medications" value={form.medicationInfo.overTheCounterMeds} onChangeText={(v) => updateMedicationInfo('overTheCounterMeds', v)} multiline numberOfLines={2} />
          <Input label="Vitamins / Supplements" value={form.medicationInfo.vitaminsOrSupplements} onChangeText={(v) => updateMedicationInfo('vitaminsOrSupplements', v)} multiline numberOfLines={2} />
        </View>
      )
    },
    {
      id: 'womens_health', title: 'Women\'s Health', subtitle: 'If applicable, please answer.',
      validate: () => true,
      render: () => (
        <View style={styles.cardContent}>
          <Text style={styles.fieldLabel}>ARE YOU PREGNANT?</Text>
          <View style={styles.sexRow}>
            {[true, false].map(v => (
              <PrimaryButton key={String(v)} title={v ? 'Yes' : 'No'} variant={form.womenHealth.isPregnant === v ? 'primary' : 'outline'} onPress={() => updateWomenHealth('isPregnant', v)} style={styles.sexButton} />
            ))}
            <PrimaryButton title="N/A" variant={form.womenHealth.isPregnant === null ? 'secondary' : 'outline'} onPress={() => updateWomenHealth('isPregnant', null)} style={styles.sexButton} />
          </View>
          {form.womenHealth.isPregnant === true && (
            <Input label="Due Date" value={form.womenHealth.dueDate ?? ''} onChangeText={(v) => updateWomenHealth('dueDate', v)} placeholder="MM/DD/YYYY" />
          )}
          <Text style={styles.fieldLabel}>ARE YOU NURSING?</Text>
          <View style={styles.sexRow}>
            {[true, false].map(v => (
              <PrimaryButton key={String(v)} title={v ? 'Yes' : 'No'} variant={form.womenHealth.isNursing === v ? 'primary' : 'outline'} onPress={() => updateWomenHealth('isNursing', v)} style={styles.sexButton} />
            ))}
            <PrimaryButton title="N/A" variant={form.womenHealth.isNursing === null ? 'secondary' : 'outline'} onPress={() => updateWomenHealth('isNursing', null)} style={styles.sexButton} />
          </View>
        </View>
      )
    },
    {
      id: 'consent', title: 'Review & Consent', subtitle: 'Just sign here to finish!',
      validate: () => {
        let e: Record<string, string> = {};
        if (!form.consent.patientSignature) e.patientSignature = 'Required';
        if (!form.consent.signatureDate) e.signatureDate = 'Required';
        setErrors(e); return Object.keys(e).length === 0;
      },
      render: () => (
        <View style={styles.cardContent}>
          <Text style={styles.consentText}>I certify that I have read and understand the above. I acknowledge my responses are accurate...</Text>
          <Input label="Patient Signature *" value={form.consent.patientSignature} onChangeText={(v) => updateConsent('patientSignature', v)} error={errors.patientSignature} />
          <Input label="Date *" value={form.consent.signatureDate} onChangeText={(v) => updateConsent('signatureDate', v)} error={errors.signatureDate} placeholder="MM/DD/YYYY" />
        </View>
      )
    }
  ];

  const currentStep = stepsData[step];

  const animateTransition = (next: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 20, duration: 0, useNativeDriver: true })
    ]).start(() => {
      setStep(next);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true })
      ]).start();
    });
  };

  const handleNext = () => {
    if (!currentStep.validate()) return;
    if (step < stepsData.length - 1) {
      animateTransition(step + 1);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    if (step > 0) animateTransition(step - 1);
  };

  const submitForm = async () => {
    setSubmitting(true);
    try {
      const history: ADAHealthHistory = {
        id: `hh-${Date.now()}`,
        completedAt: new Date().toISOString(),
        ...form,
      };
      setCompleted(true);
      setTimeout(async () => {
        await completeOnboarding(history);
      }, 2000);
    } catch (e) {
      Alert.alert('Error', 'Failed to submit health history. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface}}>
          <View style={styles.completionBubble}>
            <Text style={styles.completionBubbleText}>You're all set! Welcome to VIP Health Recs.</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Calculate Progress
  const progressPercent = Math.max(5, Math.round(((step) / stepsData.length) * 100));

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Top Image Area */}
      <View style={styles.topImageContainer}>
        <Image source={AVATAR_IMAGE} style={styles.topImage} contentFit="cover" contentPosition="top center" />
        <View style={styles.imageGradient} />
      </View>

      <KeyboardAvoidingView style={styles.bottomCardContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
           <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
           </View>
           <Text style={styles.progressText}>{progressPercent}% Complete</Text>
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>
            
            {currentStep.render()}
          </Animated.View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {step > 0 && (
            <PrimaryButton title="Back" variant="outline" onPress={handleBack} icon={<ArrowLeft size={16} color={colors.primary} />} style={styles.backButton} />
          )}
          <PrimaryButton 
             title={step === stepsData.length - 1 ? "Submit" : "Continue"} 
             onPress={handleNext} 
             loading={submitting} 
             icon={step === stepsData.length - 1 ? <Check size={16} color={colors.textInverse}/> : <ArrowRight size={16} color={colors.textInverse} />} 
             style={styles.nextButton} 
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topImageContainer: {
    height: SCREEN_HEIGHT * 0.45,
    width: '100%',
    backgroundColor: '#f4f4f5',
    position: 'absolute',
    top: 0,
  },
  topImage: { flex: 1, width: '100%', height: '100%' },
  imageGradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.03)'
  },
  bottomCardContainer: {
    flex: 1,
    marginTop: SCREEN_HEIGHT * 0.35, // Overlap the image smoothly
    backgroundColor: colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    ...shadow.lg,
    overflow: 'hidden'
  },
  progressContainer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.primaryFaded,
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  progressText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: spacing.xs
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl
  },
  stepTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    ...typography.callout,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  cardContent: {
    paddingBottom: spacing.md,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  halfInput: { flex: 1 },
  quarterInput: { flex: 0.35 },
  fieldLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  sexRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  sexButton: { flex: 1, minHeight: 42, paddingVertical: 8 },
  consentText: { ...typography.callout, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.xl, backgroundColor: colors.surfaceSecondary, padding: spacing.lg, borderRadius: borderRadius.md },
  footer: {
    flexDirection: 'row',
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
    gap: spacing.md
  },
  backButton: { flex: 0.35 },
  nextButton: { flex: 1 },
  completionBubble: { backgroundColor: colors.primaryFaded, padding: 32, borderRadius: 24 },
  completionBubbleText: { ...typography.title3, color: colors.primaryDark, textAlign: 'center' }
});
