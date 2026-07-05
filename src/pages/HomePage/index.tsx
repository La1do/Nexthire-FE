import { FeatureGrid } from './components/FeatureGrid'
import { HeroPanel } from './components/HeroPanel'
import { MetricsRow } from './components/MetricsRow'

export function HomePage() {
  return (
    <div className="space-y-8">
      <HeroPanel />
      <MetricsRow />
      <FeatureGrid />
    </div>
  )
}

export default HomePage
