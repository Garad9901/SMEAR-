import { useState } from 'react'
import {
  Bot, Activity, CheckCircle2, AlertCircle, Clock, Cpu,
  Brain, Globe, Wrench, DollarSign, Shield, TrendingUp,
  Eye, FileText, Zap, MemoryStick, BarChart3
} from 'lucide-react'
import { mockAgents, type AIAgent } from '../data/mockData'
import clsx from 'clsx'

const agentIcons: Record<string, React.ElementType> = {
  geospatial: Globe,
  environmental: TrendingUp,
  planning: Wrench,
  financial: DollarSign,
  assessment: Shield,
  prediction: Brain,
  verification: Eye,
  governance: FileText,
}

const statusConfig = {
  active:     { color: '#34d399', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Active', dot: 'bg-emerald-400' },
  processing: { color: '#fbbf24', bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  label: 'Processing', dot: 'bg-amber-400' },
  idle:       { color: '#64748b', bg: 'bg-slate-500/10',  border: 'border-slate-500/30',  label: 'Idle', dot: 'bg-slate-500' },
  error:      { color: '#fb7185', bg: 'bg-rose-500/10',   border: 'border-rose-500/30',   label: 'Error', dot: 'bg-rose-400' },
}

function AgentCard({ agent, isSelected, onClick }: {
  agent: AIAgent, isSelected: boolean, onClick: () => void
}) {
  const Icon = agentIcons[agent.type] ?? Bot
  const st = statusConfig[agent.status]

  return (
    <div
      onClick={onClick}
      className={clsx(
        'card p-5 cursor-pointer transition-all duration-200',
        isSelected ? 'border-brand-500/60 ring-1 ring-brand-500/30' : 'hover:border-brand-500/20'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${st.bg} border ${st.border}`}>
              <Icon className="w-5 h-5" style={{ color: st.color }} />
            </div>
            <div className={clsx('absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-card', st.dot)} />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">{agent.name}</div>
            <div className="text-xs text-slate-500 capitalize">{agent.type}</div>
          </div>
        </div>
        <div className={`badge text-[10px] font-semibold ${st.bg} border ${st.border}`}
             style={{ color: st.color }}>
          {st.label}
        </div>
      </div>

      {/* Current Task */}
      <div className="text-xs text-slate-400 mb-3 leading-relaxed bg-surface rounded-lg p-2.5 border border-surface-border/50">
        {agent.currentTask}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-surface rounded-lg p-2">
          <div className="text-xs font-bold text-white">{agent.accuracy}%</div>
          <div className="text-[9px] text-slate-500">Accuracy</div>
        </div>
        <div className="bg-surface rounded-lg p-2">
          <div className="text-xs font-bold text-white">{agent.uptime}%</div>
          <div className="text-[9px] text-slate-500">Uptime</div>
        </div>
        <div className="bg-surface rounded-lg p-2">
          <div className="text-xs font-bold text-white">{agent.memoryUsage}%</div>
          <div className="text-[9px] text-slate-500">Memory</div>
        </div>
      </div>

      {/* Memory Bar */}
      <div className="mt-2.5">
        <div className="progress-bar">
          <div className="progress-fill"
               style={{
                 width: `${agent.memoryUsage}%`,
                 background: agent.memoryUsage > 80 ? '#fb7185' : agent.memoryUsage > 60 ? '#fbbf24' : '#6366f1'
               }} />
        </div>
      </div>
    </div>
  )
}

function AgentDetail({ agent }: { agent: AIAgent }) {
  const Icon = agentIcons[agent.type] ?? Bot
  const st = statusConfig[agent.status]

  return (
    <div className="card p-6 h-full">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${st.bg} border ${st.border}`}
             style={{ boxShadow: `0 0 20px ${st.color}30` }}>
          <Icon className="w-7 h-7" style={{ color: st.color }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{agent.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className={clsx('w-2 h-2 rounded-full', st.dot,
              agent.status === 'processing' ? 'animate-pulse' : '')} />
            <span className="text-sm" style={{ color: st.color }}>{st.label}</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-500 capitalize">{agent.type} agent</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="label mb-2">Current Task</div>
          <div className="bg-surface rounded-xl p-4 border border-surface-border">
            <div className="flex items-start gap-2">
              <Activity className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <span className="text-sm text-slate-300">{agent.currentTask}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="label mb-2">Last Action</div>
          <div className="bg-surface rounded-xl p-3 border border-surface-border">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-slate-400">{agent.lastAction}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: BarChart3, label: 'Accuracy', value: `${agent.accuracy}%`, color: '#34d399' },
            { icon: Activity,  label: 'Uptime',   value: `${agent.uptime}%`,   color: '#6366f1' },
            { icon: Cpu,       label: 'Memory',   value: `${agent.memoryUsage}%`, color: '#fbbf24' },
            { icon: Zap,       label: 'Inferences', value: `${(agent.inferenceCount/1e6).toFixed(1)}M`, color: '#22d3ee' },
            { icon: CheckCircle2, label: 'Tasks Done', value: agent.tasksCompleted.toLocaleString(), color: '#a78bfa' },
          ].map(m => (
            <div key={m.label} className="bg-surface rounded-xl p-3 border border-surface-border">
              <div className="flex items-center gap-2 mb-1">
                <m.icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                <span className="text-xs text-slate-500">{m.label}</span>
              </div>
              <div className="text-lg font-bold" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Memory Usage Bar */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5 text-slate-500">
              <MemoryStick className="w-3 h-3" />Memory Usage
            </div>
            <span className="text-white font-semibold">{agent.memoryUsage}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-border overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
                 style={{
                   width: `${agent.memoryUsage}%`,
                   background: agent.memoryUsage > 80
                     ? 'linear-gradient(90deg, #fbbf24, #fb7185)'
                     : 'linear-gradient(90deg, #6366f1, #22d3ee)'
                 }} />
          </div>
        </div>

        {/* Vector Memory */}
        <div className="bg-surface rounded-xl p-4 border border-surface-border">
          <div className="label mb-2">Vector Memory (Pinecone)</div>
          <div className="space-y-1.5">
            {[
              { k: 'Index', v: `routeiq-${agent.type}-mem` },
              { k: 'Dimensions', v: '1536 (OpenAI ada-002)' },
              { k: 'Stored Embeddings', v: `${(agent.inferenceCount * 0.001).toFixed(0)} vectors` },
              { k: 'Context Window', v: '128K tokens' },
            ].map(({ k, v }) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-300 font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AgentsPage() {
  const [selected, setSelected] = useState<string>(mockAgents[0].id)
  const selectedAgent = mockAgents.find(a => a.id === selected)!

  const activeCount = mockAgents.filter(a => a.status === 'active').length
  const processingCount = mockAgents.filter(a => a.status === 'processing').length
  const totalInferences = mockAgents.reduce((s, a) => s + a.inferenceCount, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">AI Agent Orchestration</h1>
          <p className="text-slate-400 text-sm mt-1">
            LangGraph · Temporal Workflows · Celery · Pinecone Vector Memory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="badge-success">{activeCount} Active</div>
          <div className="badge-warning">{processingCount} Processing</div>
          <div className="text-xs text-slate-500">
            {(totalInferences/1e6).toFixed(1)}M total inferences
          </div>
        </div>
      </div>

      {/* Orchestration Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'LangGraph', status: 'Running', color: '#6366f1', nodes: 24 },
          { label: 'Temporal WF', status: 'Active', color: '#22d3ee', nodes: 128 },
          { label: 'Celery Queue', status: '14 tasks', color: '#34d399', nodes: null },
          { label: 'Ray Serve', status: '6 replicas', color: '#fbbf24', nodes: null },
        ].map(item => (
          <div key={item.label} className="card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">{item.label}</span>
              <div className="pulse-dot" style={item.color !== '#34d399' && item.color !== '#6366f1'
                ? {} : {}} />
            </div>
            <div className="text-sm font-bold" style={{ color: item.color }}>{item.status}</div>
            {item.nodes && <div className="text-xs text-slate-500 mt-0.5">{item.nodes} graph nodes</div>}
          </div>
        ))}
      </div>

      {/* Agent Grid + Detail */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3 content-start">
          {mockAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selected === agent.id}
              onClick={() => setSelected(agent.id)}
            />
          ))}
        </div>
        <div className="overflow-y-auto no-scrollbar">
          <AgentDetail agent={selectedAgent} />
        </div>
      </div>
    </div>
  )
}
