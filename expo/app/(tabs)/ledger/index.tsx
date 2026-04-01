import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, Filter, CreditCard } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { ledgerTransactions } from '@/mocks/dashboardData';

const statusColors: Record<string, { bg: string; text: string }> = {
  'Paid in Full': { bg: '#DCFCE7', text: '#166534' },
  'Insurance Processing': { bg: '#FEF3C7', text: '#92400E' },
  'Payment Pending': { bg: '#FEE2E2', text: '#991B1B' },
  'Partial Payment': { bg: '#DBEAFE', text: '#1E40AF' },
};

export default function LedgerScreen() {
  const totalCharges = ledgerTransactions.reduce((s, t) => s + t.fee, 0);
  const totalInsurance = ledgerTransactions.reduce((s, t) => s + t.insurance, 0);
  const totalPatient = ledgerTransactions.reduce((s, t) => s + t.patient, 0);
  const outstanding = ledgerTransactions.reduce((s, t) => s + t.balance, 0);

  return (
    <View style={s.screen}>
      <SafeAreaView edges={['top']} style={s.safeTop}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <FileText size={22} color={colors.primary} />
            <Text style={s.headerTitle}>Dental Ledger</Text>
          </View>
          <Pressable style={s.filterBtn}>
            <Filter size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.summaryGrid}>
          <View style={[s.summaryCard, { backgroundColor: '#EDF3FA' }]}>
            <Text style={s.summaryLabel}>Total Charges</Text>
            <Text style={s.summaryValue}>${totalCharges.toLocaleString()}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#DCFCE7' }]}>
            <Text style={s.summaryLabel}>Insurance Paid</Text>
            <Text style={[s.summaryValue, { color: '#166534' }]}>${totalInsurance.toLocaleString()}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: '#DBEAFE' }]}>
            <Text style={s.summaryLabel}>Patient Paid</Text>
            <Text style={[s.summaryValue, { color: '#1E40AF' }]}>${totalPatient.toLocaleString()}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: outstanding > 0 ? '#FEF3C7' : '#DCFCE7' }]}>
            <Text style={s.summaryLabel}>Outstanding</Text>
            <Text style={[s.summaryValue, { color: outstanding > 0 ? '#92400E' : '#166534' }]}>${outstanding.toLocaleString()}</Text>
          </View>
        </View>

        <View style={s.actionsRow}>
          <Pressable style={s.actionBtn}>
            <Download size={16} color={colors.primary} />
            <Text style={s.actionBtnText}>Export PDF</Text>
          </Pressable>
          <Pressable style={s.actionBtn}>
            <FileText size={16} color={colors.primary} />
            <Text style={s.actionBtnText}>Print Statement</Text>
          </Pressable>
          {outstanding > 0 && (
            <Pressable style={[s.actionBtn, s.actionBtnPrimary]}>
              <CreditCard size={16} color={colors.textInverse} />
              <Text style={s.actionBtnTextPrimary}>Pay ${outstanding}</Text>
            </Pressable>
          )}
        </View>

        <Text style={s.transTitle}>Transaction History</Text>

        {ledgerTransactions.map(t => {
          const sc = statusColors[t.status] || statusColors['Paid in Full'];
          return (
            <View key={t.id} style={s.transCard}>
              <View style={s.transHeader}>
                <Text style={s.transDate}>{t.date}</Text>
                <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[s.statusText, { color: sc.text }]}>{t.status}</Text>
                </View>
              </View>
              <Text style={s.transProcedure}>{t.procedure}</Text>
              <View style={s.transDetails}>
                <Text style={s.transDetailText}>CDT: {t.cdt}</Text>
                {t.tooth !== '-' && <Text style={s.transDetailText}>Tooth: {t.tooth}</Text>}
                <Text style={s.transDetailText}>{t.provider}</Text>
              </View>
              <View style={s.transAmounts}>
                <View style={s.transAmountItem}>
                  <Text style={s.transAmountLabel}>Fee</Text>
                  <Text style={s.transAmountValue}>${t.fee.toLocaleString()}</Text>
                </View>
                <View style={s.transAmountItem}>
                  <Text style={s.transAmountLabel}>Insurance</Text>
                  <Text style={[s.transAmountValue, { color: '#166534' }]}>
                    {t.insurance > 0 ? `-$${t.insurance.toLocaleString()}` : '-'}
                  </Text>
                </View>
                <View style={s.transAmountItem}>
                  <Text style={s.transAmountLabel}>Patient</Text>
                  <Text style={[s.transAmountValue, { color: colors.primary }]}>${t.patient.toLocaleString()}</Text>
                </View>
                {t.balance > 0 && (
                  <View style={s.transAmountItem}>
                    <Text style={s.transAmountLabel}>Balance</Text>
                    <Text style={[s.transAmountValue, { color: '#F59E0B' }]}>${t.balance.toLocaleString()}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  safeTop: { backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { ...typography.title, color: colors.textPrimary },
  filterBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  summaryGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.lg,
  },
  summaryCard: {
    width: '48%' as unknown as number,
    flexGrow: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  summaryLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  summaryValue: { fontSize: 20, fontWeight: '700' as const, color: colors.textPrimary },
  actionsRow: {
    flexDirection: 'row', paddingHorizontal: spacing.xl,
    gap: spacing.sm, marginBottom: spacing.xxl,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    borderWidth: 1, borderColor: colors.primary, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  actionBtnText: { ...typography.caption, color: colors.primary, fontWeight: '600' as const },
  actionBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionBtnTextPrimary: { ...typography.caption, color: colors.textInverse, fontWeight: '600' as const },
  transTitle: {
    ...typography.title3, color: colors.textPrimary,
    paddingHorizontal: spacing.xl, marginBottom: spacing.md,
  },
  transCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginHorizontal: spacing.xl,
    marginBottom: spacing.md, ...shadow.sm,
  },
  transHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  transDate: { ...typography.caption, color: colors.textTertiary },
  statusBadge: { borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  statusText: { ...typography.small, fontWeight: '600' as const },
  transProcedure: { ...typography.headline, color: colors.textPrimary, marginBottom: spacing.xs },
  transDetails: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  transDetailText: { ...typography.caption, color: colors.textSecondary },
  transAmounts: { flexDirection: 'row', gap: spacing.md },
  transAmountItem: {},
  transAmountLabel: { ...typography.small, color: colors.textTertiary },
  transAmountValue: { ...typography.callout, color: colors.textPrimary, fontWeight: '600' as const },
});
