export type AppointmentType = 'IN_PERSON' | 'VIRTUAL';
export type AppointmentStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  title: string;
  providerName: string;
  specialty: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  location?: string;
  notes?: string;
}

export type RecordCategory = 'LAB' | 'IMAGING' | 'VISIT' | 'PROCEDURE' | 'PRESCRIPTION' | 'OTHER';

export interface HealthRecord {
  id: string;
  title: string;
  category: RecordCategory;
  date: string;
  providerName: string;
  summary: string;
  fileUrl?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  refillDate?: string;
  pillsRemaining?: number;
  totalPills?: number;
  instructions?: string;
  isActive: boolean;
}

export type ReferralDirection = 'MED_TO_DENTAL' | 'DENTAL_TO_MED';
export type ReferralStatus = 'DRAFT' | 'SENT' | 'RECEIVED' | 'IN_REVIEW' | 'ACCEPTED' | 'SCHEDULED' | 'COMPLETED' | 'DECLINED';

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  npi?: string;
  phone: string;
  address: string;
  secureFax?: string;
  email: string;
  type: 'MEDICAL' | 'DENTAL';
}

export interface Referral {
  id: string;
  direction: ReferralDirection;
  patientName: string;
  patientDOB?: string;
  reason: string;
  notes: string;
  fromProviderId: string;
  toProviderId: string;
  attachments: string[];
  status: ReferralStatus;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthStat {
  id: string;
  label: string;
  value: string;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  color: string;
  icon: string;
}

export interface ADAHealthHistory {
  id: string;
  completedAt: string;

  patientInfo: {
    lastName: string;
    firstName: string;
    middleInitial?: string;
    dateOfBirth: string;
    sex: 'Male' | 'Female' | 'Other' | '';
    homeAddress: string;
    city: string;
    state: string;
    zip: string;
    homePhone: string;
    cellPhone: string;
    email: string;
    occupation: string;
    socialSecurityNumber?: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
  };

  dentalInfo: {
    reasonForVisit: string;
    previousDentist: string;
    dateOfLastVisit: string;
    dateOfLastXrays: string;
    hasJawPain: boolean;
    hasClickingJaw: boolean;
    hasSoreJawMuscles: boolean;
    hasDifficultyOpening: boolean;
    clenchesTeeth: boolean;
    grindsTeeth: boolean;
    hasBitingHabit: boolean;
    hasOrthodonticTreatment: boolean;
    hasPeriodontitis: boolean;
    hasBleedingGums: boolean;
    hasSensitiveTeeth: boolean;
    hasBadBreath: boolean;
    hasSoresOrGrowths: boolean;
    usesTobacco: boolean;
    tobaccoType?: string;
    satisfiedWithSmile: boolean;
    additionalDentalConcerns?: string;
  };

  medicalConditions: {
    heartDisease: boolean;
    heartAttack: boolean;
    heartMurmur: boolean;
    rheumaticFever: boolean;
    highBloodPressure: boolean;
    lowBloodPressure: boolean;
    mitralValveProlapse: boolean;
    chestPain: boolean;
    angina: boolean;
    stroke: boolean;
    pacemaker: boolean;
    artificialHeart: boolean;
    anemia: boolean;
    bleedingDisorder: boolean;
    hemophilia: boolean;
    leukemia: boolean;
    diabetes: boolean;
    diabetesType?: 'Type 1' | 'Type 2' | '';
    thyroidDisease: boolean;
    hepatitis: boolean;
    hepatitisType?: 'A' | 'B' | 'C' | '';
    liverDisease: boolean;
    jaundice: boolean;
    hivPositive: boolean;
    aids: boolean;
    arthritis: boolean;
    rheumatism: boolean;
    cortisoneTherapy: boolean;
    asthma: boolean;
    hayfever: boolean;
    sinusProblems: boolean;
    allergies: boolean;
    tuberculosis: boolean;
    emphysema: boolean;
    respiratoryProblems: boolean;
    epilepsy: boolean;
    seizures: boolean;
    fainting: boolean;
    nervousness: boolean;
    psychiatricTreatment: boolean;
    kidneyDisease: boolean;
    ulcers: boolean;
    stomachProblems: boolean;
    cancer: boolean;
    cancerType?: string;
    radiationTherapy: boolean;
    chemotherapy: boolean;
    prostheticJoint: boolean;
    prostheticJointType?: string;
    glaucoma: boolean;
    contactLenses: boolean;
    skinRash: boolean;
    otherConditions?: string;
  };

  allergyInfo: {
    localAnesthetics: boolean;
    penicillin: boolean;
    antibiotics: boolean;
    sulfa: boolean;
    barbiturates: boolean;
    sedatives: boolean;
    aspirin: boolean;
    ibuprofen: boolean;
    codeine: boolean;
    latex: boolean;
    metals: boolean;
    acrylic: boolean;
    otherAllergies?: string;
  };

  medicationInfo: {
    currentMedications: string;
    overTheCounterMeds: string;
    vitaminsOrSupplements: string;
  };

  womenHealth: {
    isPregnant: boolean | null;
    isNursing: boolean | null;
    takesBirthControl: boolean | null;
    dueDate?: string;
  };

  additionalInfo: {
    hasBeenHospitalized: boolean;
    hospitalizationReason?: string;
    hasBloodTransfusion: boolean;
    hasDrugAlcoholDependency: boolean;
    useRecreationalDrugs: boolean;
    hasSpecialDiet: boolean;
    dietDetails?: string;
    physicianName: string;
    physicianPhone: string;
    dateOfLastPhysical: string;
  };

  consent: {
    patientSignature: string;
    signatureDate: string;
    parentGuardianSignature?: string;
  };
}

export interface UserProfile {
  id: string;
  total_points: number;
  current_level: number;
  current_streak: number;
  last_streak_date?: string;
  avatar_url?: string;
}

export interface CompletedChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  completed_at: string;
}
