import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Pill, AlertTriangle, Check } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import Chip from '@/components/Chip';
import EmptyState from '@/components/EmptyState';
import { Medication } from '@/types';

const FILTERS = ['All', 'Active', 'Low Stock', 'Inactive'] as const;

export default function MedicationsListScreen() {
  const router = useRouter();
  const { medications, refetchAll } = useData();
  const [filter, setFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'Active':
        return medications.filter(m => m.isActive);
      case 'Low Stock':
        return medications.filter(m => m.isActive && m.pillsRemaining !== undefined && m.totalPills !== undefined && m.pillsRemaining < m.totalPills * 0.2);
      case 'Inactive':
        return medications.filter(m => !m.isActive);
      default:
        return medications;
    }
  }, [medications, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    refetchAll();
    setTimeout(() => setRefreshing(false), 800);
  };

  const getStockPercentage = (med: Medication): number => {
    if (med.pillsRemaining === undefined || med.totalPills === undefined || med.totalPills === 0) return 100;
    return (med.pillsRemaining / med.totalPills) * 100;
  };

  const isLowStock = (med: Medication): boolean => {
    return med.isActive && getStockPercentage(med) < 20;
  };

  const renderItem = ({ item }: { item: Medication }) => {
    const stockPct = getStockPercentage(item);
    const low = isLowStock(item);
    const barColor = low ? colors.error : stockPct < 50 ? colors.warning : colors.success;

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push(`/(tabs)/medications/${item.id}`)}
      >
        <View style={styles.cardTop}>
          <View style={[styles.pillIcon, { backgroundColor: item.isActive ? colors.primaryFaded : colors.surfaceSecondary }]}>
            <Pill size={18} color={item.isActive ? colors.primary : colors.textTertiary} />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.medName}>{item.name}</Text>
              {low && <AlertTriangle size={14} color={colors.error} />}
              {!item.isActive && <Check size={14} color={colors.textTertiary} />}
            </View>
            <Text style={styles.medDosage}>{item.dosage} · {item.frequency}</Text>
            <Text style={styles.medProvider}>Prescribed by {item.prescribedBy}</Text>
          </View>
        </View>

        {item.isActive && item.pillsRemaining !== undefined && item.totalPills !== undefined && (
          <View style={styles.stockSection}>
            <View style={styles.stockRow}>
              <Text style={styles.stockLabel}>
                {item.pillsRemaining} of {item.totalPills} pills remaining
              </Text>
              <Text style={[styles.stockPct, { color: barColor }]}>
                {Math.round(stockPct)}%
              </Text>
            </View>
            <View style={styles.stockBar}>
              <View style={[styles.stockFill, { width: `${Math.min(stockPct, 100)}%`, backgroundColor: barColor }]} />
            </View>
          </View>
        )}

        {item.refillDate && item.isActive && (
          <Text style={styles.refillText}>Refill by {item.refillDate}</Text>
        )}
      </Pressable>
    );
  };

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
            <Chip
              label={item}
              selected={filter === item}
              onPress={() => setFilter(item)}
              color={item === 'Low Stock' ? colors.error : undefined}
            />
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
        ListEmptyComponent={<EmptyState title="No Medications" message="No medications match this filter." />}
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/(tabs)/medications/create')}
      >
        <Plus size={24} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
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
  cardPressed: { opacity: 0.95 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  pillIcon: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  medName: { ...typography.headline, color: colors.textPrimary },
  medDosage: { ...typography.callout, color: colors.textSecondary, marginTop: 2 },
  medProvider: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  stockSection: { marginTop: spacing.md },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stockLabel: { ...typography.small, color: colors.textSecondary },
  stockPct: { ...typography.caption, fontWeight: '700' as const },
  stockBar: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stockFill: {
    height: 4,
    borderRadius: 2,
  },
  refillText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '500' as const,
    marginTop: spacing.sm,
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
  fabPressed: { opacity: 0.9, transform: [{ scale: 0.95 }] },
});
