import { api } from './api';
import type { CommentDTO, InternDashboardOverview, PaginatedResponse, TaskDTO, TaskStatus } from '../types/api';

export const internService = {
  getMyTasks: async (page = 0, size = 50) => {
    const response = await api.get<PaginatedResponse<TaskDTO>>(`/intern/tasks?page=${page}&size=${size}`);
    return response.data;
  },

  // Refactored to accept a partial payload
  updateTask: async (taskId: string, payload: { status?: TaskStatus; submissionUrl?: string }) => {
    const response = await api.patch<TaskDTO>(`/intern/tasks/${taskId}`, payload);
    return response.data;
  },

  getTaskComments: async (taskId: string) => {
    const response = await api.get<CommentDTO[]>(`/intern/tasks/${taskId}/comments`);
    return response.data;
  },

  addTaskComment: async (taskId: string, content: string) => {
    const response = await api.post<CommentDTO>(`/intern/tasks/${taskId}/comments`, { content });
    return response.data;
  },
  getDashboardOverview: async (): Promise<InternDashboardOverview> => {
    const response = await api.get('/intern/dashboard');
    return response.data;
  },
};