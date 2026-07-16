import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../context'
import { routes } from './routes'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
