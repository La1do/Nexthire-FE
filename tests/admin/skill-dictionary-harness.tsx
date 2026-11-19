import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '../../src/context/authContextValue'
import { apiClient } from '../../src/lib/api'
import { AdminSkillDictionaryPage } from '../../src/pages/AdminSkillDictionaryPage'
import '../../src/styles/index.css'
let userId = '55555555-5555-4555-8555-555555555555', companyId = '77777777-7777-4777-8777-777777777777', role = 'ADMIN', hydrating = false
apiClient.defaults.adapter = async config => {
  const suffix = config.url?.split('/admin/skill-dictionary')[1] ?? ''
  const query = new URLSearchParams(config.params as Record<string, string>).toString()
  const response = await fetch(`/__dictionary_fixture__${suffix}${query ? `?${query}` : ''}`, { method: config.method?.toUpperCase(), headers: { 'Content-Type': 'application/json', 'x-test-user-id': userId, 'x-test-company-id': companyId, 'x-test-role': role }, body: ['post', 'patch'].includes(config.method ?? '') ? config.data : undefined, signal: config.signal as AbortSignal })
  const data = await response.json()
  if (!response.ok) throw { response: { status: response.status } }
  return { config, status: response.status, statusText: response.statusText, headers: {}, data }
}
const root = createRoot(document.getElementById('root')!)
function render() {
  const auth = { user: { id: userId, companyId, role }, isHydratingUser: hydrating, isAuthenticated: true } as AuthContextValue
  root.render(<StrictMode><AuthContext.Provider value={auth}><BrowserRouter><main><Link to="/leave">Rời từ điển</Link><AdminSkillDictionaryPage /></main></BrowserRouter></AuthContext.Provider></StrictMode>)
}
Object.assign(window, { dictionaryIdentity: (next: { userId?: string; companyId?: string; role?: string; hydrating?: boolean }) => { userId = next.userId ?? userId; companyId = next.companyId ?? companyId; role = next.role ?? role; hydrating = next.hydrating ?? hydrating; render() }, dictionaryUnmount: () => root.unmount() })
render()
