export interface SendNotificationRequest {
  user_id: string;
  pool_id: string;
  notification_data: any;
  notification_type: string;
  notification_description: string;
}
