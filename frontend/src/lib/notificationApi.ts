import { api } from './api';

export interface NotificationDTO {
  id: string;
  message: string; // The text content of the notification
  read: boolean;
  createdAt?: string; 
}

export const notificationService = {
  getUnread: async (): Promise<NotificationDTO[]> => {
    // Assuming your base api instance handles the '/api' prefix
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },
};