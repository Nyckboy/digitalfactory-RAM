import { api } from './api';
import type { PaginatedResponse, ProjectDTO } from '../types/api';

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
  }
};