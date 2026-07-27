import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../context'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { useTranslations } from '../i18n'
import { queryClient } from './queryClient'
import { BusinessGateGuard } from './routes/BusinessGateGuard'
import { RouteGuard } from './routes/RouteGuard'
import { getRoutes } from './routes'

function AppRoutes() {
  const translations = useTranslations()
  const routes = getRoutes(translations)

  return (
    <Routes>
      {routes.map(({ access, businessGate, element, layout: Layout, path }) => (
        <Route
          element={
            <RouteGuard access={access}>
              <BusinessGateGuard gate={businessGate}>
                <Layout>{element}</Layout>
              </BusinessGateGuard>
            </RouteGuard>
          }
          key={path}
          path={path}
        />
      ))}
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LocaleProvider>
    </QueryClientProvider>
  )
}

export default App
