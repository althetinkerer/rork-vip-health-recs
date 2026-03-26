export const colors = {
  primary: '#1E6BB8',
  primaryLight: '#4A8FD3',
  primaryDark: '#155A9C',
  primaryFaded: '#E8F1FA',

  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  background: '#F2F4F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FB',
  border: '#E5E7EB',
  borderLight: '#F0F1F3',

  textPrimary: '#1A1D21',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  overlay: 'rgba(0,0,0,0.4)',

  heartRate: '#EF4444',
  bloodPressure: '#8B5CF6',
  sleep: '#6366F1',
  steps: '#22C55E',

  dental: '#14B8A6',
  medical: '#1E6BB8',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 999,
} as const;

export const typography = {
  largeTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  title3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  headline: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  callout: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  small: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 14,
  },
} as const;

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;
