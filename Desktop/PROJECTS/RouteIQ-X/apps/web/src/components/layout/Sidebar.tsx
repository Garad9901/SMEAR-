import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Map, Bot, BarChart3, Wrench, DollarSign,
  FlaskConical, FileText, Settings, ChevronLeft, ChevronRight,
  Zap, Activity, Sliders, BarChart2, Terminal
} from 'lucide-react'
import clsx from 'clsx'
import { globalKPIs } from '../../data/mockData'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { path: '/app/dashboard',      icon: LayoutDashboard, label: 'Dashboard',        badge: null },
  { path: '/app/map',            icon: Map,             label: 'Road Health Map',   badge: null },
  { path: '/app/agents',         icon: Bot,             label: 'AI Agents',         badge: `${globalKPIs.agentsOnline}/8` },
  { path: '/app/command-center', icon: Terminal,        label: 'Command Center',    badge: 'Live' },
  { path: '/app/simulator',      icon: Sliders,         label: 'Digital Twin',      badge: null },
  { path: '/app/comparison',     icon: BarChart2,       label: 'Comparison',        badge: null },
  { path: '/app/analytics',      icon: BarChart3,       label: 'Analytics',         badge: null },
  { path: '/app/maintenance',    icon: Wrench,           label: 'Maintenance',       badge: `${globalKPIs.criticalSegments}` },
  { path: '/app/budget',         icon: DollarSign,      label: 'Budget Optimizer',  badge: null },
  { path: '/app/mlops',          icon: FlaskConical,    label: 'MLOps',             badge: null },
  { path: '/app/reports',        icon: FileText,        label: 'Reports',           badge: null },
  { path: '/app/settings',       icon: Settings,        label: 'Settings',          badge: null },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={clsx(
        'flex flex-col border-r border-surface-border bg-surface-card transition-all duration-300 relative z-20',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-border">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center flex-shrink-0"
             style={{ boxShadow: '0 0 16px rgba(99,102,241,0.6)' }}>
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-bold text-base leading-tight">RouteIQ X</div>
            <div className="text-slate-500 text-[10px] font-medium tracking-widest uppercase">Infrastructure AI</div>
          </div>
        )}
      </div>

      {/* Platform Status */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-surface-border">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500">Platform Status</span>
            <div className="flex items-center gap-1.5">
              <div className="pulse-dot" />
              <span className="text-emerald-400 font-semibold">Operational</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-surface rounded-lg p-2 text-center">
              <div className="text-brand-400 font-bold text-sm">{globalKPIs.agentsOnline}/8</div>
              <div className="text-slate-500 text-[10px]">Agents</div>
            </div>
            <div className="bg-surface rounded-lg p-2 text-center">
              <div className="text-cyan-400 font-bold text-sm">{globalKPIs.citiesDeployed}</div>
              <div className="text-slate-500 text-[10px]">Cities</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {!collapsed && (
          <div className="label px-2 pb-2">Navigation</div>
        )}
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'text-white bg-brand-600/20 border border-brand-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-surface-hover'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={clsx('w-4 h-4 flex-shrink-0', isActive ? 'text-brand-400' : '')}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={clsx(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                        item.label === 'Maintenance'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-brand-500/20 text-brand-400'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Live Data Indicator */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-surface-border">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Live data streaming</span>
            <div className="pulse-dot ml-auto" />
          </div>
          <div className="text-[10px] text-slate-600 mt-1">
            {(globalKPIs.dataPointsProcessed / 1e9).toFixed(1)}B points processed
          </div>
        </div>
      )}

      {/* Collapse Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-surface-card border border-surface-border rounded-full 
                   flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-500/50 
                   transition-all z-30"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
