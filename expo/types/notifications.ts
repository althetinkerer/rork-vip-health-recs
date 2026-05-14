export type NotificationCategory =
  | 'appointment'
  | 'rewards'
  | 'medications'
  | 'records'
  | 'referrals'
  | 'insurance';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  actionRoute?: string;
}
