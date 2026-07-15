import { api } from './api';
import type { CommentDTO, DashboardOverview, OngoingTask, PaginatedResponse, ProjectDTO, TaskDTO } from '../types/api';

export interface CreateTaskPayload {
  title: string;
  description: string;
  projectId: string;
  assignedToId: string;
  deadline: string; // ISO format string: YYYY-MM-DDTHH:mm:ss
}

export const supervisorService = {
  // Fetch only projects assigned to the logged-in supervisor
  getAssignedProjects: async (page = 0, size = 10) => {
    const response = await api.get<PaginatedResponse<ProjectDTO>>(`/supervisor/projects?page=${page}&size=${size}`);
    return response.data;
  },

  // Create a new task
  createTask: async (taskData: CreateTaskPayload) => {
    const response = await api.post('/supervisor/tasks', taskData);
    return response.data;
  },

  getProjectTasks: async (projectId: string, page = 0, size = 50) => {
    // We use a larger size default for a board view to fetch most tasks at once
    const response = await api.get<PaginatedResponse<TaskDTO>>(`/supervisor/projects/${projectId}/tasks?page=${page}&size=${size}`);
    return response.data;
  },

  updateTask: async (taskId: string, taskData: Partial<TaskDTO>) => {
    const response = await api.put<TaskDTO>(`/supervisor/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId: string) => {
    const response = await api.delete(`/supervisor/tasks/${taskId}`);
    return response.data;
  },

  getTaskComments: async (taskId: string) => {
    const response = await api.get<CommentDTO[]>(`/supervisor/tasks/${taskId}/comments`);
    return response.data;
  },

  addTaskComment: async (taskId: string, content: string) => {
    const response = await api.post<CommentDTO>(`/supervisor/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  getDashboardOverview: async (): Promise<DashboardOverview> => {
    const response = await api.get('/supervisor/dashboard/overview');
    return response.data;
  },

  getOngoingTasks: async (): Promise<OngoingTask[]> => {
    const response = await api.get('/supervisor/dashboard/ongoing-tasks');
    return response.data;
  },
};