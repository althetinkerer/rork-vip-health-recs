import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import * as repo from '@/data/repository';
import { Appointment, Medication, Provider, Referral, ADAHealthHistory } from '@/types';

export const [DataProvider, useData] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isSeeded, setIsSeeded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    void (async () => {
      await repo.seedData();
      const auth = await repo.isAuthenticated();
      const onboarded = await repo.isOnboardingComplete();
      setIsAuthenticated(auth);
      setIsOnboarded(onboarded);
      setIsSeeded(true);
    })();
  }, []);

  const appointmentsQuery = useQuery({
    queryKey: ['appointments'],
    queryFn: repo.getAppointments,
    enabled: isSeeded,
  });

  const recordsQuery = useQuery({
    queryKey: ['records'],
    queryFn: repo.getRecords,
    enabled: isSeeded,
  });

  const medicationsQuery = useQuery({
    queryKey: ['medications'],
    queryFn: repo.getMedications,
    enabled: isSeeded,
  });

  const providersQuery = useQuery({
    queryKey: ['providers'],
    queryFn: repo.getProviders,
    enabled: isSeeded,
  });

  const referralsQuery = useQuery({
    queryKey: ['referrals'],
    queryFn: repo.getReferrals,
    enabled: isSeeded,
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

  const healthHistoriesQuery = useQuery({
    queryKey: ['healthHistories'],
    queryFn: repo.getHealthHistories,
    enabled: isSeeded,
  });

  const addHealthHistoryMutation = useMutation({
    mutationFn: repo.addHealthHistory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['healthHistories'] }),
  });

  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const stored = await repo.getPhoneNumber();
      if (stored) setPhoneNumber(stored);
    })();
  }, []);

  const login = useCallback(async (phone: string) => {
    await repo.setPhoneNumber(phone);
    await repo.setAuthenticated(true);
    setPhoneNumber(phone);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await repo.setAuthenticated(false);
    setIsAuthenticated(false);
  }, []);

  const completeOnboarding = useCallback(async (history: ADAHealthHistory) => {
    await repo.addHealthHistory(history);
    await repo.setOnboardingComplete(true);
    setIsOnboarded(true);
    void queryClient.invalidateQueries({ queryKey: ['healthHistories'] });
  }, [queryClient]);

  const getProvider = useCallback((id: string): Provider | undefined => {
    return providersQuery.data?.find(p => p.id === id);
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
    refetchAll,
  }), [
    isSeeded, isAuthenticated, isOnboarded, phoneNumber, login, logout, completeOnboarding,
    appointmentsQuery.data, appointmentsQuery.isLoading, addAppointmentMutation.mutate, updateAppointmentMutation.mutate,
    recordsQuery.data, recordsQuery.isLoading, addRecordMutation.mutate,
    medicationsQuery.data, medicationsQuery.isLoading, addMedicationMutation.mutate, updateMedicationMutation.mutate,
    providersQuery.data, providersQuery.isLoading, getProvider,
    referralsQuery.data, referralsQuery.isLoading, addReferralMutation.mutate, updateReferralMutation.mutate,
    healthHistoriesQuery.data, healthHistoriesQuery.isLoading, addHealthHistoryMutation.mutate,
    refetchAll,
  ]);
});
