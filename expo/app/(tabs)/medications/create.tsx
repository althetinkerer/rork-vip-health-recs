import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/constants/theme';
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Input label="Medication Name" value={name} onChangeText={setName} placeholder="e.g. Lisinopril" error={errors.name} />
      <Input label="Dosage" value={dosage} onChangeText={setDosage} placeholder="e.g. 10mg" error={errors.dosage} />
      <Input label="Frequency" value={frequency} onChangeText={setFrequency} placeholder="e.g. Once daily" error={errors.frequency} />
      <Input label="Prescribed By" value={prescribedBy} onChangeText={setPrescribedBy} placeholder="e.g. Dr. Smith" error={errors.prescribedBy} />
      <Input label="Start Date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" error={errors.startDate} />
      <Input label="Total Pills (optional)" value={totalPills} onChangeText={setTotalPills} placeholder="e.g. 90" keyboardType="numeric" />
      <Input label="Instructions (optional)" value={instructions} onChangeText={setInstructions} placeholder="Special instructions..." multiline numberOfLines={3} />
      <PrimaryButton title="Add Medication" onPress={handleCreate} style={styles.submitBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 40 },
  submitBtn: { marginTop: spacing.md },
});
