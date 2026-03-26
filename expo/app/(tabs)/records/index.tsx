import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, FileText, FlaskConical, ImageIcon, Stethoscope, Scissors, Pill } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import Chip from '@/components/Chip';
import EmptyState from '@/components/EmptyState';
import { HealthRecord, RecordCategory } from '@/types';

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All', value: 'All' },
  { label: 'Lab', value: 'LAB' },
  { label: 'Imaging', value: 'IMAGING' },
  { label: 'Visit', value: 'VISIT' },
  { label: 'Procedure', value: 'PROCEDURE' },
];

const categoryIcons: Record<RecordCategory, React.ReactNode> = {
  LAB: <FlaskConical size={16} color={colors.primary} />,
  IMAGING: <ImageIcon size={16} color="#8B5CF6" />,
  VISIT: <Stethoscope size={16} color={colors.success} />,
  PROCEDURE: <Scissors size={16} color={colors.warning} />,
  PRESCRIPTION: <Pill size={16} color={colors.error} />,
  OTHER: <FileText size={16} color={colors.textSecondary} />,
};

const categoryColors: Record<RecordCategory, string> = {
  LAB: colors.primaryFaded,
  IMAGING: '#F3E8FF',
  VISIT: colors.successLight,
  PROCEDURE: colors.warningLight,
  PRESCRIPTION: colors.errorLight,
  OTHER: colors.surfaceSecondary,
};

export default function RecordsListScreen() {
  const router = useRouter();
  const { records, refetchAll } = useData();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    let result = records;
    if (category !== 'All') {
      result = result.filter(r => r.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) || r.providerName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [records, category, search]);

  const onRefresh = () => {
    setRefreshing(true);
    refetchAll();
    setTimeout(() => setRefreshing(false), 800);
  };

  const renderItem = ({ item }: { item: HealthRecord }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/(tabs)/records/${item.id}`)}
    >
      <View style={styles.cardRow}>
        <View style={[styles.catIcon, { backgroundColor: categoryColors[item.category] }]}>
          {categoryIcons[item.category]}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardSub}>{item.providerName}</Text>
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{item.category}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search records..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <Chip label={item.label} selected={category === item.value} onPress={() => setCategory(item.value)} />
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
        ListEmptyComponent={<EmptyState title="No Records" message="No health records match your search." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
    paddingBottom: 40,
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
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  catIcon: {
    width: 40,
    height: 40,
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
    marginTop: 1,
  },
  cardDate: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  catBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  catBadgeText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
});
