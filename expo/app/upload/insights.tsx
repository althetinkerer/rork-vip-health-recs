import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Calendar, FileText, BrainCircuit, Activity, Pill, Bone, Image as ImageIcon } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import Card from '@/components/Card';
import { useData } from '@/context/DataContext';

export default function AIInsightsScreen() {
  const router = useRouter();
  const { insightType } = useLocalSearchParams();
  const { addRecord, addInsurancePolicy } = useData();

  const standardData = {
    docName: "Periodontal Examination & Scaling",
    date: "March 28, 2026",
    provider: "VIP Advanced Dentistry",
    category: "VISIT",
    insights: [
      {
        icon: Activity,
        color: '#EF4444',
        title: "Gum Inflammation Detected",
        text: "AI isolated a 5mm pocket depth on tooth #14, correlating with your documented Type 2 Diabetes history. Recommend strict maintenance."
      },
      {
        icon: Pill,
        color: '#8B5CF6',
        title: "Medication Contraindication Check",
        text: "Detected a prescription for Lisinopril (dry mouth side effects) on file. Dr. Smith correctly noted the usage of fluoride varnishes to prevent root decay."
      }
    ]
  };

  const xrayData = {
    docName: "Panoramic Radiograph (.dcm)",
    date: "March 28, 2026",
    provider: "VIP Advanced Dentistry",
    category: "IMAGING",
    insights: [
      {
        icon: Bone,
        color: colors.primary,
        title: "Excellent Bone Density",
        text: "Neural net evaluation of the DICOM volumetric slices reveals normal mandibular bone density with zero signs of root resorption."
      },
      {
        icon: ImageIcon,
        color: colors.success,
        title: "Clear Margins",
        text: "No apical radiolucency detected around prior endodontic treatments. Restoration integrities remain preserved."
      }
    ]
  };

  const rxData = {
    docName: "Amoxicillin 500mg Script (.pdf)",
    date: "April 02, 2026",
    provider: "CVS Pharmacy",
    category: "PRESCRIPTION",
    insights: [
      {
        icon: Pill,
        color: colors.success,
        title: "Active Medication Added",
        text: "Parsed Amoxicillin 500mg 3x daily. Document successfully classified into your Prescription History timeline."
      },
      {
        icon: CheckCircle,
        color: colors.primary,
        title: "No Intraclass Conflicts",
        text: "Cross-checked against your existing active medications. No significant pharmacological interactions detected."
      }
    ]
  };

  const insuranceCardData = {
    docName: "MetLife Dental PPO (Scanned ID)",
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
    provider: "MetLife",
    category: "INSURANCE",
    insights: [
      {
        icon: CheckCircle,
        color: colors.success,
        title: "Current Eligibility",
        text: "Active Status Confirmed via DentalXChange API. Eligible for PPO network benefits."
      },
      {
        icon: BrainCircuit,
        color: colors.primary,
        title: "Financial Details",
        text: "Annual Maximum: $2,000 / Deductible: $50 Met. Basic Restorative: 80% Coverage."
      },
      {
        icon: FileText,
        color: colors.textSecondary,
        title: "Coverage Limits",
        text: "Prophylaxis: 2 per year. Bitewings: 1 per year. Major Restorative requires 6-month waiting period."
      }
    ]
  };

  const mockData = insightType === 'xray' ? xrayData : insightType === 'prescription' ? rxData : insightType === 'insurance' ? insuranceCardData : standardData;

  return (
    <View style={s.screen}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        
        {/* Success Header */}
        <View style={s.successHeader}>
          <CheckCircle size={48} color={colors.success} style={{ marginBottom: spacing.sm }} />
          <Text style={s.successTitle}>Scan Processed</Text>
          <Text style={s.successSubtitle}>Document digitized and parsed successfully.</Text>
        </View>

        {/* Extracted Metadata */}
        <Card style={s.metadataCard}>
          <Text style={s.cardTitle}>Document Details</Text>
          <View style={s.metaRow}>
            <FileText size={18} color={colors.textTertiary} />
            <Text style={s.metaLabel}>Name:</Text>
            <Text style={s.metaVal}>{mockData.docName}</Text>
          </View>
          <View style={s.metaRow}>
            <Calendar size={18} color={colors.textTertiary} />
            <Text style={s.metaLabel}>Visit Date:</Text>
            <Text style={s.metaVal}>{mockData.date}</Text>
          </View>
        </Card>

        {/* AI Integration Insights */}
        <View style={s.insightsHeader}>
          <BrainCircuit size={20} color={colors.primary} />
          <Text style={s.insightsTitle}>Medical-Dental Insights</Text>
        </View>
        <Text style={s.insightsDesc}>Our AI cross-referenced this dental record against your medical history to derive the following observations.</Text>

        {mockData.insights.map((ins, i) => (
          <Card key={i} style={s.insightItem}>
            <View style={[s.insightIconBox, { backgroundColor: ins.color + '20' }]}>
              <ins.icon size={20} color={ins.color} />
            </View>
            <View style={s.insightContent}>
              <Text style={s.insightItemTitle}>{ins.title}</Text>
              <Text style={s.insightItemText}>{ins.text}</Text>
            </View>
          </Card>
        ))}

      </ScrollView>

      <View style={s.footer}>
        <Pressable 
          style={s.saveBtn} 
          onPress={() => {
            if (insightType === 'insurance') {
              addInsurancePolicy({
                type: 'dental',
                provider: 'MetLife PPO',
                policyNumber: 'ML-7893041',
                groupNumber: 'GRP-99442',
                primaryHolder: 'John Doe',
                dependents: 0,
                coverageStart: 'Jan 1, 2026',
                active: true,
                lines: [
                  { label: 'Annual Maximum', value: '$2,000 Remaining / $2,000', highlight: true },
                  { label: 'Deductible', value: '$0 / $50 Met', highlight: true },
                  { label: 'Preventive Care', value: '100%', highlight: true },
                  { label: 'Basic Procedures', value: '80%', highlight: true },
                  { label: 'Major Procedures', value: '50%', highlight: true },
                ],
                customerService: '1-800-METLIFE',
                portalLabel: 'Access MetLife Portal',
              });
              router.navigate('/(tabs)/dashboard');
            } else {
              // Save the mock extracted data to the global context
              addRecord({
                id: `rec-${Date.now()}`,
                title: mockData.docName,
                date: mockData.date,
                providerName: mockData.provider,
                category: mockData.category as any,
                fileUrl: 'mock-file-url',
                summary: 'Analyzed clinical document via AI Upload.',
              });
              // Navigate back to records tab to see the new addition
              router.navigate('/(tabs)/records');
            }
          }}
        >
          <Text style={s.saveBtnText}>Save to Health Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.md,
  },
  successTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metadataCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    ...shadow.sm,
  },
  cardTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  metaLabel: {
    ...typography.body,
    color: colors.textSecondary,
    width: 80,
  },
  metaVal: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  insightsTitle: {
    ...typography.title3,
    color: colors.primaryDark,
  },
  insightsDesc: {
    ...typography.callout,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  insightItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  insightIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightItemTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  insightItemText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingBottom: 40, // safe area approx
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    ...typography.headline,
    color: colors.textInverse,
  }
});
