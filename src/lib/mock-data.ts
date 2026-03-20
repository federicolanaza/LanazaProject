
import { User, VisitEntry } from './types';
import { subDays, subHours } from 'date-fns';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'JC Esperanza',
    email: 'jcesperanza@neu.edu.ph',
    role: 'ADMIN',
    userType: 'EMPLOYEE',
    isBlocked: false,
    avatarUrl: 'https://picsum.photos/seed/jce/100/100'
  },
  {
    id: 'u2',
    name: 'John Doe',
    email: 'j.doe@neu.edu.ph',
    role: 'VISITOR',
    userType: 'STUDENT',
    isBlocked: false,
    avatarUrl: 'https://picsum.photos/seed/john/100/100'
  },
  {
    id: 'u3',
    name: 'Jane Smith',
    email: 'j.smith@neu.edu.ph',
    role: 'VISITOR',
    userType: 'STUDENT',
    isBlocked: false,
    avatarUrl: 'https://picsum.photos/seed/jane/100/100'
  }
];

export const MOCK_VISITS: VisitEntry[] = [
  {
    id: 'v1',
    userId: 'u2',
    userName: 'John Doe',
    userEmail: 'j.doe@neu.edu.ph',
    userType: 'STUDENT',
    department: 'College of Computer Studies',
    domain: 'LIBRARY',
    reason: 'Working on my thesis project about AI applications in libraries.',
    timestamp: subHours(new Date(), 2),
    aiInsights: {
      categories: ['Research', 'Technology'],
      commonThemes: ['AI', 'Thesis'],
      summary: 'Student is researching AI for their thesis.'
    }
  },
  {
    id: 'v2',
    userId: 'u3',
    userName: 'Jane Smith',
    userEmail: 'j.smith@neu.edu.ph',
    userType: 'STUDENT',
    department: 'College of Arts and Sciences',
    domain: 'LIBRARY',
    reason: 'Borrowing books for the upcoming literature exam.',
    timestamp: subDays(new Date(), 1),
    aiInsights: {
      categories: ['Study', 'Resources'],
      commonThemes: ['Exams', 'Literature'],
      summary: 'Student is borrowing resources for exam preparation.'
    }
  }
];
