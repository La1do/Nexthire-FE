export type BusinessGate =
  | {
      kind: 'recruiter-company-required'
    }
  | {
      kind: 'recruiter-company-approved'
    }
  | {
      kind: 'recruiter-can-post-jobs'
    }
