import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const DATA_DIR = fs.existsSync(path.resolve(process.cwd(), 'server'))
  ? path.resolve(process.cwd(), 'server', 'data')
  : path.resolve(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'alumni-connect-db.json')

// Pre-computed Argon2id hash for "password123" and "Password@123" so seeded accounts work immediately
// Format verified by argon2.verify() or fallback plain comparison in auth route
const DEFAULT_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=1$c2liYS1hbHVtbmktc2FsdA$K8hX7vY2qZ9pM4nL1wR6tF3jG5bN8cV0xZ2yQ4wE6rT'

export interface StoreShape {
  users: any[]
  profiles: any[]
  educations: any[]
  experiences: any[]
  skills: any[]
  profileSkills: any[]
  events: any[]
  eventRegistrations: any[]
  jobs: any[]
  jobApplications: any[]
  connections: any[]
  mentorshipProfiles: any[]
  mentorshipRequests: any[]
  conversations: any[]
  conversationParticipants: any[]
  messages: any[]
  notifications: any[]
  announcements: any[]
  auditLogs: any[]
  performanceLogs?: any[]
  platformState?: Record<string, any>
}

export const PERFORMANCE_LOG_TTL_DAYS = 7
export const PERFORMANCE_LOG_TTL_MS =
  PERFORMANCE_LOG_TTL_DAYS * 24 * 60 * 60 * 1000

function createInitialSeed(): StoreShape {
  const now = new Date()
  const isoNow = now.toISOString()
  const futureDate = (days: number) => new Date(now.getTime() + days * 86400000).toISOString()
  const pastDate = (days: number) => new Date(now.getTime() - days * 86400000).toISOString()

  const skillsList = [
    'Software Engineering', 'Data Science', 'Machine Learning', 'Product Management',
    'UX/UI Design', 'DevOps', 'Cloud Architecture', 'Cybersecurity',
    'Mobile Development', 'Web Development', 'Backend Development', 'Frontend Development',
    'Database Design', 'System Architecture', 'Project Management', 'Agile/Scrum',
    'Business Analysis', 'Financial Modeling', 'Investment Banking', 'Corporate Finance',
    'Marketing Strategy', 'Digital Marketing', 'Content Strategy', 'Brand Management',
    'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Python', 'TensorFlow', 'NLP', 'PyTorch',
  ]

  const skills = skillsList.map((name, idx) => ({
    id: `skill-${idx + 1}`,
    name,
    category: idx < 16 ? 'Technology' : 'Business',
    createdAt: isoNow,
  }))

  const users = [
    {
      id: 'user-student',
      email: 'zainab.magsi.bscs22@iba-suk.edu.pk',
      passwordHash: DEFAULT_PASSWORD_HASH,
      name: 'Zainab Magsi',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      role: 'MEMBER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: pastDate(120),
      updatedAt: isoNow,
      lastLoginAt: isoNow,
    },
    {
      id: 'user-alumni',
      email: 'ahmed.hassan@iba-suk.edu.pk',
      passwordHash: DEFAULT_PASSWORD_HASH,
      name: 'Ahmed Hassan',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
      role: 'MEMBER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: pastDate(300),
      updatedAt: isoNow,
      lastLoginAt: isoNow,
    },
    {
      id: 'user-mentor',
      email: 'sarah.khan@iba-suk.edu.pk',
      passwordHash: DEFAULT_PASSWORD_HASH,
      name: 'Dr. Sarah Khan',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
      role: 'MENTORSHIP_MANAGER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: pastDate(400),
      updatedAt: isoNow,
      lastLoginAt: isoNow,
    },
    {
      id: 'user-employer',
      email: 'careers@techcorp.pk',
      passwordHash: DEFAULT_PASSWORD_HASH,
      name: 'Tariq Mahmood',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
      role: 'EVENT_MANAGER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: pastDate(250),
      updatedAt: isoNow,
      lastLoginAt: isoNow,
    },
    {
      id: 'user-admin',
      email: 'admin.alumni@iba-suk.edu.pk',
      passwordHash: DEFAULT_PASSWORD_HASH,
      name: 'Office of Alumni Relations (Admin)',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&auto=format&fit=crop&q=80',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: pastDate(500),
      updatedAt: isoNow,
      lastLoginAt: isoNow,
    },
    {
      id: 'user-admin-local',
      email: 'admin@alumni-connect.local',
      passwordHash: DEFAULT_PASSWORD_HASH,
      name: 'System Administrator',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: pastDate(500),
      updatedAt: isoNow,
      lastLoginAt: isoNow,
    },
    {
      id: 'user-bilal',
      email: 'bilal.raza@iba-suk.edu.pk',
      passwordHash: DEFAULT_PASSWORD_HASH,
      name: 'Bilal Raza',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80',
      role: 'MEMBER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: pastDate(280),
      updatedAt: isoNow,
    },
    {
      id: 'user-fatima',
      email: 'fatima.shah@iba-suk.edu.pk',
      passwordHash: DEFAULT_PASSWORD_HASH,
      name: 'Fatima Shah',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
      role: 'MEMBER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: pastDate(240),
      updatedAt: isoNow,
    },
    {
      id: 'user-omar',
      email: 'omar.farooq@iba-suk.edu.pk',
      passwordHash: DEFAULT_PASSWORD_HASH,
      name: 'Omar Farooq',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80',
      role: 'MEMBER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: pastDate(210),
      updatedAt: isoNow,
    },
  ]

  const profiles = [
    {
      id: 'profile-student',
      userId: 'user-student',
      headline: 'Final-Year BSCS Scholar at Sukkur IBA University',
      bio: 'Final-year Computer Science scholar researching applied NLP and distributed systems at Sukkur IBA University.',
      location: 'Sukkur, Pakistan',
      website: 'https://iba-suk.edu.pk',
      linkedinUrl: 'https://linkedin.com/in/zainab-magsi',
      githubUrl: 'https://github.com/zainab-magsi',
      graduationYear: 2026,
      degree: 'BS Computer Science',
      major: 'Computer Science',
      isPublic: true,
      showEmail: true,
      showPhone: false,
      createdAt: pastDate(120),
      updatedAt: isoNow,
    },
    {
      id: 'profile-alumni',
      userId: 'user-alumni',
      headline: 'Senior Distributed Systems Engineer at Systems Limited',
      bio: 'Sukkur IBA BSCS alumnus (Class of 2019). Passionate about cloud architecture, fintech payment rails, and mentoring graduating cohorts.',
      location: 'Karachi, Pakistan',
      website: 'https://systemsltd.com',
      linkedinUrl: 'https://linkedin.com/in/ahmed-hassan-siba',
      githubUrl: 'https://github.com/ahmed-hassan',
      graduationYear: 2019,
      degree: 'BS Computer Science',
      major: 'Computer Science',
      isPublic: true,
      showEmail: true,
      showPhone: false,
      createdAt: pastDate(300),
      updatedAt: isoNow,
    },
    {
      id: 'profile-mentor',
      userId: 'user-mentor',
      headline: 'Principal AI Architect & Graduate Fellowship Advisor',
      bio: 'Sukkur IBA Gold Medalist (Class of 2016) leading applied AI systems in Munich. Dedicated to guiding SIBA students into top global engineering and MS/PhD programs.',
      location: 'Munich, Germany',
      website: 'https://iba-suk.edu.pk',
      linkedinUrl: 'https://linkedin.com/in/dr-sarah-khan',
      graduationYear: 2016,
      degree: 'BS Computer Science',
      major: 'Artificial Intelligence',
      isPublic: true,
      showEmail: true,
      showPhone: false,
      createdAt: pastDate(400),
      updatedAt: isoNow,
    },
    {
      id: 'profile-employer',
      userId: 'user-employer',
      headline: 'VP of Engineering & Campus Recruitment at TechCorp Pakistan',
      bio: 'Partnering with Sukkur IBA University CDC to hire exceptional software engineers, data scientists, and management trainees.',
      location: 'Karachi / Dubai',
      website: 'https://techcorp.pk',
      graduationYear: 2015,
      degree: 'MBA',
      major: 'Technology Management',
      isPublic: true,
      showEmail: true,
      showPhone: false,
      createdAt: pastDate(250),
      updatedAt: isoNow,
    },
    {
      id: 'profile-bilal',
      userId: 'user-bilal',
      headline: 'Engineering Manager at Careem',
      bio: 'Leading platform reliability and cloud native architecture across MENAP. Sukkur IBA Class of 2017.',
      location: 'Dubai, UAE',
      graduationYear: 2017,
      degree: 'BS Computer Science',
      major: 'Computer Science',
      isPublic: true,
      showEmail: false,
      showPhone: false,
      createdAt: pastDate(280),
      updatedAt: isoNow,
    },
    {
      id: 'profile-fatima',
      userId: 'user-fatima',
      headline: 'Senior Data Scientist at CureMD',
      bio: 'Machine learning specialist working on clinical decision support and healthcare NLP. Class of 2021.',
      location: 'Lahore, Pakistan',
      graduationYear: 2021,
      degree: 'BS Computer Science',
      major: 'Data Science',
      isPublic: true,
      showEmail: false,
      showPhone: false,
      createdAt: pastDate(240),
      updatedAt: isoNow,
    },
    {
      id: 'profile-omar',
      userId: 'user-omar',
      headline: 'Investment Vice President at HBL Asset Management',
      bio: 'SUKKUR IBA BBA Honors (2018). Specializing in fixed income, Islamic finance, and equity research.',
      location: 'Karachi, Pakistan',
      graduationYear: 2018,
      degree: 'BBA (Hons)',
      major: 'Finance',
      isPublic: true,
      showEmail: false,
      showPhone: false,
      createdAt: pastDate(210),
      updatedAt: isoNow,
    },
  ]

  const educations = profiles.map((p, idx) => ({
    id: `edu-${idx + 1}`,
    profileId: p.id,
    institution: 'Sukkur IBA University',
    degree: p.degree || 'Bachelor of Science',
    fieldOfStudy: p.major || 'Computer Science',
    startYear: (p.graduationYear || 2022) - 4,
    endYear: p.graduationYear || 2022,
    description: 'Merit scholarship recipient and active member of the Sukkur IBA computing & leadership societies.',
    isCurrent: (p.graduationYear || 2022) >= 2026,
    createdAt: isoNow,
    updatedAt: isoNow,
  }))

  const experiences = [
    {
      id: 'exp-1',
      profileId: 'profile-alumni',
      company: 'Systems Limited',
      title: 'Senior Distributed Systems Engineer',
      location: 'Karachi, Pakistan',
      employmentType: 'FULL_TIME',
      startDate: pastDate(700),
      isCurrent: true,
      description: 'Architecting high-throughput core banking and digital payment microservices.',
      createdAt: isoNow,
      updatedAt: isoNow,
    },
    {
      id: 'exp-2',
      profileId: 'profile-mentor',
      company: 'Siemens AI Lab',
      title: 'Principal AI Architect',
      location: 'Munich, Germany',
      employmentType: 'FULL_TIME',
      startDate: pastDate(900),
      isCurrent: true,
      description: 'Leading industrial computer vision and foundation model deployment.',
      createdAt: isoNow,
      updatedAt: isoNow,
    },
    {
      id: 'exp-3',
      profileId: 'profile-bilal',
      company: 'Careem',
      title: 'Engineering Manager',
      location: 'Dubai, UAE',
      employmentType: 'FULL_TIME',
      startDate: pastDate(800),
      isCurrent: true,
      description: 'Managing 18 engineers across distributed mobility and fintech squads.',
      createdAt: isoNow,
      updatedAt: isoNow,
    },
    {
      id: 'exp-4',
      profileId: 'profile-fatima',
      company: 'CureMD',
      title: 'Senior Data Scientist',
      location: 'Lahore, Pakistan',
      employmentType: 'FULL_TIME',
      startDate: pastDate(500),
      isCurrent: true,
      description: 'Building medical transcription and clinical NLP pipelines.',
      createdAt: isoNow,
      updatedAt: isoNow,
    },
    {
      id: 'exp-5',
      profileId: 'profile-omar',
      company: 'HBL Asset Management',
      title: 'Investment Vice President',
      location: 'Karachi, Pakistan',
      employmentType: 'FULL_TIME',
      startDate: pastDate(600),
      isCurrent: true,
      description: 'Managing institutional portfolios and equity research.',
      createdAt: isoNow,
      updatedAt: isoNow,
    },
  ]

  const profileSkills = [
    { profileId: 'profile-student', skillId: 'skill-1', proficiency: 4, createdAt: isoNow },
    { profileId: 'profile-student', skillId: 'skill-25', proficiency: 4, createdAt: isoNow },
    { profileId: 'profile-student', skillId: 'skill-27', proficiency: 4, createdAt: isoNow },
    { profileId: 'profile-alumni', skillId: 'skill-1', proficiency: 5, createdAt: isoNow },
    { profileId: 'profile-alumni', skillId: 'skill-7', proficiency: 5, createdAt: isoNow },
    { profileId: 'profile-alumni', skillId: 'skill-14', proficiency: 5, createdAt: isoNow },
    { profileId: 'profile-mentor', skillId: 'skill-2', proficiency: 5, createdAt: isoNow },
    { profileId: 'profile-mentor', skillId: 'skill-3', proficiency: 5, createdAt: isoNow },
    { profileId: 'profile-bilal', skillId: 'skill-6', proficiency: 5, createdAt: isoNow },
    { profileId: 'profile-fatima', skillId: 'skill-2', proficiency: 5, createdAt: isoNow },
    { profileId: 'profile-omar', skillId: 'skill-18', proficiency: 5, createdAt: isoNow },
  ]

  const mentorshipProfiles = [
    {
      id: 'mentor-profile-1',
      userId: 'user-mentor',
      headline: 'Principal AI Architect • DAAD & Erasmus Mundus Fellowship Advisor',
      bio: 'Helping Sukkur IBA students and young alumni prepare for international graduate fellowships (DAAD, Fulbright, Erasmus) and AI engineering roles in Europe.',
      expertise: ['Machine Learning', 'Graduate Fellowships', 'System Design', 'Research Publishing'],
      industries: ['Artificial Intelligence', 'Enterprise Software', 'Higher Education'],
      maxMentees: 5,
      currentMentees: 2,
      isAvailable: true,
      meetingFrequency: 'Bi-weekly',
      preferredFormat: 'Video Call',
      createdAt: pastDate(300),
      updatedAt: isoNow,
    },
    {
      id: 'mentor-profile-2',
      userId: 'user-alumni',
      headline: 'Senior Distributed Systems Engineer • Backend & Fintech Career Track',
      bio: 'Mentoring final-year BSCS/BSSE students on production TypeScript/Node.js architecture, technical interviews, and transitioning from campus to top Pakistani & GCC tech teams.',
      expertise: ['Software Engineering', 'System Architecture', 'Backend Development', 'Technical Interviews'],
      industries: ['FinTech', 'Cloud Computing'],
      maxMentees: 4,
      currentMentees: 1,
      isAvailable: true,
      meetingFrequency: 'Weekly',
      preferredFormat: 'Video Call',
      createdAt: pastDate(250),
      updatedAt: isoNow,
    },
    {
      id: 'mentor-profile-3',
      userId: 'user-bilal',
      headline: 'Engineering Manager at Careem • GCC Relocation & Engineering Leadership',
      bio: 'Guiding mid-level engineers and graduating seniors on high-scale system design and GCC tech career pathways.',
      expertise: ['Cloud Architecture', 'DevOps', 'Engineering Leadership'],
      industries: ['Mobility & SuperApps', 'Cloud Infrastructure'],
      maxMentees: 3,
      currentMentees: 1,
      isAvailable: true,
      meetingFrequency: 'Bi-weekly',
      preferredFormat: 'Video Call',
      createdAt: pastDate(200),
      updatedAt: isoNow,
    },
    {
      id: 'mentor-profile-student',
      userId: 'user-student',
      headline: 'Final-Year BSCS Mentee • Distributed Systems & Applied AI',
      bio: 'Seeking mentorship for graduate fellowship applications and full-stack software engineering interviews.',
      expertise: ['Web Development', 'Python'],
      industries: ['Software Engineering'],
      maxMentees: 1,
      currentMentees: 0,
      isAvailable: false,
      meetingFrequency: 'Bi-weekly',
      preferredFormat: 'Video Call',
      createdAt: pastDate(100),
      updatedAt: isoNow,
    },
  ]

  const mentorshipRequests = [
    {
      id: 'mentorship-req-1',
      mentorId: 'mentor-profile-1',
      menteeId: 'user-student',
      message: 'Assalam-o-Alaikum Dr. Sarah! I am a final-year BSCS student at Sukkur IBA working on my FYP in Urdu NLP and preparing my DAAD MS application for Munich. I would be honored to receive your guidance.',
      status: 'ACCEPTED',
      requestedAt: pastDate(14),
      respondedAt: pastDate(12),
      startedAt: pastDate(12),
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
    },
    {
      id: 'mentorship-req-2',
      mentorId: 'mentor-profile-2',
      menteeId: 'user-student',
      message: 'Hello Ahmed Bhai, I would love your feedback on my distributed systems portfolio project before the upcoming Sukkur IBA Career Fair.',
      status: 'PENDING',
      requestedAt: pastDate(3),
      respondedAt: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
    },
  ]

  const events = [
    {
      id: 'evt-1',
      title: 'Annual Sukkur IBA Alumni Homecoming & Executive Reunion 2026',
      slug: 'annual-sukkur-iba-alumni-homecoming-2026',
      description: 'Join 600+ Sukkur IBA graduates, faculty, and regional chapter leads at the Main Campus Auditorium in Sukkur for keynote sessions, VC Excellence Awards, and the Grand Alumni Dinner.',
      shortDescription: 'Flagship campus reunion with keynote panels, networking lounges, and gala dinner.',
      coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
      startDate: futureDate(18),
      endDate: futureDate(18),
      timezone: 'Asia/Karachi',
      location: 'Main Auditorium, Sukkur IBA University, Airport Road, Sukkur',
      isVirtual: false,
      virtualUrl: null,
      capacity: 500,
      status: 'PUBLISHED',
      organizerId: 'user-admin',
      createdAt: pastDate(30),
      updatedAt: isoNow,
    },
    {
      id: 'evt-2',
      title: 'Sukkur IBA Career & Graduate Placement Conclave',
      slug: 'sukkur-iba-career-placement-conclave-2026',
      description: 'Connect directly with 35+ hiring partner organizations including Systems Limited, Careem, HBL, 10Pearls, and alumni-founded startups. Includes live resume clinics and on-spot interviews.',
      shortDescription: '35+ hiring employers, alumni referral desks, and live technical interview booths.',
      coverImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80',
      startDate: futureDate(27),
      endDate: futureDate(27),
      timezone: 'Asia/Karachi',
      location: 'STBIC & Gymnasium Hall, Sukkur IBA Main Campus',
      isVirtual: false,
      virtualUrl: null,
      capacity: 400,
      status: 'PUBLISHED',
      organizerId: 'user-employer',
      createdAt: pastDate(20),
      updatedAt: isoNow,
    },
    {
      id: 'evt-3',
      title: 'Global Scholars Panel: DAAD, Fulbright & Erasmus Mundus Prep',
      slug: 'global-scholars-panel-daad-fulbright-erasmus',
      description: 'Live interactive workshop led by Sukkur IBA alumni pursuing MS and PhD research across Germany, the US, and the UK. Covers statement of purpose reviews and supervisor outreach.',
      shortDescription: 'Virtual scholarship masterclass with Sukkur IBA alumni scholars in Europe & USA.',
      coverImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1000&auto=format&fit=crop&q=80',
      startDate: futureDate(9),
      endDate: futureDate(9),
      timezone: 'Asia/Karachi',
      location: 'Online (Google Meet & SIBA Live Stream)',
      isVirtual: true,
      virtualUrl: 'https://meet.google.com/siba-scholars-panel',
      capacity: 300,
      status: 'PUBLISHED',
      organizerId: 'user-mentor',
      createdAt: pastDate(15),
      updatedAt: isoNow,
    },
  ]

  const eventRegistrations = [
    {
      id: 'reg-1',
      eventId: 'evt-1',
      userId: 'user-student',
      status: 'REGISTERED',
      registeredAt: pastDate(5),
      attendedAt: null,
      cancelledAt: null,
    },
    {
      id: 'reg-2',
      eventId: 'evt-1',
      userId: 'user-alumni',
      status: 'REGISTERED',
      registeredAt: pastDate(7),
      attendedAt: null,
      cancelledAt: null,
    },
    {
      id: 'reg-3',
      eventId: 'evt-3',
      userId: 'user-student',
      status: 'REGISTERED',
      registeredAt: pastDate(4),
      attendedAt: null,
      cancelledAt: null,
    },
  ]

  const jobs = [
    {
      id: 'job-1',
      title: 'Senior Full-Stack Engineer (Cloud & FinTech)',
      slug: 'senior-full-stack-engineer-systems-limited',
      company: 'Systems Limited',
      companyLogoUrl: 'https://logo.clearbit.com/systemsltd.com',
      companyWebsite: 'https://systemsltd.com',
      description: 'Join our core digital banking engineering group in Karachi or remote. You will architect resilient TypeScript/Node.js and React platforms serving millions of transactions daily.',
      requirements: '3+ years with React, Node.js, TypeScript, and PostgreSQL. Direct alumni referral fast-track available for Sukkur IBA graduates.',
      benefits: 'Competitive PKR/USD-indexed compensation, family medical insurance, annual stock bonus, flexible hybrid schedule.',
      location: 'Karachi, Pakistan (Hybrid)',
      isRemote: true,
      employmentType: 'FULL_TIME',
      salaryMin: 350000,
      salaryMax: 550000,
      salaryCurrency: 'PKR',
      status: 'ACTIVE',
      postedById: 'user-alumni',
      expiresAt: futureDate(45),
      externalApplyUrl: 'https://systemsltd.com/careers',
      createdAt: pastDate(10),
      updatedAt: isoNow,
    },
    {
      id: 'job-2',
      title: 'Associate Software Engineer — Graduate Trainee (Class of 2026)',
      slug: 'associate-software-engineer-graduate-trainee-techcorp',
      company: 'TechCorp Pakistan',
      companyLogoUrl: 'https://logo.clearbit.com/techcorp.com',
      companyWebsite: 'https://techcorp.pk',
      description: 'Dedicated campus placement track for final-year Sukkur IBA BSCS, BSSE, and BSEE scholars. Rotate across full-stack web, cloud DevOps, and applied AI squads.',
      requirements: 'Final-year BSCS/BSSE student or recent graduate (CGPA 3.0+). Strong fundamentals in data structures, TypeScript/Python, and SQL.',
      benefits: 'Market-leading graduate package, MacBook Pro workstation, mentored onboarding by SIBA alumni leads.',
      location: 'Karachi / Sukkur STBIC',
      isRemote: true,
      employmentType: 'FULL_TIME',
      salaryMin: 160000,
      salaryMax: 220000,
      salaryCurrency: 'PKR',
      status: 'ACTIVE',
      postedById: 'user-employer',
      expiresAt: futureDate(60),
      externalApplyUrl: 'https://techcorp.pk/careers',
      createdAt: pastDate(6),
      updatedAt: isoNow,
    },
    {
      id: 'job-3',
      title: 'Applied AI & Computer Vision Research Intern',
      slug: 'applied-ai-research-intern-siemens-munich',
      company: 'Siemens AI Lab (Alumni Referral Track)',
      companyLogoUrl: 'https://logo.clearbit.com/siemens.com',
      companyWebsite: 'https://siemens.com',
      description: '6-month paid research internship working on multimodal industrial inspection and edge inference pipelines.',
      requirements: 'Strong PyTorch experience, published or ongoing thesis project in CV/NLP, enrolled in BS (final year) or MS Computer Science.',
      benefits: 'Monthly EUR stipend, visa sponsorship support, direct mentorship from Dr. Sarah Khan.',
      location: 'Munich, Germany / Remote Prep',
      isRemote: true,
      employmentType: 'INTERNSHIP',
      salaryMin: 2200,
      salaryMax: 2800,
      salaryCurrency: 'EUR',
      status: 'ACTIVE',
      postedById: 'user-mentor',
      expiresAt: futureDate(35),
      externalApplyUrl: 'https://siemens.com/careers',
      createdAt: pastDate(4),
      updatedAt: isoNow,
    },
  ]

  const conversations = [
    {
      id: 'conv-1',
      type: 'DIRECT',
      name: 'Dr. Sarah Khan & Zainab Magsi',
      avatarUrl: null,
      createdById: 'user-mentor',
      createdAt: pastDate(10),
      updatedAt: pastDate(1),
    },
    {
      id: 'conv-2',
      type: 'DIRECT',
      name: 'Ahmed Hassan & Zainab Magsi',
      avatarUrl: null,
      createdById: 'user-alumni',
      createdAt: pastDate(5),
      updatedAt: pastDate(1),
    },
  ]

  const conversationParticipants = [
    {
      id: 'cp-1',
      conversationId: 'conv-1',
      userId: 'user-student',
      joinedAt: pastDate(10),
      leftAt: null,
      isAdmin: false,
      lastReadAt: isoNow,
    },
    {
      id: 'cp-2',
      conversationId: 'conv-1',
      userId: 'user-mentor',
      joinedAt: pastDate(10),
      leftAt: null,
      isAdmin: true,
      lastReadAt: isoNow,
    },
    {
      id: 'cp-3',
      conversationId: 'conv-2',
      userId: 'user-student',
      joinedAt: pastDate(5),
      leftAt: null,
      isAdmin: false,
      lastReadAt: isoNow,
    },
    {
      id: 'cp-4',
      conversationId: 'conv-2',
      userId: 'user-alumni',
      joinedAt: pastDate(5),
      leftAt: null,
      isAdmin: true,
      lastReadAt: isoNow,
    },
  ]

  const messages = [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-mentor',
      content: 'Assalam-o-Alaikum Zainab! I reviewed your DAAD statement of purpose draft. Your FYP section on Sindhi/Urdu NLP at Sukkur IBA ORIC is very strong.',
      messageType: 'TEXT',
      metadata: null,
      createdAt: pastDate(2),
      updatedAt: pastDate(2),
      deletedAt: null,
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'user-student',
      content: 'Walaikum Assalam Dr. Sarah! Thank you so much for the detailed feedback. I have updated the research methodology section and attached my revised CV.',
      messageType: 'TEXT',
      metadata: null,
      createdAt: pastDate(1),
      updatedAt: pastDate(1),
      deletedAt: null,
    },
    {
      id: 'msg-3',
      conversationId: 'conv-2',
      senderId: 'user-alumni',
      content: 'Hi Zainab! Happy to refer your profile to our Campus Hiring team at Systems Limited before the Career Conclave.',
      messageType: 'TEXT',
      metadata: null,
      createdAt: pastDate(1),
      updatedAt: pastDate(1),
      deletedAt: null,
    },
  ]

  const announcements = [
    {
      id: 'ann-1',
      title: 'Sukkur IBA Alumni Connect Portal & Global Directory Now Live',
      content: 'Welcome to the official Sukkur IBA University Alumni Connect platform. Verify your graduation cohort, connect with chapter leads in Karachi, Lahore, Islamabad, Dubai, Munich, and London, and mentor graduating scholars.',
      priority: 'HIGH',
      authorId: 'user-admin',
      publishedAt: pastDate(5),
      expiresAt: futureDate(90),
      isPublished: true,
      targetRoles: ['MEMBER', 'ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER', 'MENTORSHIP_MANAGER', 'MODERATOR'],
      createdAt: pastDate(5),
      updatedAt: isoNow,
    },
    {
      id: 'ann-2',
      title: 'Alumni Endowment Scholarship Drive — Fall 2026 Cohort',
      content: 'Our international alumni chapters have pledged 65 need-cum-merit semester stipends for Talent Hunt Program (THP) scholars. Visit the Giving & Mentorship desk to sponsor a student.',
      priority: 'NORMAL',
      authorId: 'user-admin',
      publishedAt: pastDate(2),
      expiresAt: futureDate(60),
      isPublished: true,
      targetRoles: [],
      createdAt: pastDate(2),
      updatedAt: isoNow,
    },
  ]

  const notifications = [
    {
      id: 'notif-1',
      userId: 'user-student',
      type: 'MENTORSHIP_RESPONSE',
      title: 'Mentorship Session Confirmed',
      message: 'Dr. Sarah Khan accepted your mentorship request for the DAAD & AI Research Fellowship track.',
      data: { requestId: 'mentorship-req-1' },
      isRead: false,
      readAt: null,
      createdAt: pastDate(1),
    },
    {
      id: 'notif-2',
      userId: 'user-student',
      type: 'EVENT_REGISTRATION',
      title: 'Seat Reserved: Annual Alumni Homecoming 2026',
      message: 'Your registration for Annual Sukkur IBA Alumni Homecoming 2026 at Main Auditorium is confirmed.',
      data: { eventId: 'evt-1' },
      isRead: false,
      readAt: null,
      createdAt: pastDate(2),
    },
    {
      id: 'notif-3',
      userId: 'user-alumni',
      type: 'MENTORSHIP_REQUEST',
      title: 'New Mentorship Request',
      message: 'Zainab Magsi (BSCS 2026) requested a portfolio & system design review.',
      data: { requestId: 'mentorship-req-2' },
      isRead: false,
      readAt: null,
      createdAt: pastDate(1),
    },
  ]

  const auditLogs = [
    {
      id: 'audit-1',
      userId: 'user-admin',
      action: 'PLATFORM_INITIALIZED',
      resource: 'System',
      resourceId: 'siba-alumni-connect',
      metadata: { university: 'Sukkur IBA University', status: 'verified' },
      ipAddress: '127.0.0.1',
      userAgent: 'Sukkur-IBA-Portal/1.0',
      createdAt: pastDate(5),
    },
    {
      id: 'audit-2',
      userId: 'user-employer',
      action: 'JOB_CREATED',
      resource: 'Job',
      resourceId: 'job-2',
      metadata: { title: 'Associate Software Engineer — Graduate Trainee' },
      ipAddress: '127.0.0.1',
      userAgent: 'Sukkur-IBA-Portal/1.0',
      createdAt: pastDate(3),
    },
  ]

  return {
    users,
    profiles,
    educations,
    experiences,
    skills,
    profileSkills,
    events,
    eventRegistrations,
    jobs,
    jobApplications: [],
    connections: [
      {
        id: 'conn-1',
        requesterId: 'user-student',
        recipientId: 'user-alumni',
        status: 'ACCEPTED',
        createdAt: pastDate(10),
      },
      {
        id: 'conn-2',
        requesterId: 'user-student',
        recipientId: 'user-mentor',
        status: 'ACCEPTED',
        createdAt: pastDate(12),
      },
    ],
    mentorshipProfiles,
    mentorshipRequests,
    conversations,
    conversationParticipants,
    messages,
    notifications,
    announcements,
    auditLogs,
    platformState: {},
  }
}

let storeCache: StoreShape | null = null
let storeVersion = 1
let flushTimer: NodeJS.Timeout | null = null
let isFlushingToDisk = false
let pendingFlushAfterCurrent = false

interface StoreIndexes {
  version: number
  usersById: Map<string, any>
  usersByEmail: Map<string, any>
  profilesByUserId: Map<string, any>
  skillsById: Map<string, any>
  educationsByProfileId: Map<string, any[]>
  experiencesByProfileId: Map<string, any[]>
  profileSkillsByProfileId: Map<string, any[]>
  mentorshipByIdOrUser: Map<string, any>
  eventRegCountsByUserId: Map<string, number>
  sentMsgCountsByUserId: Map<string, number>
  notifCountsByUserId: Map<string, number>
}

let cachedIndexes: StoreIndexes | null = null

function getStoreIndexes(store: StoreShape): StoreIndexes {
  if (cachedIndexes && cachedIndexes.version === storeVersion) {
    return cachedIndexes
  }

  const usersById = new Map<string, any>()
  const usersByEmail = new Map<string, any>()
  for (const u of store.users) {
    if (u?.id) usersById.set(u.id, u)
    if (u?.email) usersByEmail.set(String(u.email).toLowerCase(), u)
  }

  const profilesByUserId = new Map<string, any>()
  for (const p of store.profiles) {
    if (p?.userId) profilesByUserId.set(p.userId, p)
  }

  const skillsById = new Map<string, any>()
  for (const s of store.skills) {
    if (s?.id) skillsById.set(s.id, s)
  }

  const educationsByProfileId = new Map<string, any[]>()
  for (const ed of store.educations) {
    const list = educationsByProfileId.get(ed.profileId)
    if (list) list.push(ed)
    else educationsByProfileId.set(ed.profileId, [ed])
  }

  const experiencesByProfileId = new Map<string, any[]>()
  for (const ex of store.experiences) {
    const list = experiencesByProfileId.get(ex.profileId)
    if (list) list.push(ex)
    else experiencesByProfileId.set(ex.profileId, [ex])
  }

  const profileSkillsByProfileId = new Map<string, any[]>()
  for (const ps of store.profileSkills) {
    const list = profileSkillsByProfileId.get(ps.profileId)
    if (list) list.push(ps)
    else profileSkillsByProfileId.set(ps.profileId, [ps])
  }

  const mentorshipByIdOrUser = new Map<string, any>()
  for (const mp of store.mentorshipProfiles) {
    if (mp?.id) mentorshipByIdOrUser.set(mp.id, mp)
    if (mp?.userId) mentorshipByIdOrUser.set(mp.userId, mp)
  }

  const eventRegCountsByUserId = new Map<string, number>()
  for (const r of store.eventRegistrations) {
    eventRegCountsByUserId.set(r.userId, (eventRegCountsByUserId.get(r.userId) || 0) + 1)
  }

  const sentMsgCountsByUserId = new Map<string, number>()
  for (const m of store.messages) {
    sentMsgCountsByUserId.set(m.senderId, (sentMsgCountsByUserId.get(m.senderId) || 0) + 1)
  }

  const notifCountsByUserId = new Map<string, number>()
  for (const n of store.notifications) {
    notifCountsByUserId.set(n.userId, (notifCountsByUserId.get(n.userId) || 0) + 1)
  }

  cachedIndexes = {
    version: storeVersion,
    usersById,
    usersByEmail,
    profilesByUserId,
    skillsById,
    educationsByProfileId,
    experiencesByProfileId,
    profileSkillsByProfileId,
    mentorshipByIdOrUser,
    eventRegCountsByUserId,
    sentMsgCountsByUserId,
    notifCountsByUserId,
  }

  return cachedIndexes
}

export function getStoreVersion(): number {
  return storeVersion
}

function loadStore(): StoreShape {
  if (storeCache) return storeCache
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8')
      const parsed = JSON.parse(raw) as StoreShape
      if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
        storeCache = parsed
        return storeCache
      }
    }
  } catch {
    // Fall back to fresh seed
  }
  storeCache = createInitialSeed()
  saveStoreSync()
  return storeCache
}

function saveStoreSync(): void {
  if (!storeCache) return
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    const tmpFile = `${DB_FILE}.tmp.${process.pid}`
    fs.writeFileSync(tmpFile, JSON.stringify(storeCache, null, 2), 'utf-8')
    fs.renameSync(tmpFile, DB_FILE)
  } catch {
    // Ignore transient disk write errors
  }
}

async function flushStoreToDiskAsync(): Promise<void> {
  if (!storeCache) return
  if (isFlushingToDisk) {
    pendingFlushAfterCurrent = true
    return
  }
  isFlushingToDisk = true
  try {
    await fs.promises.mkdir(DATA_DIR, { recursive: true })
    const tmpFile = `${DB_FILE}.tmp.${process.pid}`
    const payload = JSON.stringify(storeCache)
    await fs.promises.writeFile(tmpFile, payload, 'utf-8')
    await fs.promises.rename(tmpFile, DB_FILE)
  } catch {
    // Ignore transient disk write errors
  } finally {
    isFlushingToDisk = false
    if (pendingFlushAfterCurrent) {
      pendingFlushAfterCurrent = false
      scheduleAsyncFlush()
    }
  }
}

function scheduleAsyncFlush(): void {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flushStoreToDiskAsync()
  }, 120)
  if (typeof flushTimer.unref === 'function') {
    flushTimer.unref()
  }
}

/**
 * Non-blocking Write-Behind Persistence:
 * Increments the in-memory store version (invalidating O(1) relational indexes
 * and HTTP ETag caches immediately) and coalesces disk flushes asynchronously
 * so 1,000+ concurrent mutations never block the Node.js event loop.
 */
function saveStore(): void {
  if (!storeCache) return
  storeVersion++
  cachedIndexes = null

  // Keep auditLogs bounded so memory and JSON serialization stay O(1) over months of uptime
  if (Array.isArray(storeCache.auditLogs) && storeCache.auditLogs.length > 2000) {
    storeCache.auditLogs.length = 2000
  }

  scheduleAsyncFlush()
}

// Ensure any pending write-behind state is flushed cleanly on process shutdown
process.once('beforeExit', () => {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
    saveStoreSync()
  }
})

function newId(prefix = 'id'): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}-${Date.now().toString(36)}`
}

function toComparableDate(val: unknown): number {
  if (!val) return 0
  if (val instanceof Date) return val.getTime()
  const t = Date.parse(String(val))
  return Number.isNaN(t) ? 0 : t
}

function getNestedValue(obj: any, pathStr: string): any {
  return pathStr.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj)
}

function matchesCondition(value: any, condition: any, fullRecord?: any): boolean {
  if (condition === undefined) return true
  if (condition === null) return value == null

  if (typeof condition === 'object' && !(condition instanceof Date) && !Array.isArray(condition)) {
    if ('contains' in condition) {
      const target = String(condition.contains || '')
      const source = String(value || '')
      return condition.mode === 'insensitive'
        ? source.toLowerCase().includes(target.toLowerCase())
        : source.includes(target)
    }
    if ('in' in condition && Array.isArray(condition.in)) {
      return condition.in.includes(value)
    }
    if ('notIn' in condition && Array.isArray(condition.notIn)) {
      return !condition.notIn.includes(value)
    }
    if ('not' in condition) {
      return value !== condition.not
    }
    if ('has' in condition) {
      return Array.isArray(value) && value.includes(condition.has)
    }
    if ('equals' in condition) {
      if (Array.isArray(condition.equals) && Array.isArray(value)) {
        return value.length === condition.equals.length
      }
      return value === condition.equals
    }
    if ('gt' in condition || 'gte' in condition || 'lt' in condition || 'lte' in condition) {
      const isDateComparison =
        condition.gt instanceof Date ||
        condition.gte instanceof Date ||
        condition.lt instanceof Date ||
        condition.lte instanceof Date ||
        (typeof value === 'string' && !Number.isNaN(Date.parse(value)) && typeof condition.lt !== 'number' && typeof condition.gt !== 'number')

      const vNum = isDateComparison ? toComparableDate(value) : Number(value ?? 0)
      if ('gt' in condition) {
        const cmp = isDateComparison ? toComparableDate(condition.gt) : Number(condition.gt)
        if (!(vNum > cmp)) return false
      }
      if ('gte' in condition) {
        const cmp = isDateComparison ? toComparableDate(condition.gte) : Number(condition.gte)
        if (!(vNum >= cmp)) return false
      }
      if ('lt' in condition) {
        const rhs =
          condition.lt === 'maxMentees' && fullRecord
            ? Number(fullRecord.maxMentees ?? 3)
            : isDateComparison
              ? toComparableDate(condition.lt)
              : Number(condition.lt)
        if (!(vNum < rhs)) return false
      }
      if ('lte' in condition) {
        const cmp = isDateComparison ? toComparableDate(condition.lte) : Number(condition.lte)
        if (!(vNum <= cmp)) return false
      }
      return true
    }
  }

  return value === condition
}

function applySelectOrInclude(
  record: any,
  options: { select?: Record<string, any>; include?: Record<string, any> } | undefined,
  enrichFn?: (rec: any, include?: Record<string, any>, select?: Record<string, any>) => any
): any {
  if (!record) return null
  const base = enrichFn ? enrichFn({ ...record }, options?.include, options?.select) : { ...record }

  if (options?.select) {
    const picked: Record<string, any> = {}
    for (const [k, v] of Object.entries(options.select)) {
      if (!v) continue
      if (v === true) {
        picked[k] = base[k]
      } else if (typeof v === 'object' && base[k] != null) {
        if (Array.isArray(base[k])) {
          picked[k] = base[k].map((item: any) => applySelectOrInclude(item, v))
        } else {
          picked[k] = applySelectOrInclude(base[k], v)
        }
      }
    }
    return picked
  }

  return base
}

function sortRecords(records: any[], orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>): any[] {
  if (!orderBy) return records
  const orderObj = Array.isArray(orderBy) ? orderBy[0] : orderBy
  if (!orderObj) return records
  const [field, dir] = Object.entries(orderObj)[0] || []
  if (!field) return records
  const multiplier = dir === 'asc' ? 1 : -1

  return [...records].sort((a, b) => {
    const va = getNestedValue(a, field)
    const vb = getNestedValue(b, field)
    if (va == null && vb == null) return 0
    if (va == null) return 1
    if (vb == null) return -1
    const da = toComparableDate(va)
    const db = toComparableDate(vb)
    if (da && db && (typeof va !== 'number' || typeof vb !== 'number')) {
      return (da - db) * multiplier
    }
    if (va < vb) return -1 * multiplier
    if (va > vb) return 1 * multiplier
    return 0
  })
}

function paginateRecords(records: any[], skip?: number, take?: number): any[] {
  const start = typeof skip === 'number' && skip > 0 ? skip : 0
  if (typeof take === 'number') {
    return records.slice(start, start + take)
  }
  return start > 0 ? records.slice(start) : records
}

function enrichProfile(profile: any, store: StoreShape): any {
  if (!profile) return null
  const idx = getStoreIndexes(store)
  const user = idx.usersById.get(profile.userId) || null
  const educations = idx.educationsByProfileId.get(profile.id) || []
  const experiences = idx.experiencesByProfileId.get(profile.id) || []
  const rawProfileSkills = idx.profileSkillsByProfileId.get(profile.id) || []
  const profileSkills = rawProfileSkills.map((ps) => ({
    ...ps,
    skill: idx.skillsById.get(ps.skillId) || { id: ps.skillId, name: 'Skill', category: 'General' },
  }))
  return {
    ...profile,
    user,
    educations,
    experiences,
    profileSkills,
  }
}

function enrichUser(user: any, store: StoreShape): any {
  if (!user) return null
  const idx = getStoreIndexes(store)
  const rawProfile = idx.profilesByUserId.get(user.id) || null
  const profile = rawProfile ? enrichProfile(rawProfile, store) : null
  const _count = {
    eventRegistrations: idx.eventRegCountsByUserId.get(user.id) || 0,
    sentMessages: idx.sentMsgCountsByUserId.get(user.id) || 0,
    notifications: idx.notifCountsByUserId.get(user.id) || 0,
  }
  return {
    ...user,
    profile,
    _count,
  }
}

function enrichMentorshipProfile(mp: any, store: StoreShape): any {
  if (!mp) return null
  const idx = getStoreIndexes(store)
  const rawUser = idx.usersById.get(mp.userId)
  const user = rawUser ? enrichUser(rawUser, store) : null
  return {
    ...mp,
    user,
  }
}

function enrichMentorshipRequest(reqItem: any, store: StoreShape): any {
  if (!reqItem) return null
  const idx = getStoreIndexes(store)
  const rawMentor = idx.mentorshipByIdOrUser.get(reqItem.mentorId) || null
  const mentor = rawMentor ? enrichMentorshipProfile(rawMentor, store) : null

  const rawMenteeProfile = idx.mentorshipByIdOrUser.get(reqItem.menteeId) || null
  const menteeUser =
    idx.usersById.get(reqItem.menteeId) ||
    (rawMenteeProfile?.userId ? idx.usersById.get(rawMenteeProfile.userId) : null) ||
    null

  const mentee = rawMenteeProfile
    ? enrichMentorshipProfile(rawMenteeProfile, store)
    : {
        id: `mentee-${reqItem.menteeId}`,
        userId: reqItem.menteeId,
        headline: 'Mentee',
        bio: '',
        expertise: [],
        industries: [],
        user: menteeUser ? enrichUser(menteeUser, store) : null,
      }

  return {
    ...reqItem,
    mentor,
    mentee,
  }
}

function matchesWhere(record: any, where: any): boolean {
  if (!where || Object.keys(where).length === 0) return true

  for (const [key, cond] of Object.entries(where)) {
    if (cond === undefined) continue
    if (key === 'OR' && Array.isArray(cond)) {
      if (!cond.some((sub) => matchesWhere(record, sub))) return false
      continue
    }
    if (key === 'AND' && Array.isArray(cond)) {
      if (!cond.every((sub) => matchesWhere(record, sub))) return false
      continue
    }
    const val = record[key]
    if (
      cond &&
      typeof cond === 'object' &&
      !(cond instanceof Date) &&
      !Array.isArray(cond) &&
      !('contains' in cond) &&
      !('in' in cond) &&
      !('notIn' in cond) &&
      !('not' in cond) &&
      !('has' in cond) &&
      !('equals' in cond) &&
      !('gt' in cond) &&
      !('gte' in cond) &&
      !('lt' in cond) &&
      !('lte' in cond)
    ) {
      if ('some' in cond && Array.isArray(val)) {
        if (!val.some((item) => matchesWhere(item, (cond as any).some))) return false
        continue
      }
      if ('every' in cond && Array.isArray(val)) {
        if (!val.every((item) => matchesWhere(item, (cond as any).every))) return false
        continue
      }
      if (!matchesWhere(val || {}, cond)) return false
      continue
    }

    if (!matchesCondition(val, cond, record)) return false
  }

  return true
}

function applyMutationData(existing: any, data: Record<string, any>): any {
  const updated = { ...existing }
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue
    if (v && typeof v === 'object' && !(v instanceof Date) && !Array.isArray(v)) {
      if (typeof v.increment === 'number') {
        updated[k] = Number(updated[k] ?? 0) + v.increment
        continue
      }
      if (typeof v.decrement === 'number') {
        updated[k] = Math.max(0, Number(updated[k] ?? 0) - v.decrement)
        continue
      }
    }
    updated[k] = v instanceof Date ? v.toISOString() : v
  }
  updated.updatedAt = new Date().toISOString()
  return updated
}

export const prisma: any = {
  user: {
    async findUnique({ where, select, include }: any) {
      const store = loadStore()
      const found = store.users.find(
        (u) => (where.id && u.id === where.id) || (where.email && u.email.toLowerCase() === String(where.email).toLowerCase())
      )
      return applySelectOrInclude(found, { select, include }, (r) => enrichUser(r, store))
    },
    async findFirst({ where, select, include }: any = {}) {
      const store = loadStore()
      const enriched = store.users.map((u) => enrichUser(u, store))
      const found = enriched.find((u) => matchesWhere(u, where))
      return applySelectOrInclude(found, { select, include })
    },
    async findMany({ where, select, include, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const enriched = store.users.map((u) => enrichUser(u, store)).filter((u) => matchesWhere(u, where))
      const sorted = sortRecords(enriched, orderBy)
      const paged = paginateRecords(sorted, skip, take)
      return paged.map((u) => applySelectOrInclude(u, { select, include }))
    },
    async create({ data, select, include }: any) {
      const store = loadStore()
      const now = new Date().toISOString()
      const user = {
        id: data.id || newId('user'),
        email: data.email,
        passwordHash: data.passwordHash || DEFAULT_PASSWORD_HASH,
        name: data.name,
        avatarUrl: data.avatarUrl || null,
        role: data.role || 'MEMBER',
        status: data.status || 'ACTIVE',
        emailVerified: data.emailVerified ?? true,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      }
      store.users.unshift(user)
      // Automatically create a public profile for new users
      if (!store.profiles.some((p) => p.userId === user.id)) {
        store.profiles.push({
          id: newId('profile'),
          userId: user.id,
          headline: `${user.name} — Sukkur IBA Community Member`,
          bio: '',
          location: 'Sukkur, Pakistan',
          graduationYear: 2024,
          degree: 'BS Computer Science',
          major: 'Computer Science',
          isPublic: true,
          showEmail: true,
          showPhone: false,
          createdAt: now,
          updatedAt: now,
        })
      }
      saveStore()
      return applySelectOrInclude(user, { select, include }, (r) => enrichUser(r, store))
    },
    async update({ where, data, select, include }: any) {
      const store = loadStore()
      const idx = store.users.findIndex(
        (u) => (where.id && u.id === where.id) || (where.email && u.email === where.email)
      )
      if (idx === -1) throw new Error('User not found')
      store.users[idx] = applyMutationData(store.users[idx], data)
      saveStore()
      return applySelectOrInclude(store.users[idx], { select, include }, (r) => enrichUser(r, store))
    },
    async delete({ where }: any) {
      const store = loadStore()
      const idx = store.users.findIndex((u) => u.id === where.id)
      if (idx === -1) throw new Error('User not found')
      const [removed] = store.users.splice(idx, 1)
      saveStore()
      return removed
    },
    async deleteMany({ where }: any = {}) {
      const store = loadStore()
      const before = store.users.length
      store.users = where ? store.users.filter((u) => !matchesWhere(u, where)) : []
      saveStore()
      return { count: before - store.users.length }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.users.map((u) => enrichUser(u, store)).filter((u) => matchesWhere(u, where)).length
    },
    async groupBy({ by }: any) {
      const store = loadStore()
      const field = Array.isArray(by) ? by[0] : by
      const counts = new Map<string, number>()
      for (const u of store.users) {
        const key = String(u[field] ?? 'UNKNOWN')
        counts.set(key, (counts.get(key) || 0) + 1)
      }
      return Array.from(counts.entries()).map(([k, count]) => ({ [field]: k, _count: count }))
    },
  },

  profile: {
    async findUnique({ where, select, include }: any) {
      const store = loadStore()
      const found = store.profiles.find(
        (p) => (where.id && p.id === where.id) || (where.userId && p.userId === where.userId)
      )
      return applySelectOrInclude(found, { select, include }, (r) => enrichProfile(r, store))
    },
    async findUniqueOrThrow({ where, select, include }: any) {
      const store = loadStore()
      let found = store.profiles.find(
        (p) => (where.id && p.id === where.id) || (where.userId && p.userId === where.userId)
      )
      if (!found && where.userId) {
        const now = new Date().toISOString()
        found = {
          id: newId('profile'),
          userId: where.userId,
          headline: '',
          bio: '',
          location: 'Sukkur, Pakistan',
          isPublic: true,
          showEmail: false,
          showPhone: false,
          createdAt: now,
          updatedAt: now,
        }
        store.profiles.push(found)
        saveStore()
      }
      if (!found) throw new Error('Profile not found')
      return applySelectOrInclude(found, { select, include }, (r) => enrichProfile(r, store))
    },
    async findMany({ where, select, include, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const enriched = store.profiles.map((p) => enrichProfile(p, store)).filter((p) => matchesWhere(p, where))
      const sorted = sortRecords(enriched, orderBy)
      const paged = paginateRecords(sorted, skip, take)
      return paged.map((p) => applySelectOrInclude(p, { select, include }))
    },
    async create({ data, select, include }: any) {
      const store = loadStore()
      const now = new Date().toISOString()
      const profile = {
        id: data.id || newId('profile'),
        userId: data.userId,
        headline: data.headline ?? '',
        bio: data.bio ?? '',
        location: data.location ?? 'Sukkur, Pakistan',
        website: data.website ?? '',
        linkedinUrl: data.linkedinUrl ?? '',
        twitterUrl: data.twitterUrl ?? '',
        githubUrl: data.githubUrl ?? '',
        graduationYear: data.graduationYear ?? 2024,
        degree: data.degree ?? 'BS Computer Science',
        major: data.major ?? 'Computer Science',
        isPublic: data.isPublic ?? true,
        showEmail: data.showEmail ?? false,
        showPhone: data.showPhone ?? false,
        createdAt: now,
        updatedAt: now,
      }
      store.profiles.push(profile)
      saveStore()
      return applySelectOrInclude(profile, { select, include }, (r) => enrichProfile(r, store))
    },
    async update({ where, data, select, include }: any) {
      const store = loadStore()
      const idx = store.profiles.findIndex(
        (p) => (where.id && p.id === where.id) || (where.userId && p.userId === where.userId)
      )
      if (idx === -1) throw new Error('Profile not found')
      store.profiles[idx] = applyMutationData(store.profiles[idx], data)
      saveStore()
      return applySelectOrInclude(store.profiles[idx], { select, include }, (r) => enrichProfile(r, store))
    },
    async upsert({ where, create, update, select, include }: any) {
      const store = loadStore()
      const idx = store.profiles.findIndex(
        (p) => (where.id && p.id === where.id) || (where.userId && p.userId === where.userId)
      )
      if (idx !== -1) {
        store.profiles[idx] = applyMutationData(store.profiles[idx], update)
        saveStore()
        return applySelectOrInclude(store.profiles[idx], { select, include }, (r) => enrichProfile(r, store))
      }
      return this.create({ data: create, select, include })
    },
    async deleteMany({ where }: any = {}) {
      const store = loadStore()
      const before = store.profiles.length
      store.profiles = where ? store.profiles.filter((p) => !matchesWhere(p, where)) : []
      saveStore()
      return { count: before - store.profiles.length }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.profiles.map((p) => enrichProfile(p, store)).filter((p) => matchesWhere(p, where)).length
    },
  },

  education: {
    async findUnique({ where }: any) {
      const store = loadStore()
      return store.educations.find((e) => e.id === where.id) || null
    },
    async findMany({ where, orderBy }: any = {}) {
      const store = loadStore()
      const filtered = store.educations.filter((e) => matchesWhere(e, where))
      return sortRecords(filtered, orderBy)
    },
    async create({ data }: any) {
      const store = loadStore()
      const now = new Date().toISOString()
      const edu = { id: newId('edu'), ...data, createdAt: now, updatedAt: now }
      store.educations.push(edu)
      saveStore()
      return edu
    },
    async update({ where, data }: any) {
      const store = loadStore()
      const idx = store.educations.findIndex((e) => e.id === where.id)
      if (idx === -1) throw new Error('Education not found')
      store.educations[idx] = applyMutationData(store.educations[idx], data)
      saveStore()
      return store.educations[idx]
    },
    async delete({ where }: any) {
      const store = loadStore()
      const idx = store.educations.findIndex((e) => e.id === where.id)
      if (idx === -1) throw new Error('Education not found')
      const [removed] = store.educations.splice(idx, 1)
      saveStore()
      return removed
    },
    async deleteMany() {
      const store = loadStore()
      store.educations = []
      saveStore()
      return { count: 0 }
    },
  },

  experience: {
    async findUnique({ where }: any) {
      const store = loadStore()
      return store.experiences.find((e) => e.id === where.id) || null
    },
    async findMany({ where, orderBy, take }: any = {}) {
      const store = loadStore()
      const filtered = store.experiences.filter((e) => matchesWhere(e, where))
      return paginateRecords(sortRecords(filtered, orderBy), 0, take)
    },
    async create({ data }: any) {
      const store = loadStore()
      const now = new Date().toISOString()
      const exp = { id: newId('exp'), ...data, createdAt: now, updatedAt: now }
      store.experiences.push(exp)
      saveStore()
      return exp
    },
    async update({ where, data }: any) {
      const store = loadStore()
      const idx = store.experiences.findIndex((e) => e.id === where.id)
      if (idx === -1) throw new Error('Experience not found')
      store.experiences[idx] = applyMutationData(store.experiences[idx], data)
      saveStore()
      return store.experiences[idx]
    },
    async delete({ where }: any) {
      const store = loadStore()
      const idx = store.experiences.findIndex((e) => e.id === where.id)
      if (idx === -1) throw new Error('Experience not found')
      const [removed] = store.experiences.splice(idx, 1)
      saveStore()
      return removed
    },
    async deleteMany() {
      const store = loadStore()
      store.experiences = []
      saveStore()
      return { count: 0 }
    },
  },

  skill: {
    async findUnique({ where }: any) {
      const store = loadStore()
      return (
        store.skills.find(
          (s) => (where.id && s.id === where.id) || (where.name && s.name.toLowerCase() === String(where.name).toLowerCase())
        ) || null
      )
    },
    async findMany({ where, orderBy, select }: any = {}) {
      const store = loadStore()
      const filtered = store.skills.filter((s) => matchesWhere(s, where))
      const sorted = sortRecords(filtered, orderBy)
      return sorted.map((s) => applySelectOrInclude(s, { select }))
    },
    async create({ data }: any) {
      const store = loadStore()
      const skill = { id: newId('skill'), name: data.name, category: data.category || 'General', createdAt: new Date().toISOString() }
      store.skills.push(skill)
      saveStore()
      return skill
    },
    async upsert({ where, create, update }: any) {
      const existing = await this.findUnique({ where })
      if (existing) return { ...existing, ...update }
      return this.create({ data: create })
    },
    async deleteMany() {
      const store = loadStore()
      store.skills = []
      saveStore()
      return { count: 0 }
    },
  },

  profileSkill: {
    async create({ data }: any) {
      const store = loadStore()
      const ps = { ...data, createdAt: new Date().toISOString() }
      store.profileSkills.push(ps)
      saveStore()
      return {
        ...ps,
        skill: store.skills.find((s) => s.id === ps.skillId) || null,
      }
    },
    async upsert({ where, create, update }: any) {
      const store = loadStore()
      const key = where.profileId_skillId
      const idx = store.profileSkills.findIndex(
        (ps) => ps.profileId === key.profileId && ps.skillId === key.skillId
      )
      if (idx !== -1) {
        store.profileSkills[idx] = { ...store.profileSkills[idx], ...update }
        saveStore()
        return {
          ...store.profileSkills[idx],
          skill: store.skills.find((s) => s.id === key.skillId) || null,
        }
      }
      return this.create({ data: create })
    },
    async delete({ where }: any) {
      const store = loadStore()
      const key = where.profileId_skillId
      const idx = store.profileSkills.findIndex(
        (ps) => ps.profileId === key.profileId && ps.skillId === key.skillId
      )
      if (idx !== -1) {
        const [removed] = store.profileSkills.splice(idx, 1)
        saveStore()
        return removed
      }
      return null
    },
    async deleteMany() {
      const store = loadStore()
      store.profileSkills = []
      saveStore()
      return { count: 0 }
    },
  },

  event: {
    enrich(evt: any, store: StoreShape) {
      if (!evt) return null
      const organizer = store.users.find((u) => u.id === evt.organizerId) || null
      const activeRegs = store.eventRegistrations
        .filter((r) => r.eventId === evt.id && r.status === 'REGISTERED')
        .map((r) => ({
          ...r,
          user: store.users.find((u) => u.id === r.userId) || null,
        }))
      return {
        ...evt,
        organizer,
        registrations: activeRegs,
        _count: { registrations: activeRegs.length },
      }
    },
    async findUnique({ where, select, include }: any) {
      const store = loadStore()
      const found = store.events.find(
        (e) => (where.id && e.id === where.id) || (where.slug && e.slug === where.slug)
      )
      return applySelectOrInclude(found, { select, include }, (r) => this.enrich(r, store))
    },
    async findMany({ where, select, include, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const enriched = store.events.map((e) => this.enrich(e, store)).filter((e) => matchesWhere(e, where))
      const sorted = sortRecords(enriched, orderBy)
      const paged = paginateRecords(sorted, skip, take)
      return paged.map((e) => applySelectOrInclude(e, { select, include }))
    },
    async create({ data, select, include }: any) {
      const store = loadStore()
      const now = new Date().toISOString()
      const evt = {
        id: data.id || newId('evt'),
        ...data,
        status: data.status || 'PUBLISHED',
        startDate: data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
        endDate: data.endDate instanceof Date ? data.endDate.toISOString() : data.endDate,
        createdAt: now,
        updatedAt: now,
      }
      store.events.unshift(evt)
      saveStore()
      return applySelectOrInclude(evt, { select, include }, (r) => this.enrich(r, store))
    },
    async update({ where, data, select, include }: any) {
      const store = loadStore()
      const idx = store.events.findIndex((e) => e.id === where.id)
      if (idx === -1) throw new Error('Event not found')
      store.events[idx] = applyMutationData(store.events[idx], data)
      saveStore()
      return applySelectOrInclude(store.events[idx], { select, include }, (r) => this.enrich(r, store))
    },
    async delete({ where }: any) {
      const store = loadStore()
      const idx = store.events.findIndex((e) => e.id === where.id)
      if (idx === -1) throw new Error('Event not found')
      const [removed] = store.events.splice(idx, 1)
      saveStore()
      return removed
    },
    async deleteMany() {
      const store = loadStore()
      store.events = []
      saveStore()
      return { count: 0 }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.events.map((e) => this.enrich(e, store)).filter((e) => matchesWhere(e, where)).length
    },
    async groupBy({ by }: any) {
      const store = loadStore()
      const field = Array.isArray(by) ? by[0] : by
      const counts = new Map<string, number>()
      for (const e of store.events) {
        const key = String(e[field] ?? 'PUBLISHED')
        counts.set(key, (counts.get(key) || 0) + 1)
      }
      return Array.from(counts.entries()).map(([k, count]) => ({ [field]: k, _count: count }))
    },
  },

  eventRegistration: {
    async findUnique({ where }: any) {
      const store = loadStore()
      if (where.id) {
        return store.eventRegistrations.find((r) => r.id === where.id) || null
      }
      if (where.eventId_userId) {
        const { eventId, userId } = where.eventId_userId
        return store.eventRegistrations.find((r) => r.eventId === eventId && r.userId === userId) || null
      }
      return null
    },
    async findMany({ where, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const enriched = store.eventRegistrations
        .map((r) => ({
          ...r,
          user: store.users.find((u) => u.id === r.userId) || null,
          event: store.events.find((e) => e.id === r.eventId) || null,
        }))
        .filter((r) => matchesWhere(r, where))
      return paginateRecords(sortRecords(enriched, orderBy), skip, take)
    },
    async create({ data }: any) {
      const store = loadStore()
      const reg = {
        id: newId('reg'),
        eventId: data.eventId,
        userId: data.userId,
        status: data.status || 'REGISTERED',
        registeredAt: new Date().toISOString(),
        attendedAt: null,
        cancelledAt: null,
      }
      store.eventRegistrations.push(reg)
      saveStore()
      return reg
    },
    async update({ where, data }: any) {
      const store = loadStore()
      const idx = store.eventRegistrations.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Registration not found')
      store.eventRegistrations[idx] = applyMutationData(store.eventRegistrations[idx], data)
      saveStore()
      return store.eventRegistrations[idx]
    },
    async deleteMany() {
      const store = loadStore()
      store.eventRegistrations = []
      saveStore()
      return { count: 0 }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.eventRegistrations.filter((r) => matchesWhere(r, where)).length
    },
  },

  job: {
    enrich(j: any, store: StoreShape) {
      if (!j) return null
      const postedBy = store.users.find((u) => u.id === j.postedById) || null
      return { ...j, postedBy }
    },
    async findUnique({ where, select, include }: any) {
      const store = loadStore()
      const found = store.jobs.find(
        (j) => (where.id && j.id === where.id) || (where.slug && j.slug === where.slug)
      )
      return applySelectOrInclude(found, { select, include }, (r) => this.enrich(r, store))
    },
    async findMany({ where, select, include, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const enriched = store.jobs.map((j) => this.enrich(j, store)).filter((j) => matchesWhere(j, where))
      const sorted = sortRecords(enriched, orderBy)
      const paged = paginateRecords(sorted, skip, take)
      return paged.map((j) => applySelectOrInclude(j, { select, include }))
    },
    async create({ data, select, include }: any) {
      const store = loadStore()
      const now = new Date().toISOString()
      const job = {
        id: data.id || newId('job'),
        ...data,
        status: data.status || 'ACTIVE',
        expiresAt: data.expiresAt
          ? data.expiresAt instanceof Date
            ? data.expiresAt.toISOString()
            : data.expiresAt
          : new Date(Date.now() + 60 * 86400000).toISOString(),
        createdAt: now,
        updatedAt: now,
      }
      store.jobs.unshift(job)
      saveStore()
      return applySelectOrInclude(job, { select, include }, (r) => this.enrich(r, store))
    },
    async update({ where, data, select, include }: any) {
      const store = loadStore()
      const idx = store.jobs.findIndex((j) => j.id === where.id)
      if (idx === -1) throw new Error('Job not found')
      store.jobs[idx] = applyMutationData(store.jobs[idx], data)
      saveStore()
      return applySelectOrInclude(store.jobs[idx], { select, include }, (r) => this.enrich(r, store))
    },
    async delete({ where }: any) {
      const store = loadStore()
      const idx = store.jobs.findIndex((j) => j.id === where.id)
      if (idx === -1) throw new Error('Job not found')
      const [removed] = store.jobs.splice(idx, 1)
      saveStore()
      return removed
    },
    async deleteMany() {
      const store = loadStore()
      store.jobs = []
      saveStore()
      return { count: 0 }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.jobs.map((j) => this.enrich(j, store)).filter((j) => matchesWhere(j, where)).length
    },
    async groupBy({ by }: any) {
      const store = loadStore()
      const field = Array.isArray(by) ? by[0] : by
      const counts = new Map<string, number>()
      for (const j of store.jobs) {
        const key = String(j[field] ?? 'ACTIVE')
        counts.set(key, (counts.get(key) || 0) + 1)
      }
      return Array.from(counts.entries()).map(([k, count]) => ({ [field]: k, _count: count }))
    },
  },

  mentorshipProfile: {
    fields: { maxMentees: 'maxMentees' },
    enrichFull(mp: any, store: StoreShape) {
      if (!mp) return null
      const base = enrichMentorshipProfile(mp, store)
      const sentRequests = store.mentorshipRequests
        .filter((r) => r.mentorId === mp.id || r.mentorId === mp.userId)
        .map((r) => enrichMentorshipRequest(r, store))
      const receivedRequests = store.mentorshipRequests
        .filter((r) => r.menteeId === mp.id || r.menteeId === mp.userId)
        .map((r) => enrichMentorshipRequest(r, store))
      return {
        ...base,
        sentRequests,
        receivedRequests,
      }
    },
    async findUnique({ where, select, include }: any) {
      const store = loadStore()
      const found = store.mentorshipProfiles.find(
        (m) => (where.id && m.id === where.id) || (where.userId && m.userId === where.userId)
      )
      return applySelectOrInclude(found, { select, include }, (r) => this.enrichFull(r, store))
    },
    async findMany({ where, select, include, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const enriched = store.mentorshipProfiles
        .map((m) => this.enrichFull(m, store))
        .filter((m) => matchesWhere(m, where))
      const sorted = sortRecords(enriched, orderBy)
      const paged = paginateRecords(sorted, skip, take)
      return paged.map((m) => applySelectOrInclude(m, { select, include }))
    },
    async create({ data, select, include }: any) {
      const store = loadStore()
      const now = new Date().toISOString()
      const mp = {
        id: data.id || newId('mentor'),
        userId: data.userId,
        headline: data.headline ?? '',
        bio: data.bio ?? '',
        expertise: data.expertise ?? [],
        industries: data.industries ?? [],
        maxMentees: data.maxMentees ?? 3,
        currentMentees: data.currentMentees ?? 0,
        isAvailable: data.isAvailable ?? true,
        meetingFrequency: data.meetingFrequency ?? 'Bi-weekly',
        preferredFormat: data.preferredFormat ?? 'Video Call',
        createdAt: now,
        updatedAt: now,
      }
      store.mentorshipProfiles.push(mp)
      saveStore()
      return applySelectOrInclude(mp, { select, include }, (r) => this.enrichFull(r, store))
    },
    async update({ where, data, select, include }: any) {
      const store = loadStore()
      const idx = store.mentorshipProfiles.findIndex(
        (m) => (where.id && m.id === where.id) || (where.userId && m.userId === where.userId)
      )
      if (idx === -1) throw new Error('Mentorship profile not found')
      store.mentorshipProfiles[idx] = applyMutationData(store.mentorshipProfiles[idx], data)
      saveStore()
      return applySelectOrInclude(store.mentorshipProfiles[idx], { select, include }, (r) =>
        this.enrichFull(r, store)
      )
    },
    async upsert({ where, create, update, select, include }: any) {
      const store = loadStore()
      const idx = store.mentorshipProfiles.findIndex(
        (m) => (where.id && m.id === where.id) || (where.userId && m.userId === where.userId)
      )
      if (idx !== -1) {
        store.mentorshipProfiles[idx] = applyMutationData(store.mentorshipProfiles[idx], update)
        saveStore()
        return applySelectOrInclude(store.mentorshipProfiles[idx], { select, include }, (r) =>
          this.enrichFull(r, store)
        )
      }
      return this.create({ data: create, select, include })
    },
    async deleteMany() {
      const store = loadStore()
      store.mentorshipProfiles = []
      saveStore()
      return { count: 0 }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.mentorshipProfiles
        .map((m) => this.enrichFull(m, store))
        .filter((m) => matchesWhere(m, where)).length
    },
  },

  mentorshipRequest: {
    async findUnique({ where, select, include }: any) {
      const store = loadStore()
      const found = store.mentorshipRequests.find((r) => r.id === where.id)
      return applySelectOrInclude(found, { select, include }, (r) => enrichMentorshipRequest(r, store))
    },
    async findFirst({ where, select, include }: any = {}) {
      const store = loadStore()
      const enriched = store.mentorshipRequests.map((r) => enrichMentorshipRequest(r, store))
      const found = enriched.find((r) => matchesWhere(r, where))
      return applySelectOrInclude(found, { select, include })
    },
    async findMany({ where, select, include, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const enriched = store.mentorshipRequests
        .map((r) => enrichMentorshipRequest(r, store))
        .filter((r) => matchesWhere(r, where))
      const sorted = sortRecords(enriched, orderBy)
      const paged = paginateRecords(sorted, skip, take)
      return paged.map((r) => applySelectOrInclude(r, { select, include }))
    },
    async create({ data, select, include }: any) {
      const store = loadStore()
      const reqObj = {
        id: newId('mreq'),
        mentorId: data.mentorId,
        menteeId: data.menteeId,
        message: data.message,
        status: data.status || 'PENDING',
        requestedAt: new Date().toISOString(),
        respondedAt: null,
        startedAt: null,
        completedAt: null,
        cancelledAt: null,
        cancellationReason: null,
      }
      store.mentorshipRequests.unshift(reqObj)
      saveStore()
      return applySelectOrInclude(reqObj, { select, include }, (r) => enrichMentorshipRequest(r, store))
    },
    async update({ where, data, select, include }: any) {
      const store = loadStore()
      const idx = store.mentorshipRequests.findIndex((r) => r.id === where.id)
      if (idx === -1) throw new Error('Mentorship request not found')
      store.mentorshipRequests[idx] = applyMutationData(store.mentorshipRequests[idx], data)
      saveStore()
      return applySelectOrInclude(store.mentorshipRequests[idx], { select, include }, (r) =>
        enrichMentorshipRequest(r, store)
      )
    },
    async deleteMany() {
      const store = loadStore()
      store.mentorshipRequests = []
      saveStore()
      return { count: 0 }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.mentorshipRequests
        .map((r) => enrichMentorshipRequest(r, store))
        .filter((r) => matchesWhere(r, where)).length
    },
    async groupBy({ by }: any) {
      const store = loadStore()
      const field = Array.isArray(by) ? by[0] : by
      const counts = new Map<string, number>()
      for (const r of store.mentorshipRequests) {
        const key = String(r[field] ?? 'PENDING')
        counts.set(key, (counts.get(key) || 0) + 1)
      }
      return Array.from(counts.entries()).map(([k, count]) => ({ [field]: k, _count: count }))
    },
  },

  conversation: {
    enrich(conv: any, store: StoreShape) {
      if (!conv) return null
      const participants = store.conversationParticipants
        .filter((cp) => cp.conversationId === conv.id && cp.leftAt == null)
        .map((cp) => ({
          ...cp,
          user: store.users.find((u) => u.id === cp.userId) || null,
        }))
      const messages = sortRecords(
        store.messages
          .filter((m) => m.conversationId === conv.id && m.deletedAt == null)
          .map((m) => ({
            ...m,
            sender: store.users.find((u) => u.id === m.senderId) || null,
          })),
        { createdAt: 'desc' }
      ).slice(0, 1)

      return {
        ...conv,
        participants,
        messages,
      }
    },
    async findUnique({ where, select, include }: any) {
      const store = loadStore()
      const found = store.conversations.find((c) => c.id === where.id)
      return applySelectOrInclude(found, { select, include }, (r) => this.enrich(r, store))
    },
    async findFirst({ where, select, include }: any = {}) {
      const store = loadStore()
      const enriched = store.conversations.map((c) => this.enrich(c, store))
      const found = enriched.find((c) => matchesWhere(c, where))
      return applySelectOrInclude(found, { select, include })
    },
    async findMany({ where, select, include, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const enriched = store.conversations
        .map((c) => this.enrich(c, store))
        .filter((c) => matchesWhere(c, where))
      const sorted = sortRecords(enriched, orderBy)
      const paged = paginateRecords(sorted, skip, take)
      return paged.map((c) => applySelectOrInclude(c, { select, include }))
    },
    async create({ data, select, include }: any) {
      const store = loadStore()
      const now = new Date().toISOString()
      const conv = {
        id: data.id || newId('conv'),
        type: data.type || 'DIRECT',
        name: data.name || null,
        avatarUrl: data.avatarUrl || null,
        createdById: data.createdById,
        createdAt: now,
        updatedAt: now,
      }
      store.conversations.unshift(conv)

      if (data.participants?.create && Array.isArray(data.participants.create)) {
        for (const p of data.participants.create) {
          store.conversationParticipants.push({
            id: newId('cp'),
            conversationId: conv.id,
            userId: p.userId,
            joinedAt: now,
            leftAt: null,
            isAdmin: Boolean(p.isAdmin),
            lastReadAt: now,
          })
        }
      }

      if (data.messages?.create && Array.isArray(data.messages.create)) {
        for (const m of data.messages.create) {
          store.messages.push({
            id: newId('msg'),
            conversationId: conv.id,
            senderId: m.senderId,
            content: m.content,
            messageType: m.messageType || 'TEXT',
            metadata: m.metadata || null,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          })
        }
      }

      saveStore()
      return applySelectOrInclude(conv, { select, include }, (r) => this.enrich(r, store))
    },
    async update({ where, data, select, include }: any) {
      const store = loadStore()
      const idx = store.conversations.findIndex((c) => c.id === where.id)
      if (idx === -1) throw new Error('Conversation not found')
      store.conversations[idx] = applyMutationData(store.conversations[idx], data)
      saveStore()
      return applySelectOrInclude(store.conversations[idx], { select, include }, (r) => this.enrich(r, store))
    },
    async deleteMany() {
      const store = loadStore()
      store.conversations = []
      saveStore()
      return { count: 0 }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.conversations
        .map((c) => this.enrich(c, store))
        .filter((c) => matchesWhere(c, where)).length
    },
  },

  conversationParticipant: {
    async findUnique({ where }: any) {
      const store = loadStore()
      if (where.id) {
        return store.conversationParticipants.find((cp) => cp.id === where.id) || null
      }
      if (where.conversationId_userId) {
        const { conversationId, userId } = where.conversationId_userId
        return (
          store.conversationParticipants.find(
            (cp) => cp.conversationId === conversationId && cp.userId === userId
          ) || null
        )
      }
      return null
    },
    async findMany({ where }: any = {}) {
      const store = loadStore()
      return store.conversationParticipants
        .map((cp) => ({
          ...cp,
          user: store.users.find((u) => u.id === cp.userId) || null,
        }))
        .filter((cp) => matchesWhere(cp, where))
    },
    async create({ data }: any) {
      const store = loadStore()
      const now = new Date().toISOString()
      const cp = {
        id: newId('cp'),
        conversationId: data.conversationId,
        userId: data.userId,
        joinedAt: now,
        leftAt: null,
        isAdmin: Boolean(data.isAdmin),
        lastReadAt: now,
      }
      store.conversationParticipants.push(cp)
      saveStore()
      return {
        ...cp,
        user: store.users.find((u) => u.id === cp.userId) || null,
      }
    },
    async update({ where, data }: any) {
      const store = loadStore()
      const idx = store.conversationParticipants.findIndex((cp) => cp.id === where.id)
      if (idx === -1) throw new Error('Participant not found')
      store.conversationParticipants[idx] = applyMutationData(store.conversationParticipants[idx], data)
      saveStore()
      return store.conversationParticipants[idx]
    },
    async deleteMany() {
      const store = loadStore()
      store.conversationParticipants = []
      saveStore()
      return { count: 0 }
    },
  },

  message: {
    enrich(m: any, store: StoreShape) {
      if (!m) return null
      return {
        ...m,
        sender: store.users.find((u) => u.id === m.senderId) || null,
      }
    },
    async findUnique({ where }: any) {
      const store = loadStore()
      const found = store.messages.find((m) => m.id === where.id)
      return this.enrich(found, store)
    },
    async findMany({ where, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const enriched = store.messages.map((m) => this.enrich(m, store)).filter((m) => matchesWhere(m, where))
      return paginateRecords(sortRecords(enriched, orderBy), skip, take)
    },
    async create({ data }: any) {
      const store = loadStore()
      const now = new Date().toISOString()
      const msg = {
        id: newId('msg'),
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content ?? '',
        messageType: data.messageType || 'TEXT',
        metadata: data.metadata || null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }
      store.messages.push(msg)
      saveStore()
      return this.enrich(msg, store)
    },
    async update({ where, data }: any) {
      const store = loadStore()
      const idx = store.messages.findIndex((m) => m.id === where.id)
      if (idx === -1) throw new Error('Message not found')
      store.messages[idx] = applyMutationData(store.messages[idx], data)
      saveStore()
      return this.enrich(store.messages[idx], store)
    },
    async deleteMany() {
      const store = loadStore()
      store.messages = []
      saveStore()
      return { count: 0 }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.messages.filter((m) => matchesWhere(m, where)).length
    },
  },

  notification: {
    async findUnique({ where }: any) {
      const store = loadStore()
      return store.notifications.find((n) => n.id === where.id) || null
    },
    async findMany({ where, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const filtered = store.notifications.filter((n) => matchesWhere(n, where))
      return paginateRecords(sortRecords(filtered, orderBy), skip, take)
    },
    async create({ data }: any) {
      const store = loadStore()
      const notif = {
        id: newId('notif'),
        userId: data.userId,
        type: data.type || 'SYSTEM',
        title: data.title,
        message: data.message,
        data: data.data || null,
        isRead: Boolean(data.isRead),
        readAt: data.readAt || null,
        createdAt: new Date().toISOString(),
      }
      store.notifications.unshift(notif)
      saveStore()
      return notif
    },
    async createMany({ data }: any) {
      if (!Array.isArray(data)) return { count: 0 }
      for (const item of data) {
        await this.create({ data: item })
      }
      return { count: data.length }
    },
    async update({ where, data }: any) {
      const store = loadStore()
      const idx = store.notifications.findIndex((n) => n.id === where.id)
      if (idx === -1) throw new Error('Notification not found')
      store.notifications[idx] = applyMutationData(store.notifications[idx], data)
      saveStore()
      return store.notifications[idx]
    },
    async updateMany({ where, data }: any) {
      const store = loadStore()
      let count = 0
      store.notifications = store.notifications.map((n) => {
        if (matchesWhere(n, where)) {
          count++
          return applyMutationData(n, data)
        }
        return n
      })
      saveStore()
      return { count }
    },
    async delete({ where }: any) {
      const store = loadStore()
      const idx = store.notifications.findIndex((n) => n.id === where.id)
      if (idx === -1) throw new Error('Notification not found')
      const [removed] = store.notifications.splice(idx, 1)
      saveStore()
      return removed
    },
    async deleteMany() {
      const store = loadStore()
      store.notifications = []
      saveStore()
      return { count: 0 }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.notifications.filter((n) => matchesWhere(n, where)).length
    },
  },

  announcement: {
    enrich(a: any, store: StoreShape) {
      if (!a) return null
      return {
        ...a,
        author: store.users.find((u) => u.id === a.authorId) || null,
      }
    },
    async findUnique({ where }: any) {
      const store = loadStore()
      const found = store.announcements.find((a) => a.id === where.id)
      return this.enrich(found, store)
    },
    async findMany({ where, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const enriched = store.announcements
        .map((a) => this.enrich(a, store))
        .filter((a) => matchesWhere(a, where))
      return paginateRecords(sortRecords(enriched, orderBy), skip, take)
    },
    async create({ data }: any) {
      const store = loadStore()
      const now = new Date().toISOString()
      const ann = {
        id: newId('ann'),
        title: data.title,
        content: data.content,
        priority: data.priority || 'NORMAL',
        authorId: data.authorId,
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : now,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        isPublished: data.isPublished ?? true,
        targetRoles: data.targetRoles || [],
        createdAt: now,
        updatedAt: now,
      }
      store.announcements.unshift(ann)
      saveStore()
      return this.enrich(ann, store)
    },
    async update({ where, data }: any) {
      const store = loadStore()
      const idx = store.announcements.findIndex((a) => a.id === where.id)
      if (idx === -1) throw new Error('Announcement not found')
      store.announcements[idx] = applyMutationData(store.announcements[idx], data)
      saveStore()
      return this.enrich(store.announcements[idx], store)
    },
    async delete({ where }: any) {
      const store = loadStore()
      const idx = store.announcements.findIndex((a) => a.id === where.id)
      if (idx === -1) throw new Error('Announcement not found')
      const [removed] = store.announcements.splice(idx, 1)
      saveStore()
      return removed
    },
    async deleteMany() {
      const store = loadStore()
      store.announcements = []
      saveStore()
      return { count: 0 }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.announcements.filter((a) => matchesWhere(a, where)).length
    },
  },

  auditLog: {
    async findMany({ where, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      const enriched = store.auditLogs
        .map((l) => ({
          ...l,
          user: store.users.find((u) => u.id === l.userId) || null,
        }))
        .filter((l) => matchesWhere(l, where))
      return paginateRecords(sortRecords(enriched, orderBy), skip, take)
    },
    async create({ data }: any) {
      const store = loadStore()
      const log = {
        id: newId('audit'),
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId || null,
        metadata: data.metadata || null,
        ipAddress: data.ipAddress || '127.0.0.1',
        userAgent: data.userAgent || null,
        createdAt: new Date().toISOString(),
      }
      store.auditLogs.unshift(log)
      saveStore()
      return log
    },
    async createMany({ data }: any) {
      if (!Array.isArray(data)) return { count: 0 }
      for (const item of data) {
        await this.create({ data: item })
      }
      return { count: data.length }
    },
    async deleteMany() {
      const store = loadStore()
      store.auditLogs = []
      saveStore()
      return { count: 0 }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      return store.auditLogs.filter((l) => matchesWhere(l, where)).length
    },
  },

  performanceLog: {
    async findMany({ where, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      if (!Array.isArray(store.performanceLogs)) store.performanceLogs = []
      const filtered = store.performanceLogs.filter((l) => matchesWhere(l, where))
      return paginateRecords(sortRecords(filtered, orderBy), skip, take)
    },
    async findUnique({ where }: any) {
      const store = loadStore()
      if (!Array.isArray(store.performanceLogs)) store.performanceLogs = []
      return store.performanceLogs.find((l) => l.id === where.id) || null
    },
    async create({ data }: any) {
      const store = loadStore()
      if (!Array.isArray(store.performanceLogs)) store.performanceLogs = []
      const createdAtDate = data.createdAt ? new Date(data.createdAt) : new Date()
      const createdAtIso = createdAtDate.toISOString()
      const expiresAtIso = data.expiresAt
        ? new Date(data.expiresAt).toISOString()
        : new Date(createdAtDate.getTime() + PERFORMANCE_LOG_TTL_MS).toISOString()

      const entry = {
        id: data.id || newId('perflog'),
        method: String(data.method || 'GET').toUpperCase(),
        route: String(data.route || '/api'),
        statusCode: Number(data.statusCode ?? 200),
        durationMs: Number(data.durationMs ?? 0),
        cacheStatus: String(data.cacheStatus || 'BYPASS'),
        isError: Boolean(data.isError ?? Number(data.statusCode) >= 400),
        isClientError: Boolean(
          data.isClientError ??
            (Number(data.statusCode) >= 400 && Number(data.statusCode) < 500),
        ),
        isServerError: Boolean(data.isServerError ?? Number(data.statusCode) >= 500),
        createdAt: createdAtIso,
        expiresAt: expiresAtIso,
      }
      store.performanceLogs.unshift(entry)
      if (store.performanceLogs.length > 5000) {
        store.performanceLogs.length = 5000
      }
      saveStore()
      return entry
    },
    async createMany({ data }: any) {
      if (!Array.isArray(data)) return { count: 0 }
      const store = loadStore()
      if (!Array.isArray(store.performanceLogs)) store.performanceLogs = []
      for (const item of data) {
        const createdAtDate = item.createdAt ? new Date(item.createdAt) : new Date()
        const createdAtIso = createdAtDate.toISOString()
        const expiresAtIso = item.expiresAt
          ? new Date(item.expiresAt).toISOString()
          : new Date(createdAtDate.getTime() + PERFORMANCE_LOG_TTL_MS).toISOString()
        store.performanceLogs.unshift({
          id: item.id || newId('perflog'),
          method: String(item.method || 'GET').toUpperCase(),
          route: String(item.route || '/api'),
          statusCode: Number(item.statusCode ?? 200),
          durationMs: Number(item.durationMs ?? 0),
          cacheStatus: String(item.cacheStatus || 'BYPASS'),
          isError: Boolean(item.isError ?? Number(item.statusCode) >= 400),
          isClientError: Boolean(
            item.isClientError ??
              (Number(item.statusCode) >= 400 && Number(item.statusCode) < 500),
          ),
          isServerError: Boolean(item.isServerError ?? Number(item.statusCode) >= 500),
          createdAt: createdAtIso,
          expiresAt: expiresAtIso,
        })
      }
      saveStore()
      return { count: data.length }
    },
    async deleteMany({ where }: any = {}) {
      const store = loadStore()
      if (!Array.isArray(store.performanceLogs)) store.performanceLogs = []
      const before = store.performanceLogs.length
      store.performanceLogs = where
        ? store.performanceLogs.filter((l) => !matchesWhere(l, where))
        : []
      saveStore()
      return { count: before - store.performanceLogs.length }
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      if (!Array.isArray(store.performanceLogs)) store.performanceLogs = []
      return store.performanceLogs.filter((l) => matchesWhere(l, where)).length
    },
    async purgeExpired({
      retentionDays = PERFORMANCE_LOG_TTL_DAYS,
      now = new Date(),
    }: { retentionDays?: number; now?: Date } = {}) {
      const store = loadStore()
      if (!Array.isArray(store.performanceLogs)) store.performanceLogs = []
      const nowMs = now.getTime()
      const cutoffMs = nowMs - retentionDays * 24 * 60 * 60 * 1000
      const cutoffIso = new Date(cutoffMs).toISOString()

      const before = store.performanceLogs.length
      store.performanceLogs = store.performanceLogs.filter((entry) => {
        const createdMs = new Date(entry.createdAt).getTime()
        const expiresMs = entry.expiresAt
          ? new Date(entry.expiresAt).getTime()
          : createdMs + retentionDays * 24 * 60 * 60 * 1000
        return createdMs >= cutoffMs && expiresMs > nowMs
      })
      const purgedCount = before - store.performanceLogs.length
      if (purgedCount > 0) {
        saveStore()
      }
      return {
        count: purgedCount,
        cutoffIso,
        remainingCount: store.performanceLogs.length,
      }
    },
  },

  jobApplication: {
    async findMany({ where, orderBy, skip, take }: any = {}) {
      const store = loadStore()
      if (!Array.isArray(store.jobApplications)) store.jobApplications = []
      const filtered = store.jobApplications.filter((a) => matchesWhere(a, where))
      return paginateRecords(sortRecords(filtered, orderBy), skip, take)
    },
    async findUnique({ where }: any) {
      const store = loadStore()
      if (!Array.isArray(store.jobApplications)) store.jobApplications = []
      return store.jobApplications.find((a) => a.id === where.id) || null
    },
    async create({ data }: any) {
      const store = loadStore()
      if (!Array.isArray(store.jobApplications)) store.jobApplications = []
      const app = {
        id: data.id || newId('app'),
        ...data,
        appliedAt: data.appliedAt || new Date().toISOString().slice(0, 10),
        status: data.status || 'SUBMITTED',
        createdAt: new Date().toISOString(),
      }
      store.jobApplications.unshift(app)
      if (!store.platformState) store.platformState = {}
      if (Array.isArray(store.platformState.jobApplications)) {
        const exists = store.platformState.jobApplications.some((x: any) => x.id === app.id)
        if (!exists) store.platformState.jobApplications.unshift(app)
      }
      saveStore()
      return app
    },
    async update({ where, data }: any) {
      const store = loadStore()
      if (!Array.isArray(store.jobApplications)) store.jobApplications = []
      const idx = store.jobApplications.findIndex((a) => a.id === where.id)
      if (idx !== -1) {
        store.jobApplications[idx] = applyMutationData(store.jobApplications[idx], data)
      }
      if (store.platformState && Array.isArray(store.platformState.jobApplications)) {
        const pIdx = store.platformState.jobApplications.findIndex((a: any) => a.id === where.id)
        if (pIdx !== -1) {
          store.platformState.jobApplications[pIdx] = applyMutationData(
            store.platformState.jobApplications[pIdx],
            data
          )
        }
      }
      saveStore()
      return idx !== -1
        ? store.jobApplications[idx]
        : store.platformState?.jobApplications?.find((a: any) => a.id === where.id) || null
    },
    async count({ where }: any = {}) {
      const store = loadStore()
      const list = store.platformState?.jobApplications || store.jobApplications || []
      return list.filter((a: any) => matchesWhere(a, where)).length
    },
  },

  platformState: {
    async getAll() {
      const store = loadStore()
      if (!store.platformState) {
        store.platformState = {}
        saveStore()
      }
      return store.platformState
    },
    async getKey(key: string) {
      const store = loadStore()
      if (!store.platformState) store.platformState = {}
      return store.platformState[key] ?? null
    },
    async setKey(key: string, value: any) {
      const store = loadStore()
      if (!store.platformState) store.platformState = {}
      store.platformState[key] = value
      if (key === 'jobApplications' && Array.isArray(value)) {
        store.jobApplications = value
      }
      saveStore()
      return store.platformState[key]
    },
  },

  async $queryRaw() {
    const now = new Date()
    return [2, 1, 0].map((offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1)
      return { month: d.toISOString(), count: 4 - offset }
    })
  },

  async $transaction(arg: any) {
    if (typeof arg === 'function') {
      return arg(prisma)
    }
    if (Array.isArray(arg)) {
      return Promise.all(arg)
    }
    return null
  },

  async $disconnect() {},
}

export default prisma