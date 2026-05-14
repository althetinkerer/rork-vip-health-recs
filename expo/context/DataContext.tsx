import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import * as repo from '@/data/repository';
import { Appointment, Medication, Provider, Referral, ADAHealthHistory } from '@/types';
import { AppNotification } from '@/types/notifications';

const NOTIF_STORAGE_KEY = 'vip_notifications_meta'; // { readIds: string[], dismissedIds: string[] }

export const [DataProvider, useData] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isSeeded, setIsSeeded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  // Local UI state specifically for demonstrating Insurance OCR Upload Flow
  const [insurancePolicies, setInsurancePolicies] = useState<any[]>([]);

  // ── Notification state ──────────────────────────────────────────────────────
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const metaLoaded = useRef(false);

  // Setup Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setPhoneNumber(session?.user?.phone || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setPhoneNumber(session?.user?.phone || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle auto-refresh for Supabase
  useEffect(() => {
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void (async () => {
      await repo.seedData();
      const onboarded = await repo.isOnboardingComplete();
      setIsOnboarded(onboarded);
      setIsSeeded(true);
    })();
  }, [isAuthenticated]);

  const appointmentsQuery = useQuery({
    queryKey: ['appointments'],
    queryFn: repo.getAppointments,
    enabled: Boolean(isSeeded && isAuthenticated),
  });

  const recordsQuery = useQuery({
    queryKey: ['records'],
    queryFn: repo.getRecords,
    enabled: Boolean(isSeeded && isAuthenticated),
  });

  const medicationsQuery = useQuery({
    queryKey: ['medications'],
    queryFn: repo.getMedications,
    enabled: Boolean(isSeeded && isAuthenticated),
  });

  const providersQuery = useQuery({
    queryKey: ['providers'],
    queryFn: repo.getProviders,
    enabled: Boolean(isSeeded && isAuthenticated),
  });

  const referralsQuery = useQuery({
    queryKey: ['referrals'],
    queryFn: repo.getReferrals,
    enabled: Boolean(isSeeded && isAuthenticated),
  });

  const healthHistoriesQuery = useQuery({
    queryKey: ['healthHistories'],
    queryFn: repo.getHealthHistories,
    enabled: Boolean(isSeeded && isAuthenticated),
  });

  const gamificationProfileQuery = useQuery({
    queryKey: ['gamificationProfile'],
    queryFn: repo.getGamificationProfile,
    enabled: Boolean(isSeeded && isAuthenticated),
  });

  const completedChallengesQuery = useQuery({
    queryKey: ['completedChallenges'],
    queryFn: repo.getCompletedChallenges,
    enabled: Boolean(isSeeded && isAuthenticated),
  });

  const addAppointmentMutation = useMutation({
    mutationFn: repo.addAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Appointment> }) =>
      repo.updateAppointment(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const addRecordMutation = useMutation({
    mutationFn: repo.addRecord,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['records'] }),
  });

  const addMedicationMutation = useMutation({
    mutationFn: repo.addMedication,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medications'] }),
  });

  const updateMedicationMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Medication> }) =>
      repo.updateMedication(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medications'] }),
  });

  const addReferralMutation = useMutation({
    mutationFn: repo.addReferral,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
  });

  const updateReferralMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Referral> }) =>
      repo.updateReferral(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
  });

  const addHealthHistoryMutation = useMutation({
    mutationFn: repo.addHealthHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['healthHistories'] }),
  });

  const completeDailyChallengeMutation = useMutation({
    mutationFn: ({ challengeId, points }: { challengeId: string; points: number }) => repo.completeDailyChallenge(challengeId, points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamificationProfile'] });
      queryClient.invalidateQueries({ queryKey: ['completedChallenges'] });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: ({ imageUri, ext, base64 }: { imageUri: string; ext: string; base64: string }) => repo.uploadAvatar(imageUri, ext, base64),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamificationProfile'] });
    },
  });

  const login = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const completeOnboarding = useCallback(async (history: ADAHealthHistory) => {
    await repo.addHealthHistory(history);
    setIsOnboarded(true);
    void queryClient.invalidateQueries({ queryKey: ['healthHistories'] });
  }, [queryClient]);

  const getProvider = useCallback((id: string): Provider | undefined => {
    return (providersQuery.data as Provider[] | undefined)?.find((p: Provider) => p.id === id);
  }, [providersQuery.data]);

  const refetchAll = useCallback(() => {
    void queryClient.invalidateQueries();
  }, [queryClient]);

  const addInsurancePolicy = useCallback((policy: any) => {
    setInsurancePolicies(prev => [policy, ...prev]);
  }, []);

  // ── Load persisted read/dismissed state ─────────────────────────────────────
  useEffect(() => {
    if (metaLoaded.current) return;
    metaLoaded.current = true;
    AsyncStorage.getItem(NOTIF_STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const meta = JSON.parse(raw) as { readIds?: string[]; dismissedIds?: string[] };
        if (meta.readIds) setReadIds(new Set(meta.readIds));
        if (meta.dismissedIds) setDismissedIds(new Set(meta.dismissedIds));
      } catch { /* ignore */ }
    });
  }, []);

  const persistMeta = useCallback((rIds: Set<string>, dIds: Set<string>) => {
    void AsyncStorage.setItem(
      NOTIF_STORAGE_KEY,
      JSON.stringify({ readIds: [...rIds], dismissedIds: [...dIds] }),
    );
  }, []);

  // ── Derive notifications from live data ──────────────────────────────────────
  const allNotifications = useMemo(() => {
    const notifs: AppNotification[] = [];
    const now = new Date();

    // Appointment reminders
    const appts = (appointmentsQuery.data ?? []) as Appointment[];
    appts
      .filter(a => a.status === 'UPCOMING')
      .forEach(a => {
        notifs.push({
          id: `appt-${a.id}`,
          category: 'appointment',
          title: 'Upcoming Appointment',
          body: `${a.title} with ${a.providerName} on ${a.date} at ${a.time}`,
          timestamp: new Date(now.getTime() - 1000 * 60 * 15), // 15 min ago
          read: false,
          actionRoute: '/(tabs)/appointments',
        });
      });

    // Gamification streak
    const gp = gamificationProfileQuery.data as { current_streak?: number; total_points?: number } | undefined;
    if (gp?.current_streak && gp.current_streak > 0) {
      notifs.push({
        id: `streak-${gp.current_streak}`,
        category: 'rewards',
        title: `🔥 ${gp.current_streak}-Day Streak!`,
        body: "You're on a roll — keep completing daily challenges to grow your streak.",
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2h ago
        read: false,
        actionRoute: '/(tabs)/dashboard',
      });
    }

    // Completed challenges
    const challenges = (completedChallengesQuery.data ?? []) as Array<{ id: string; challenge_id: string; completed_at: string }>;
    if (challenges.length > 0) {
      const latest = challenges[0];
      notifs.push({
        id: `challenge-${latest.id}`,
        category: 'rewards',
        title: '🏆 Challenge Completed!',
        body: 'You earned points for completing a daily health challenge.',
        timestamp: new Date(latest.completed_at),
        read: false,
        actionRoute: '/(tabs)/dashboard',
      });
    }

    // Medication refill reminders
    const meds = (medicationsQuery.data ?? []) as Medication[];
    meds
      .filter(m => m.isActive && m.refillDate)
      .forEach(m => {
        const refillDate = new Date(m.refillDate!);
        const daysUntil = Math.ceil((refillDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 7 && daysUntil >= 0) {
          notifs.push({
            id: `refill-${m.id}`,
            category: 'medications',
            title: 'Refill Reminder',
            body: `${m.name} ${m.dosage} refill due in ${daysUntil === 0 ? 'today' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}.`,
            timestamp: new Date(now.getTime() - 1000 * 60 * 30), // 30 min ago
            read: false,
            actionRoute: '/refills',
          });
        }
      });

    // Active referral updates
    const refs = (referralsQuery.data ?? []) as Referral[];
    refs
      .filter(r => r.status !== 'COMPLETED' && r.status !== 'DRAFT')
      .slice(0, 3)
      .forEach(r => {
        const statusLabels: Record<string, string> = {
          SENT: 'Sent', RECEIVED: 'Received', IN_REVIEW: 'In Review',
          ACCEPTED: 'Accepted', SCHEDULED: 'Scheduled', DECLINED: 'Declined',
        };
        notifs.push({
          id: `referral-${r.id}`,
          category: 'referrals',
          title: 'Referral Update',
          body: `Referral for "${r.reason}" is now ${statusLabels[r.status] ?? r.status}.`,
          timestamp: new Date(r.updatedAt),
          read: false,
          actionRoute: '/(tabs)/referrals',
        });
      });

    // New records
    const recs = (recordsQuery.data ?? []) as Array<{ id: string; title: string; date: string; providerName: string }>;
    if (recs.length > 0) {
      const latest = recs[0];
      notifs.push({
        id: `record-${latest.id}`,
        category: 'records',
        title: 'New Health Record',
        body: `"${latest.title}" from ${latest.providerName} is now available.`,
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5), // 5h ago
        read: false,
        actionRoute: '/(tabs)/records',
      });
    }

    // Insurance nudge when no policy
    if (insurancePolicies.length === 0) {
      notifs.push({
        id: 'insurance-nudge',
        category: 'insurance',
        title: 'Add Your Insurance',
        body: 'Upload your insurance card to instantly verify coverage and financial limits.',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 day ago
        read: false,
        actionRoute: '/upload',
      });
    }

    // Apply read/dismissed state
    return notifs
      .filter(n => !dismissedIds.has(n.id))
      .map(n => ({ ...n, read: readIds.has(n.id) }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [
    appointmentsQuery.data, gamificationProfileQuery.data, completedChallengesQuery.data,
    medicationsQuery.data, referralsQuery.data, recordsQuery.data,
    insurancePolicies, readIds, dismissedIds,
  ]);

  const unreadCount = useMemo(
    () => allNotifications.filter(n => !n.read).length,
    [allNotifications],
  );

  const markRead = useCallback((id: string) => {
    setReadIds(prev => {
      const next = new Set(prev).add(id);
      persistMeta(next, dismissedIds);
      return next;
    });
  }, [dismissedIds, persistMeta]);

  const markAllRead = useCallback(() => {
    setReadIds(prev => {
      const next = new Set([...prev, ...allNotifications.map(n => n.id)]);
      persistMeta(next, dismissedIds);
      return next;
    });
  }, [allNotifications, dismissedIds, persistMeta]);

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev).add(id);
      persistMeta(readIds, next);
      return next;
    });
  }, [readIds, persistMeta]);

  return useMemo(() => ({
    isSeeded,
    isAuthenticated,
    isOnboarded,
    phoneNumber,
    login,
    verifyOtp,
    logout,
    completeOnboarding,
    appointments: appointmentsQuery.data ?? [],
    appointmentsLoading: appointmentsQuery.isLoading,
    addAppointment: addAppointmentMutation.mutate,
    updateAppointment: updateAppointmentMutation.mutate,
    records: recordsQuery.data ?? [],
    recordsLoading: recordsQuery.isLoading,
    addRecord: addRecordMutation.mutate,
    medications: medicationsQuery.data ?? [],
    medicationsLoading: medicationsQuery.isLoading,
    addMedication: addMedicationMutation.mutate,
    updateMedication: updateMedicationMutation.mutate,
    providers: providersQuery.data ?? [],
    providersLoading: providersQuery.isLoading,
    getProvider,
    referrals: referralsQuery.data ?? [],
    referralsLoading: referralsQuery.isLoading,
    addReferral: addReferralMutation.mutate,
    updateReferral: updateReferralMutation.mutate,
    healthHistories: healthHistoriesQuery.data ?? [],
    healthHistoriesLoading: healthHistoriesQuery.isLoading,
    addHealthHistory: addHealthHistoryMutation.mutate,
    gamificationProfile: gamificationProfileQuery.data,
    completedChallenges: completedChallengesQuery.data ?? [],
    completeDailyChallenge: completeDailyChallengeMutation.mutate,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    refetchAll,
    insurancePolicies,
    addInsurancePolicy,
    notifications: allNotifications,
    unreadCount,
    markRead,
    markAllRead,
    dismissNotification,
  }), [
    isSeeded, isAuthenticated, isOnboarded, phoneNumber, login, verifyOtp, logout, completeOnboarding,
    appointmentsQuery.data, appointmentsQuery.isLoading, addAppointmentMutation.mutate, updateAppointmentMutation.mutate,
    recordsQuery.data, recordsQuery.isLoading, addRecordMutation.mutate,
    medicationsQuery.data, medicationsQuery.isLoading, addMedicationMutation.mutate, updateMedicationMutation.mutate,
    providersQuery.data, providersQuery.isLoading, getProvider,
    referralsQuery.data, referralsQuery.isLoading, addReferralMutation.mutate, updateReferralMutation.mutate,
    healthHistoriesQuery.data, healthHistoriesQuery.isLoading, addHealthHistoryMutation.mutate,
    gamificationProfileQuery.data, completedChallengesQuery.data, completeDailyChallengeMutation.mutate,
    refetchAll, insurancePolicies, addInsurancePolicy,
    allNotifications, unreadCount, markRead, markAllRead, dismissNotification,
  ]);
});
