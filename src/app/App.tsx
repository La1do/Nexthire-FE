import { MainLayout } from '../layouts/MainLayout'
import { mainRoute } from './routes'

export function App() {
  return <MainLayout>{mainRoute.element}</MainLayout>
}

export default App
