import { api } from './api';
import type { PaginatedResponse, UserDTO, ProjectDTO } from '../types/api';

export const adminService = {
  // Fetch Users
  getUsers: async (page = 0, size = 10) => {
    const response = await api.get<PaginatedResponse<UserDTO>>(`/admin/users?page=${page}&size=${size}`);
    return response.data;
  },

  // Fetch Projects
  getProjects: async (page = 0, size = 10) => {
    const response = await api.get<PaginatedResponse<ProjectDTO>>(`/admin/projects?page=${page}&size=${size}`);
    return response.data;
  },

  // We will wire up the POST endpoints later when we build the forms
  registerUser: async (userData: any) => {
    const response = await api.post('/admin/users/register', userData);
    return response.data;
  },

  createProject: async (projectData: any) => {
    const response = await api.post('/admin/projects', projectData);
    return response.data;
  },

  updateUser: async (userId: string, userData: Partial<UserDTO>) => {
    const response = await api.put<UserDTO>(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    // We don't wrap this in a typed response because a 409 might be thrown
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  updateProject: async (projectId: string, projectData: any) => {
    const response = await api.put<ProjectDTO>(`/admin/projects/${projectId}`, projectData);
    return response.data;
  },

  deleteProject: async (projectId: string) => {
    const response = await api.delete(`/admin/projects/${projectId}`);
    return response.data;
  }
};