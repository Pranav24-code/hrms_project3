export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'hr_manager' | 'employee';
  department?: string;
  phone?: string;
  designation?: string;
}
