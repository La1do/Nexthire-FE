import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../context'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { useTranslations } from '../i18n'
import { getRoutes } from './routes'

function AppRoutes() {
  const translations = useTranslations()
  const routes = getRoutes(translations)

  return (
    <Routes>
      {routes.map(({ element, layout: Layout, path }) => (
        <Route
          element={<Layout>{element}</Layout>}
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
    <LocaleProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LocaleProvider>
  )
}

export default App
