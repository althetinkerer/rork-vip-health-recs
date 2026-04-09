import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Database } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';

export default function UploadSourceScreen() {
  const router = useRouter();

  return (
    <View style={s.screen}>
      <Text style={s.instruction}>How would you like to import your records?</Text>
      
      <Pressable style={s.card} onPress={() => router.push('/upload/scan')}>
        <View style={[s.iconBox, { backgroundColor: colors.primaryFaded }]}>
          <Camera size={28} color={colors.primary} />
        </View>
        <View style={s.cardContent}>
          <Text style={s.cardTitle}>Upload Physical or Digital Records</Text>
          <Text style={s.cardDesc}>Upload files like PDFs, clinical DICOM X-Rays, or use your camera to scan standard paper.</Text>
        </View>
      </Pressable>

      <Pressable style={[s.card, s.cardDisabled]} onPress={() => {}}>
        <View style={[s.iconBox, { backgroundColor: colors.borderLight }]}>
          <Database size={28} color={colors.textTertiary} />
        </View>
        <View style={s.cardContent}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Text style={[s.cardTitle, { color: colors.textTertiary }]}>Connect Dental EMR</Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>Coming Soon</Text>
            </View>
          </View>
          <Text style={s.cardDesc}>Direct API synchronization hookup with compatible Epic, Dentrix, or Eaglesoft databases.</Text>
        </View>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  instruction: {
    ...typography.headline,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.sm,
  },
  cardDisabled: {
    opacity: 0.7,
    backgroundColor: '#F9FAFB', // slightly off white
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
  }
});
