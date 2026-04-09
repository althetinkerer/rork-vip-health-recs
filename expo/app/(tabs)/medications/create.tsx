import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Sparkles, Camera } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import { Medication } from '@/types';

export default function CreateMedicationScreen() {
  const router = useRouter();
  const { addMedication } = useData();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [totalPills, setTotalPills] = useState('');
  const [instructions, setInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isScanning, setIsScanning] = useState(false);

  const handleScanBottle = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need camera access to scan your medicine bottle.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsScanning(true);
        // Simulate AI analysis delay
        setTimeout(() => {
          setIsScanning(false);
          // Auto-populate the mock simulation payload
          setName('Amoxicillin');
          setDosage('500mg');
          setFrequency('Every 8 hours');
          setPrescribedBy('Dr. Robert Martinez');
          setStartDate(new Date().toISOString().split('T')[0]);
          setTotalPills('30');
          setInstructions('Take until finished for dental infection');
          
          Alert.alert('Scan Complete', 'AI has mapped the prescription. Please verify the fields below.');
        }, 2500);
      }
    } catch (e) {
      console.error('Scan Error', e);
      Alert.alert('Error', 'There was an issue processing the image.');
      setIsScanning(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Medication name is required';
    if (!dosage.trim()) e.dosage = 'Dosage is required';
    if (!frequency.trim()) e.frequency = 'Frequency is required';
    if (!prescribedBy.trim()) e.prescribedBy = 'Provider name is required';
    if (!startDate.trim()) e.startDate = 'Start date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const pills = parseInt(totalPills, 10);
    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      prescribedBy: prescribedBy.trim(),
      startDate: startDate.trim(),
      pillsRemaining: isNaN(pills) ? undefined : pills,
      totalPills: isNaN(pills) ? undefined : pills,
      instructions: instructions.trim() || undefined,
      isActive: true,
    };
    addMedication(newMed);
    Alert.alert('Success', 'Medication added successfully', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* AI Scanner Button */}
        <Pressable style={styles.scanBtn} onPress={handleScanBottle}>
          <View style={styles.scanIconWrap}>
            <Sparkles size={20} color={colors.surface} />
          </View>
          <View style={styles.scanTextWrap}>
            <Text style={styles.scanTitle}>Scan Medicine Bottle</Text>
            <Text style={styles.scanDesc}>Use AI to automatically fill out fields</Text>
          </View>
          <Camera size={20} color={colors.textTertiary} />
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR ADD MANUALLY</Text>
          <View style={styles.dividerLine} />
        </View>

        <Input label="Medication Name" value={name} onChangeText={setName} placeholder="e.g. Lisinopril" error={errors.name} />
        <Input label="Dosage" value={dosage} onChangeText={setDosage} placeholder="e.g. 10mg" error={errors.dosage} />
        <Input label="Frequency" value={frequency} onChangeText={setFrequency} placeholder="e.g. Once daily" error={errors.frequency} />
        <Input label="Prescribed By" value={prescribedBy} onChangeText={setPrescribedBy} placeholder="e.g. Dr. Smith" error={errors.prescribedBy} />
        <Input label="Start Date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" error={errors.startDate} />
        <Input label="Total Pills (optional)" value={totalPills} onChangeText={setTotalPills} placeholder="e.g. 90" keyboardType="numeric" />
        <Input label="Instructions (optional)" value={instructions} onChangeText={setInstructions} placeholder="Special instructions..." multiline numberOfLines={3} />
        <PrimaryButton title="Add Medication" onPress={handleCreate} style={styles.submitBtn} />
      </ScrollView>

      {/* AI Processing Overlay */}
      {isScanning && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={'#8B5CF6'} />
            <Text style={styles.overlayTitle}>Analyzing Label...</Text>
            <Text style={styles.overlayDesc}>Extracting active ingredients and dosage via AI.</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 40 },
  scanBtn: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    ...shadow.sm,
  },
  scanIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  scanTextWrap: {
    flex: 1,
  },
  scanTitle: {
    ...typography.headline,
    color: '#8B5CF6',
  },
  scanDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textTertiary,
    paddingHorizontal: spacing.md,
    letterSpacing: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayCard: {
    backgroundColor: colors.surface,
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    width: '80%',
    ...shadow.lg,
  },
  overlayTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  overlayDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  submitBtn: { marginTop: spacing.md },
});
