import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import {
  upperRightTeeth,
  upperLeftTeeth,
  lowerLeftTeeth,
  lowerRightTeeth,
  toothStatusColors,
  type ToothData,
} from '@/mocks/dashboardData';

const CHART_TABS = ['Chart', 'Perio', 'Implants'] as const;

const legendItems = [
  { label: 'Healthy', color: toothStatusColors.healthy },
  { label: 'Cavity', color: toothStatusColors.cavity },
  { label: 'Filling', color: toothStatusColors.filling },
  { label: 'Crown', color: toothStatusColors.crown },
  { label: 'Root Canal', color: toothStatusColors.rootCanal },
  { label: 'Implant', color: toothStatusColors.implant },
];

function Tooth({ tooth }: { tooth: ToothData }) {
  const bg = toothStatusColors[tooth.status] || toothStatusColors.healthy;
  const isLight = tooth.status === 'healthy';
  return (
    <View style={[ts.tooth, { backgroundColor: bg }]}>
      <Text style={[ts.toothNum, isLight && ts.toothNumDark]}>{tooth.number}</Text>
    </View>
  );
}

export default function DentalChartView() {
  const [activeTab, setActiveTab] = useState<typeof CHART_TABS[number]>('Chart');

  return (
    <View style={ts.container}>
      <View style={ts.header}>
        <View style={ts.headerLeft}>
          <CheckCircle2 size={20} color={colors.primary} />
          <Text style={ts.title}>Dental Chart</Text>
        </View>
        <Pressable style={ts.printBtn}>
          <Text style={ts.printText}>Print</Text>
        </Pressable>
      </View>

      <View style={ts.tabs}>
        {CHART_TABS.map(tab => (
          <Pressable
            key={tab}
            style={[ts.tab, activeTab === tab && ts.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[ts.tabText, activeTab === tab && ts.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      <View style={ts.legend}>
        <Text style={ts.legendTitle}>Legend</Text>
        <View style={ts.legendGrid}>
          {legendItems.map(item => (
            <View key={item.label} style={ts.legendItem}>
              <View style={[ts.legendDot, { backgroundColor: item.color }]} />
              <Text style={ts.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={ts.treatmentBadge}>
        <Text style={ts.treatmentText}>Active Treatment: Ceramic Braces</Text>
      </View>

      <View style={ts.archSection}>
        <View style={ts.archRow}>
          <View style={ts.teethRow}>
            {upperRightTeeth.map(t => <Tooth key={t.number} tooth={t} />)}
          </View>
          <View style={ts.archDivider} />
          <View style={ts.teethRow}>
            {upperLeftTeeth.map(t => <Tooth key={t.number} tooth={t} />)}
          </View>
        </View>
        <View style={ts.archSideLabels}>
          <Text style={ts.sideLabel}>R</Text>
          <Text style={ts.archLabel}>Upper</Text>
          <Text style={ts.sideLabel}>L</Text>
        </View>
      </View>

      <View style={ts.archSeparator} />

      <View style={ts.archSection}>
        <View style={ts.archRow}>
          <View style={ts.teethRow}>
            {lowerLeftTeeth.map(t => <Tooth key={t.number} tooth={t} />)}
          </View>
          <View style={ts.archDivider} />
          <View style={ts.teethRow}>
            {lowerRightTeeth.map(t => <Tooth key={t.number} tooth={t} />)}
          </View>
        </View>
        <View style={ts.archSideLabels}>
          <Text style={ts.sideLabel}>L</Text>
          <Text style={ts.archLabel}>Lower</Text>
          <Text style={ts.sideLabel}>R</Text>
        </View>
      </View>

      <View style={ts.summary}>
        <Text style={ts.summaryTitle}>Health Summary</Text>
        <View style={ts.summaryGrid}>
          <View style={ts.summaryItem}>
            <Text style={ts.summaryLabel}>Teeth Present</Text>
            <Text style={ts.summaryValue}>29</Text>
          </View>
          <View style={ts.summaryItem}>
            <Text style={ts.summaryLabel}>Need Attention</Text>
            <Text style={ts.summaryValue}>1</Text>
          </View>
          <View style={ts.summaryItem}>
            <Text style={ts.summaryLabel}>Restored</Text>
            <Text style={ts.summaryValue}>4</Text>
          </View>
          <View style={ts.summaryItem}>
            <Text style={ts.summaryLabel}>Overall</Text>
            <Text style={[ts.summaryValue, { color: colors.success }]}>Good</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const ts = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    ...shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  printBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  printText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  tabText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '600' as const,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  legend: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  legendTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  treatmentBadge: {
    alignSelf: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  treatmentText: {
    ...typography.caption,
    color: '#92400E',
    fontWeight: '600' as const,
  },
  archSection: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  archRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  teethRow: {
    flexDirection: 'row',
    gap: 2,
  },
  archDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.textPrimary,
    marginHorizontal: spacing.xs,
  },
  archSideLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: spacing.xs,
  },
  sideLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
  archLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600' as const,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  archSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.xxl,
  },
  tooth: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toothNum: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  toothNumDark: {
    color: '#FFFFFF',
  },
  summary: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  summaryTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '50%',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.headline,
    color: colors.textPrimary,
  },
});
