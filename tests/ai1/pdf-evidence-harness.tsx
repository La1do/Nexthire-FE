import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ApplicationDetailDrawer } from '../../src/pages/RecruiterApplicationsPage/components/ApplicationDetailDrawer'
import { LocaleProvider } from '../../src/i18n/LocaleProvider'
import { recruiterApplications } from '../../src/i18n/locales/vi/pages/recruiterApplications'
import { jobService } from '../../src/services/job.service'
import { ApplicationReviewWorkspace } from '../../src/pages/RecruiterApplicationsPage/components/ApplicationReviewWorkspace'
import { applicationService } from '../../src/services/application.service'
import type { RecruiterApplicationItem } from '../../src/pages/RecruiterApplicationsPage/types'
import type { RecruiterJobResponse } from '../../src/types/job.types'
import { PdfCvViewer } from '../../src/pages/RecruiterApplicationsPage/components/PdfCvViewer'
import { Ai1EvidenceView } from '../../src/pages/RecruiterApplicationsPage/components/ai1/Ai1EvidenceView'
import { ai1Copy } from '../../src/pages/RecruiterApplicationsPage/components/ai1/ai1Copy'
import fixtures from './fixtures/ai1-hr-review.synthetic.json'
import type { HrReview } from '../../src/types/hr-review.types'
import '../../src/styles/index.css'
import '../../src/pages/RecruiterApplicationsPage/recruiter-applications.css'

function Harness() {
  const [query, setQuery] = useState<string | null>(null)
  const [request, setRequest] = useState(0)
  const [revision, setRevision] = useState(0)
  const [candidate, setCandidate] = useState('a')
  const [open, setOpen] = useState(true)
  const [page, setPage] = useState<number | null>(null)
  const [source, setSource] = useState<string | undefined>()
  const review = structuredClone(fixtures.find(row => row.scenario === 'CONFIRMED_POSTGRES_AWS')!.review) as HrReview
  review.requirements = [review.requirements[0]]
  review.requirements[0].text = 'Relational database design'
  review.requirements[0].components = null
  review.requirements[0].evidence = [{ ...review.requirements[0].evidence[0], text: 'MSSQL (SQL Server)', relevantSpan: null }]
  Object.assign(window, { pdfHarness: {
    search(value: string, pageNumber: number | null = null, section?: string) { setQuery(value); setPage(pageNumber); setSource(section); setRequest(n => n + 1) },
    rerender() { setRevision(n => n + 1) },
    candidate(value: string) { setCandidate(value) },
    open(value: boolean) { setOpen(value) },
  } })
  return <main data-revision={revision}>
    <Ai1EvidenceView state={{ status: 'loaded', review }} copy={ai1Copy.vi} isMatching={false} onRefresh={() => {}} onJumpToPdf={target => {
      setQuery(typeof target === 'string' ? target : target.phrase)
      setRequest(n => n + 1)
    }} />
    <section style={{ height: '80vh', minHeight: 400 }}>
      {open && <PdfCvViewer key={candidate} url={`/synthetic-${candidate}.pdf`} searchQuery={query} searchTerms={['design']} searchRequestId={request} sourceSection={source} pageHint={page} onClearSearch={() => setQuery(null)} />}
    </section>
  </main>
}
function WorkspaceHarness() {
  const quote = 'Backend Developer with practical experience building maintainable APIs and real-time systems. Focused on system design, database management, and writing clean, scalable code for real-world software architecture.'
  applicationService.getRecruiterApplicationCv = async () => ({ documentId: 'synthetic', fileName: 'synthetic.pdf', mimeType: 'application/pdf', size: 1024, url: '/synthetic-a.pdf', expiresInSeconds: 3600 })
  const application = { id: 'synthetic', jobId: 'job', updatedAt: '1', skills: [], candidateName: 'Synthetic', cvFileName: 'synthetic.pdf' } as unknown as RecruiterApplicationItem
  const job = { id: 'job', skills: ['Node.js', 'TypeScript', 'REST API', 'PostgreSQL', 'Git'], requirements: 'Synthetic requirements' } as RecruiterJobResponse
  return <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
    <header style={{ flex: '0 0 150px' }}>Synthetic drawer header</header>
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: 16, display: 'flex' }}>
      <ApplicationReviewWorkspace application={application} job={job} hrReview={null} jumpTarget={{ phrase: quote, snippetText: quote.repeat(12), source: 'Giới thiệu bản thân · tóm tắt' }} />
    </div>
    <footer style={{ flex: '0 0 45px' }}>Synthetic drawer footer</footer>
  </div>
}
function DrawerHarness() {
  const review = structuredClone(fixtures.find(row => row.scenario === 'CONFIRMED_POSTGRES_AWS')!.review) as HrReview
  review.applicationId = 'synthetic'; review.jobId = 'job'
  review.requirements[0].evidence[0].text = 'MSSQL (SQL Server)'
  review.requirements[0].evidence[0].relevantSpan = null
  applicationService.getRecruiterApplicationHrReview = async () => ({ success: true, data: review })
  applicationService.getRecruiterApplicationCv = async () => ({ documentId: 'synthetic', fileName: 'synthetic.pdf', mimeType: 'application/pdf', size: 1024, url: '/synthetic-a.pdf', expiresInSeconds: 3600 })
  jobService.getRecruiterJobById = async () => ({ id: 'job', skills: [], requirements: 'Synthetic' }) as never
  const application = { id: 'synthetic', jobId: 'job', updatedAt: '1', skills: [], timeline: [], status: 'PENDING', cvParseStatus: 'PARSED', candidateName: 'Synthetic candidate', candidateHeadline: 'Backend developer', cvFileName: 'synthetic.pdf' } as unknown as RecruiterApplicationItem
  return <LocaleProvider><ApplicationDetailDrawer application={application} isMatching={false} isStatusUpdating={false} matchLabels={recruiterApplications.match} meta={recruiterApplications.meta} statusLabels={recruiterApplications.statusLabels} translations={recruiterApplications.drawer} onClose={() => {}} onEmail={() => {}} onOpenResume={() => {}} onRunMatch={() => {}} onStatusChange={async () => true} /></LocaleProvider>
}
createRoot(document.getElementById('root')!).render(location.search.includes('drawer') ? <DrawerHarness /> : location.search.includes('workspace') ? <WorkspaceHarness /> : <Harness />)
