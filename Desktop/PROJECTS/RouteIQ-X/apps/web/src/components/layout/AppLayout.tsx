import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { AIAssistantWidget } from '../AIAssistantWidget'

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-surface overflow-hidden relative ultra-grid-bg bg-noise">
      {/* Shifting neon gradient orbs in the background */}
      <div className="ultra-orb-1" />
      <div className="ultra-orb-2" />

      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <TopBar onMenuToggle={() => setSidebarCollapsed(c => !c)} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Global AI Assistant chatbot */}
      <AIAssistantWidget />
    </div>
  )
}
