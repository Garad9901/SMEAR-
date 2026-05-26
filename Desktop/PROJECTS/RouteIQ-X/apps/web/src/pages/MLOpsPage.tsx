import { useState } from 'react'
import {
  FlaskConical, CheckCircle2, AlertTriangle, TrendingUp,
  Activity, RefreshCw, Eye, GitBranch, Cpu, Zap, ArrowUpRight
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, Cell
} from 'recharts'
import { mockMLModels, type MLModel } from '../data/mockData'
import clsx from 'clsx'

const statusConfig = {
  production: { color: '#34d399', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Production' },
  staging:    { color: '#fbbf24', bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   label: 'Staging' },
  shadow:     { color: '#60a5fa', bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    label: 'Shadow' },
  retired:    { color: '#64748b', bg: 'bg-slate-500/10',   border: 'border-slate-500/30',   label: 'Retired' },
}

const generateDriftData = () =>
  Array.from({ length: 14 }, (_, i) => ({
    day: `D-${14 - i}`,
    drift: 0.01 + Math.sin(i * 0.5) * 0.02 + Math.random() * 0.01,
    threshold: 0.05,
    accuracy: 94 + Math.sin(i * 0.3) * 2 - i * 0.05,
  }))

const generateTrainingHistory = () =>
  Array.from({ length: 8 }, (_, i) => ({
    epoch: `v${i + 1}`,
    trainLoss: 0.8 - i * 0.08 + Math.random() * 0.02,
    valLoss: 0.85 - i * 0.075 + Math.random() * 0.03,
    accuracy: 85 + i * 1.2 + Math.random(),
  }))

function ModelCard({ model, isSelected, onClick }: {
  model: MLModel, isSelected: boolean, onClick: () => void
}) {
  const st = statusConfig[model.status]
  const driftOk = model.driftScore < 0.05

  return (
    <div onClick={onClick}
         className={clsx(
           'card p-4 cursor-pointer transition-all duration-200',
           isSelected ? 'border-brand-500/60 ring-1 ring-brand-500/30' : 'hover:border-brand-500/20'
         )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-bold text-white">{model.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{model.type}</div>
        </div>
        <span className={`badge text-[10px] ${st.bg} border ${st.border}`} style={{ color: st.color }}>
          {st.label}
        </span>
      </div>

      <div className="text-xs font-mono text-slate-500 mb-3 bg-surface px-2 py-1 rounded-lg inline-block">
        {model.framework}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-sm font-bold text-white">{model.accuracy}%</div>
          <div className="text-[9px] text-slate-500">Accuracy</div>
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: driftOk ? '#34d399' : '#fb7185' }}>
            {model.driftScore.toFixed(2)}
          </div>
          <div className="text-[9px] text-slate-500">Drift</div>
        </div>
        <div>
          <div className="text-sm font-bold text-white">{model.latency}ms</div>
          <div className="text-[9px] text-slate-500">Latency</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600">
        <span>{(model.inferences / 1e6).toFixed(1)}M inferences</span>
        <div className={`flex items-center gap-1 ${driftOk ? 'text-emerald-400' : 'text-rose-400'}`}>
          {driftOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {driftOk ? 'No drift' : 'Drift detected'}
        </div>
      </div>
    </div>
  )
}

export function MLOpsPage() {
  const [selectedModel, setSelectedModel] = useState<string>(mockMLModels[0].id)
  const model = mockMLModels.find(m => m.id === selectedModel)!
  const drift = generateDriftData()
  const history = generateTrainingHistory()
  const st = statusConfig[model.status]

  const modelsByStatus = {
    production: mockMLModels.filter(m => m.status === 'production').length,
    staging: mockMLModels.filter(m => m.status === 'staging').length,
    shadow: mockMLModels.filter(m => m.status === 'shadow').length,
  }

  const pipelineSteps = [
    { label: 'Data Ingestion', status: 'done', duration: '2m 14s' },
    { label: 'Feature Engineering', status: 'done', duration: '8m 47s' },
    { label: 'Model Training', status: 'done', duration: '34m 12s' },
    { label: 'Evaluation & Validation', status: 'done', duration: '5m 31s' },
    { label: 'Drift Check (Evidently)', status: 'done', duration: '1m 08s' },
    { label: 'SHAP Explainability', status: 'running', duration: '—' },
    { label: 'Canary Deployment', status: 'pending', duration: '—' },
    { label: 'Shadow Testing', status: 'pending', duration: '—' },
    { label: 'Promotion to Production', status: 'pending', duration: '—' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">MLOps Monitor</h1>
          <p className="text-slate-400 text-sm mt-1">
            MLflow · Kubeflow Pipelines · Feast Feature Store · Evidently Drift · SHAP
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="badge-success">{modelsByStatus.production} Production</div>
          <div className="badge-warning">{modelsByStatus.staging} Staging</div>
          <div className="badge-info">{modelsByStatus.shadow} Shadow</div>
        </div>
      </div>

      {/* MLflow + Kubeflow Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'MLflow Server', url: ':5000', status: 'Healthy', color: '#34d399', icon: FlaskConical },
          { label: 'Kubeflow Pipelines', url: ':3000/pipeline', status: '2 Running', color: '#6366f1', icon: GitBranch },
          { label: 'Feast Feature Store', url: ':6566', status: 'Synced', color: '#22d3ee', icon: Cpu },
          { label: 'Ray Serve', url: ':8265', status: '6 Replicas', color: '#fbbf24', icon: Zap },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-xs font-semibold text-white">{s.label}</span>
            </div>
            <div className="text-sm font-bold" style={{ color: s.color }}>{s.status}</div>
            <div className="text-[10px] text-slate-600 font-mono mt-0.5">{s.url}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Model Registry */}
        <div className="space-y-3">
          <div className="label">Model Registry ({mockMLModels.length} models)</div>
          {mockMLModels.map(m => (
            <ModelCard
              key={m.id}
              model={m}
              isSelected={selectedModel === m.id}
              onClick={() => setSelectedModel(m.id)}
            />
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Model Header */}
          <div className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${st.bg} border ${st.border}`}>
                  <Activity className="w-6 h-6" style={{ color: st.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{model.name}</h2>
                  <div className="text-xs text-slate-500">v{model.version} · {model.framework}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary text-xs py-1.5 px-3 gap-1.5">
                  <RefreshCw className="w-3 h-3" />Retrain
                </button>
                <button className="btn-secondary text-xs py-1.5 px-3 gap-1.5">
                  <Eye className="w-3 h-3" />SHAP
                </button>
                {model.status !== 'production' && (
                  <button className="btn-primary text-xs py-1.5 px-3 gap-1.5">
                    <ArrowUpRight className="w-3 h-3" />Promote
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'Accuracy', value: `${model.accuracy}%`, color: '#34d399' },
                { label: 'F1 Score', value: model.f1Score.toFixed(3), color: '#6366f1' },
                { label: 'Drift Score', value: model.driftScore.toFixed(3), color: model.driftScore < 0.05 ? '#34d399' : '#fb7185' },
                { label: 'Inferences', value: `${(model.inferences/1e6).toFixed(1)}M`, color: '#22d3ee' },
                { label: 'Latency p99', value: `${model.latency}ms`, color: '#fbbf24' },
                { label: 'Last Retrained', value: model.lastRetrained, color: '#a78bfa' },
              ].map(m => (
                <div key={m.label} className="bg-surface rounded-xl p-3 text-center">
                  <div className="text-sm font-bold" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Drift Monitor */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="label mb-1">Evidently AI</div>
                <h3 className="text-white font-semibold text-sm">Feature Drift Monitor</h3>
              </div>
              <div className={`badge ${model.driftScore < 0.05 ? 'badge-success' : 'badge-critical'}`}>
                {model.driftScore < 0.05 ? '✓ Within Tolerance' : '⚠ Drift Detected'}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={drift}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
                />
                <Line type="monotone" dataKey="drift" stroke="#6366f1" strokeWidth={2}
                      dot={{ fill: '#6366f1', r: 2 }} name="Drift Score" />
                <Line type="monotone" dataKey="threshold" stroke="#fb7185" strokeWidth={1.5}
                      strokeDasharray="4 4" dot={false} name="Threshold" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Training History */}
          <div className="card p-5">
            <div className="label mb-1">Training History</div>
            <h3 className="text-white font-semibold text-sm mb-4">Loss & Accuracy per Version</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={history} barSize={14} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="epoch" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" domain={[80, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
                />
                <Bar yAxisId="left" dataKey="trainLoss" fill="#6366f1" radius={[2, 2, 0, 0]} name="Train Loss" opacity={0.8} />
                <Bar yAxisId="left" dataKey="valLoss" fill="#22d3ee" radius={[2, 2, 0, 0]} name="Val Loss" opacity={0.8} />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 3 }} name="Accuracy" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Kubeflow Pipeline */}
          <div className="card p-5">
            <div className="label mb-3">Kubeflow Pipeline — Current Run</div>
            <div className="space-y-2">
              {pipelineSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.status === 'done' ? 'bg-emerald-500/20' :
                    step.status === 'running' ? 'bg-amber-500/20 animate-pulse' :
                    'bg-surface-border'
                  }`}>
                    {step.status === 'done'    && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {step.status === 'running' && <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />}
                    {step.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-600" />}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className={`text-xs ${
                      step.status === 'done' ? 'text-slate-300' :
                      step.status === 'running' ? 'text-amber-400 font-semibold' :
                      'text-slate-600'
                    }`}>{step.label}</span>
                    <span className="text-[10px] font-mono text-slate-600">{step.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
