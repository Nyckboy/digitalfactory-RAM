import type { UserRole } from './auth';

// Generic interface for Spring Boot paginated responses
export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface ProjectDTO {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  createdAt: string;
  supervisor: UserDTO;
  interns: UserDTO[];
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline: string;
  projectId: string;
  assignedTo: UserDTO;
  submissionUrl?: string | null; // <-- Add this field
}