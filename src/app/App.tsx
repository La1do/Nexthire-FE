import { mainRoute, routes } from './routes'

function normalizePath(pathname: string) {
  if (pathname === '/') {
    return pathname
  }

  return pathname.replace(/\/+$/, '')
}

function doesRouteMatch(routePath: string, pathname: string) {
  const routeParts = routePath.split('/').filter(Boolean)
  const pathParts = pathname.split('/').filter(Boolean)

  if (routeParts.length !== pathParts.length) {
    return false
  }

  return routeParts.every((part, index) => part.startsWith(':') || part === pathParts[index])
}

function getActiveRoute() {
  const currentPath = normalizePath(window.location.pathname)

  return routes.find((route) => doesRouteMatch(route.path, currentPath)) ?? mainRoute
}

export function App() {
  const activeRoute = getActiveRoute()
  const Layout = activeRoute.layout

  return <Layout>{activeRoute.element}</Layout>
}

export default App
