import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Terminal, Brain, Wifi, WifiOff, CheckCircle2, AlertTriangle,
  Clock, Zap, MessageSquare, Eye, ChevronRight, Pause, Play,
  Filter, Download, Shield
} from 'lucide-react'
import clsx from 'clsx'

// ── Agent Colors ────────────────────────────────────────────────────
const AGENT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'GIS':         { color: '#22d3ee', bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30' },
  'Climate':     { color: '#60a5fa', bg: 'bg-blue-500/10',    border: 'border-blue-500/30' },
  'Risk':        { color: '#fb7185', bg: 'bg-rose-500/10',    border: 'border-rose-500/30' },
  'Forecast':    { color: '#a78bfa', bg: 'bg-violet-500/10',  border: 'border-violet-500/30' },
  'Maintenance': { color: '#fbbf24', bg: 'bg-amber-500/10',   border: 'border-amber-500/30' },
  'Budget':      { color: '#34d399', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  'Verify':      { color: '#f472b6', bg: 'bg-pink-500/10',    border: 'border-pink-500/30' },
  'Audit':       { color: '#94a3b8', bg: 'bg-slate-500/10',   border: 'border-slate-500/30' },
}

type LogLevel = 'thought' | 'action' | 'decision' | 'alert' | 'success' | 'error' | 'comms'

interface AgentLog {
  id: string
  timestamp: string
  agent: string
  level: LogLevel
  message: string
  data?: Record<string, unknown>
  requiresApproval?: boolean
  approved?: boolean | null
  confidence?: number
  reasoning?: string
}

// ── Synthetic log stream ─────────────────────────────────────────────
const LOG_STREAM: Omit<AgentLog, 'id' | 'timestamp'>[] = [
  { agent: 'GIS', level: 'thought', message: 'Querying PostGIS for segments with RHI < 30 within Mumbai Zone 4…', confidence: 0.97 },
  { agent: 'GIS', level: 'action', message: 'ST_DWithin query returned 23 critical segments. Running OSMnx betweenness centrality.', data: { segments: 23, query_ms: 48 } },
  { agent: 'Climate', level: 'thought', message: 'Cross-referencing OpenWeatherMap 7-day forecast with historical RUSLE erosion model…', confidence: 0.91 },
  { agent: 'Climate', level: 'alert', message: '⚠ MONSOON RISK: 380mm rainfall predicted in 21 days. Accelerating degradation model for 47 segments.', data: { risk_index: 0.87, segments_affected: 47 } },
  { agent: 'Risk', level: 'action', message: 'Running XGBoost ensemble inference on 234 critical candidates…', confidence: 0.95 },
  { agent: 'Risk', level: 'decision', message: 'RS-001 NH-48 classified CRITICAL (RHI: 23). SHAP: road_age=0.28, traffic=0.24, rainfall=0.15.', data: { rhi: 23, shap: { road_age: 0.28, traffic: 0.24, rainfall: 0.15 } }, confidence: 0.98 },
  { agent: 'Forecast', level: 'thought', message: 'Initiating TFT-v2 + LSTM-v3 ensemble for 90-day degradation trajectory on 50 priority segments…', confidence: 0.93 },
  { agent: 'Forecast', level: 'action', message: 'Temporal Fusion Transformer inference complete. RS-001 projected to reach RHI < 15 by 2026-06-20.', data: { predicted_failure: '2026-06-20', failure_prob: 0.89 } },
  { agent: 'GIS', level: 'comms', message: '→ [Maintenance] Sending cluster analysis: 7 segments within 2.4km radius — optimal for joint dispatch.', data: { cluster_id: 'MUM-C7', segments: 7, savings_est: 84000 } },
  { agent: 'Maintenance', level: 'thought', message: 'Received cluster MUM-C7. Running DBSCAN with ε=3km. Evaluating 3 crew configurations…', confidence: 0.96 },
  { agent: 'Maintenance', level: 'action', message: 'Optimal schedule: Alpha-7 (8 crew) + Beta-3 (5 crew). Start: 2026-06-01. Duration: 45 days. Cost: ₹1.85M', data: { crew: 13, start: '2026-06-01', cost: 1850000 } },
  { agent: 'Budget', level: 'thought', message: 'Running Linear Programming optimization on 34 selected projects within ₹50M envelope…', confidence: 0.99 },
  { agent: 'Budget', level: 'action', message: 'HiGHS solver converged in 234ms. Optimal: 32 projects, ₹47.2M, ROI 3.4x. Deferring 2 low-risk segments.', data: { solver: 'HiGHS', projects: 32, cost: 47200000, roi: 3.4 } },
  { agent: 'Budget', level: 'decision', message: 'HIGH-VALUE DECISION: ₹47.2M allocation approved by LP optimizer. Requires human sign-off per governance policy.', requiresApproval: true, approved: null, confidence: 0.98, reasoning: 'Budget exceeds ₹45M auto-approval threshold per municipal governance rules. Expected ROI: 3.4x. Climate risk window: 21 days.' },
  { agent: 'Audit', level: 'action', message: 'Recording decision to audit ledger. SHAP coverage: 100%. Fairness score: 0.97. Bias check: PASSED.', data: { audit_id: 'AUD-2026-05-26-4821', shap_coverage: '100%', fairness: 0.97 } },
  { agent: 'Audit', level: 'success', message: '✓ Full pipeline audit complete. 14 agent decisions recorded. 0 governance violations. Blockchain hash: 0xa4f2…', data: { decisions: 14, violations: 0 } },
  { agent: 'Verify', level: 'thought', message: 'Polling Sentinel-2 for post-repair verification of MT-022 (Pune Ring Road)…', confidence: 0.99 },
  { agent: 'Verify', level: 'success', message: '✓ VERIFIED: RS-088 Pune — RHI improved from 28 → 76 post-resurfacing. Cost: ₹720K. Within budget.', data: { rhi_before: 28, rhi_after: 76, cost: 720000 } },
  { agent: 'Climate', level: 'comms', message: '→ [Risk] Sharing updated freeze-thaw cycle forecast: 0 cycles in 90 days. Adjusting Delhi winter risk model.', data: { freeze_thaw_90d: 0, impact: 'low' } },
  { agent: 'Risk', level: 'thought', message: 'Integrating climate update. Re-running ensemble for 18 Delhi segments…', confidence: 0.94 },
  { agent: 'GIS', level: 'action', message: 'Satellite tile refresh: 4 new Sentinel-2 passes processed. 847 segments re-scored. 3 new critical detections.', data: { tiles: 4, segments_rescored: 847, new_critical: 3 } },
  { agent: 'Forecast', level: 'decision', message: 'Updated 90-day forecast ensemble. R² improvement: 0.93 → 0.96 with new satellite features.', data: { r2_old: 0.93, r2_new: 0.96, model: 'TFT-v2' }, confidence: 0.96 },
]

const levelConfig: Record<LogLevel, { icon: typeof Terminal; color: string; label: string; prefix: string }> = {
  thought:   { icon: Brain,          color: '#a78bfa', label: 'THOUGHT',  prefix: '💭' },
  action:    { icon: Zap,            color: '#22d3ee', label: 'ACTION',   prefix: '⚡' },
  decision:  { icon: CheckCircle2,   color: '#fbbf24', label: 'DECISION', prefix: '🎯' },
  alert:     { icon: AlertTriangle,  color: '#fb7185', label: 'ALERT',    prefix: '🚨' },
  success:   { icon: CheckCircle2,   color: '#34d399', label: 'SUCCESS',  prefix: '✅' },
  error:     { icon: AlertTriangle,  color: '#fb7185', label: 'ERROR',    prefix: '❌' },
  comms:     { icon: MessageSquare,  color: '#60a5fa', label: 'COMMS',    prefix: '📡' },
}

function LogEntry({ log, onApprove, onReject }: {
  log: AgentLog
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(log.requiresApproval)
  const agentStyle = AGENT_COLORS[log.agent] || AGENT_COLORS['GIS']
  const levelStyle = levelConfig[log.level]

  return (
    <div className={clsx(
      'border-b border-surface-border/30 py-3 px-4 hover:bg-surface-hover/30 transition-all',
      log.requiresApproval && log.approved === null && 'bg-amber-500/5 border-l-2 border-l-amber-500/60',
      log.approved === true && 'bg-emerald-500/5 border-l-2 border-l-emerald-500/60',
      log.approved === false && 'bg-rose-500/5 border-l-2 border-l-rose-500/40',
    )}>
      <div className="flex items-start gap-3">
        {/* Timestamp */}
        <div className="text-[10px] font-mono text-slate-600 w-16 flex-shrink-0 pt-0.5">
          {log.timestamp}
        </div>

        {/* Agent badge */}
        <div className={clsx(
          'text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0',
          agentStyle.bg, agentStyle.border
        )} style={{ color: agentStyle.color }}>
          {log.agent}
        </div>

        {/* Level */}
        <div className="text-[10px] font-mono flex-shrink-0 pt-0.5" style={{ color: levelStyle.color }}>
          [{levelStyle.label}]
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <div
            className="text-xs text-slate-300 leading-relaxed cursor-pointer"
            onClick={() => log.data && setExpanded(e => !e)}
          >
            {log.message}
          </div>

          {/* Confidence bar */}
          {log.confidence && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="text-[9px] text-slate-600">Conf.</div>
              <div className="flex-1 max-w-20 h-1 bg-surface-border rounded-full">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
                  style={{ width: `${log.confidence * 100}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-500">{(log.confidence * 100).toFixed(0)}%</div>
            </div>
          )}

          {/* Expanded data / reasoning */}
          {expanded && (log.data || log.reasoning) && (
            <div className="mt-2 p-2.5 bg-black/40 rounded-lg border border-surface-border/40 text-[10px] font-mono">
              {log.reasoning && (
                <div className="text-amber-300/80 mb-2 leading-relaxed">{log.reasoning}</div>
              )}
              {log.data && (
                <pre className="text-slate-400 overflow-x-auto">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Human-in-the-loop approval */}
          {log.requiresApproval && log.approved === null && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold">
                <Shield className="w-3 h-3" />
                Governance approval required
              </div>
              <button
                onClick={() => onApprove(log.id)}
                className="px-3 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg hover:bg-emerald-500/30 transition-all"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => onReject(log.id)}
                className="px-3 py-1 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-lg hover:bg-rose-500/30 transition-all"
              >
                ✗ Reject
              </button>
            </div>
          )}
          {log.approved === true && (
            <div className="mt-1 text-[10px] text-emerald-400 font-semibold">✓ Approved by operator</div>
          )}
          {log.approved === false && (
            <div className="mt-1 text-[10px] text-rose-400 font-semibold">✗ Rejected — sent back for re-evaluation</div>
          )}
        </div>

        {/* Expand toggle */}
        {log.data && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
          >
            <ChevronRight className={clsx('w-3 h-3 transition-transform', expanded && 'rotate-90')} />
          </button>
        )}
      </div>
    </div>
  )
}

export function CommandCenterPage() {
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [running, setRunning] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const bottomRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const makeId = () => Math.random().toString(36).slice(2)
  const getTime = () => new Date().toLocaleTimeString('en-GB', { hour12: false })

  const addNextLog = useCallback(() => {
    if (indexRef.current >= LOG_STREAM.length) indexRef.current = 0
    const template = LOG_STREAM[indexRef.current++]
    setLogs(prev => [...prev.slice(-80), {
      ...template,
      id: makeId(),
      timestamp: getTime(),
    }])
  }, [])

  useEffect(() => {
    // Seed 6 logs immediately
    const seed = Array.from({ length: 6 }, (_, i) => ({
      ...LOG_STREAM[i],
      id: makeId(),
      timestamp: getTime(),
    }))
    setLogs(seed)
    indexRef.current = 6
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(addNextLog, 1800)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, addNextLog])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleApprove = (id: string) =>
    setLogs(prev => prev.map(l => l.id === id ? { ...l, approved: true } : l))
  const handleReject = (id: string) =>
    setLogs(prev => prev.map(l => l.id === id ? { ...l, approved: false } : l))

  const filteredLogs = logs.filter(l => {
    if (agentFilter !== 'all' && l.agent !== agentFilter) return false
    if (filter === 'approvals') return l.requiresApproval
    if (filter !== 'all') return l.level === filter
    return true
  })

  const pendingApprovals = logs.filter(l => l.requiresApproval && l.approved === null).length
  const activeAgents = [...new Set(logs.map(l => l.agent))].length
  const decisions = logs.filter(l => l.level === 'decision').length

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">AI Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">
            LangGraph orchestration · real-time agent reasoning · human-in-the-loop governance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={clsx('w-2 h-2 rounded-full', running ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500')} />
            <span className="text-xs text-slate-400">{running ? 'Live' : 'Paused'}</span>
          </div>
          <button
            onClick={() => setRunning(r => !r)}
            className={clsx(
              'btn-secondary text-xs py-1.5 px-3',
              running ? 'text-amber-400 border-amber-500/30' : 'text-emerald-400 border-emerald-500/30'
            )}>
            {running ? <><Pause className="w-3 h-3" />Pause</> : <><Play className="w-3 h-3" />Resume</>}
          </button>
          <button className="btn-secondary text-xs py-1.5 px-3">
            <Download className="w-3 h-3" />Export Logs
          </button>
        </div>
      </div>

      {/* Status KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Agents', value: activeAgents, color: '#34d399', icon: Brain },
          { label: 'Log Events', value: logs.length, color: '#6366f1', icon: Terminal },
          { label: 'AI Decisions', value: decisions, color: '#fbbf24', icon: CheckCircle2 },
          { label: 'Pending Approvals', value: pendingApprovals, color: pendingApprovals > 0 ? '#fb7185' : '#34d399', icon: Shield },
        ].map(k => (
          <div key={k.label} className={clsx(
            'card p-4',
            k.label === 'Pending Approvals' && pendingApprovals > 0 && 'border-rose-500/40 animate-pulse-slow'
          )}>
            <div className="flex items-center gap-2 mb-1">
              <k.icon className="w-4 h-4" style={{ color: k.color }} />
              <span className="text-xs text-slate-400">{k.label}</span>
            </div>
            <div className="text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="card p-3 flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-500" />
        {['all', 'thought', 'action', 'decision', 'alert', 'success', 'comms', 'approvals'].map(f => (
          <button key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all',
                    filter === f ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40'
                                : 'text-slate-500 border border-surface-border hover:text-white'
                  )}>
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-slate-600">Agent:</span>
          <select
            value={agentFilter}
            onChange={e => setAgentFilter(e.target.value)}
            className="bg-surface border border-surface-border rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
          >
            <option value="all">All Agents</option>
            {Object.keys(AGENT_COLORS).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Main Terminal */}
      <div className="card flex-1 overflow-hidden flex flex-col min-h-0">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-border bg-black/20">
          <div className="w-3 h-3 rounded-full bg-rose-500/60" />
          <div className="w-3 h-3 rounded-full bg-amber-500/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          <div className="ml-3 text-[11px] font-mono text-slate-500">
            routeiq-x:agent-orchestrator — LangGraph StateGraph v0.2.x — {running ? '● LIVE' : '■ PAUSED'}
          </div>
          <div className="ml-auto flex gap-2">
            {Object.entries(AGENT_COLORS).map(([name, style]) => (
              <div key={name} className="w-1.5 h-1.5 rounded-full animate-pulse"
                   style={{ background: style.color, animationDelay: `${Math.random() * 2}s` }} />
            ))}
          </div>
        </div>

        {/* Log stream */}
        <div className="flex-1 overflow-y-auto font-mono text-xs" style={{ background: 'rgba(0,0,0,0.4)' }}>
          {filteredLogs.length === 0 && (
            <div className="text-center text-slate-600 py-12 text-xs">
              No logs match current filters.
            </div>
          )}
          {filteredLogs.map(log => (
            <LogEntry key={log.id} log={log} onApprove={handleApprove} onReject={handleReject} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Terminal prompt */}
        <div className="px-4 py-2 border-t border-surface-border bg-black/30 flex items-center gap-3">
          <span className="text-emerald-400 text-[11px] font-mono">routeiq@orchestrator:~$</span>
          <div className="flex-1 text-[11px] font-mono text-slate-500">
            {running ? 'Streaming agent decisions…' : 'Stream paused. Press Resume to continue.'}
          </div>
          <div className="text-[10px] text-slate-600 font-mono">{logs.length} events</div>
        </div>
      </div>
    </div>
  )
}
