export type UserRole = 'SUPER_ADMIN' | 'SUPERVISOR' | 'INTERN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}