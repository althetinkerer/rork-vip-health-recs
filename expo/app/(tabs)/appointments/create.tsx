import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, MapPin } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import Input from '@/components/Input';
import PrimaryButton from '@/components/PrimaryButton';
import { Appointment } from '@/types';

export default function CreateAppointmentScreen() {
  const router = useRouter();
  const { addAppointment } = useData();
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'IN_PERSON' | 'VIRTUAL'>('IN_PERSON');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!provider.trim()) e.provider = 'Provider name is required';
    if (!date.trim()) e.date = 'Date is required (YYYY-MM-DD)';
    if (!time.trim()) e.time = 'Time is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      title: title.trim(),
      providerName: provider.trim(),
      specialty: specialty.trim() || 'General',
      date: date.trim(),
      time: time.trim(),
      type,
      status: 'UPCOMING',
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    addAppointment(newApt);
    Alert.alert('Success', 'Appointment created successfully', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>Appointment Type</Text>
      <View style={styles.typeRow}>
        <Pressable
          style={[styles.typeOption, type === 'IN_PERSON' && styles.typeSelected]}
          onPress={() => setType('IN_PERSON')}
        >
          <MapPin size={20} color={type === 'IN_PERSON' ? colors.primary : colors.textTertiary} />
          <Text style={[styles.typeText, type === 'IN_PERSON' && styles.typeTextSelected]}>In-Person</Text>
        </Pressable>
        <Pressable
          style={[styles.typeOption, type === 'VIRTUAL' && styles.typeSelected]}
          onPress={() => setType('VIRTUAL')}
        >
          <Video size={20} color={type === 'VIRTUAL' ? colors.primary : colors.textTertiary} />
          <Text style={[styles.typeText, type === 'VIRTUAL' && styles.typeTextSelected]}>Virtual</Text>
        </Pressable>
      </View>

      <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Annual Check-up" error={errors.title} />
      <Input label="Provider Name" value={provider} onChangeText={setProvider} placeholder="e.g. Dr. Smith" error={errors.provider} />
      <Input label="Specialty" value={specialty} onChangeText={setSpecialty} placeholder="e.g. Cardiology" />
      <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" error={errors.date} />
      <Input label="Time" value={time} onChangeText={setTime} placeholder="e.g. 10:00 AM" error={errors.time} />
      {type === 'IN_PERSON' && (
        <Input label="Location" value={location} onChangeText={setLocation} placeholder="Address" />
      )}
      <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any special instructions..." multiline numberOfLines={3} />

      <PrimaryButton title="Create Appointment" onPress={handleCreate} style={styles.submitBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaded,
  },
  typeText: {
    ...typography.headline,
    color: colors.textTertiary,
  },
  typeTextSelected: {
    color: colors.primary,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});
