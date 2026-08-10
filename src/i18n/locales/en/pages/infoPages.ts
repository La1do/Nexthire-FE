export const infoPages = {
  pages: {
    latestJobs: {
      badge: 'Info page',
      hero: {
        eyebrow: 'Latest jobs',
        title: 'Fresh openings, updated every day',
        description:
          'A live feed of roles just posted on NexHire, ordered by recency so you can apply early and stay ahead of the market.',
      },
      intro:
        'The list below refreshes automatically from verified employers on NexHire. Open the Search page to narrow results by industry, location, or salary band.',
      sections: [
        {
          title: 'How the feed stays fresh',
          description:
            'Whenever an employer posts or renews a role, it surfaces at the top of the list. Expired roles are moved out of the public feed.',
          bullets: [
            'New postings appear within five minutes.',
            'Renewed roles keep their original publish date in the history.',
            'Closed roles no longer accept new applications.',
          ],
        },
        {
          title: 'Tips for a faster response',
          description:
            'A complete profile and a tailored CV noticeably increase your chance of hearing back within seven days.',
          bullets: [
            'Set your desired role and expected salary on your profile.',
            'Attach a short cover letter that fits the industry.',
            'Turn on email alerts for new matching jobs.',
          ],
        },
      ],
      cta: {
        title: 'Ready to browse the freshest roles?',
        description: 'Open the Search page to see every open role in one place.',
        primaryLabel: 'Open Search',
        primaryHref: '/search',
        secondaryLabel: 'Create a candidate profile',
        secondaryHref: '/register',
      },
    },
    itJobs: {
      badge: 'Info page',
      hero: {
        eyebrow: 'IT jobs',
        title: 'Opportunities for engineers, developers and tech specialists',
        description:
          'A roundup of IT roles currently hiring on NexHire, spanning frontend, backend, mobile, DevOps, AI/ML and product.',
      },
      intro:
        'This page gives you a quick overview of the IT category. To see the full list with filters by language and seniority, open Search and pick the IT group.',
      sections: [
        {
          title: 'Popular IT categories',
          description:
            'Roles are grouped by function so you can quickly find work that matches your specialism.',
          bullets: [
            'Frontend / Backend / Fullstack.',
            'Mobile (iOS, Android, React Native, Flutter).',
            'DevOps, SRE, Cloud and Data Engineering.',
            'AI/ML, Data Science and analytics.',
            'Product management, UX/UI and QA.',
          ],
        },
        {
          title: 'Skills employers ask for',
          description:
            'Each role lists the core stack. Match it against your profile before applying to boost your chance of a reply.',
          bullets: [
            'TypeScript, React and Node.js for modern web products.',
            'Java and Spring Boot for enterprise systems.',
            'AWS, Docker and Kubernetes for cloud-native infrastructure.',
            'SQL and relational databases are almost always required.',
          ],
        },
      ],
      cta: {
        title: 'Browse IT roles now',
        description: 'Use the IT filter on the Search page to narrow by stack and seniority.',
        primaryLabel: 'Filter IT jobs',
        primaryHref: '/search',
        secondaryLabel: 'Browse IT CV templates',
        secondaryHref: '/cv-templates',
      },
    },
    marketingJobs: {
      badge: 'Info page',
      hero: {
        eyebrow: 'Marketing jobs',
        title: 'Roles for marketers, content strategists and growth specialists',
        description:
          'A collection of marketing openings on NexHire, covering content, SEO, performance, brand and communications.',
      },
      intro:
        'Marketing on NexHire spans hands-on execution to mid-level management. Open Search to see the latest roles by sub-category.',
      sections: [
        {
          title: 'Common marketing roles',
          description:
            'Pick the track that matches your strengths, from creative writing to data-driven optimisation.',
          bullets: [
            'Content marketing, copywriting and editorial.',
            'Performance marketing, paid ads and conversion.',
            'SEO, social media and community.',
            'Brand, PR and internal communications.',
            'Product marketing and growth.',
          ],
        },
        {
          title: 'Tools and experience',
          description:
            'Most roles expect familiarity with popular analytics and campaign tools.',
          bullets: [
            'Google Analytics, Google Tag Manager, Meta Ads.',
            'SEO tooling such as Ahrefs or SEMrush (or equivalents).',
            'CRM and email platforms like HubSpot or Mailchimp.',
            'Cross-channel content writing and KPI measurement.',
          ],
        },
      ],
      cta: {
        title: 'Explore the latest marketing roles',
        description: 'Use the category filters on Search to find your best fit.',
        primaryLabel: 'View marketing jobs',
        primaryHref: '/search',
      },
    },
    postJob: {
      badge: 'For employers',
      hero: {
        eyebrow: 'Post a job',
        title: 'Reach thousands of verified candidates',
        description:
          'Posting on NexHire connects you with candidates whose email is verified and whose profiles are ready to review.',
      },
      intro:
        'This page summarises how posting works and what to prepare before opening the form. If you do not have an employer account yet, please register first.',
      sections: [
        {
          title: 'Get ready before posting',
          description:
            'A clear company profile helps your job get approved faster and attracts more qualified applicants.',
          bullets: [
            'Complete business verification with your tax code and official website.',
            'Prepare the job description, requirements and benefits in clear language.',
            'Decide on the salary floor or mark it as negotiable.',
            'Pick the working mode: onsite, remote or hybrid.',
          ],
        },
        {
          title: 'The posting workflow',
          description:
            'After you submit a new posting, our automated moderation checks the content and publishes it within minutes when it passes.',
          bullets: [
            'Create the posting from the recruiter dashboard.',
            'The system reviews the content and flags any risk signals.',
            'Approved postings go live immediately and start receiving applications.',
            'You can edit, pause or close any posting at any time.',
          ],
        },
        {
          title: 'Tips to attract candidates',
          description:
            'Well structured and transparent postings usually attract higher quality applicants.',
          bullets: [
            'List the core responsibilities and evaluation criteria.',
            'Publish a salary band whenever possible.',
            'Describe the culture and the interview process.',
            'Aim to reply to candidates within seven business days.',
          ],
        },
      ],
      cta: {
        title: 'Start posting today',
        description: 'Sign in with your employer account to open the create-job form.',
        primaryLabel: 'Employer sign in',
        primaryHref: '/recruiter/login',
        secondaryLabel: 'Register an employer account',
        secondaryHref: '/recruiter/register',
      },
    },
    businessHiring: {
      badge: 'For businesses',
      hero: {
        eyebrow: 'Business hiring',
        title: 'Hiring solutions for larger teams',
        description:
          'NexHire helps companies build an efficient hiring funnel, from verified profiles to organisation-wide reporting.',
      },
      intro:
        'This page is for HR teams and leaders who need a long term hiring solution with deeper customisation and dedicated support.',
      sections: [
        {
          title: 'What we support',
          description:
            'Beyond posting jobs, companies can use additional tooling to screen and manage candidates at scale.',
          bullets: [
            'Email and profile verification before interviews.',
            'Dashboards to monitor conversion rates per role.',
            'AI assisted screening and candidate matching.',
            'Dedicated success support for high-volume hiring.',
          ],
        },
        {
          title: 'How to get started',
          description:
            'You do not need to sign a contract upfront. Create an employer account and explore the free tools first.',
          bullets: [
            'Register an employer account and complete verification.',
            'Post a few roles to evaluate candidate quality.',
            'Talk to the NexHire team about a plan that fits your scale.',
          ],
        },
      ],
      cta: {
        title: 'Talk to the NexHire team',
        description: 'Email us to get a recommendation tailored to your company size.',
        primaryLabel: 'Send partnership email',
        primaryHref: 'mailto:nexhire.team.support@gmail.com',
        secondaryLabel: 'Learn more',
        secondaryHref: '/contact',
      },
    },
    helpCenter: {
      badge: 'Support',
      hero: {
        eyebrow: 'Help center',
        title: 'FAQ and step-by-step guides',
        description:
          'Common questions from candidates and employers, along with practical guides to help you use NexHire effectively.',
      },
      intro:
        'If you cannot find what you need below, please reach out to the support team via email or the Contact page.',
      sections: [
        {
          title: 'For candidates',
          description: 'The basics of finding work and applying on NexHire.',
          bullets: [
            'Create an account and verify your email in a few minutes.',
            'Complete your profile to increase visibility to recruiters.',
            'Use the filters on Search to narrow your results.',
            'Track application status inside your profile dashboard.',
          ],
        },
        {
          title: 'For employers',
          description: 'Verification and posting workflow for companies.',
          bullets: [
            'Use a dedicated employer account.',
            'Prepare your tax code and website to complete verification.',
            'Once approved you can post unlimited jobs.',
            'Use the dashboard to track and respond to candidates.',
          ],
        },
        {
          title: 'Security and privacy',
          description:
            'We are committed to protecting your personal data in line with our privacy policy.',
          bullets: [
            'Passwords are hashed and never stored in plain text.',
            'Only you and authorised recruiters can view your profile.',
            'You can request account deletion at any time.',
          ],
        },
      ],
      cta: {
        title: 'Still need help?',
        description: 'The NexHire team is ready to assist via email or the Contact page.',
        primaryLabel: 'Contact support',
        primaryHref: '/contact',
      },
    },
    contact: {
      badge: 'Contact',
      hero: {
        eyebrow: 'Contact',
        title: 'Get in touch with the NexHire team',
        description:
          'Feedback, support requests and partnership enquiries are all welcome. We aim to respond as quickly as we can.',
      },
      intro:
        'This page lists our official contact channels. Please pick the one that fits your need best.',
      sections: [
        {
          title: 'Support email',
          description:
            'Use the support email for account issues, profile problems, posting questions or content reports.',
          bullets: [
            'General support: nexhire.team.support@gmail.com',
            'Reply within one to two business days.',
            'Please attach screenshots if you hit a UI bug.',
          ],
        },
        {
          title: 'Business partnerships',
          description:
            'If you want a hiring solution for a larger team, send us an email with a short company brief.',
          bullets: [
            'A short description of your size and industry.',
            'The number of roles you expect to fill in the next three months.',
            'A point of contact and how to reach them.',
          ],
        },
        {
          title: 'Feedback and ideas',
          description:
            'We value every suggestion that helps us improve. Send feature ideas or bug reports via email.',
          bullets: [
            'Suggest a new feature.',
            'Report inappropriate content.',
            'Share your experience using NexHire.',
          ],
        },
      ],
      cta: {
        title: 'Send us an email',
        description: 'The NexHire team will get back to you as soon as possible.',
        primaryLabel: 'Open support email',
        primaryHref: 'mailto:nexhire.team.support@gmail.com',
        secondaryLabel: 'See the FAQ',
        secondaryHref: '/help',
      },
    },
    privacyPolicy: {
      badge: 'Legal',
      hero: {
        eyebrow: 'Privacy policy',
        title: 'How we collect, use and protect your data',
        description:
          'This policy explains the kinds of information NexHire collects, why we use them and the rights you have over your personal data.',
      },
      intro:
        'By using NexHire you agree to the terms of this policy. Please read it carefully before creating an account or posting a job.',
      sections: [
        {
          title: 'What we collect',
          description:
            'We only collect the information we need to run the service and improve the product.',
          bullets: [
            'Account details: name, email, phone number (if provided).',
            'Professional profile: skills, experience and uploaded CV.',
            'Business details for employers: name, tax code and address.',
            'Access logs and device data for security purposes.',
          ],
        },
        {
          title: 'How we use data',
          description:
            'Your data powers the service and is never sold to third parties for marketing.',
          bullets: [
            'Match candidates with relevant recruiters.',
            'Send important account and service notifications.',
            'Detect and prevent abusive behaviour.',
            'Improve the product through anonymous analytics.',
          ],
        },
        {
          title: 'Your rights',
          description:
            'You stay in full control of the personal data you store on NexHire.',
          bullets: [
            'Request access to and correction of your data at any time.',
            'Request deletion of your account and all related data.',
            'Opt out of marketing emails while keeping essential service notices.',
            'Contact our security team if you spot unauthorised use.',
          ],
        },
        {
          title: 'Retention',
          description:
            'We keep data for as long as your account is active or as required by law.',
          bullets: [
            'After you request deletion, data leaves our systems within thirty days.',
            'Some records may be retained anonymously for statistics.',
          ],
        },
      ],
      cta: {
        title: 'Questions about privacy?',
        description: 'Reach out to the NexHire team if you need any clarification on this policy.',
        primaryLabel: 'Send email',
        primaryHref: 'mailto:nexhire.team.support@gmail.com',
        secondaryLabel: 'Read the terms',
        secondaryHref: '/terms',
      },
    },
    terms: {
      badge: 'Legal',
      hero: {
        eyebrow: 'Terms of use',
        title: 'The rules of the road for NexHire',
        description:
          'These terms form the agreement between you and NexHire about how the service is delivered and used.',
      },
      intro:
        'When you create an account or use any NexHire feature you agree to the terms below.',
      sections: [
        {
          title: 'Your account',
          description:
            'You are responsible for safeguarding your login credentials and everything that happens under your account.',
          bullets: [
            'Provide accurate information when registering and keep it up to date.',
            'Do not share your account with anyone else.',
            'Tell NexHire immediately if you detect unauthorised access.',
          ],
        },
        {
          title: 'User-generated content',
          description:
            'You keep ownership of what you post but grant NexHire a reasonable licence to operate the service.',
          bullets: [
            'Do not post content that is illegal, abusive or misleading.',
            'Do not use NexHire for fraud, harassment or spam.',
            'NexHire may remove violating content and suspend accounts when needed.',
          ],
        },
        {
          title: 'NexHire rights and responsibilities',
          description:
            'We commit to a stable, transparent service and reserve the right to limit access during maintenance or violations.',
          bullets: [
            'Maintain the platform, secure data and support users.',
            'Suspend the service for maintenance when needed, with notice where possible.',
            'We are not responsible for content posted by users.',
          ],
        },
        {
          title: 'Changes to the terms',
          description:
            'We may update these terms to reflect product changes and legal requirements.',
          bullets: [
            'Material changes are announced by email or in-product notice.',
            'Continuing to use NexHire after an update means you accept the new terms.',
          ],
        },
      ],
      cta: {
        title: 'Accept the terms',
        description: 'Create an account or keep using NexHire to accept these terms.',
        primaryLabel: 'Create an account',
        primaryHref: '/register',
        secondaryLabel: 'Read the privacy policy',
        secondaryHref: '/privacy',
      },
    },
  },
}
