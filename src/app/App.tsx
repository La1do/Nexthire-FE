import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { routes } from './routes'

export function App() {
  return (
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
  )
}

export default App
