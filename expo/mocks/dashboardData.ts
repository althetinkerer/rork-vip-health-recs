export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  icon: string;
}

export interface WeeklyGoal {
  id: string;
  label: string;
  current: number;
  target: number;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  date?: string;
  earned: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  initials: string;
  points: number;
  isYou: boolean;
}

export interface InsuranceInfo {
  type: 'dental' | 'medical';
  provider: string;
  policyNumber: string;
  groupNumber: string;
  primaryHolder: string;
  dependents: number;
  coverageStart: string;
  active: boolean;
  lines: { label: string; value: string; highlight?: boolean }[];
  customerService: string;
  portalLabel: string;
}

export interface InsightCard {
  id: string;
  type: 'warning' | 'info' | 'positive';
  title: string;
  description: string;
  actionLabel: string;
}

export interface ToothData {
  number: number;
  status: 'healthy' | 'cavity' | 'filling' | 'crown' | 'rootCanal' | 'implant' | 'missing';
}

export interface DashboardAppointment {
  id: string;
  category: string;
  title: string;
  provider: string;
  date: string;
  location: string;
  iconColor: string;
  bgColor: string;
}

export interface DashboardRecord {
  id: string;
  title: string;
  date: string;
  provider: string;
}

export interface DashboardReferral {
  id: string;
  refNumber: string;
  status: string;
  statusColor: string;
  priority: string;
  priorityColor: string;
  date: string;
  fromDoctor: { name: string; specialty: string };
  toDoctor: { name: string; specialty: string };
  reason: string;
  description: string;
}

export interface EducationalResource {
  id: string;
  type: 'Article' | 'Video' | 'Guide';
  duration: string;
  title: string;
  imageUrl: string;
}

export const quickActions: QuickAction[] = [
  { id: '1', label: 'Book\nAppointment', icon: 'Calendar', color: '#1E6BB8', bgColor: '#E8F1FA' },
  { id: '2', label: 'Message\nProvider', icon: 'MessageSquare', color: '#22C55E', bgColor: '#DCFCE7' },
  { id: '3', label: 'Upload\nRecords', icon: 'Upload', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { id: '4', label: 'Request\nPrescription', icon: 'FileText', color: '#F97316', bgColor: '#FFF7ED' },
  { id: '5', label: 'View\nMedications', icon: 'Pill', color: '#1E6BB8', bgColor: '#E8F1FA' },
  { id: '6', label: 'Request\nRefill', icon: 'RefreshCw', color: '#22C55E', bgColor: '#DCFCE7' },
  { id: '7', label: 'Prescription\nHistory', icon: 'ClipboardList', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { id: '8', label: 'Set\nReminders', icon: 'Clock', color: '#F97316', bgColor: '#FFF7ED' },
];

export const healthRewards = {
  totalPoints: 1250,
  currentLevel: 8,
  pointsToNextLevel: 250,
  currentStreak: 12,
};

export const dailyChallenges: DailyChallenge[] = [
  { id: '1', title: 'Morning Brush', description: 'Log your morning tooth brushing', points: 50, completed: true, icon: 'CheckCircle' },
  { id: '2', title: 'Evening Brush', description: 'Log your evening tooth brushing', points: 50, completed: false, icon: 'Circle' },
  { id: '3', title: 'Learn About Periodontal Disease', description: 'Read 1 educational article today', points: 75, completed: false, icon: 'BookOpen' },
  { id: '4', title: 'Schedule Preventive Care', description: 'Book your next dental checkup', points: 100, completed: false, icon: 'Calendar' },
];

export const weeklyGoals: WeeklyGoal[] = [
  { id: '1', label: 'Brush Sessions', current: 10, target: 14 },
  { id: '2', label: 'Articles Read', current: 3, target: 5 },
  { id: '3', label: 'Appointments', current: 1, target: 2 },
];

export const achievements: Achievement[] = [
  { id: '1', name: 'Week Warrior', icon: 'Flame', date: 'Feb 4, 2026', earned: true },
  { id: '2', name: 'Prevention Pioneer', icon: 'Calendar', date: 'Jan 28, 2026', earned: true },
  { id: '3', name: 'Knowledge Seeker', icon: 'BookOpen', date: 'Feb 1, 2026', earned: true },
  { id: '4', name: 'Monthly Master', icon: 'Crown', date: undefined, earned: false },
  { id: '5', name: 'Health Advocate', icon: 'Users', date: undefined, earned: false },
  { id: '6', name: 'Perfect Week', icon: 'Star', date: undefined, earned: false },
];

export const leaderboard: LeaderboardEntry[] = [
  { id: '1', name: 'Sarah M.', initials: 'SM', points: 2150, isYou: false },
  { id: '2', name: 'John D.', initials: 'JD', points: 1890, isYou: false },
  { id: '3', name: 'You', initials: 'ME', points: 1250, isYou: true },
  { id: '4', name: 'Emily R.', initials: 'ER', points: 1120, isYou: false },
  { id: '5', name: 'Mike K.', initials: 'MK', points: 980, isYou: false },
];

export const insuranceData: InsuranceInfo[] = [
  {
    type: 'dental',
    provider: 'Delta Dental PPO',
    policyNumber: 'DD-9876543',
    groupNumber: 'GRP-12345',
    primaryHolder: 'John Doe',
    dependents: 2,
    coverageStart: 'Jan 1, 2024',
    active: true,
    lines: [
      { label: 'Annual Maximum', value: '$1,200 Remaining / $1,500', highlight: true },
      { label: 'Deductible', value: '$50 / $50 Met', highlight: true },
      { label: 'Preventive Care', value: '100%', highlight: true },
      { label: 'Basic Procedures', value: '80%', highlight: true },
      { label: 'Major Procedures', value: '50%', highlight: true },
    ],
    customerService: '1-800-DENTAL-1',
    portalLabel: 'Access Delta Dental Portal',
  },
  {
    type: 'medical',
    provider: 'Blue Cross Blue Shield',
    policyNumber: 'BC-1234567',
    groupNumber: 'GRP-87890',
    primaryHolder: 'John Doe',
    dependents: 2,
    coverageStart: 'Jan 1, 2024',
    active: true,
    lines: [
      { label: 'Deductible', value: '$1,250 / $2,000', highlight: true },
      { label: 'Out-of-Pocket Max', value: '$2,800 / $6,000', highlight: true },
      { label: 'Copay (Primary)', value: '$25' },
      { label: 'Copay (Specialist)', value: '$50' },
    ],
    customerService: '1-800-MEDICAL',
    portalLabel: 'Access BCBS Portal',
  },
];

export const insights: InsightCard[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Gum Disease Risk',
    description: 'Your recent blood sugar levels (HbA1c: 7.2%) may increase risk of periodontal disease. Schedule a dental checkup.',
    actionLabel: 'Book Dental Appointment →',
  },
  {
    id: '2',
    type: 'info',
    title: 'Medication Impact',
    description: 'Your blood pressure medication may cause dry mouth. Discuss with your dentist about preventive care.',
    actionLabel: 'Learn More →',
  },
  {
    id: '3',
    type: 'positive',
    title: 'Positive Connection',
    description: 'Recent dental cleaning has reduced oral bacteria. This may contribute to better cardiovascular health.',
    actionLabel: 'View Details →',
  },
];

export const upperRightTeeth: ToothData[] = [
  { number: 1, status: 'healthy' },
  { number: 2, status: 'filling' },
  { number: 3, status: 'cavity' },
  { number: 4, status: 'healthy' },
  { number: 5, status: 'filling' },
  { number: 6, status: 'healthy' },
  { number: 7, status: 'healthy' },
  { number: 8, status: 'healthy' },
];

export const upperLeftTeeth: ToothData[] = [
  { number: 9, status: 'healthy' },
  { number: 10, status: 'healthy' },
  { number: 11, status: 'healthy' },
  { number: 12, status: 'healthy' },
  { number: 13, status: 'crown' },
  { number: 14, status: 'filling' },
  { number: 15, status: 'rootCanal' },
  { number: 16, status: 'healthy' },
];

export const lowerLeftTeeth: ToothData[] = [
  { number: 32, status: 'healthy' },
  { number: 31, status: 'filling' },
  { number: 30, status: 'crown' },
  { number: 29, status: 'healthy' },
  { number: 28, status: 'healthy' },
  { number: 27, status: 'healthy' },
  { number: 26, status: 'healthy' },
  { number: 25, status: 'healthy' },
];

export const lowerRightTeeth: ToothData[] = [
  { number: 24, status: 'healthy' },
  { number: 23, status: 'healthy' },
  { number: 22, status: 'healthy' },
  { number: 21, status: 'healthy' },
  { number: 20, status: 'healthy' },
  { number: 19, status: 'implant' },
  { number: 18, status: 'crown' },
  { number: 17, status: 'healthy' },
];

export const toothStatusColors: Record<string, string> = {
  healthy: '#22C55E',
  cavity: '#EF4444',
  filling: '#3B82F6',
  crown: '#F59E0B',
  rootCanal: '#8B5CF6',
  implant: '#EC4899',
  missing: '#9CA3AF',
};

export const dashboardAppointments: DashboardAppointment[] = [
  {
    id: 'da-1',
    category: 'Dental',
    title: 'Routine Cleaning & Checkup',
    provider: 'Dr. Sarah Johnson, DDS',
    date: 'Feb 5, 2026 at 10:00 AM',
    location: 'VIP Dental Center',
    iconColor: '#1E6BB8',
    bgColor: '#E8F1FA',
  },
  {
    id: 'da-2',
    category: 'Medical',
    title: 'Annual Physical Exam',
    provider: 'Dr. Michael Chen, MD',
    date: 'Feb 12, 2026 at 2:30 PM',
    location: 'VIP Health Clinic',
    iconColor: '#22C55E',
    bgColor: '#DCFCE7',
  },
  {
    id: 'da-3',
    category: 'Medical',
    title: 'Diabetes Follow-up',
    provider: 'Dr. Lisa Thompson, Endocrinologist',
    date: 'Feb 18, 2026 at 11:00 AM',
    location: 'Virtual Visit',
    iconColor: '#22C55E',
    bgColor: '#DCFCE7',
  },
];

export const dashboardRecords: DashboardRecord[] = [
  { id: 'dr-1', title: 'Annual Physical Results', date: 'Jan 15, 2026', provider: 'Dr. Michael Chen' },
  { id: 'dr-2', title: 'Blood Pressure Monitoring', date: 'Jan 10, 2026', provider: 'VIP Health Clinic' },
  { id: 'dr-3', title: 'Diabetes Management Plan', date: 'Dec 20, 2025', provider: 'Dr. Lisa Thompson' },
];

export const dashboardReferrals: DashboardReferral[] = [
  {
    id: 'dref-1',
    refNumber: 'REF-2026-001',
    status: 'Pending',
    statusColor: '#F59E0B',
    priority: 'Medium Priority',
    priorityColor: '#F59E0B',
    date: 'Jan 28, 2026',
    fromDoctor: { name: 'Dr. Sarah Johnson', specialty: 'General Dentistry' },
    toDoctor: { name: 'Dr. Robert Martinez', specialty: 'Periodontist' },
    reason: 'Advanced periodontal disease requiring specialist care',
    description: 'Patient has significant bone loss. Recommend comprehensive periodontal evaluation.',
  },
  {
    id: 'dref-2',
    refNumber: 'REF-2026-002',
    status: 'Accepted',
    statusColor: '#22C55E',
    priority: 'High Priority',
    priorityColor: '#EF4444',
    date: 'Jan 25, 2026',
    fromDoctor: { name: 'Dr. Sarah Johnson', specialty: 'General Dentistry' },
    toDoctor: { name: 'Dr. Lisa Thompson', specialty: 'Endocrinologist' },
    reason: 'Uncontrolled diabetes affecting oral health',
    description: "Patient's HbA1c levels elevated. Severe gum inflammation noted.",
  },
  {
    id: 'dref-3',
    refNumber: 'REF-2026-003',
    status: 'Completed',
    statusColor: '#22C55E',
    priority: 'High Priority',
    priorityColor: '#EF4444',
    date: 'Jan 22, 2026',
    fromDoctor: { name: 'Dr. Michael Chen', specialty: 'Internal Medicine' },
    toDoctor: { name: 'Dr. Sarah Johnson', specialty: 'General Dentistry' },
    reason: 'Pre-cardiac surgery dental clearance',
    description: 'Patient scheduled for heart valve replacement. Need dental exam before surgery.',
  },
];

export const educationalResources: EducationalResource[] = [
  {
    id: '1',
    type: 'Article',
    duration: '5 min read',
    title: 'How Oral Health Affects Heart Disease',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=200&fit=crop',
  },
  {
    id: '2',
    type: 'Video',
    duration: '8 min',
    title: 'Diabetes and Dental Health Connection',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&h=200&fit=crop',
  },
  {
    id: '3',
    type: 'Guide',
    duration: '10 min read',
    title: 'Medications That Impact Oral Health',
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=200&fit=crop',
  },
];

export const ledgerTransactions = [
  { id: '1', date: 'Jan 22, 2026', procedure: 'Dental Implant - Tooth #19', cdt: 'D6010', tooth: '#19', provider: 'Dr. James Liu', fee: 2200, insurance: 550, patient: 1650, balance: 0, status: 'Paid in Full' as const },
  { id: '2', date: 'Jan 15, 2026', procedure: 'Porcelain Crown - Tooth #30', cdt: 'D2750', tooth: '#30', provider: 'Dr. Sarah Johnson', fee: 1100, insurance: 550, patient: 550, balance: 0, status: 'Paid in Full' as const },
  { id: '3', date: 'Dec 20, 2025', procedure: 'Root Canal - Tooth #15', cdt: 'D3330', tooth: '#15', provider: 'Dr. Sarah Johnson', fee: 850, insurance: 425, patient: 425, balance: 0, status: 'Paid in Full' as const },
  { id: '4', date: 'Dec 10, 2025', procedure: 'Comprehensive Oral Eval', cdt: 'D0150', tooth: '-', provider: 'Dr. Sarah Johnson', fee: 95, insurance: 0, patient: 95, balance: 0, status: 'Paid in Full' as const },
  { id: '5', date: 'Nov 15, 2025', procedure: 'Prophylaxis - Adult', cdt: 'D1110', tooth: '-', provider: 'Dr. Sarah Johnson', fee: 120, insurance: 0, patient: 120, balance: 0, status: 'Insurance Processing' as const },
  { id: '6', date: 'Oct 28, 2025', procedure: 'Composite Filling - Tooth #5', cdt: 'D2391', tooth: '#5', provider: 'Dr. Sarah Johnson', fee: 195, insurance: 0, patient: 195, balance: 195, status: 'Payment Pending' as const },
  { id: '7', date: 'Oct 10, 2025', procedure: 'Bitewing X-Rays (4 films)', cdt: 'D0274', tooth: '-', provider: 'Dr. Sarah Johnson', fee: 65, insurance: 0, patient: 65, balance: 0, status: 'Paid in Full' as const },
  { id: '8', date: 'Sep 15, 2025', procedure: 'Ceramic Braces Adjustment', cdt: 'D8670', tooth: '-', provider: 'Dr. Sarah Johnson', fee: 235, insurance: 0, patient: 40, balance: 0, status: 'Partial Payment' as const },
];
