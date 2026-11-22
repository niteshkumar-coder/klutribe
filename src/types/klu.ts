import { Timestamp } from 'firebase/firestore';

export type Branch = 'CSE' | 'AI&DS' | 'CS&IT' | 'ECE' | 'EEE' | 'ME' | 'CE' | 'BT';

export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';

export type ArchetypeId =
  | 'corporate-architect'
  | 'strategic-builder'
  | 'campus-maverick'
  | 'day1-hustler'
  | 'wildcard';

export type VerificationStatus = 'pending_review' | 'verified' | 'rejected';

export type CampusMode = '' | 'Hosteller' | 'Day Scholar';

export type GenderOption = '' | 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';

export interface RoadmapYear {
  year: number;
  label: string;
  goal: string;
  completed: boolean;
  notes: string;
}

export interface StudentPublic {
  uid: string;
  memberNumber: string;
  maskedStudentId: string;
  fullName: string;
  branch: Branch;
  year: AcademicYear;
  batch: string;
  primaryCategory: ArchetypeId;
  secondaryInterests: string[];
  skills: string[];
  bio: string;
  careerGoal: string;
  startupInterest: boolean;
  startupIdeaSummary: string;
  campusMode: CampusMode;
  verificationStatus: VerificationStatus;
  isSuspended: boolean;
  allowConnections: boolean;
  roadmap: RoadmapYear[];
  categoryUpdatedAtMs: number;
  avatarDataUrl?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface StudentPrivate {
  uid: string;
  email: string;
  phone: string;
  kluStudentId: string;
  gender: GenderOption;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface StudentIdRegistryRecord {
  kluStudentId: string;
  ownerUid: string;
  memberNumber: string;
  fullName: string;
  branch: Branch;
  year: AcademicYear;
  authMethod: 'google' | 'student_id';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Connection {
  id: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  toName: string;
  participantUids: string[];
  status: 'pending' | 'accepted' | 'declined';
  note: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface DirectMessage {
  id: string;
  senderUid: string;
  senderName: string;
  body: string;
  createdAt?: Timestamp;
}

export interface StartupIdea {
  id: string;
  authorUid: string;
  authorName: string;
  authorBranch: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  stage: 'Concept' | 'Validation' | 'Prototype' | 'MVP' | 'Launched';
  requiredSkills: string[];
  rolesNeeded: string;
  visibility: 'public' | 'private';
  interestedUids: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SkillExchange {
  id: string;
  authorUid: string;
  authorName: string;
  authorBranch: string;
  teachSkill: string;
  learnSkill: string;
  note: string;
  status: 'open' | 'matched' | 'closed';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ProjectTeam {
  id: string;
  authorUid: string;
  authorName: string;
  title: string;
  description: string;
  techStack: string[];
  openRoles: string;
  githubUrl: string;
  portfolioUrl: string;
  isHackathonTeam: boolean;
  memberUids: string[];
  status: 'recruiting' | 'active' | 'completed';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type OpportunityCategory =
  | 'Internship'
  | 'Part-Time'
  | 'Freelancing'
  | 'Hackathon'
  | 'Competition'
  | 'Scholarship'
  | 'Placement Prep'
  | 'Startup Program';

export interface Opportunity {
  id: string;
  submittedByUid: string;
  submittedByName: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  source: string;
  eligibility: string;
  deadline: string;
  applyUrl: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type CampusSection =
  | 'Samyak'
  | 'Surabhi'
  | 'Clubs'
  | 'Sports'
  | 'Events'
  | 'Achievements'
  | 'Weekend';

export interface CampusEvent {
  id: string;
  createdByUid: string;
  title: string;
  section: CampusSection;
  dateLabel: string;
  venue: string;
  description: string;
  attendeeUids: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ContentReport {
  id: string;
  reporterUid: string;
  targetType: 'opportunity' | 'student' | 'idea' | 'project';
  targetId: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetId: string;
  details: string;
  createdAt?: Timestamp;
}

export interface ArchetypeMeta {
  id: ArchetypeId;
  index: string;
  name: string;
  subtitle: string;
  motto: string;
  description: string;
  pillars: string[];
  accentHex: string;
  textClass: string;
  borderClass: string;
}

export const ARCHETYPES: ArchetypeMeta[] = [
  {
    id: 'corporate-architect',
    index: '01',
    name: 'The Corporate Architect',
    subtitle: 'Career First',
    motto: 'Precision · Depth · Placement',
    description: 'Building a disciplined engineering career through high CGPA, algorithmic mastery, and premier internships.',
    pillars: ['High CGPA', 'DSA & Coding', 'Internships', 'Placements', 'System Design'],
    accentHex: '#1D4ED8',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
  },
  {
    id: 'strategic-builder',
    index: '02',
    name: 'The Strategic Builder',
    subtitle: 'Future Founder',
    motto: 'Leverage · Vision · Scale',
    description: 'Securing strong technical fundamentals today while structuring ventures, research, or higher studies for tomorrow.',
    pillars: ['Placement Security', 'Venture Planning', 'Higher Studies', 'Product Strategy', 'Long-Term Moats'],
    accentHex: '#7C3AED',
    textClass: 'text-violet-700',
    borderClass: 'border-violet-200',
  },
  {
    id: 'campus-maverick',
    index: '03',
    name: 'The Campus Maverick',
    subtitle: 'Campus Life',
    motto: 'Culture · Leadership · Energy',
    description: 'Leading clubs, organizing Samyak and Surabhi, competing in athletics, and forging lifelong friendships without missing growth.',
    pillars: ['College Fests', 'Club Leadership', 'Travel & Sports', 'Event Operations', 'Community Culture'],
    accentHex: '#C2410C',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200',
  },
  {
    id: 'day1-hustler',
    index: '04',
    name: 'The Day-1 Hustler',
    subtitle: 'Earn & Build',
    motto: 'Build · Earn · Grow',
    description: 'Shipping real software, freelancing for clients, and launching campus startups from semester one.',
    pillars: ['Early Revenue', 'Freelancing', 'Micro-Startups', 'MVP Shipping', 'Placement as Backup'],
    accentHex: '#C8102E',
    textClass: 'text-[#C8102E]',
    borderClass: 'border-red-200',
  },
  {
    id: 'wildcard',
    index: '05',
    name: 'The Wildcard',
    subtitle: 'Own Journey',
    motto: 'Independent · Custom · Unscripted',
    description: 'Combining unconventional disciplines, creative tech, research, and personal milestones outside standard templates.',
    pillars: ['Custom Goals', 'Cross-Disciplinary', 'Creative Tech', 'Independent Research', 'Unique Path'],
    accentHex: '#4338CA',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
  },
];

export const BRANCHES: Branch[] = ['CSE', 'AI&DS', 'CS&IT', 'ECE', 'EEE', 'ME', 'CE', 'BT'];

export const ACADEMIC_YEARS: AcademicYear[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const CURATED_SKILLS: string[] = [
  'React / Next.js',
  'TypeScript',
  'Python',
  'Java',
  'C++ / DSA',
  'AI / ML',
  'UI/UX Design',
  'Node.js',
  'Flutter / Mobile',
  'Cloud & DevOps',
  'Embedded / IoT',
  'Video Editing',
  'Product & Marketing',
  'Cybersecurity',
  'Data Analytics',
  'Blockchain / Web3',
];

export const SECONDARY_INTERESTS: string[] = [
  'Startup Co-founding',
  'Hackathons',
  'Open Source',
  'Competitive Programming',
  'Research & Papers',
  'Freelancing',
  'Clubs & Fests',
  'Higher Studies (MS/MBA)',
  'Design & Media',
  'Sports & Athletics',
];

export const OPPORTUNITY_CATEGORIES: OpportunityCategory[] = [
  'Internship',
  'Part-Time',
  'Freelancing',
  'Hackathon',
  'Competition',
  'Scholarship',
  'Placement Prep',
  'Startup Program',
];

export const CAMPUS_SECTIONS: CampusSection[] = [
  'Samyak',
  'Surabhi',
  'Clubs',
  'Sports',
  'Events',
  'Achievements',
  'Weekend',
];

export const DEFAULT_ROADMAP: RoadmapYear[] = [
  { year: 1, label: 'Year 1', goal: 'Master core programming & join a campus club', completed: false, notes: '' },
  { year: 2, label: 'Year 2', goal: 'Ship 2 full-stack or hardware projects & attend hackathons', completed: false, notes: '' },
  { year: 3, label: 'Year 3', goal: 'Secure a summer internship or launch an MVP', completed: false, notes: '' },
  { year: 4, label: 'Year 4', goal: 'Convert full-time placement, scale startup, or admit to masters', completed: false, notes: '' },
];

export const ADMIN_BOOTSTRAP_EMAIL = 'niteshkumar9128ku@gmail.com';
export const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export function getArchetypeMeta(id: ArchetypeId): ArchetypeMeta {
  return ARCHETYPES.find((a) => a.id === id) || ARCHETYPES[0];
}
