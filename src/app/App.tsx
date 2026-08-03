import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, GlobalLoaderProvider, ToastProvider, useAuth, useGlobalLoader } from '../context'
import { LocaleProvider } from '../i18n/LocaleProvider'
import { useTranslations } from '../i18n'
import { GlobalLoader } from '../pages/_components'
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

function AppGlobalLoaderBridge() {
  const { isHydratingUser } = useAuth()
  const { common } = useTranslations()
  const { hide, show } = useGlobalLoader()
  const bootLoaderIdRef = useRef<string | null>(null)
  const sessionLoaderIdRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    const loaderId = show({
      delayMs: 0,
      label: common.loader.bootLabel,
      minVisibleMs: 360,
      mode: 'overlay',
    })
    const timeoutId = window.setTimeout(() => {
      hide(loaderId)

      if (bootLoaderIdRef.current === loaderId) {
        bootLoaderIdRef.current = null
      }
    }, 420)

    bootLoaderIdRef.current = loaderId
    return () => {
      window.clearTimeout(timeoutId)
      hide(loaderId)
      bootLoaderIdRef.current = null
    }
  }, [common.loader.bootLabel, hide, show])

  useEffect(() => {
    if (!isHydratingUser) {
      if (sessionLoaderIdRef.current) {
        hide(sessionLoaderIdRef.current)
        sessionLoaderIdRef.current = null
      }

      return
    }

    if (!sessionLoaderIdRef.current) {
      sessionLoaderIdRef.current = show({
        delayMs: 0,
        label: common.loader.checkingSessionLabel,
        minVisibleMs: 460,
        mode: 'overlay',
      })
    }

    return () => {
      if (sessionLoaderIdRef.current) {
        hide(sessionLoaderIdRef.current)
        sessionLoaderIdRef.current = null
      }
    }
  }, [common.loader.checkingSessionLabel, hide, isHydratingUser, show])

  return null
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <ToastProvider>
          <GlobalLoaderProvider>
            <AuthProvider>
              <AppGlobalLoaderBridge />
              <BrowserRouter>
                <AppRoutes />
                <GlobalLoader />
              </BrowserRouter>
            </AuthProvider>
          </GlobalLoaderProvider>
        </ToastProvider>
      </LocaleProvider>
    </QueryClientProvider>
  )
}

export default App
