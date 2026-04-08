import { supabase } from '@/lib/supabase';
import { Appointment, HealthRecord, Medication, Provider, Referral, ADAHealthHistory } from '@/types';
import { mockAppointments, mockRecords, mockMedications, mockProviders, mockReferrals } from '@/mocks/data';

// --- Seed Data ---
export async function seedData(): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return;

  // Check if already seeded by fetching one record
  const { data: existingAppts } = await supabase.from('appointments').select('id').limit(1);
  if (existingAppts && existingAppts.length > 0) {
    console.log('Data already seeded');
    return;
  }

  // Strip ids to let Supabase generate them, and convert camelCase to snake_case if necessary
  // Wait, in my schema I used provider_name instead of providerName etc! Mocks use camelCase.
  // Let's transform them safely.
  try {
    const insertAppts = mockAppointments.map(({ id, ...rest }) => ({
      title: rest.title,
      provider_name: rest.providerName,
      specialty: rest.specialty,
      date: rest.date,
      time: rest.time,
      type: rest.type,
      status: rest.status,
      location: rest.location,
      notes: rest.notes,
    }));
    await supabase.from('appointments').insert(insertAppts);

    const insertRecords = mockRecords.map(({ id, ...rest }) => ({
      title: rest.title,
      category: rest.category,
      date: rest.date,
      provider_name: rest.providerName,
      summary: rest.summary,
      file_url: rest.fileUrl,
    }));
    await supabase.from('health_records').insert(insertRecords);

    const insertMeds = mockMedications.map(({ id, ...rest }) => ({
      name: rest.name,
      dosage: rest.dosage,
      frequency: rest.frequency,
      prescribed_by: rest.prescribedBy,
      start_date: rest.startDate,
      end_date: rest.endDate,
      refill_date: rest.refillDate,
      pills_remaining: rest.pillsRemaining,
      total_pills: rest.totalPills,
      instructions: rest.instructions,
      is_active: rest.isActive,
    }));
    await supabase.from('medications').insert(insertMeds);

    const insertProviders = mockProviders.map(({ id, ...rest }) => ({
      name: rest.name,
      specialty: rest.specialty,
      npi: rest.npi,
      phone: rest.phone,
      address: rest.address,
      secure_fax: rest.secureFax,
      email: rest.email,
      type: rest.type,
    }));
    await supabase.from('providers').insert(insertProviders);

    const insertReferrals = mockReferrals.map(({ id, ...rest }) => ({
      direction: rest.direction,
      patient_name: rest.patientName,
      patient_dob: rest.patientDOB,
      reason: rest.reason,
      notes: rest.notes,
      from_provider_id: rest.fromProviderId,
      to_provider_id: rest.toProviderId,
      attachments: rest.attachments,
      status: rest.status,
      scheduled_date: rest.scheduledDate,
    }));
    await supabase.from('referrals').insert(insertReferrals);

    console.log('Seed data initialized');
  } catch (e) {
    console.log('Seed error:', e);
  }
}

// --- Appointments ---
export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map((d: any) => ({
    ...d,
    providerName: d.provider_name,
  })) as Appointment[];
}

export async function addAppointment(item: Appointment): Promise<void> {
  const { id, providerName, ...rest } = item;
  await supabase.from('appointments').insert([{ ...rest, provider_name: providerName }]);
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<void> {
  const payload: any = { ...updates };
  if (payload.providerName) {
    payload.provider_name = payload.providerName;
    delete payload.providerName;
  }
  await supabase.from('appointments').update(payload).eq('id', id);
}

// --- Records ---
export async function getRecords(): Promise<HealthRecord[]> {
  const { data, error } = await supabase.from('health_records').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map((d: any) => ({
    ...d,
    providerName: d.provider_name,
    fileUrl: d.file_url,
  })) as HealthRecord[];
}

export async function addRecord(item: HealthRecord): Promise<void> {
  const { id, providerName, fileUrl, ...rest } = item;
  await supabase.from('health_records').insert([{
    ...rest,
    provider_name: providerName,
    file_url: fileUrl,
  }]);
}

// --- Medications ---
export async function getMedications(): Promise<Medication[]> {
  const { data, error } = await supabase.from('medications').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map((d: any) => ({
    ...d,
    prescribedBy: d.prescribed_by,
    startDate: d.start_date,
    endDate: d.end_date,
    refillDate: d.refill_date,
    pillsRemaining: d.pills_remaining,
    totalPills: d.total_pills,
    isActive: d.is_active,
  })) as Medication[];
}

export async function addMedication(item: Medication): Promise<void> {
  const { id, prescribedBy, startDate, endDate, refillDate, pillsRemaining, totalPills, isActive, ...rest } = item;
  await supabase.from('medications').insert([{
    ...rest,
    prescribed_by: prescribedBy,
    start_date: startDate,
    end_date: endDate,
    refill_date: refillDate,
    pills_remaining: pillsRemaining,
    total_pills: totalPills,
    is_active: isActive,
  }]);
}

export async function updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
  const payload: any = { ...updates };
  if ('isActive' in payload) { payload.is_active = payload.isActive; delete payload.isActive; }
  await supabase.from('medications').update(payload).eq('id', id);
}

// --- Providers ---
export async function getProviders(): Promise<Provider[]> {
  const { data, error } = await supabase.from('providers').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map((d: any) => ({
    ...d,
    secureFax: d.secure_fax,
  })) as Provider[];
}

// --- Referrals ---
export async function getReferrals(): Promise<Referral[]> {
  const { data, error } = await supabase.from('referrals').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map((d: any) => ({
    ...d,
    patientName: d.patient_name,
    patientDOB: d.patient_dob,
    fromProviderId: d.from_provider_id,
    toProviderId: d.to_provider_id,
    scheduledDate: d.scheduled_date,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  })) as Referral[];
}

export async function addReferral(item: Referral): Promise<void> {
  const { id, patientName, patientDOB, fromProviderId, toProviderId, scheduledDate, createdAt, updatedAt, ...rest } = item;
  await supabase.from('referrals').insert([{
    ...rest,
    patient_name: patientName,
    patient_dob: patientDOB,
    from_provider_id: fromProviderId,
    to_provider_id: toProviderId,
    scheduled_date: scheduledDate,
  }]);
}

export async function updateReferral(id: string, updates: Partial<Referral>): Promise<void> {
  const payload: any = { ...updates, updated_at: new Date().toISOString() };
  if (payload.status) { payload.status = payload.status; }
  await supabase.from('referrals').update(payload).eq('id', id);
}

// --- Auth Utilities ---
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function setAuthenticated(val: boolean): Promise<void> {
  // Controlled by supabase sessions now
}

export async function getPhoneNumber(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.phone || null;
}

export async function setPhoneNumber(phone: string): Promise<void> {
  // Managed by supabase auth
}

// --- Health Histories ---
export async function getHealthHistories(): Promise<ADAHealthHistory[]> {
  const { data, error } = await supabase.from('health_histories').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map((d: any) => ({
    id: d.id,
    completedAt: d.completed_at,
    patientInfo: d.patient_info,
    dentalInfo: d.dental_info,
    medicalConditions: d.medical_conditions,
    allergyInfo: d.allergy_info,
    medicationInfo: d.medication_info,
    womenHealth: d.women_health,
    additionalInfo: d.additional_info,
    consent: d.consent,
  })) as ADAHealthHistory[];
}

export async function addHealthHistory(item: ADAHealthHistory): Promise<void> {
  const { id, completedAt, patientInfo, dentalInfo, medicalConditions, allergyInfo, medicationInfo, womenHealth, additionalInfo, consent } = item;
  const { error } = await supabase.from('health_histories').insert([{
    completed_at: completedAt,
    patient_info: patientInfo,
    dental_info: dentalInfo,
    medical_conditions: medicalConditions,
    allergy_info: allergyInfo,
    medication_info: medicationInfo,
    women_health: womenHealth,
    additional_info: additionalInfo,
    consent: consent,
  }]);
  if (error) {
    console.error('Failed to save intake form:', error);
    throw error;
  }
}

export async function isOnboardingComplete(): Promise<boolean> {
  const histories = await getHealthHistories();
  return histories.length > 0;
}

export async function setOnboardingComplete(val: boolean): Promise<void> {
  // Infered based on history count
}

export async function clearAll(): Promise<void> {
  await supabase.auth.signOut();
}

// --- Gamification ---
export async function getGamificationProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code === 'PGRST116') {
    // If not found, insert a default row
    const defaultProfile = { id: user.id, total_points: 0, current_level: 1, current_streak: 0, avatar_url: null };
    const { data: newData, error: insertError } = await supabase
      .from('user_profiles')
      .insert([defaultProfile])
      .select()
      .single();
    if (insertError) throw insertError;
    return newData;
  }
  
  if (error) throw error;
  return data;
}

export async function addGamificationPoints(amount: number) {
  const profile = await getGamificationProfile();
  const newPoints = profile.total_points + amount;
  const newLevel = Math.floor(newPoints / 1000) + 1; // Basic level algorithm
  
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      total_points: newPoints,
      current_level: newLevel
    })
    .eq('id', profile.id);
    
  if (error) throw error;
}

export async function uploadAvatar(imageUri: string, ext: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileName = `${user.id}/${Date.now()}.${ext}`;

  // Read the local file as a blob
  const res = await fetch(imageUri);
  const blob = await res.blob();
  
  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, blob, {
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      upsert: true
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  // Update profile
  await supabase
    .from('user_profiles')
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq('id', user.id);

  return publicUrlData.publicUrl;
}

export async function getCompletedChallenges() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('completed_challenges')
    .select('challenge_id')
    .eq('user_id', user.id)
    .gte('completed_at', today.toISOString());
    
  if (error) throw error;
  return data.map(d => d.challenge_id);
}

export async function completeDailyChallenge(challengeId: string, points: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Award the points
  await addGamificationPoints(points);
  
  // Track the completed challenge
  const { error } = await supabase
    .from('completed_challenges')
    .insert([{
      user_id: user.id,
      challenge_id: challengeId
    }]);
    
  if (error) throw error;
}
