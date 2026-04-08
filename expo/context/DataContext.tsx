import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '@/lib/supabase';
import * as repo from '@/data/repository';
import { Appointment, Medication, Provider, Referral, ADAHealthHistory } from '@/types';

export const [DataProvider, useData] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isSeeded, setIsSeeded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

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
    mutationFn: ({ imageUri, ext }: { imageUri: string; ext: string }) => repo.uploadAvatar(imageUri, ext),
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
  }), [
    isSeeded, isAuthenticated, isOnboarded, phoneNumber, login, verifyOtp, logout, completeOnboarding,
    appointmentsQuery.data, appointmentsQuery.isLoading, addAppointmentMutation.mutate, updateAppointmentMutation.mutate,
    recordsQuery.data, recordsQuery.isLoading, addRecordMutation.mutate,
    medicationsQuery.data, medicationsQuery.isLoading, addMedicationMutation.mutate, updateMedicationMutation.mutate,
    providersQuery.data, providersQuery.isLoading, getProvider,
    referralsQuery.data, referralsQuery.isLoading, addReferralMutation.mutate, updateReferralMutation.mutate,
    healthHistoriesQuery.data, healthHistoriesQuery.isLoading, addHealthHistoryMutation.mutate,
    gamificationProfileQuery.data, completedChallengesQuery.data, completeDailyChallengeMutation.mutate,
    refetchAll,
  ]);
});
