import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { WorkflowBuilder } from './pages/WorkflowBuilder'
import { WorkflowList } from './pages/WorkflowList'
import { Integrations } from './pages/Integrations'
import { Settings } from './pages/Settings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workflows" element={<WorkflowList />} />
        <Route path="/workflows/new" element={<WorkflowBuilder />} />
        <Route path="/workflows/:id" element={<WorkflowBuilder />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App