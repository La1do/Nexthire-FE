import { createRoot } from 'react-dom/client'
import { LocaleProvider } from '../../src/i18n/LocaleProvider'
import { apiClient } from '../../src/lib/api'
import { Ai2DemoPanel } from '../../src/pages/RecruiterApplicationsPage/components/ai2/Ai2DemoPanel'
import '../../src/styles/index.css'
import '../../src/pages/RecruiterApplicationsPage/components/application-detail-drawer.css'

const config = (window as unknown as { ai2LiveConfig: { token: string; applicationId: string; jobId: string } }).ai2LiveConfig
apiClient.defaults.baseURL = 'http://127.0.0.1:13000/api/v1'
apiClient.defaults.headers.common.Authorization = `Bearer ${config.token}`
createRoot(document.getElementById('root')!).render(
  <LocaleProvider><main style={{ maxWidth: 760, margin: '40px auto', padding: 24 }}>
    <h1>Local AI2 E2E — saved synthetic fixture</h1>
    <Ai2DemoPanel applicationId={config.applicationId} jobId={config.jobId} updatedAt="e2e" isMatching={false} />
  </main></LocaleProvider>,
)
