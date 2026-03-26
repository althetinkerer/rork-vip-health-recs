import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, HealthRecord, Medication, Provider, Referral, ADAHealthHistory } from '@/types';
import { mockAppointments, mockRecords, mockMedications, mockProviders, mockReferrals } from '@/mocks/data';

const KEYS = {
  APPOINTMENTS: 'vhr_appointments',
  RECORDS: 'vhr_records',
  MEDICATIONS: 'vhr_medications',
  PROVIDERS: 'vhr_providers',
  REFERRALS: 'vhr_referrals',
  HEALTH_HISTORIES: 'vhr_health_histories',
  ONBOARDING_COMPLETE: 'vhr_onboarding_complete',
  SEEDED: 'vhr_seeded',
  AUTH: 'vhr_auth',
  PHONE_NUMBER: 'vhr_phone_number',
} as const;

async function getItem<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.log('Repository getItem error:', e);
    return [];
  }
}

async function setItem<T>(key: string, data: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.log('Repository setItem error:', e);
  }
}

export async function seedData(): Promise<void> {
  try {
    const seeded = await AsyncStorage.getItem(KEYS.SEEDED);
    if (seeded === 'true') {
      console.log('Data already seeded');
      return;
    }
    await Promise.all([
      setItem(KEYS.APPOINTMENTS, mockAppointments),
      setItem(KEYS.RECORDS, mockRecords),
      setItem(KEYS.MEDICATIONS, mockMedications),
      setItem(KEYS.PROVIDERS, mockProviders),
      setItem(KEYS.REFERRALS, mockReferrals),
    ]);
    await AsyncStorage.setItem(KEYS.SEEDED, 'true');
    console.log('Seed data initialized');
  } catch (e) {
    console.log('Seed error:', e);
  }
}

export async function getAppointments(): Promise<Appointment[]> {
  return getItem<Appointment>(KEYS.APPOINTMENTS);
}

export async function getAppointmentById(id: string): Promise<Appointment | undefined> {
  const items = await getAppointments();
  return items.find(i => i.id === id);
}

export async function addAppointment(item: Appointment): Promise<void> {
  const items = await getAppointments();
  items.unshift(item);
  await setItem(KEYS.APPOINTMENTS, items);
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> {
  const items = await getAppointments();
  const idx = items.findIndex(i => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates };
    await setItem(KEYS.APPOINTMENTS, items);
  }
}

export async function getRecords(): Promise<HealthRecord[]> {
  return getItem<HealthRecord>(KEYS.RECORDS);
}

export async function getRecordById(id: string): Promise<HealthRecord | undefined> {
  const items = await getRecords();
  return items.find(i => i.id === id);
}

export async function addRecord(item: HealthRecord): Promise<void> {
  const items = await getRecords();
  items.unshift(item);
  await setItem(KEYS.RECORDS, items);
}

export async function getMedications(): Promise<Medication[]> {
  return getItem<Medication>(KEYS.MEDICATIONS);
}

export async function getMedicationById(id: string): Promise<Medication | undefined> {
  const items = await getMedications();
  return items.find(i => i.id === id);
}

export async function addMedication(item: Medication): Promise<void> {
  const items = await getMedications();
  items.unshift(item);
  await setItem(KEYS.MEDICATIONS, items);
}

export async function updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
  const items = await getMedications();
  const idx = items.findIndex(i => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates };
    await setItem(KEYS.MEDICATIONS, items);
  }
}

export async function getProviders(): Promise<Provider[]> {
  return getItem<Provider>(KEYS.PROVIDERS);
}

export async function getProviderById(id: string): Promise<Provider | undefined> {
  const items = await getProviders();
  return items.find(i => i.id === id);
}

export async function getReferrals(): Promise<Referral[]> {
  return getItem<Referral>(KEYS.REFERRALS);
}

export async function getReferralById(id: string): Promise<Referral | undefined> {
  const items = await getReferrals();
  return items.find(i => i.id === id);
}

export async function addReferral(item: Referral): Promise<void> {
  const items = await getReferrals();
  items.unshift(item);
  await setItem(KEYS.REFERRALS, items);
}

export async function updateReferral(id: string, updates: Partial<Referral>): Promise<void> {
  const items = await getReferrals();
  const idx = items.findIndex(i => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    await setItem(KEYS.REFERRALS, items);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.AUTH);
  return val === 'true';
}

export async function setAuthenticated(val: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.AUTH, val ? 'true' : 'false');
}

export async function getPhoneNumber(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.PHONE_NUMBER);
}

export async function setPhoneNumber(phone: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.PHONE_NUMBER, phone);
}

export async function getHealthHistories(): Promise<ADAHealthHistory[]> {
  return getItem<ADAHealthHistory>(KEYS.HEALTH_HISTORIES);
}

export async function getHealthHistoryById(id: string): Promise<ADAHealthHistory | undefined> {
  const items = await getHealthHistories();
  return items.find(i => i.id === id);
}

export async function addHealthHistory(item: ADAHealthHistory): Promise<void> {
  const items = await getHealthHistories();
  items.unshift(item);
  await setItem(KEYS.HEALTH_HISTORIES, items);
}

export async function isOnboardingComplete(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
  return val === 'true';
}

export async function setOnboardingComplete(val: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, val ? 'true' : 'false');
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
