import { useState, useEffect } from 'react'
import {
  TrendingDown, AlertTriangle, Wrench, DollarSign,
  Bot, Satellite, Activity, Globe, ArrowUpRight, ArrowDownRight,
  ChevronRight, Clock, Cpu
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  globalKPIs, mockRoadSegments, mockAgents,
  generateDegradationForecast, generateAlertStream, generateBudgetTrend
} from '../data/mockData'
import clsx from 'clsx'

const riskColors = {
  critical: '#fb7185', high: '#fbbf24', medium: '#60a5fa', low: '#34d399'
}

function KPICard({ icon: Icon, label, value, sub, trend, color }: {
  icon: React.ElementType, label: string, value: string, sub: string,
  trend?: { dir: 'up' | 'down', val: string }, color: string
}) {
  return (
    <div className="metric-card group">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend.dir === 'down' ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {trend.dir === 'down'
              ? <ArrowDownRight className="w-3 h-3" />
              : <ArrowUpRight className="w-3 h-3" />}
            {trend.val}
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-black text-white mt-2">{value}</div>
        <div className="text-sm font-medium text-slate-300 mt-0.5">{label}</div>
        <div className="text-xs text-slate-500 mt-1">{sub}</div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const [tick, setTick] = useState(0)
  const forecasts = generateDegradationForecast()
  const alerts = generateAlertStream()
  const budgetTrend = generateBudgetTrend()

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 5000)
    return () => clearInterval(t)
  }, [])

  const riskDist = [
    { name: 'Critical', value: 234, color: '#fb7185' },
    { name: 'High',     value: 489, color: '#fbbf24' },
    { name: 'Medium',   value: 847, color: '#60a5fa' },
    { name: 'Low',      value: 276, color: '#34d399' },
  ]

  const cityRHI = [
    { city: 'Mumbai', rhi: 54, repairs: 47 },
    { city: 'Delhi', rhi: 58, repairs: 63 },
    { city: 'Bengaluru', rhi: 67, repairs: 34 },
    { city: 'Pune', rhi: 61, repairs: 21 },
    { city: 'Hyderabad', rhi: 72, repairs: 18 },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Executive Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time infrastructure intelligence across {globalKPIs.citiesDeployed} cities · {globalKPIs.countriesDeployed} countries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 badge-success">
            <div className="pulse-dot" />
            All Systems Operational
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Updated {tick > 0 ? `${tick * 5}s` : 'now'}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Activity}
          label="Roads Monitored"
          value="1.85M+"
          sub="Across 23 smart cities"
          color="#6366f1"
        />
        <KPICard
          icon={AlertTriangle}
          label="Critical Segments"
          value={String(globalKPIs.criticalSegments)}
          sub="Requiring immediate action"
          trend={{ dir: 'up', val: '+12 today' }}
          color="#fb7185"
        />
        <KPICard
          icon={DollarSign}
          label="Predicted Savings"
          value="₹79.6Cr"
          sub="vs reactive maintenance"
          trend={{ dir: 'down', val: '23.4% less cost' }}
          color="#34d399"
        />
        <KPICard
          icon={Bot}
          label="AI Agents Online"
          value={`${globalKPIs.agentsOnline}/8`}
          sub="1 idle, 7 active"
          color="#22d3ee"
        />
        <KPICard
          icon={TrendingDown}
          label="Avg Road Health Index"
          value={String(globalKPIs.avgRHI)}
          sub="City-wide average (0–100)"
          trend={{ dir: 'up', val: '+2.1 this month' }}
          color="#fbbf24"
        />
        <KPICard
          icon={Wrench}
          label="Scheduled Repairs"
          value={String(globalKPIs.scheduledRepairs)}
          sub="Across all cities"
          color="#a78bfa"
        />
        <KPICard
          icon={Satellite}
          label="Model Inferences"
          value="15.2M"
          sub="This month · 94.7% accuracy"
          color="#06b6d4"
        />
        <KPICard
          icon={Globe}
          label="Budget Utilized"
          value={`${globalKPIs.budgetUtilized}%`}
          sub="₹505Cr total allocation"
          color="#10b981"
        />
      </div>

      {/* ── Charts Row 1 ─────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Degradation Forecast */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="label mb-1">AI Forecast</div>
              <h3 className="text-white font-semibold">Road Health Index Trajectory</h3>
            </div>
            <div className="badge-warning">60-Day Forecast</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={forecasts}>
              <defs>
                <linearGradient id="rhiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
                labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="confidence_upper" stroke="transparent" fill="#6366f120" />
              <Area type="monotone" dataKey="confidence_lower" stroke="transparent" fill="#0f0f1a" />
              <Area type="monotone" dataKey="rhi" stroke="#6366f1" strokeWidth={2.5}
                    fill="url(#rhiGrad)" dot={{ fill: '#6366f1', r: 3 }} name="Actual RHI" />
              <Area type="monotone" dataKey="predicted" stroke="#22d3ee" strokeWidth={2}
                    strokeDasharray="6 3" fill="url(#predGrad)" dot={false} name="Predicted" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-brand-500 rounded" />Actual RHI
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400" />Predicted
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-brand-500/20" />Confidence Band
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="card p-5">
          <div className="label mb-1">Risk Analysis</div>
          <h3 className="text-white font-semibold mb-4">Segment Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                   paddingAngle={3} dataKey="value">
                {riskDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {riskDist.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="font-semibold text-white">{d.value} segments</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ─────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* City RHI Bar Chart */}
        <div className="card p-5">
          <div className="label mb-1">City Performance</div>
          <h3 className="text-white font-semibold mb-4">Road Health by City</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cityRHI} barSize={24}>
              <XAxis dataKey="city" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
              />
              <Bar dataKey="rhi" radius={[4, 4, 0, 0]} name="RHI Score">
                {cityRHI.map((entry, i) => (
                  <Cell key={i}
                        fill={entry.rhi < 55 ? '#fb7185' : entry.rhi < 65 ? '#fbbf24' : '#34d399'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Trend */}
        <div className="card p-5">
          <div className="label mb-1">Financial Performance</div>
          <h3 className="text-white font-semibold mb-4">Budget vs Spend Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={budgetTrend} barSize={16} barGap={2}>
              <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/1e6).toFixed(0)}M`} />
              <Tooltip
                formatter={(v: number) => [`₹${(v/1e6).toFixed(1)}M`]}
                contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
              />
              <Bar dataKey="budgeted" fill="#2a2a4a" radius={[4, 4, 0, 0]} name="Budgeted" />
              <Bar dataKey="spent" fill="#6366f1" radius={[4, 4, 0, 0]} name="Spent" />
              <Bar dataKey="savings" fill="#34d399" radius={[4, 4, 0, 0]} name="Savings" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-surface-border" />Budgeted</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-brand-500" />Spent</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-400" />Savings</div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Critical Roads */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="label mb-1">Priority Queue</div>
              <h3 className="text-white font-semibold">Critical Road Segments</h3>
            </div>
            <button className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {mockRoadSegments.filter(r => r.risk === 'critical').slice(0, 4).map(road => (
              <div key={road.id}
                   className="flex items-center gap-3 p-3 bg-surface rounded-xl hover:bg-surface-hover 
                              transition-colors border border-surface-border/50">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{road.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{road.city} · {road.complaints} complaints</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-rose-400">RHI {road.rhi}</div>
                  <div className="text-[10px] text-slate-600">Fails {road.predictedFailure}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Alert Stream */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="label mb-1">Event Stream</div>
              <h3 className="text-white font-semibold">Live System Alerts</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <div className="pulse-dot" />Streaming
            </div>
          </div>
          <div className="space-y-2.5">
            {alerts.slice(0, 6).map(alert => (
              <div key={alert.id} className="flex items-start gap-3">
                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  alert.type === 'critical' ? 'bg-rose-400' :
                  alert.type === 'warning' ? 'bg-amber-400' :
                  alert.type === 'success' ? 'bg-emerald-400' : 'bg-brand-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-300 leading-relaxed">{alert.msg}</div>
                </div>
                <div className="text-[10px] text-slate-600 font-mono flex-shrink-0">{alert.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Agent Status Summary ─────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="label mb-1">AI Orchestration</div>
            <h3 className="text-white font-semibold">Agent Status Overview</h3>
          </div>
          <div className="badge-cyan">
            <Cpu className="w-3 h-3" />
            {mockAgents.filter(a => a.status === 'active').length} Active
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {mockAgents.map(agent => (
            <div key={agent.id}
                 className={`p-3 rounded-xl border text-center transition-all ${
                   agent.status === 'active' ? 'border-emerald-500/30 bg-emerald-500/5' :
                   agent.status === 'processing' ? 'border-amber-500/30 bg-amber-500/5' :
                   agent.status === 'idle' ? 'border-surface-border bg-surface' :
                   'border-rose-500/30 bg-rose-500/5'
                 }`}>
              <div className={`mx-auto mb-1.5 w-2 h-2 rounded-full ${
                agent.status === 'active' ? 'bg-emerald-400' :
                agent.status === 'processing' ? 'bg-amber-400 animate-pulse' :
                agent.status === 'idle' ? 'bg-slate-500' : 'bg-rose-400'
              }`} />
              <div className="text-[10px] font-semibold text-white leading-tight">
                {agent.name.split(' ')[0]}
              </div>
              <div className="text-[9px] text-slate-500 capitalize">{agent.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Municipal Team Handover Notes (Human Element Override) ── */}
      <MunicipalNotesBoard />
    </div>
  )
}

function MunicipalNotesBoard() {
  const [notes, setNotes] = useState([
    { id: 1, text: "Amit: Emergency contingency budgets are restricted at ₹50M. Do not authorize any low-priority overlay runs.", author: "Amit (Super.)", time: "10 mins ago", color: 'amber' },
    { id: 2, text: "Sanjay: Extreme monsoon forecast triggers June 5. Crew Alpha is pre-positioning geo-layers in Pune Bypass today.", author: "Sanjay (Ops)", time: "1 hr ago", color: 'cyan' },
    { id: 3, text: "Ramesh: Mumbai Western Highway bypass has manual override RHI score 85 (AI predicted 41, but repairs completed).", author: "Ramesh (Insp.)", time: "3 hrs ago", color: 'rose' },
  ])
  const [newText, setNewText] = useState('')
  const [selectedColor, setSelectedColor] = useState<'amber' | 'cyan' | 'rose'>('amber')

  const handleAddNote = () => {
    if (!newText.trim()) return
    const newNote = {
      id: Date.now(),
      text: newText,
      author: "Operator (You)",
      time: "Just now",
      color: selectedColor
    }
    setNotes([newNote, ...notes])
    setNewText('')
  }

  const handleDelete = (id: number) => {
    setNotes(notes.filter(n => n.id !== id))
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div>
          <div className="label mb-1">Human Operator Coordination</div>
          <h3 className="text-white font-semibold">Municipal Team Handover Notes</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-surface px-2.5 py-1 rounded-lg border border-surface-border">
          {notes.length} Active Notes
        </span>
      </div>

      {/* Post-it Note Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {notes.map(note => (
          <div
            key={note.id}
            className={clsx(
              'p-4 rounded-xl border relative flex flex-col justify-between min-h-[110px] transition-all hover:scale-[1.02]',
              note.color === 'amber' ? 'bg-amber-500/5 border-amber-500/20 text-amber-300/90' :
              note.color === 'cyan' ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-300/90' :
              'bg-rose-500/5 border-rose-500/20 text-rose-300/90'
            )}
          >
            <button
              onClick={() => handleDelete(note.id)}
              className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors text-[10px]"
            >
              ✕
            </button>
            <p className="text-xs leading-relaxed italic pr-4">"{note.text}"</p>
            <div className="flex justify-between items-center mt-3 border-t border-surface-border/20 pt-2 text-[9px] text-slate-500">
              <span className="font-bold uppercase tracking-wider">{note.author}</span>
              <span>{note.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Add Sticky Note panel */}
      <div className="bg-surface/50 border border-surface-border p-3.5 rounded-xl flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Leave supervisor handover note or RHI override remark..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="flex-1 bg-surface border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
        />
        
        <div className="flex gap-1.5 items-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mr-1">Color:</span>
          {(['amber', 'cyan', 'rose'] as const).map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={clsx(
                'w-5 h-5 rounded-full border transition-all',
                color === 'amber' ? 'bg-amber-400/80 border-amber-400' :
                color === 'cyan' ? 'bg-cyan-400/80 border-cyan-400' : 'bg-rose-400/80 border-rose-400',
                selectedColor === color ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
              )}
            />
          ))}
        </div>

        <button
          onClick={handleAddNote}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_12px_rgba(99,102,241,0.4)]"
        >
          + Leave Note
        </button>
      </div>
    </div>
  )
}
