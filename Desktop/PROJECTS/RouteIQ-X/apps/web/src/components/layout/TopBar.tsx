import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, Menu, Satellite, Globe, ChevronDown } from 'lucide-react'
import { generateAlertStream } from '../../data/mockData'

interface TopBarProps {
  onMenuToggle: () => void
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const [time, setTime] = useState(new Date())
  const [showAlerts, setShowAlerts] = useState(false)
  const alerts = generateAlertStream()
  const criticalCount = alerts.filter(a => a.type === 'critical').length
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-16 border-b border-surface-border bg-surface-card flex items-center px-6 gap-4 flex-shrink-0 z-10">
      {/* Menu Toggle */}
      <button onClick={onMenuToggle}
              className="text-slate-400 hover:text-white transition-colors lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search roads, segments, cities..."
            className="w-full bg-surface border border-surface-border rounded-xl pl-10 pr-4 py-2.5 
                       text-sm text-slate-300 placeholder-slate-600 focus:outline-none 
                       focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-surface 
                        border border-surface-border rounded-lg px-3 py-2">
          <Satellite className="w-3 h-3 text-cyan-400" />
          <span className="font-mono text-slate-400">
            {time.toLocaleTimeString('en-US', { hour12: false })} UTC+5:30
          </span>
        </div>

        {/* Data Sources */}
        <div className="hidden md:flex items-center gap-2 text-xs bg-emerald-500/10 
                        border border-emerald-500/20 rounded-lg px-3 py-2">
          <Globe className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">4 APIs Live</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notif-btn"
            onClick={() => setShowAlerts(s => !s)}
            className="relative w-9 h-9 bg-surface border border-surface-border rounded-xl 
                       flex items-center justify-center text-slate-400 hover:text-white 
                       hover:border-brand-500/50 transition-all"
          >
            <Bell className="w-4 h-4" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full 
                               flex items-center justify-center text-[9px] font-bold text-white">
                {criticalCount}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 top-12 w-96 card z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                <span className="font-semibold text-white text-sm">Live Alerts</span>
                <span className="badge-critical text-[10px]">{criticalCount} Critical</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.map(alert => (
                  <div key={alert.id}
                       className="px-4 py-3 border-b border-surface-border/50 hover:bg-surface-hover 
                                  transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        alert.type === 'critical' ? 'bg-rose-400' :
                        alert.type === 'warning' ? 'bg-amber-400' :
                        alert.type === 'success' ? 'bg-emerald-400' : 'bg-brand-400'
                      }`} />
                      <div>
                        <div className="text-xs text-slate-300 leading-relaxed">{alert.msg}</div>
                        <div className="text-[10px] text-slate-600 mt-1 font-mono">{alert.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center">
                <button className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  View all alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tenant Selector */}
        <button className="flex items-center gap-2 bg-surface border border-surface-border 
                           rounded-xl px-3 py-2 text-sm text-slate-300 hover:border-brand-500/50 
                           transition-all">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex-shrink-0" />
          <span className="hidden sm:block font-medium">Mumbai Metro</span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>

        {/* User Avatar */}
        <button
          id="user-avatar-btn"
          onClick={() => navigate('/app/settings')}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center 
                     justify-center text-white font-bold text-sm"
          style={{ boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}
        >
          AK
        </button>
      </div>
    </header>
  )
}
