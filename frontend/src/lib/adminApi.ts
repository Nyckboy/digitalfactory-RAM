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
  }
};