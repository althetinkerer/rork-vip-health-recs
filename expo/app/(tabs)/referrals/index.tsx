import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import Chip from '@/components/Chip';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { Referral } from '@/types';

const FILTERS = ['All', 'Sent', 'Received', 'Needs Action'] as const;

export default function ReferralsListScreen() {
  const router = useRouter();
  const { referrals, providers, refetchAll } = useData();
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const getProviderName = (id: string) => providers.find(p => p.id === id)?.name ?? 'Unknown';

  const filtered = useMemo(() => {
    let result = referrals;

    switch (filter) {
      case 'Sent':
        result = result.filter(r => r.status === 'SENT');
        break;
      case 'Received':
        result = result.filter(r => r.status === 'RECEIVED');
        break;
      case 'Needs Action':
        result = result.filter(r => r.status === 'RECEIVED' || r.status === 'IN_REVIEW');
        break;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.patientName.toLowerCase().includes(q) ||
        getProviderName(r.fromProviderId).toLowerCase().includes(q) ||
        getProviderName(r.toProviderId).toLowerCase().includes(q)
      );
    }

    return result;
  }, [referrals, filter, search, providers]);

  const onRefresh = () => {
    setRefreshing(true);
    refetchAll();
    setTimeout(() => setRefreshing(false), 800);
  };

  const renderItem = ({ item }: { item: Referral }) => {
    const fromName = getProviderName(item.fromProviderId);
    const toName = getProviderName(item.toProviderId);
    const isMedToDental = item.direction === 'MED_TO_DENTAL';
    const dirColor = isMedToDental ? colors.medical : colors.dental;

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push(`/(tabs)/referrals/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.dirBadge, { backgroundColor: dirColor + '15' }]}>
            <Text style={[styles.dirText, { color: dirColor }]}>
              {isMedToDental ? 'Medical → Dental' : 'Dental → Medical'}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.reason} numberOfLines={2}>{item.reason}</Text>

        <View style={styles.providerFlow}>
          <View style={styles.providerCol}>
            <Text style={styles.providerLabel}>From</Text>
            <Text style={styles.providerName} numberOfLines={1}>{fromName}</Text>
          </View>
          <View style={styles.arrowWrap}>
            {isMedToDental ? (
              <ArrowRight size={16} color={dirColor} />
            ) : (
              <ArrowLeft size={16} color={dirColor} />
            )}
          </View>
          <View style={[styles.providerCol, styles.providerColRight]}>
            <Text style={styles.providerLabel}>To</Text>
            <Text style={styles.providerName} numberOfLines={1}>{toName}</Text>
          </View>
          <ChevronRight size={18} color={colors.textTertiary} />
        </View>

        <Text style={styles.dateText}>
          Created {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patient or provider..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

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
              color={item === 'Needs Action' ? colors.warning : undefined}
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
        ListEmptyComponent={
          <EmptyState
            title="No Referrals"
            message="No referrals match your current filters."
            actionLabel="Create Referral"
            onAction={() => router.push('/(tabs)/referrals/create')}
          />
        }
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/(tabs)/referrals/create')}
      >
        <Plus size={24} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  searchWrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 10,
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
  cardPressed: { opacity: 0.95 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dirBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  dirText: {
    ...typography.caption,
    fontWeight: '600' as const,
  },
  patientName: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  reason: {
    ...typography.callout,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  providerFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  providerCol: {
    flex: 1,
  },
  providerColRight: {
    alignItems: 'flex-end',
  },
  providerLabel: {
    ...typography.small,
    color: colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  providerName: {
    ...typography.callout,
    color: colors.textPrimary,
    fontWeight: '600' as const,
    marginTop: 1,
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    ...typography.small,
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
  fabPressed: { opacity: 0.9, transform: [{ scale: 0.95 }] },
});
