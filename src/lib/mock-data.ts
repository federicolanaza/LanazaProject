
import { User, VisitEntry } from './types';
import { subDays, subHours } from 'date-fns';

const ADMIN_AVATAR = "https://chat.google.com/u/0/api/get_attachment_url?url_type=FIFE_URL&content_type=image%2Fjpeg&attachment_token=AOo0EEWNH4d%2BgAqtae6uoEXheU79rwd6rBOVlD54UPphj3A3x2iXPw%2Bek2%2B7K1Ofp80Y8UpZXIzSY4nNoWRRco3jrzSf4vnQMzQXRStjnrvGUAbGqrwlSDSpWE%2FjGeffaFO6gf%2B8ujqEptY8ARR%2FLqCuMYaT9%2FauIeUmelc%2B%2B0tzXtvmJhr9T4pxjxBrV1n3xDdDoQpjlUQ4eRE5KGe6BziK5JgXI3Vo0HthYGfMqrXdtc%2BTvlsraxU0kWr45%2FP3NT40lwY5KZ2Enqh8SB0mILCKg%2Bo0kvx%2FfjJQxrRbr%2BTS%2FMDtxbRGFp%2FfWN%2Fp96qWgqc6y1nWWThZTZ9XbQw3wGBsPP7lg3VS63h5GO1Njl76umXDkKTwG4oWD6wqE3SapynJ6PODXuDLMDY%2BDqMm13qs42tboCMhM5SJHnxq1p5IfqNNuE7hmCTAEURJKMuDqjtZFn2NFCaqsP9I0olJmadSK1Okl5cqJqGBLWpkx6txLMszdDcF%2Fs8Ix%2Fh2Qd1jsyavgUT0iDG47r6UpcY0NHlCrY3JTvZHEDeFYh66YKEis%2BxLDZqUpYgkEmHDlef8PTKepJve0ARYeozIvVUdCsRW&allow_caching=true&sz=w1920-h945-rw&auditContext=forDisplay";

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'JC Esperanza',
    email: 'jcesperanza@neu.edu.ph',
    role: 'ADMIN',
    userType: 'EMPLOYEE',
    isBlocked: false,
    avatarUrl: ADMIN_AVATAR
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
