import { PrismaClient, UserRole, UserStatus, EventStatus, JobStatus, EmploymentType, MentorshipStatus, AnnouncementPriority, ConversationType, MessageType, NotificationType } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  })
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning existing data...')
    await prisma.auditLog.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.message.deleteMany()
    await prisma.conversationParticipant.deleteMany()
    await prisma.conversation.deleteMany()
    await prisma.mentorshipRequest.deleteMany()
    await prisma.mentorshipProfile.deleteMany()
    await prisma.job.deleteMany()
    await prisma.eventRegistration.deleteMany()
    await prisma.event.deleteMany()
    await prisma.profileSkill.deleteMany()
    await prisma.skill.deleteMany()
    await prisma.experience.deleteMany()
    await prisma.education.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.announcement.deleteMany()
    await prisma.user.deleteMany()
  }

  // Create skills
  console.log('🎯 Creating skills...')
  const skills = await Promise.all([
    'Software Engineering', 'Data Science', 'Machine Learning', 'Product Management',
    'UX/UI Design', 'DevOps', 'Cloud Architecture', 'Cybersecurity',
    'Mobile Development', 'Web Development', 'Backend Development', 'Frontend Development',
    'Database Design', 'System Architecture', 'Project Management', 'Agile/Scrum',
    'Business Analysis', 'Financial Modeling', 'Investment Banking', 'Corporate Finance',
    'Marketing Strategy', 'Digital Marketing', 'Content Strategy', 'Brand Management',
    'Human Resources', 'Talent Acquisition', 'Learning & Development', 'Organizational Development',
    'Sales Leadership', 'Account Management', 'Business Development', 'Customer Success',
    'Operations Management', 'Supply Chain', 'Quality Assurance', 'Process Improvement',
  ].map(name => prisma.skill.upsert({
    where: { name },
    update: {},
    create: { name, category: 'Technology' },
  })))

  // Create users
  console.log('👥 Creating users...')
  const passwordHash = await hashPassword('password123')

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@alumni-connect.local',
      passwordHash,
      name: 'System Administrator',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  })

  const admin = await prisma.user.create({
    data: {
      email: 'admin2@alumni-connect.local',
      passwordHash,
      name: 'Platform Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  })

  const eventManager = await prisma.user.create({
    data: {
      email: 'events@alumni-connect.local',
      passwordHash,
      name: 'Event Manager',
      role: UserRole.EVENT_MANAGER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  })

  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@alumni-connect.local',
      passwordHash,
      name: 'Content Moderator',
      role: UserRole.MODERATOR,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  })

  const mentorshipManager = await prisma.user.create({
    data: {
      email: 'mentorship@alumni-connect.local',
      passwordHash,
      name: 'Mentorship Coordinator',
      role: UserRole.MENTORSHIP_MANAGER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  })

  // Create member users with profiles
  const memberData = [
    {
      email: 'sarah.ahmed@alumni-connect.local',
      name: 'Sarah Ahmed',
      graduationYear: 2020,
      degree: 'Bachelor of Science',
      major: 'Computer Science',
      headline: 'Senior Software Engineer at TechCorp',
      bio: 'Passionate full-stack developer with 4+ years of experience building scalable web applications. Love mentoring junior developers and contributing to open source.',
      location: 'Karachi, Pakistan',
      company: 'TechCorp',
      title: 'Senior Software Engineer',
      skills: ['Software Engineering', 'Web Development', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    },
    {
      email: 'ahmed.khan@alumni-connect.local',
      name: 'Ahmed Khan',
      graduationYear: 2018,
      degree: 'Master of Business Administration',
      major: 'Finance',
      headline: 'Investment Analyst at Global Capital',
      bio: 'Finance professional with expertise in equity research, financial modeling, and portfolio management. CFA Level III candidate.',
      location: 'Dubai, UAE',
      company: 'Global Capital',
      title: 'Investment Analyst',
      skills: ['Financial Modeling', 'Investment Banking', 'Corporate Finance', 'Equity Research'],
    },
    {
      email: 'fatima.shah@alumni-connect.local',
      name: 'Fatima Shah',
      graduationYear: 2021,
      degree: 'Bachelor of Science',
      major: 'Data Science',
      headline: 'Data Scientist at AI Innovations',
      bio: 'ML engineer specializing in NLP and computer vision. Published research at NeurIPS 2023. Advocate for women in tech.',
      location: 'San Francisco, USA',
      company: 'AI Innovations',
      title: 'Data Scientist',
      skills: ['Data Science', 'Machine Learning', 'Python', 'TensorFlow', 'NLP', 'Computer Vision'],
    },
    {
      email: 'omar.hassan@alumni-connect.local',
      name: 'Omar Hassan',
      graduationYear: 2019,
      degree: 'Bachelor of Engineering',
      major: 'Electrical Engineering',
      headline: 'Product Manager at StartupXYZ',
      bio: 'Product leader driving B2B SaaS products from 0 to 1. Former software engineer turned PM. Mentor at multiple accelerators.',
      location: 'London, UK',
      company: 'StartupXYZ',
      title: 'Product Manager',
      skills: ['Product Management', 'Agile/Scrum', 'System Architecture', 'Business Analysis', 'Project Management'],
    },
    {
      email: 'aisha.malik@alumni-connect.local',
      name: 'Aisha Malik',
      graduationYear: 2022,
      degree: 'Bachelor of Arts',
      major: 'Graphic Design',
      headline: 'UX Designer at Creative Studio',
      bio: 'Design thinker creating intuitive digital experiences. Winner of Red Dot Design Award 2023. Speaker at design conferences.',
      location: 'Toronto, Canada',
      company: 'Creative Studio',
      title: 'Senior UX Designer',
      skills: ['UX/UI Design', 'Design Systems', 'Figma', 'User Research', 'Prototyping'],
    },
    {
      email: 'bilal.raza@alumni-connect.local',
      name: 'Bilal Raza',
      graduationYear: 2017,
      degree: 'Master of Science',
      major: 'Computer Science',
      headline: 'Engineering Manager at ScaleUp Inc',
      bio: 'Engineering leader building high-performing teams. 10+ years in distributed systems. Active in developer community.',
      location: 'Singapore',
      company: 'ScaleUp Inc',
      title: 'Engineering Manager',
      skills: ['Software Engineering', 'System Architecture', 'DevOps', 'Cloud Architecture', 'Team Leadership'],
    },
    {
      email: 'zara.ibrahim@alumni-connect.local',
      name: 'Zara Ibrahim',
      graduationYear: 2023,
      degree: 'Bachelor of Science',
      major: 'Marketing',
      headline: 'Marketing Specialist at GrowthLabs',
      bio: 'Growth marketer specializing in SEO, content strategy, and conversion optimization. Helped 3 startups scale to $1M+ ARR.',
      location: 'Sydney, Australia',
      company: 'GrowthLabs',
      title: 'Marketing Specialist',
      skills: ['Digital Marketing', 'Content Strategy', 'SEO', 'Marketing Strategy', 'Analytics'],
    },
    {
      email: 'hassan.ali@alumni-connect.local',
      name: 'Hassan Ali',
      graduationYear: 2016,
      degree: 'Doctor of Philosophy',
      major: 'Machine Learning',
      headline: 'Principal Research Scientist at DeepMind',
      bio: 'AI researcher pushing boundaries in reinforcement learning. 50+ publications. PhD from Sukkur IBA. Mentoring PhD students.',
      location: 'Mountain View, USA',
      company: 'DeepMind',
      title: 'Principal Research Scientist',
      skills: ['Machine Learning', 'Deep Learning', 'Reinforcement Learning', 'Research', 'Python', 'PyTorch'],
    },
  ]

  const members = []
  for (const data of memberData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: UserRole.MEMBER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
    })

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        headline: data.headline,
        bio: data.bio,
        location: data.location,
        graduationYear: data.graduationYear,
        degree: data.degree,
        major: data.major,
        isPublic: true,
        showEmail: false,
        showPhone: false,
      },
    })

    // Add experiences
    await prisma.experience.create({
      data: {
        profileId: profile.id,
        company: data.company,
        title: data.title,
        location: data.location,
        employmentType: EmploymentType.FULL_TIME,
        startDate: new Date(data.graduationYear + 1, 6, 1),
        isCurrent: true,
        description: `Leading initiatives at ${data.company} as a ${data.title}.`,
      },
    })

    // Add education
    await prisma.education.create({
      data: {
        profileId: profile.id,
        institution: 'Sukkur IBA University',
        degree: data.degree,
        fieldOfStudy: data.major,
        startYear: data.graduationYear - 4,
        endYear: data.graduationYear,
        isCurrent: false,
      },
    })

    // Add skills
    for (const skillName of data.skills) {
      const skill = await prisma.skill.findUnique({ where: { name: skillName } })
      if (skill) {
        await prisma.profileSkill.create({
          data: {
            profileId: profile.id,
            skillId: skill.id,
            proficiency: Math.floor(Math.random() * 5) + 3,
          },
        })
      }
    }

    members.push({ user, profile })
  }

  // Create mentorship profiles for some members
  console.log('🤝 Creating mentorship profiles...')
  const mentorUsers = [members[0], members[1], members[3], members[5], members[7]]
  for (const { user, profile } of mentorUsers) {
    await prisma.mentorshipProfile.create({
      data: {
        userId: user.id,
        headline: `Mentor: ${profile.headline}`,
        bio: `${profile.bio}\n\nI'm passionate about helping the next generation of professionals navigate their careers. I can provide guidance on career transitions, technical growth, leadership development, and industry insights.`,
        expertise: profile.profileSkills?.slice(0, 3).map(ps => ps.skill?.name) || ['Career Growth', 'Leadership', 'Technical Excellence'],
        industries: ['Technology', 'Finance', 'Consulting'],
        maxMentees: 3,
        currentMentees: 0,
        isAvailable: true,
        meetingFrequency: 'Bi-weekly',
        preferredFormat: 'Video Call',
      },
    })
  }

  // Create events
  console.log('📅 Creating events...')
  const now = new Date()
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Annual Alumni Reunion 2024',
        slug: 'annual-alumni-reunion-2024',
        description: 'Join us for the biggest alumni gathering of the year! Reconnect with old friends, network with fellow graduates, and celebrate our shared journey. Featuring keynote speakers, panel discussions, and a gala dinner.',
        shortDescription: 'Annual reunion with keynotes, panels, and gala dinner.',
        startDate: new Date(now.getFullYear(), now.getMonth() + 2, 15, 18, 0),
        endDate: new Date(now.getFullYear(), now.getMonth() + 2, 15, 23, 0),
        timezone: 'Asia/Karachi',
        location: 'Sukkur IBA University Main Campus',
        isVirtual: false,
        capacity: 500,
        status: EventStatus.PUBLISHED,
        organizerId: eventManager.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Tech Career Fair 2024',
        slug: 'tech-career-fair-2024',
        description: 'Connect with top tech companies hiring alumni. Over 30 companies from startups to FAANG. Bring your resume and prepare for on-site interviews.',
        shortDescription: '30+ tech companies hiring alumni. On-site interviews available.',
        startDate: new Date(now.getFullYear(), now.getMonth() + 1, 20, 10, 0),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 20, 16, 0),
        timezone: 'Asia/Karachi',
        location: 'Sukkur IBA University Auditorium',
        isVirtual: false,
        capacity: 300,
        status: EventStatus.PUBLISHED,
        organizerId: eventManager.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Women in Tech Leadership Panel',
        slug: 'women-in-tech-leadership-panel',
        description: 'Hear from successful women alumni leading tech teams globally. Discussion on breaking barriers, building inclusive teams, and career advancement strategies.',
        shortDescription: 'Panel discussion with women tech leaders.',
        startDate: new Date(now.getFullYear(), now.getMonth() + 1, 5, 19, 0),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 5, 21, 0),
        timezone: 'UTC',
        isVirtual: true,
        virtualUrl: 'https://meet.alumni-connect.local/women-in-tech',
        capacity: 200,
        status: EventStatus.PUBLISHED,
        organizerId: eventManager.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Entrepreneurship Workshop: From Idea to IPO',
        slug: 'entrepreneurship-workshop-idea-to-ipo',
        description: 'Full-day workshop covering ideation, validation, fundraising, scaling, and exit strategies. Led by successful alumni founders.',
        shortDescription: 'Full-day startup workshop with alumni founders.',
        startDate: new Date(now.getFullYear(), now.getMonth() + 3, 10, 9, 0),
        endDate: new Date(now.getFullYear(), now.getMonth() + 3, 10, 17, 0),
        timezone: 'Asia/Karachi',
        location: 'Sukkur IBA Incubation Center',
        isVirtual: false,
        capacity: 100,
        status: EventStatus.PUBLISHED,
        organizerId: eventManager.id,
      },
    }),
  ])

  // Create jobs
  console.log('💼 Creating jobs...')
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Senior Full Stack Engineer',
        slug: 'senior-full-stack-engineer-techcorp',
        company: 'TechCorp',
        companyLogoUrl: 'https://logo.clearbit.com/techcorp.com',
        companyWebsite: 'https://techcorp.com',
        description: 'We are looking for a Senior Full Stack Engineer to join our core product team. You will build features end-to-end, mentor junior engineers, and contribute to architectural decisions.',
        requirements: '5+ years experience with React, Node.js, TypeScript, PostgreSQL. Experience with AWS and Kubernetes preferred.',
        benefits: 'Competitive salary, equity, health insurance, learning budget, flexible remote work.',
        location: 'Karachi, Pakistan',
        isRemote: true,
        employmentType: EmploymentType.FULL_TIME,
        salaryMin: 80000,
        salaryMax: 150000,
        salaryCurrency: 'USD',
        status: JobStatus.ACTIVE,
        postedById: admin.id,
        expiresAt: new Date(now.getFullYear(), now.getMonth() + 2, 1),
      },
    }),
    prisma.job.create({
      data: {
        title: 'Data Scientist - NLP',
        slug: 'data-scientist-nlp-ai-innovations',
        company: 'AI Innovations',
        companyLogoUrl: 'https://logo.clearbit.com/ai-innovations.com',
        companyWebsite: 'https://ai-innovations.com',
        description: 'Join our NLP research team building next-generation language models. Work on cutting-edge research with direct product impact.',
        requirements: 'PhD or MS in CS/ML. Strong publication record in NLP. Expert in PyTorch, Transformers. Experience with large-scale training.',
        benefits: 'Top-tier compensation, research freedom, conference budget, GPU cluster access.',
        location: 'San Francisco, USA',
        isRemote: false,
        employmentType: EmploymentType.FULL_TIME,
        salaryMin: 150000,
        salaryMax: 250000,
        salaryCurrency: 'USD',
        status: JobStatus.ACTIVE,
        postedById: admin.id,
        expiresAt: new Date(now.getFullYear(), now.getMonth() + 1, 15),
      },
    }),
    prisma.job.create({
      data: {
        title: 'Product Manager - B2B SaaS',
        slug: 'product-manager-b2b-saas-startupxyz',
        company: 'StartupXYZ',
        companyLogoUrl: 'https://logo.clearbit.com/startupxyz.com',
        companyWebsite: 'https://startupxyz.com',
        description: 'Lead product strategy for our flagship B2B platform. Work directly with CEO and engineering leads. Own the roadmap from discovery to delivery.',
        requirements: '3+ years PM experience in B2B SaaS. Technical background preferred. Strong analytical and communication skills.',
        benefits: 'Equity package, competitive salary, health benefits, learning stipend, quarterly offsites.',
        location: 'London, UK',
        isRemote: true,
        employmentType: EmploymentType.FULL_TIME,
        salaryMin: 90000,
        salaryMax: 140000,
        salaryCurrency: 'GBP',
        status: JobStatus.ACTIVE,
        postedById: admin.id,
        expiresAt: new Date(now.getFullYear(), now.getMonth() + 3, 1),
      },
    }),
    prisma.job.create({
      data: {
        title: 'UX Design Intern',
        slug: 'ux-design-intern-creative-studio',
        company: 'Creative Studio',
        companyLogoUrl: 'https://logo.clearbit.com/creativestudio.com',
        companyWebsite: 'https://creativestudio.com',
        description: 'Summer internship program for aspiring UX designers. Work on real client projects with senior mentor guidance. Portfolio review and career coaching included.',
        requirements: 'Currently pursuing design degree. Figma proficiency. Strong portfolio showing design process. Passion for user-centered design.',
        benefits: 'Monthly stipend, mentorship, portfolio pieces, potential full-time offer.',
        location: 'Toronto, Canada',
        isRemote: true,
        employmentType: EmploymentType.INTERNSHIP,
        salaryMin: 3000,
        salaryMax: 4000,
        salaryCurrency: 'CAD',
        status: JobStatus.ACTIVE,
        postedById: admin.id,
        expiresAt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      },
    }),
    prisma.job.create({
      data: {
        title: 'DevOps Engineer',
        slug: 'devops-engineer-scaleup',
        company: 'ScaleUp Inc',
        companyLogoUrl: 'https://logo.clearbit.com/scaleup.com',
        companyWebsite: 'https://scaleup.com',
        description: 'Build and maintain our cloud infrastructure. Automate deployments, improve observability, and ensure system reliability at scale.',
        requirements: '3+ years DevOps experience. Expert in AWS/GCP, Kubernetes, Terraform, CI/CD. Strong scripting skills (Python/Go/Bash).',
        benefits: 'Competitive salary, stock options, 4-day work week option, home office budget.',
        location: 'Singapore',
        isRemote: true,
        employmentType: EmploymentType.FULL_TIME,
        salaryMin: 100000,
        salaryMax: 160000,
        salaryCurrency: 'SGD',
        status: JobStatus.ACTIVE,
        postedById: admin.id,
        expiresAt: new Date(now.getFullYear(), now.getMonth() + 2, 15),
      },
    }),
  ])

  // Create announcements
  console.log('📢 Creating announcements...')
  await Promise.all([
    prisma.announcement.create({
      data: {
        title: 'Welcome to AlumniConnect!',
        content: 'We are thrilled to launch AlumniConnect, the new digital home for Sukkur IBA University alumni. This platform is designed to help you reconnect, grow, and succeed together. Explore the directory, join events, find mentors, and discover career opportunities.',
        priority: AnnouncementPriority.HIGH,
        authorId: superAdmin.id,
        isPublished: true,
        publishedAt: new Date(),
        targetRoles: [UserRole.MEMBER, UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.MODERATOR, UserRole.MENTORSHIP_MANAGER],
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'New Mentorship Program Launching Soon',
        content: 'Our structured mentorship program will launch next month. Senior alumni can sign up as mentors now. Mentees will be matched based on career goals and interests. Stay tuned for more details!',
        priority: AnnouncementPriority.NORMAL,
        authorId: mentorshipManager.id,
        isPublished: true,
        publishedAt: new Date(Date.now() - 86400000),
        targetRoles: [UserRole.MEMBER],
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Platform Maintenance Scheduled',
        content: 'Scheduled maintenance on Sunday 2-4 AM UTC. The platform may be briefly unavailable. We apologize for any inconvenience.',
        priority: AnnouncementPriority.NORMAL,
        authorId: admin.id,
        isPublished: true,
        publishedAt: new Date(Date.now() - 172800000),
        targetRoles: [UserRole.MEMBER, UserRole.ADMIN, UserRole.EVENT_MANAGER, UserRole.MODERATOR, UserRole.MENTORSHIP_MANAGER],
      },
    }),
  ])

  // Create sample conversations and messages
  console.log('💬 Creating sample conversations...')
  const conversation = await prisma.conversation.create({
    data: {
      type: ConversationType.DIRECT,
      createdById: members[0].user.id,
      participants: {
        create: [
          { userId: members[0].user.id, isAdmin: true },
          { userId: members[1].user.id },
        ],
      },
      messages: {
        create: [
          {
            senderId: members[0].user.id,
            content: 'Hi Ahmed! Great to connect with a fellow alumnus. I saw your profile and your work in finance looks fascinating.',
            messageType: MessageType.TEXT,
          },
          {
            senderId: members[1].user.id,
            content: 'Thanks Sarah! Likewise - your work in software engineering is impressive. Are you still at TechCorp?',
            messageType: MessageType.TEXT,
          },
          {
            senderId: members[0].user.id,
            content: 'Yes, 4 years now. Leading the frontend team. How about you - still at Global Capital?',
            messageType: MessageType.TEXT,
          },
        ],
      },
    },
    include: { participants: true, messages: true },
  })

  // Create notifications
  console.log('🔔 Creating notifications...')
  for (const { user } of members.slice(0, 3)) {
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          type: NotificationType.ANNOUNCEMENT,
          title: 'Welcome to AlumniConnect!',
          message: 'We are thrilled to launch AlumniConnect. Explore the platform and connect with fellow alumni.',
          isRead: false,
        },
        {
          userId: user.id,
          type: NotificationType.EVENT_REGISTRATION,
          title: 'Event Registration Confirmed',
          message: 'You have been registered for Annual Alumni Reunion 2024.',
          isRead: true,
          readAt: new Date(),
        },
      ],
    })
  }

  // Create audit logs
  console.log('📝 Creating audit logs...')
  await prisma.auditLog.createMany({
    data: [
      { userId: superAdmin.id, action: 'USER_CREATED', resource: 'User', resourceId: admin.id, metadata: { role: 'ADMIN' } },
      { userId: superAdmin.id, action: 'EVENT_CREATED', resource: 'Event', resourceId: events[0].id },
      { userId: eventManager.id, action: 'EVENT_PUBLISHED', resource: 'Event', resourceId: events[0].id },
      { userId: admin.id, action: 'JOB_POSTED', resource: 'Job', resourceId: jobs[0].id },
      { userId: members[0].user.id, action: 'PROFILE_UPDATED', resource: 'Profile', resourceId: members[0].profile.id },
    ],
  })

  console.log('✅ Database seed completed successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('  Super Admin: admin@alumni-connect.local / password123')
  console.log('  Admin: admin2@alumni-connect.local / password123')
  console.log('  Event Manager: events@alumni-connect.local / password123')
  console.log('  Moderator: moderator@alumni-connect.local / password123')
  console.log('  Mentorship Manager: mentorship@alumni-connect.local / password123')
  console.log('  Members: sarah.ahmed@alumni-connect.local / password123 (and others)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })