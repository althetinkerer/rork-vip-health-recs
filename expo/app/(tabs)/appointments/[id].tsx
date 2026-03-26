import React from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Video, User, FileText } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/StatusBadge';
import PrimaryButton from '@/components/PrimaryButton';
import Card from '@/components/Card';

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { appointments, updateAppointment } = useData();
  const appointment = appointments.find(a => a.id === id);

  if (!appointment) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Appointment not found</Text>
      </View>
    );
  }

  const handleCancel = () => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => {
          updateAppointment({ id: appointment.id, updates: { status: 'CANCELLED' } });
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={[styles.typeIcon, { backgroundColor: appointment.type === 'VIRTUAL' ? colors.primaryFaded : colors.successLight }]}>
            {appointment.type === 'VIRTUAL' ? (
              <Video size={22} color={colors.primary} />
            ) : (
              <MapPin size={22} color={colors.success} />
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{appointment.title}</Text>
            <StatusBadge status={appointment.status} />
          </View>
        </View>
      </Card>

      <Card style={styles.detailCard}>
        <DetailRow icon={<User size={18} color={colors.primary} />} label="Provider" value={appointment.providerName} />
        <DetailRow icon={<FileText size={18} color={colors.primary} />} label="Specialty" value={appointment.specialty} />
        <DetailRow icon={<Calendar size={18} color={colors.primary} />} label="Date" value={appointment.date} />
        <DetailRow icon={<Clock size={18} color={colors.primary} />} label="Time" value={appointment.time} />
        {appointment.location && (
          <DetailRow icon={<MapPin size={18} color={colors.primary} />} label="Location" value={appointment.location} />
        )}
        <DetailRow
          icon={<Video size={18} color={colors.primary} />}
          label="Type"
          value={appointment.type === 'VIRTUAL' ? 'Virtual (Telehealth)' : 'In-Person'}
        />
      </Card>

      {appointment.notes && (
        <Card style={styles.notesCard}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>{appointment.notes}</Text>
        </Card>
      )}

      {appointment.status === 'UPCOMING' && (
        <View style={styles.actions}>
          <PrimaryButton title="Cancel Appointment" onPress={handleCancel} variant="danger" />
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
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    ...typography.body,
    color: colors.textSecondary,
  },
  headerCard: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  typeIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  detailCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: 2,
  },
  notesCard: {
    marginBottom: spacing.lg,
  },
  notesLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  notesText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  actions: {
    marginTop: spacing.sm,
  },
});
