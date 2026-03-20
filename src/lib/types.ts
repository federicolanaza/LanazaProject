
export type UserRole = 'ADMIN' | 'VISITOR';
export type VisitDomain = 'LIBRARY' | 'DEANS_OFFICE';
export type UserType = 'STUDENT' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  userType: UserType;
  isBlocked: boolean;
  avatarUrl?: string;
}

export interface VisitEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userType: UserType;
  department: string;
  domain: VisitDomain;
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
  'School of Design',
  'College of Architecture',
  'College of Pharmacy',
  'College of Allied Health Sciences',
  'School of Management',
  'College of Social Sciences',
  'College of Communication',
  'College of Maritime Studies',
  'College of Hospitality Management',
  'College of Fine Arts',
  'Institute of Technology',
];

export const VISIT_REASON_GROUPS = [
  {
    label: 'Academic Research',
    reasons: ['Thesis/Dissertation Research', 'Capstone Project', 'Library Resource Consultation', 'Archive Access'],
  },
  {
    label: 'Study & Collaboration',
    reasons: ['Individual Quiet Study', 'Group Discussion/Project', 'Online Class/Webinar', 'Peer Tutoring'],
  },
  {
    label: 'Facility Services',
    reasons: ['Book Borrowing/Return', 'Printing/Scanning', 'Computer Lab Access', 'Media Room Reservation'],
  },
  {
    label: 'Administrative',
    reasons: ['Library Card Registration', 'Clearance Processing', 'Fines/Dues Payment', 'Inquiry/Information Desk'],
  },
];
