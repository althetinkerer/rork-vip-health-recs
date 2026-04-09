import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { TrendingUp, AlertTriangle, Info, CheckCircle, ArrowRight } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import Card from '@/components/Card';

export default function IntegrativeInsightsCard() {
  return (
    <Card style={s.container}>
      {/* Header */}
      <View style={s.headerRow}>
        <View style={s.titleWrap}>
          <TrendingUp size={20} color={colors.primary} style={{ marginTop: 2 }} />
          <Text style={s.title}>Medical-Dental Integration{'\n'}Insights</Text>
        </View>
        <Pressable style={s.viewAllBtn}>
          <Text style={s.viewAllText}>View All</Text>
        </Pressable>
      </View>

      {/* 1. Gum Disease Risk (Red) */}
      <View style={[s.alertBox, { backgroundColor: '#FFF1F2' /* Tailored faint red */ }]}>
        <View style={s.alertTitleRow}>
          <AlertTriangle size={18} color={colors.error} />
          <Text style={[s.alertTitle, { color: colors.error }]}>Gum Disease Risk</Text>
        </View>
        <Text style={[s.alertBody, { color: '#E11D48' /* Darker red */ }]}>
          Your recent blood sugar levels (HbA1c: 7.2%) may increase risk of periodontal disease. Schedule a dental checkup.
        </Text>
        <Pressable style={s.actionRow}>
          <Text style={s.actionText}>Book Dental Appointment</Text>
          <ArrowRight size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* 2. Medication Impact (Gray) */}
      <View style={[s.alertBox, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={s.alertTitleRow}>
          <Info size={18} color={colors.textPrimary} />
          <Text style={[s.alertTitle, { color: colors.textPrimary }]}>Medication Impact</Text>
        </View>
        <Text style={[s.alertBody, { color: colors.textSecondary }]}>
          Your blood pressure medication may cause dry mouth. Discuss with your dentist about preventive care.
        </Text>
        <Pressable style={s.actionRow}>
          <Text style={s.actionText}>Learn More</Text>
          <ArrowRight size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* 3. Positive Connection (Green) */}
      <View style={[s.alertBox, { backgroundColor: '#F0FDF4' /* Tailored faint green */ }]}>
        <View style={s.alertTitleRow}>
          <CheckCircle size={18} color={colors.success} />
          <Text style={[s.alertTitle, { color: colors.success }]}>Positive Connection</Text>
        </View>
        <Text style={[s.alertBody, { color: colors.textSecondary }]}>
          Recent dental cleaning has reduced oral bacteria. This may contribute to better cardiovascular health.
        </Text>
        <Pressable style={s.actionRow}>
          <Text style={s.actionText}>View Details</Text>
          <ArrowRight size={16} color={colors.primary} />
        </Pressable>
      </View>

    </Card>
  );
}

const s = StyleSheet.create({
  container: {
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  viewAllBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  viewAllText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  alertBox: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  alertTitle: {
    ...typography.headline,
  },
  alertBody: {
    ...typography.body,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    ...typography.headline,
    color: colors.primary,
  }
});
