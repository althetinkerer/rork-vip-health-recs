import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Pill, FileText, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import { useData } from '@/context/DataContext';

export default function RxHistoryScreen() {
  const { medications, records } = useData();
  const router = useRouter();

  const timelineItems = useMemo(() => {
    // 1. Digital / Clinical Medications
    const meds = medications.map(m => ({
      id: `med-${m.id}`,
      type: 'MEDICATION' as const,
      dateStr: m.startDate,
      dateObj: new Date(m.startDate),
      title: m.name,
      subtitle: `Prescribed by ${m.prescribedBy}`,
      details: `${m.dosage} - ${m.frequency}`,
      status: m.isActive ? 'Active' : 'Past',
      refId: m.id
    }));

    // 2. Uploaded / Physical Prescriptions (Filtered via AI Categorization)
    const rxRecords = records
      .filter(r => r.category === 'PRESCRIPTION')
      .map(r => ({
        id: `rec-${r.id}`,
        type: 'RECORD' as const,
        dateStr: r.date,
        dateObj: new Date(r.date),
        title: r.title,
        subtitle: `Document Provider: ${r.providerName}`,
        details: 'Scanned digital file',
        status: 'Uploaded',
        refId: r.id
      }));

    // Combine & Sort Newest First
    return [...meds, ...rxRecords].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [medications, records]);

  return (
    <View style={s.screen}>
      <Stack.Screen 
        options={{
          headerTitle: 'Prescription History',
          headerBackTitle: 'Back',
          headerTintColor: colors.primary,
          headerLeft: () => (
            <Pressable 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.navigate('/(tabs)/dashboard');
                }
              }}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <ChevronLeft size={28} color={colors.primary} style={{ marginLeft: -8 }} />
              <Text style={{ color: colors.primary, fontSize: 17 }}>Back</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Unified Timeline</Text>
          <Text style={s.headerDesc}>A fused view of your active clinical medications alongside physically uploaded prescription documents.</Text>
        </View>

        <View style={s.timelineContainer}>
          {timelineItems.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>No prescription history found. Scan physical records or add clinical medications to build your timeline.</Text>
            </View>
          ) : (
            timelineItems.map((item, index) => {
              const isLast = index === timelineItems.length - 1;
              const isMed = item.type === 'MEDICATION';
              
              // Dynamic Theme Accents
              const Icon = isMed ? Pill : FileText;
              const bgColor = isMed ? '#EDE9FE' : '#E8F1FA'; // Purple vs Blue
              const iconColor = isMed ? '#8B5CF6' : colors.primary;

              return (
                <View key={item.id} style={s.timelineRow}>
                  {/* Left Axis */}
                  <View style={s.timelineLeft}>
                    <View style={[s.timelineDot, { backgroundColor: bgColor }]}>
                      <Icon size={18} color={iconColor} />
                    </View>
                    {!isLast && <View style={s.timelineLine} />}
                  </View>

                  {/* Right Content Card */}
                  <Pressable 
                    style={s.timelineCard}
                    onPress={() => {
                      if (isMed) {
                        router.navigate('/medications');
                      } else {
                        router.navigate('/records');
                      }
                    }}
                  >
                    <View style={s.cardHeader}>
                      <Text style={s.dateText}>{item.dateStr}</Text>
                      <View style={[
                        s.statusBadge, 
                        { backgroundColor: item.status === 'Active' ? '#DCFCE7' : item.status === 'Uploaded' ? '#E8F1FA' : '#F1F5F9' }
                      ]}>
                        <Text style={[
                          s.statusText, 
                          { color: item.status === 'Active' ? '#15803D' : item.status === 'Uploaded' ? colors.primaryDark : '#64748B' }
                        ]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={s.itemTitle}>{item.title}</Text>
                    <Text style={s.itemSubtitle}>{item.subtitle}</Text>
                    
                    {item.details && (
                      <View style={s.detailsBox}>
                        <Text style={s.detailsText}>{item.details}</Text>
                      </View>
                    )}

                    <View style={s.actionRow}>
                      <Text style={s.actionText}>{isMed ? 'View in Active Meds' : 'View Exported PDF'}</Text>
                      <ChevronRight size={16} color={colors.primary} />
                    </View>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerDesc: {
    ...typography.body,
    color: colors.textSecondary,
    maxWidth: '90%',
  },
  timelineContainer: {
    paddingTop: spacing.md,
  },
  emptyState: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadow.sm,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: -4,
    marginBottom: -4,
    zIndex: 1,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    marginLeft: spacing.lg,
    ...shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  detailsBox: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  detailsText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  actionText: {
    ...typography.callout,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  }
});
