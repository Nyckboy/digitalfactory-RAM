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

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';

export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline: string;
  projectId: string;
  assignedTo: UserDTO;
  submissionUrl?: string | null; 
}

export interface CommentDTO {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorRole: string; // 'SUPERVISOR' | 'INTERN'
}

export interface DashboardStats {
  activeProjects: number;
  teamMembers: number;
  tasksCompleted: number;
}

export interface ActivityLog {
  id: string;
  actorName: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface DashboardOverview {
  featuredProject: FeaturedProject | null;
  actionRequiredTasks: number;
}

export interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  progressPercentage: number;
  teamMembers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
  }>;
}