import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LandingPage } from './pages/LandingPage'
import { Dashboard } from './pages/Dashboard'
import { MapView } from './pages/MapView'
import { AgentsPage } from './pages/AgentsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { MaintenancePage } from './pages/MaintenancePage'
import { BudgetPage } from './pages/BudgetPage'
import { MLOpsPage } from './pages/MLOpsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SimulatorPage } from './pages/SimulatorPage'
import { ComparisonPage } from './pages/ComparisonPage'
import { CommandCenterPage } from './pages/CommandCenterPage'

export default function App() {
  return (
    <Routes>
      {/* Public Landing */}
      <Route path="/" element={<LandingPage />} />
      
      {/* App (authenticated layout) */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="map" element={<MapView />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="mlops" element={<MLOpsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="simulator" element={<SimulatorPage />} />
        <Route path="comparison" element={<ComparisonPage />} />
        <Route path="command-center" element={<CommandCenterPage />} />
      </Route>
    </Routes>
  )
}
