import { mainRoute, routes } from './routes'

function normalizePath(pathname: string) {
  if (pathname === '/') {
    return pathname
  }

  return pathname.replace(/\/+$/, '')
}

function getActiveRoute() {
  const currentPath = normalizePath(window.location.pathname)

  return routes.find((route) => route.path === currentPath) ?? mainRoute
}

export function App() {
  const activeRoute = getActiveRoute()
  const Layout = activeRoute.layout

  return <Layout>{activeRoute.element}</Layout>
}

export default App
