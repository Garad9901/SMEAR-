import { useState } from 'react'
import { Wrench, CheckCircle2, Clock, AlertTriangle, Play, ChevronDown, ChevronRight, Users } from 'lucide-react'
import { mockMaintenanceTasks, mockRoadSegments, type MaintenanceTask } from '../data/mockData'
import clsx from 'clsx'

const typeConfig = {
  'crack-sealing':     { label: 'Crack Sealing',      color: '#60a5fa' },
  'pothole-repair':    { label: 'Pothole Repair',     color: '#fbbf24' },
  'resurfacing':       { label: 'Resurfacing',         color: '#a78bfa' },
  'patching':          { label: 'Patching',            color: '#34d399' },
  'full-reconstruction': { label: 'Full Reconstruction', color: '#fb7185' },
}

const priorityConfig = {
  critical: { badge: 'badge-critical', label: 'Critical' },
  high:     { badge: 'badge-warning',  label: 'High' },
  medium:   { badge: 'badge-info',     label: 'Medium' },
  low:      { badge: 'badge-success',  label: 'Low' },
}

const statusConfig = {
  'scheduled':         { icon: Clock,         color: '#60a5fa', label: 'Scheduled' },
  'in-progress':       { icon: Play,          color: '#fbbf24', label: 'In Progress' },
  'completed':         { icon: CheckCircle2,  color: '#34d399', label: 'Completed' },
  'pending-approval':  { icon: AlertTriangle, color: '#fb7185', label: 'Pending Approval' },
}

function GanttBar({ task }: { task: MaintenanceTask }) {
  const startDate = new Date(task.scheduledDate)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + task.estimatedDays)
  const today = new Date('2026-05-26')
  const monthStart = new Date('2026-06-01')
  const totalDays = 90
  const startOffset = Math.max(0, (startDate.getTime() - monthStart.getTime()) / 86400000)
  const width = (task.estimatedDays / totalDays) * 100
  const left = (startOffset / totalDays) * 100

  const typeC = typeConfig[task.type]
  const isActive = task.status === 'in-progress'

  return (
    <div className="relative h-8">
      <div
        className={clsx(
          'absolute h-6 top-1 rounded-full flex items-center px-2.5 text-[10px] font-semibold text-white truncate',
          isActive ? 'animate-pulse-slow' : ''
        )}
        style={{
          left: `${Math.min(left, 85)}%`,
          width: `${Math.min(width, 100 - Math.min(left, 85))}%`,
          minWidth: '60px',
          background: `${typeC.color}30`,
          border: `1px solid ${typeC.color}60`,
          boxShadow: isActive ? `0 0 10px ${typeC.color}40` : undefined,
        }}
      >
        {typeC.label}
      </div>
    </div>
  )
}

export function MaintenancePage() {
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState<'list' | 'gantt'>('list')
  const [expanded, setExpanded] = useState<string | null>(null)

  const tasks = filter === 'all' ? mockMaintenanceTasks
    : mockMaintenanceTasks.filter(t => t.status === filter || t.priority === filter)

  const totalCost = mockMaintenanceTasks.reduce((s, t) => s + t.estimatedCost, 0)
  const totalSavings = mockMaintenanceTasks.reduce((s, t) => s + t.savings, 0)
  const inProgress = mockMaintenanceTasks.filter(t => t.status === 'in-progress').length
  const critical = mockMaintenanceTasks.filter(t => t.priority === 'critical').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Maintenance Scheduler</h1>
          <p className="text-slate-400 text-sm mt-1">
            AI-generated repair workflows · {mockMaintenanceTasks.length} active tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('list')}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              view === 'list' ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40'
                             : 'text-slate-400 border border-surface-border hover:text-white')}>
            List View
          </button>
          <button
            onClick={() => setView('gantt')}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              view === 'gantt' ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40'
                              : 'text-slate-400 border border-surface-border hover:text-white')}>
            Timeline
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: mockMaintenanceTasks.length, color: '#6366f1', icon: Wrench },
          { label: 'Critical', value: critical, color: '#fb7185', icon: AlertTriangle },
          { label: 'In Progress', value: inProgress, color: '#fbbf24', icon: Play },
          { label: 'Cost Estimate', value: `₹${(totalCost/1e6).toFixed(1)}M`, color: '#34d399', icon: CheckCircle2 },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <k.icon className="w-4 h-4" style={{ color: k.color }} />
              <span className="text-xs text-slate-400">{k.label}</span>
            </div>
            <div className="text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-semibold">Filter:</span>
        {['all', 'critical', 'in-progress', 'scheduled', 'pending-approval'].map(f => (
          <button key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                    filter === f
                      ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40'
                      : 'text-slate-400 border border-surface-border hover:text-white'
                  )}>
            {f === 'all' ? 'All Tasks' : f.replace('-', ' ')}
          </button>
        ))}
        <div className="ml-auto text-xs text-slate-500">
          Projected savings: <span className="text-emerald-400 font-bold">₹{(totalSavings/1e6).toFixed(1)}M</span>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="card overflow-hidden">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Road Segment</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Scheduled</th>
                <th>Cost Est.</th>
                <th>Savings</th>
                <th>Team</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const st = statusConfig[task.status]
                const StIcon = st.icon
                return (
                  <>
                    <tr key={task.id} className="cursor-pointer"
                        onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
                      <td>
                        <div className="font-semibold text-white">{task.road}</div>
                        <div className="text-xs text-slate-500">{task.city} · {task.id}</div>
                      </td>
                      <td>
                        <span className="badge text-[10px]"
                              style={{
                                background: `${typeConfig[task.type].color}20`,
                                color: typeConfig[task.type].color,
                                border: `1px solid ${typeConfig[task.type].color}40`,
                              }}>
                          {typeConfig[task.type].label}
                        </span>
                      </td>
                      <td>
                        <span className={priorityConfig[task.priority].badge}>
                          {priorityConfig[task.priority].label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5" style={{ color: st.color }}>
                          <StIcon className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">{st.label}</span>
                        </div>
                      </td>
                      <td className="text-xs font-mono">{task.scheduledDate}</td>
                      <td className="font-semibold text-white">₹{(task.estimatedCost/1e6).toFixed(2)}M</td>
                      <td className="text-emerald-400 font-semibold">₹{(task.savings/1e3).toFixed(0)}K</td>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Users className="w-3 h-3" />
                          {task.assignedTeam}
                        </div>
                      </td>
                      <td>
                        {expanded === task.id
                          ? <ChevronDown className="w-4 h-4 text-slate-400" />
                          : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </td>
                    </tr>
                    {expanded === task.id && (
                      <tr key={`${task.id}-exp`}>
                        <td colSpan={9} className="bg-surface-hover">
                          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div><span className="text-slate-500">RHI Score:</span> <span className="text-rose-400 font-bold">{task.rhi}/100</span></div>
                            <div><span className="text-slate-500">Duration:</span> <span className="text-white">{task.estimatedDays} days</span></div>
                            <div><span className="text-slate-500">Road ID:</span> <span className="text-slate-300 font-mono">{task.roadId}</span></div>
                            <div>
                              <span className="text-slate-500">AI Decision: </span>
                              <span className="text-brand-400">Maintenance Planning Agent</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Gantt View */}
      {view === 'gantt' && (
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-4">Repair Timeline — Jun–Sep 2026</h3>
          {/* Month markers */}
          <div className="grid grid-cols-3 mb-3 text-xs text-slate-500 border-b border-surface-border pb-2">
            {['June 2026', 'July 2026', 'August 2026'].map(m => (
              <div key={m} className="font-semibold">{m}</div>
            ))}
          </div>
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-44 flex-shrink-0 text-xs">
                    <div className="text-white font-medium truncate">{task.road}</div>
                    <div className="text-slate-500">{task.city}</div>
                  </div>
                  <div className="flex-1 relative">
                    <GanttBar task={task} />
                  </div>
                  <div className="w-20 text-right text-xs text-slate-400">
                    {task.estimatedDays}d
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(typeConfig).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-3 h-3 rounded-full" style={{ background: v.color }} />
                {v.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
