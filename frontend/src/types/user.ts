export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'PROJECT_MANAGER'
  | 'ARCHITECT'
  | 'DEVELOPER'
  | 'CONSULTANT';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  createdAt?: string;
};