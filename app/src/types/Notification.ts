export interface Notification {
  data: NotificationData;
  description: string;
  type: NotificationType;
}

export type NotificationType =
  | 'new_deposit'
  | 'new_proposal'
  | 'proposal_execution'
  | 'proposal_rejection'
  | 'proposal_confirmation';

export type NotificationData = {
  remaining_votes?: number;
  url?: string;
};
