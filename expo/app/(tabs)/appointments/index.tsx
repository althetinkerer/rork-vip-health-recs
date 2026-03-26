import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Calendar, Video, MapPin } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import Chip from '@/components/Chip';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { Appointment } from '@/types';

const FILTERS = ['All', 'Upcoming', 'Completed', 'Cancelled'] as const;

export default function AppointmentsListScreen() {
  const router = useRouter();
  const { appointments, refetchAll } = useData();
  const [filter, setFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'All') return appointments;
    return appointments.filter(a => a.status === filter.toUpperCase());
  }, [appointments, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    refetchAll();
    setTimeout(() => setRefreshing(false), 800);
  };

  const renderItem = ({ item }: { item: Appointment }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/(tabs)/appointments/${item.id}`)}
    >
      <View style={styles.cardRow}>
        <View style={[styles.typeIcon, { backgroundColor: item.type === 'VIRTUAL' ? colors.primaryFaded : colors.successLight }]}>
          {item.type === 'VIRTUAL' ? (
            <Video size={18} color={colors.primary} />
          ) : (
            <MapPin size={18} color={colors.success} />
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSub}>{item.providerName} · {item.specialty}</Text>
          <View style={styles.cardMeta}>
            <Calendar size={12} color={colors.textTertiary} />
            <Text style={styles.cardDate}>{item.date} at {item.time}</Text>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <Chip label={item} selected={filter === item} onPress={() => setFilter(item)} />
          )}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState title="No Appointments" message="You don't have any appointments matching this filter." />
        }
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/(tabs)/appointments/create')}
      >
        <Plus size={24} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterRow: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: 100,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.sm,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.985 }],
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  typeIcon: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  cardSub: {
    ...typography.callout,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  cardDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.lg,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});
