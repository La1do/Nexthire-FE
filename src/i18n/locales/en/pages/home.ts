import type { HomeTranslations } from '../../../types'

export const home: HomeTranslations = {
  states: {
    loading: 'Loading roles…',
    errorTitle: 'Could not load this section',
    errorDescription: 'Please refresh the page or try again in a moment.',
    emptyTitle: 'Nothing here yet',
    emptyDescription: 'No matching results are available right now.',
  },
  hero: {
    eyebrow: 'Career opportunities',
    title: 'Find work that matches your next move',
    description: 'Explore verified roles from trusted companies and filter quickly by location, salary, and work style.',
    keywordLabel: 'Job keyword',
    keywordPlaceholder: 'Role, skill, or company',
    locationLabel: 'Location',
    locationPlaceholder: 'All locations',
    locationOptions: ['Ha Noi', 'Ho Chi Minh City', 'Da Nang', 'Remote'],
    filterLabel: 'Open filters',
    submit: 'Search',
    quickFilters: ['Remote', 'Hybrid', 'Senior', '25M+ salary'],
    stats: {
      openRoles: 'open roles',
      companies: 'verified companies',
      categories: 'career tracks',
    },
    spotlight: {
      title: 'Hiring this week',
      subtitle: 'Companies with active roles matching strong candidate demand',
    },
  },
  employers: {
    eyebrow: 'Hiring partners',
    title: 'Employers gaining momentum',
    viewAll: 'View all',
  },
  jobs: {
    eyebrow: 'Job list',
    title: 'Recommended roles today',
    tabs: ['Recommended', 'Newest', 'High salary'],
    loadMore: 'Load more roles',
    saveLabel: 'Save job',
  },
  categories: {
    eyebrow: 'Quick discovery',
    title: 'Filter by career track',
  },
  industryJobs: {
    eyebrow: 'By industry',
    title: 'Opportunities by industry',
    viewAll: 'View all industries',
    viewMore: 'View more',
    saveLabel: 'Save job',
  },
  articles: {
    title: 'Career guides',
    readMore: 'Read more',
    items: [
      {
        slug: 'stand-out-in-your-next-interview',
        category: 'Interview',
        description: 'Prepare answers, reverse questions, and follow-up notes before your next interview.',
        title: 'How to stand out in your next interview',
        tone: 'coral',
        author: 'Mai Tran',
        authorRole: 'Talent Acquisition Lead, Nexthire',
        date: 'August 2026',
        readingTime: '6 min read',
        content: [
          {
            type: 'paragraph',
            text: 'Hiring managers usually decide whether they like a candidate in the first ten minutes — and spend the rest of the conversation confirming it. Walking in with a clear structure for your answers is the fastest way to control that first impression.',
          },
          { type: 'heading', text: 'Prepare with the STAR method' },
          {
            type: 'paragraph',
            text: 'Behavioral questions ask you to prove a skill with a real story, not a definition. The STAR method — Situation, Task, Action, Result — keeps your answer short and specific instead of a vague summary of your job description.',
          },
          {
            type: 'list',
            items: [
              'Situation: set the scene in one sentence — the team, the deadline, the constraint.',
              'Task: name the outcome you were responsible for, not just your job title.',
              'Action: describe the two or three decisions only you could have made.',
              'Result: close with a number — time saved, revenue, retention, or adoption.',
            ],
          },
          { type: 'heading', text: 'Ask questions that reverse the interview' },
          {
            type: 'paragraph',
            text: 'The questions you ask signal how you think about the role. Skip "what\'s the culture like" and ask how success is measured in the first 90 days, or what made the last person in the role succeed or leave. It gives the interviewer something real to answer and gives you information you actually need to decide.',
          },
          {
            type: 'quote',
            text: 'The candidates who get offers are the ones who interview us back — they ask sharper questions than we do.',
            attribution: 'Hiring manager, mid-size tech company',
          },
          { type: 'heading', text: 'Follow up without sounding desperate' },
          {
            type: 'paragraph',
            text: 'A follow-up note within 24 hours is expected, not impressive — so make it useful instead of just polite. Reference one specific point from the conversation and add something you didn\'t get to say, rather than repeating "thank you for your time."',
          },
          {
            type: 'list',
            items: [
              'Send within 24 hours, to every interviewer if you have their contact.',
              'Mention one detail from the conversation — it proves you were listening.',
              'Add one thing you wish you\'d said, kept to two sentences.',
              'Ask one open question if the next step wasn\'t confirmed.',
            ],
          },
        ],
      },
      {
        slug: 'build-a-stronger-cv-in-30-minutes',
        category: 'CV',
        description: 'Frame achievements, skills, and projects so recruiters can read your profile faster.',
        title: 'Build a stronger CV in 30 minutes',
        tone: 'blue',
        author: 'Duc Nguyen',
        authorRole: 'Recruiter, Nexthire',
        date: 'August 2026',
        readingTime: '5 min read',
        content: [
          {
            type: 'paragraph',
            text: 'Most CVs list duties. The ones that get interviews list outcomes. Recruiters spend under a minute on a first read, so every line has to answer one question: what changed because you were there?',
          },
          { type: 'heading', text: 'Lead with outcomes, not duties' },
          {
            type: 'paragraph',
            text: 'Rewrite each bullet so it starts with what happened, not what you were assigned to do. "Responsible for onboarding" tells a recruiter nothing; "Cut onboarding time from three weeks to nine days" tells them exactly what you\'re capable of repeating.',
          },
          {
            type: 'list',
            items: [
              'Before: "Managed social media accounts for the brand."',
              'After: "Grew organic reach 3x in six months across three channels."',
              'Before: "Responsible for customer support tickets."',
              'After: "Reduced average response time from 6 hours to 45 minutes."',
            ],
          },
          { type: 'heading', text: 'Trim to what recruiters actually scan' },
          {
            type: 'paragraph',
            text: 'A recruiter\'s eyes move in an F-pattern: job titles, companies, and the first line of each bullet. Put your strongest achievement first in every section, and cut anything older than ten years unless it\'s directly relevant.',
          },
          {
            type: 'quote',
            text: 'I don\'t read CVs top to bottom. I scan the left edge, then decide if the rest is worth reading.',
            attribution: 'Talent acquisition partner, SaaS company',
          },
          { type: 'heading', text: 'Format for both humans and ATS' },
          {
            type: 'paragraph',
            text: 'Applicant tracking systems parse plain structure best: standard section headers, no tables or text boxes, and a single column. Save a plain version for online applications and a designed version for direct sends or interviews.',
          },
          {
            type: 'list',
            items: [
              'Use standard headers: Experience, Education, Skills.',
              'Avoid tables, columns, and graphics that ATS can\'t parse.',
              'Keep it to one page under five years of experience, two pages beyond that.',
              'Match keywords from the job post — exact phrasing, not just synonyms.',
            ],
          },
        ],
      },
      {
        slug: 'sustainable-career-growth-strategies',
        category: 'Growth',
        description: 'Spot the right moment to move roles, negotiate salary, and plan your next learning cycle.',
        title: 'Sustainable career growth strategies',
        tone: 'green',
        author: 'Linh Pham',
        authorRole: 'Career Coach, Nexthire',
        date: 'August 2026',
        readingTime: '7 min read',
        content: [
          {
            type: 'paragraph',
            text: 'Career growth rarely looks like a straight line. It looks like a series of decisions made slightly before you felt fully ready — about when to move, when to ask for more, and what to learn next. Waiting for certainty is usually the same as waiting too long.',
          },
          { type: 'heading', text: "Know when it's time to move" },
          {
            type: 'paragraph',
            text: "The clearest signal isn't boredom — it's a shrinking gap between what you're asked to do and what you're capable of doing. If your last three projects felt more like repetition than challenge, that gap has already closed.",
          },
          {
            type: 'list',
            items: [
              'You could do the job with your eyes closed most days.',
              'No one on your team can teach you something new in your core skill.',
              "You've stopped asking for feedback because you already know the answer.",
              'The next promotion in your current path is more than a year away.',
            ],
          },
          { type: 'heading', text: 'Negotiate from evidence, not emotion' },
          {
            type: 'paragraph',
            text: 'Salary conversations go better when you bring a number and a reason, not a feeling. Research the market range for your role and level, then anchor the conversation on impact you can point to — a project shipped, a target hit, a process you built that others now rely on.',
          },
          {
            type: 'quote',
            text: 'The people who get the raise are the ones who make the case before they ask for the number.',
            attribution: 'People operations lead, growth-stage startup',
          },
          { type: 'heading', text: 'Build a 12-month learning plan' },
          {
            type: 'paragraph',
            text: 'Growth compounds when it\'s planned, not accidental. Pick one skill that makes your current role easier and one that opens the next one, then block time for both every week instead of hoping conferences and courses will fit in eventually.',
          },
          {
            type: 'list',
            items: [
              "One skill for your current role — makes this year's work easier.",
              'One skill for your next role — makes next year\'s move possible.',
              'A recurring weekly block, even 90 minutes, beats occasional binges.',
              'A checkpoint every quarter to test what you\'ve learned against real work.',
            ],
          },
        ],
      },
    ],
  },
  newsletter: {
    eyebrow: 'New job alerts',
    title: 'Set up alerts around your real target',
    description: 'Get weekly emails with new roles, salary insights, and practical career content.',
    emailLabel: 'Notification email',
    emailPlaceholder: 'Your email',
    emailHelper: 'One email a week. Unsubscribe at any time.',
    submit: 'Subscribe',
    chips: ['Engineering', 'Remote', '25M+', 'Senior'],
    mockTitle: 'Matched brief',
    mockLines: ['4 new roles from verified companies', '2 remote roles in your salary range', 'Interview checklist for this week'],
  },
}
