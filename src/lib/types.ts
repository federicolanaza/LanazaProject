
export type UserRole = 'ADMIN' | 'VISITOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  avatarUrl?: string;
}

export interface VisitEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  reason: string;
  timestamp: Date;
  aiInsights?: {
    categories: string[];
    commonThemes: string[];
    summary: string;
  };
}

export const DEPARTMENTS = [
  'College of Computer Studies',
  'College of Engineering',
  'College of Arts and Sciences',
  'College of Business and Accountancy',
  'College of Education',
  'College of Nursing',
  'College of Law',
  'Graduate School',
];
