import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import {
  AlertCircle,
  Phone,
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  Video,
  MapPin,
  ChevronLeft,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import PrimaryButton from '@/components/PrimaryButton';
import { Appointment } from '@/types';

// ─── Constants ──────────────────────────────────────────────────────────────

const EMERGENCY_PHONE = '1-800-VIP-DENT';

const APPOINTMENT_TYPES = [
  { id: 'cleaning', label: 'Routine Cleaning', emoji: '🦷' },
  { id: 'checkup', label: 'Check-up & Exam', emoji: '🔍' },
  { id: 'xray', label: 'X-Rays', emoji: '📷' },
  { id: 'filling', label: 'Filling / Cavity', emoji: '🩹' },
  { id: 'whitening', label: 'Whitening', emoji: '✨' },
  { id: 'crown', label: 'Crown / Bridge', emoji: '👑' },
  { id: 'extraction', label: 'Tooth Extraction', emoji: '⚕️' },
  { id: 'orthodontics', label: 'Orthodontics', emoji: '😁' },
  { id: 'other', label: 'Other / General', emoji: '📋' },
];

const PAIN_LEVELS = [
  { id: '1', label: 'Mild', color: '#22C55E' },
  { id: '2', label: 'Moderate', color: '#F59E0B' },
  { id: '3', label: 'Severe', color: '#EF4444' },
];

const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

// Simulated nearby dental offices (would come from a Places API in production)
const NEARBY_DENTISTS = [
  { id: 'n1', name: 'Dr. Michael Torres', specialty: 'General Dentistry', address: '1200 California St', distance: '0.3 mi', rating: 4.9, accepting: true },
  { id: 'n2', name: 'Dr. Lisa Park', specialty: 'Periodontics', address: '2100 Webster St', distance: '0.7 mi', rating: 4.8, accepting: true },
  { id: 'n3', name: 'Dr. James Liu', specialty: 'Oral Surgery', address: '780 Mission St', distance: '1.1 mi', rating: 4.7, accepting: true },
  { id: 'n4', name: 'Sunset Dental Group', specialty: 'General Dentistry', address: '3420 Judah St', distance: '1.6 mi', rating: 4.6, accepting: false },
  { id: 'n5', name: 'Dr. Amanda Reyes', specialty: 'Orthodontics', address: '655 Castro St', distance: '2.0 mi', rating: 4.8, accepting: true },
];

// Your known/saved dental providers
const MY_DENTISTS = [
  { id: 'prov-2', name: 'Dr. Michael Torres', specialty: 'General Dentistry', address: '1200 California St, San Francisco, CA', phone: '(415) 555-0202' },
  { id: 'prov-4', name: 'Dr. Lisa Park', specialty: 'Periodontics', address: '2100 Webster St, San Francisco, CA', phone: '(415) 555-0404' },
  { id: 'prov-5', name: 'Dr. James Liu', specialty: 'Oral Surgery', address: '780 Mission St, San Francisco, CA', phone: '(415) 555-0505' },
];

function generateDates() {
  const dates: { dayName: string; label: string; dateStr: string; dayNum: number }[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateStr: d.toISOString().split('T')[0],
      dayNum: d.getDate(),
    });
  }
  return dates;
}

const DATES = generateDates();

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function TypePill({
  emoji,
  label,
  selected,
  onPress,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.typePill, selected && styles.typePillSelected]}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.94, friction: 8, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, friction: 8, useNativeDriver: true }).start()
        }
        onPress={onPress}
      >
        <Text style={styles.typePillEmoji}>{emoji}</Text>
        <Text style={[styles.typePillText, selected && styles.typePillTextSelected]}>{label}</Text>
        {selected && <CheckCircle size={14} color={colors.dental} />}
      </Pressable>
    </Animated.View>
  );
}

function DateCard({
  dayName,
  dayNum,
  label,
  selected,
  onPress,
}: {
  dayName: string;
  dayNum: number;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.dateCard, selected && styles.dateCardSelected]}
      onPress={onPress}
    >
      <Text style={[styles.dateDayName, selected && styles.dateDayNameSelected]}>{dayName}</Text>
      <Text style={[styles.dateDayNum, selected && styles.dateDayNumSelected]}>{dayNum}</Text>
      <Text style={[styles.dateLabel, selected && styles.dateLabelSelected]}>
        {label.split(' ')[0]}
      </Text>
    </Pressable>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function CreateAppointmentScreen() {
  const router = useRouter();
  const { addAppointment } = useData();

  // Form state
  const [isEmergency, setIsEmergency] = useState(false);
  const [painLevel, setPainLevel] = useState('');
  const [painDescription, setPainDescription] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [visitMode, setVisitMode] = useState<'IN_PERSON' | 'VIRTUAL'>('IN_PERSON');
  const [providerName, setProviderName] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [providerTab, setProviderTab] = useState<'mine' | 'nearby'>('mine');
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Emergency pulse animation
  const pulse = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const handleCallEmergency = () => {
    const tel = `tel:${EMERGENCY_PHONE.replace(/-/g, '')}`;
    Linking.openURL(tel).catch(() =>
      Alert.alert('Call', `Please call our emergency line:\n${EMERGENCY_PHONE}`)
    );
  };

  const handleSubmit = useCallback(() => {
    if (!appointmentType) {
      Alert.alert('Select Appointment Type', 'Please choose what type of dental visit you need.');
      return;
    }
    if (!selectedDate) {
      Alert.alert('Choose a Date', 'Please select a preferred appointment date.');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Choose a Time', 'Please pick a time slot.');
      return;
    }

    setLoading(true);
    const typeLabel =
      APPOINTMENT_TYPES.find((t) => t.id === appointmentType)?.label ?? appointmentType;

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      title: isEmergency ? `🚨 Emergency – ${typeLabel}` : typeLabel,
      providerName: providerName.trim() || 'VIP Dental Center',
      specialty: 'General Dentistry',
      date: selectedDate,
      time: selectedTime,
      type: visitMode,
      status: 'UPCOMING',
      notes: [
        isEmergency && painLevel ? `Pain level: ${painLevel}` : '',
        isEmergency && painDescription ? `Pain description: ${painDescription}` : '',
        notes.trim(),
      ]
        .filter(Boolean)
        .join('\n') || undefined,
    };

    addAppointment(newApt);

    setTimeout(() => {
      setLoading(false);
      const displayDate = (() => {
        const d = new Date(selectedDate + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      })();
      Alert.alert(
        isEmergency ? '🚨 Emergency Appointment Requested' : '🦷 Appointment Booked!',
        `${typeLabel}\n${displayDate} at ${selectedTime}\n\nWe'll confirm your appointment shortly.`,
        [{ text: 'Done', onPress: () => router.back() }]
      );
    }, 700);
  }, [
    appointmentType,
    selectedDate,
    selectedTime,
    isEmergency,
    painLevel,
    painDescription,
    providerName,
    visitMode,
    notes,
    addAppointment,
    router,
  ]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 8 }}
            >
              <ChevronLeft size={22} color={colors.primary} />
              <Text style={{ ...typography.callout, color: colors.primary, fontWeight: '600' }}>
                Back
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      {/* ── Emergency Banner ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.emergencyCard, isEmergency && { transform: [{ scale: pulse }] }]}>
        <View style={styles.emergencyTop}>
          <AlertCircle size={22} color={colors.error} />
          <View style={styles.emergencyTextBlock}>
            <Text style={styles.emergencyTitle}>Tooth or Mouth Pain?</Text>
            <Text style={styles.emergencySubtitle}>
              Severe pain, swelling, or injury? Get seen today.
            </Text>
          </View>
        </View>

        <Pressable
          id="emergency-call-button"
          style={styles.emergencyCallBtn}
          onPress={handleCallEmergency}
        >
          <Phone size={16} color="#fff" />
          <Text style={styles.emergencyCallText}>Call Emergency Line</Text>
        </Pressable>

        <View style={styles.emergencyDivider}>
          <View style={styles.emergencyDividerLine} />
          <Text style={styles.emergencyDividerText}>or book an emergency visit below</Text>
          <View style={styles.emergencyDividerLine} />
        </View>

        <Pressable
          id="emergency-toggle-button"
          style={[styles.emergencyToggle, isEmergency && styles.emergencyToggleActive]}
          onPress={() => setIsEmergency((v) => !v)}
        >
          <Text style={[styles.emergencyToggleText, isEmergency && { color: colors.error }]}>
            {isEmergency ? '✓ Marked as Emergency' : 'Mark as Emergency Appointment'}
          </Text>
        </Pressable>

        {isEmergency && (
          <View style={styles.emergencyDetails}>
            <Text style={styles.emergencyDetailLabel}>Pain level</Text>
            <View style={styles.painRow}>
              {PAIN_LEVELS.map((p) => (
                <Pressable
                  key={p.id}
                  id={`pain-level-${p.id}`}
                  style={[
                    styles.painBtn,
                    { borderColor: p.color },
                    painLevel === p.label && { backgroundColor: p.color },
                  ]}
                  onPress={() => setPainLevel(p.label)}
                >
                  <Text
                    style={[
                      styles.painBtnText,
                      { color: p.color },
                      painLevel === p.label && { color: '#fff', fontWeight: '700' },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              id="pain-description-input"
              style={styles.painInput}
              value={painDescription}
              onChangeText={setPainDescription}
              placeholder="Describe your symptoms (e.g. sharp pain in upper right molar)"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
            />
          </View>
        )}
      </Animated.View>

      {/* ── Appointment Type ─────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Type of Visit</SectionLabel>
        <View style={styles.typeGrid}>
          {APPOINTMENT_TYPES.map((t) => (
            <TypePill
              key={t.id}
              emoji={t.emoji}
              label={t.label}
              selected={appointmentType === t.id}
              onPress={() => setAppointmentType(t.id)}
            />
          ))}
        </View>
      </View>

      {/* ── Visit Mode ───────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Visit Type</SectionLabel>
        <View style={styles.modeRow}>
          <Pressable
            id="mode-in-person"
            style={[styles.modeBtn, visitMode === 'IN_PERSON' && styles.modeBtnSelected]}
            onPress={() => setVisitMode('IN_PERSON')}
          >
            <MapPin
              size={16}
              color={visitMode === 'IN_PERSON' ? colors.dental : colors.textTertiary}
            />
            <Text
              style={[styles.modeBtnText, visitMode === 'IN_PERSON' && styles.modeBtnTextSelected]}
            >
              In-Person
            </Text>
          </Pressable>
          <Pressable
            id="mode-virtual"
            style={[styles.modeBtn, visitMode === 'VIRTUAL' && styles.modeBtnSelected]}
            onPress={() => setVisitMode('VIRTUAL')}
          >
            <Video size={16} color={visitMode === 'VIRTUAL' ? colors.dental : colors.textTertiary} />
            <Text
              style={[styles.modeBtnText, visitMode === 'VIRTUAL' && styles.modeBtnTextSelected]}
            >
              Virtual / Telehealth
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── Provider Picker ───────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Choose Your Dentist</SectionLabel>

        {/* Tab toggle */}
        <View style={styles.providerTabRow}>
          <Pressable
            id="provider-tab-mine"
            style={[styles.providerTab, providerTab === 'mine' && styles.providerTabActive]}
            onPress={() => setProviderTab('mine')}
          >
            <User size={14} color={providerTab === 'mine' ? colors.dental : colors.textTertiary} />
            <Text style={[styles.providerTabText, providerTab === 'mine' && styles.providerTabTextActive]}>
              My Dentists
            </Text>
          </Pressable>
          <Pressable
            id="provider-tab-nearby"
            style={[styles.providerTab, providerTab === 'nearby' && styles.providerTabActive]}
            onPress={() => {
              setProviderTab('nearby');
              if (!locationLoading) {
                setLocationLoading(true);
                setTimeout(() => setLocationLoading(false), 1200);
              }
            }}
          >
            <MapPin size={14} color={providerTab === 'nearby' ? colors.dental : colors.textTertiary} />
            <Text style={[styles.providerTabText, providerTab === 'nearby' && styles.providerTabTextActive]}>
              Near Me
            </Text>
          </Pressable>
        </View>

        {/* My Dentists list */}
        {providerTab === 'mine' && (
          <View style={styles.providerList}>
            {MY_DENTISTS.map((d) => {
              const selected = selectedProviderId === d.id;
              return (
                <Pressable
                  key={d.id}
                  id={`dentist-mine-${d.id}`}
                  style={[styles.providerCard, selected && styles.providerCardSelected]}
                  onPress={() => { setSelectedProviderId(d.id); setProviderName(d.name); }}
                >
                  <View style={[styles.providerAvatar, selected && { backgroundColor: `${colors.dental}25` }]}>
                    <Text style={[styles.providerAvatarText, selected && { color: colors.dental }]}>
                      {d.name.split(' ').slice(-2).map((n: string) => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={[styles.providerName, selected && { color: colors.dental }]}>{d.name}</Text>
                    <Text style={styles.providerSpecialty}>{d.specialty}</Text>
                    <Text style={styles.providerAddress}>{d.address}</Text>
                  </View>
                  <View style={styles.providerRight}>
                    {selected && <CheckCircle size={20} color={colors.dental} />}
                  </View>
                </Pressable>
              );
            })}
            {MY_DENTISTS.length === 0 && (
              <View style={styles.providerEmpty}>
                <Text style={styles.providerEmptyText}>No saved dentists yet.</Text>
              </View>
            )}
          </View>
        )}

        {/* Near Me list */}
        {providerTab === 'nearby' && (
          <View style={styles.providerList}>
            {locationLoading ? (
              <View style={styles.locationLoading}>
                <MapPin size={22} color={colors.dental} />
                <Text style={styles.locationLoadingText}>Finding dentists near you…</Text>
              </View>
            ) : (
              NEARBY_DENTISTS.map((d) => {
                const selected = selectedProviderId === d.id;
                return (
                  <Pressable
                    key={d.id}
                    id={`dentist-nearby-${d.id}`}
                    style={[
                      styles.providerCard,
                      selected && styles.providerCardSelected,
                      !d.accepting && styles.providerCardDisabled,
                    ]}
                    onPress={() => {
                      if (!d.accepting) return;
                      setSelectedProviderId(d.id);
                      setProviderName(d.name);
                    }}
                  >
                    <View style={[styles.providerAvatar, selected && { backgroundColor: `${colors.dental}25` }]}>
                      <Text style={[styles.providerAvatarText, selected && { color: colors.dental }]}>
                        {d.name.split(' ').slice(-2).map((n: string) => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.providerInfo}>
                      <Text style={[styles.providerName, selected && { color: colors.dental }]}>{d.name}</Text>
                      <Text style={styles.providerSpecialty}>{d.specialty}</Text>
                      <View style={styles.providerMeta}>
                        <MapPin size={11} color={colors.textTertiary} />
                        <Text style={styles.providerMetaText}>{d.distance}</Text>
                        <Text style={styles.providerMetaDot}>·</Text>
                        <Text style={styles.providerMetaText}>⭐ {d.rating}</Text>
                      </View>
                    </View>
                    <View style={styles.providerRight}>
                      {selected
                        ? <CheckCircle size={20} color={colors.dental} />
                        : d.accepting
                          ? <View style={styles.acceptingBadge}><Text style={styles.acceptingText}>Open</Text></View>
                          : <View style={styles.notAcceptingBadge}><Text style={styles.notAcceptingText}>Full</Text></View>
                      }
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        )}

        {/* Selected provider confirmation */}
        {providerName !== '' && (
          <View style={styles.selectedProviderBanner}>
            <CheckCircle size={14} color={colors.dental} />
            <Text style={styles.selectedProviderText}>{providerName} selected</Text>
          </View>
        )}
      </View>

      {/* ── Date ────────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Preferred Date</SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScroll}
        >
          {DATES.map((d) => (
            <DateCard
              key={d.dateStr}
              dayName={d.dayName}
              dayNum={d.dayNum}
              label={d.label}
              selected={selectedDate === d.dateStr}
              onPress={() => setSelectedDate(d.dateStr)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Time ────────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Preferred Time</SectionLabel>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((t) => (
            <Pressable
              key={t}
              id={`time-slot-${t.replace(/[: ]/g, '-')}`}
              style={[styles.timeSlot, selectedTime === t && styles.timeSlotSelected]}
              onPress={() => setSelectedTime(t)}
            >
              <Text style={[styles.timeSlotText, selectedTime === t && styles.timeSlotTextSelected]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── Patient Name ─────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Patient Name</SectionLabel>
        <View style={styles.inputRow}>
          <User size={18} color={colors.textTertiary} />
          <TextInput
            id="patient-name-input"
            style={styles.input}
            value={patientName}
            onChangeText={setPatientName}
            placeholder="Your full name"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Additional Notes</SectionLabel>
        <View style={[styles.inputRow, styles.notesRow]}>
          <FileText size={18} color={colors.textTertiary} style={{ alignSelf: 'flex-start', marginTop: 2 }} />
          <TextInput
            id="notes-input"
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special concerns or instructions for your dentist..."
            placeholderTextColor={colors.textTertiary}
            multiline
          />
        </View>
      </View>

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      {(selectedDate || selectedTime || appointmentType) && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Calendar size={15} color={colors.dental} />
            <Text style={styles.summaryText}>
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'No date selected'}
              {selectedTime ? ` at ${selectedTime}` : ''}
            </Text>
          </View>
          {appointmentType && (
            <View style={styles.summaryRow}>
              <Clock size={15} color={colors.dental} />
              <Text style={styles.summaryText}>
                {APPOINTMENT_TYPES.find((t) => t.id === appointmentType)?.label}
                {isEmergency ? ' · 🚨 Emergency' : ''}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <PrimaryButton
        title={isEmergency ? '🚨 Book Emergency Appointment' : 'Book Appointment'}
        onPress={handleSubmit}
        loading={loading}
        style={isEmergency
          ? { ...styles.submitBtn, backgroundColor: colors.error }
          : styles.submitBtn
        }
      />

      <View style={{ height: 32 }} />
    </ScrollView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const DENTAL = colors.dental; // #14B8A6

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },

  section: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
    marginBottom: spacing.md,
  },

  // ── Emergency card ─────────────────────────────────────────────────────────
  emergencyCard: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1.5,
    borderColor: `${colors.error}40`,
    ...shadow.sm,
  },
  emergencyTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  emergencyTextBlock: { flex: 1 },
  emergencyTitle: {
    ...typography.headline,
    color: colors.error,
  },
  emergencySubtitle: {
    ...typography.callout,
    color: '#B91C1C',
    marginTop: 2,
  },
  emergencyCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  emergencyCallText: {
    ...typography.headline,
    color: '#fff',
  },
  emergencyDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  emergencyDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: `${colors.error}30`,
  },
  emergencyDividerText: {
    ...typography.small,
    color: '#B91C1C',
    flexShrink: 1,
  },
  emergencyToggle: {
    borderWidth: 1.5,
    borderColor: `${colors.error}50`,
    borderRadius: borderRadius.lg,
    paddingVertical: 10,
    alignItems: 'center',
  },
  emergencyToggleActive: {
    backgroundColor: `${colors.error}15`,
    borderColor: colors.error,
  },
  emergencyToggleText: {
    ...typography.callout,
    color: '#B91C1C',
    fontWeight: '600',
  },
  emergencyDetails: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  emergencyDetailLabel: {
    ...typography.caption,
    color: '#B91C1C',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  painRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  painBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  painBtnText: {
    ...typography.callout,
    fontWeight: '600',
  },
  painInput: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: `${colors.error}30`,
    minHeight: 72,
    textAlignVertical: 'top',
  },

  // ── Type grid ──────────────────────────────────────────────────────────────
  typeGrid: {
    gap: spacing.sm,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    ...shadow.sm,
  },
  typePillSelected: {
    borderColor: DENTAL,
    backgroundColor: `${DENTAL}10`,
  },
  typePillEmoji: {
    fontSize: 18,
  },
  typePillText: {
    ...typography.callout,
    color: colors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  typePillTextSelected: {
    color: DENTAL,
    fontWeight: '600',
  },

  // ── Visit mode ─────────────────────────────────────────────────────────────
  modeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 13,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeBtnSelected: {
    borderColor: DENTAL,
    backgroundColor: `${DENTAL}10`,
  },
  modeBtnText: {
    ...typography.callout,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  modeBtnTextSelected: {
    color: DENTAL,
    fontWeight: '600',
  },

  // ── Input ──────────────────────────────────────────────────────────────────
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  notesRow: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    ...typography.body,
    color: colors.textPrimary,
  },

  // ── Date ───────────────────────────────────────────────────────────────────
  dateScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dateCard: {
    width: 60,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 2,
    ...shadow.sm,
  },
  dateCardSelected: {
    borderColor: DENTAL,
    backgroundColor: DENTAL,
  },
  dateDayName: {
    ...typography.small,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  dateDayNameSelected: { color: 'rgba(255,255,255,0.8)' },
  dateDayNum: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 26,
  },
  dateDayNumSelected: { color: '#fff' },
  dateLabel: {
    ...typography.small,
    color: colors.textTertiary,
  },
  dateLabelSelected: { color: 'rgba(255,255,255,0.7)' },

  // ── Time ───────────────────────────────────────────────────────────────────
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: '22%',
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: DENTAL,
    borderColor: DENTAL,
  },
  timeSlotText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },

  // ── Summary card ───────────────────────────────────────────────────────────
  summaryCard: {
    backgroundColor: `${DENTAL}0F`,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: `${DENTAL}30`,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryText: {
    ...typography.callout,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },

  // ── Submit ─────────────────────────────────────────────────────────────────
  submitBtn: {
    marginTop: spacing.sm,
  },

  // ── Provider picker ────────────────────────────────────────────────────────
  providerTabRow: {
    flexDirection: 'row' as const,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: 3,
    marginBottom: spacing.md,
  },
  providerTab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.xs,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  providerTabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  providerTabText: {
    ...typography.callout,
    color: colors.textTertiary,
    fontWeight: '500' as const,
  },
  providerTabTextActive: {
    color: DENTAL,
    fontWeight: '600' as const,
  },
  providerList: {
    gap: spacing.sm,
  },
  providerCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  providerCardSelected: {
    borderColor: DENTAL,
    backgroundColor: `${DENTAL}08`,
  },
  providerCardDisabled: {
    opacity: 0.5,
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  providerAvatarText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textTertiary,
  },
  providerInfo: { flex: 1 },
  providerName: {
    ...typography.callout,
    color: colors.textPrimary,
    fontWeight: '600' as const,
  },
  providerSpecialty: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 1,
  },
  providerAddress: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 1,
  },
  providerMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 2,
  },
  providerMetaText: {
    ...typography.small,
    color: colors.textTertiary,
  },
  providerMetaDot: {
    ...typography.small,
    color: colors.textTertiary,
  },
  providerRight: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  acceptingBadge: {
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  acceptingText: {
    ...typography.small,
    color: colors.success,
    fontWeight: '600' as const,
  },
  notAcceptingBadge: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  notAcceptingText: {
    ...typography.small,
    color: colors.error,
    fontWeight: '600' as const,
  },
  providerEmpty: {
    padding: spacing.xl,
    alignItems: 'center' as const,
  },
  providerEmptyText: {
    ...typography.callout,
    color: colors.textTertiary,
  },
  locationLoading: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  locationLoadingText: {
    ...typography.callout,
    color: DENTAL,
    fontWeight: '500' as const,
  },
  selectedProviderBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectedProviderText: {
    ...typography.callout,
    color: DENTAL,
    fontWeight: '600' as const,
  },
});
