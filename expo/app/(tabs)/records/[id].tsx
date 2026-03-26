import React from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FileText, User, Calendar, Download, Tag } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useData } from '@/context/DataContext';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { records } = useData();
  const record = records.find(r => r.id === id);

  if (!record) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Record not found</Text>
      </View>
    );
  }

  const handleDownload = () => {
    Alert.alert('Download', 'Record download started (mock). In production, this would download the actual file.');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <FileText size={24} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{record.title}</Text>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{record.category}</Text>
            </View>
          </View>
        </View>
      </Card>

      <Card style={styles.detailCard}>
        <DetailRow icon={<User size={18} color={colors.primary} />} label="Provider" value={record.providerName} />
        <DetailRow icon={<Calendar size={18} color={colors.primary} />} label="Date" value={record.date} />
        <DetailRow icon={<Tag size={18} color={colors.primary} />} label="Category" value={record.category} />
      </Card>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Summary</Text>
        <Text style={styles.summaryText}>{record.summary}</Text>
      </Card>

      <PrimaryButton
        title="Download Record"
        onPress={handleDownload}
        variant="secondary"
        icon={<Download size={18} color={colors.primary} />}
      />
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
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { ...typography.body, color: colors.textSecondary },
  headerCard: { marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  iconWrap: {
    width: 52, height: 52, borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryFaded, alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1, gap: spacing.sm },
  title: { ...typography.title3, color: colors.textPrimary },
  catBadge: {
    backgroundColor: colors.surfaceSecondary, paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs, borderRadius: borderRadius.sm, alignSelf: 'flex-start',
  },
  catText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' as const },
  detailCard: { marginBottom: spacing.lg, gap: spacing.lg },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  detailInfo: { flex: 1 },
  detailLabel: {
    ...typography.caption, color: colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5,
  },
  detailValue: { ...typography.body, color: colors.textPrimary, marginTop: 2 },
  summaryCard: { marginBottom: spacing.xxl },
  summaryLabel: {
    ...typography.caption, color: colors.textTertiary,
    textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: spacing.sm,
  },
  summaryText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
});
