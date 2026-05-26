import { useState } from 'react'
import {
  DollarSign, TrendingUp, Sliders, Play, RotateCcw,
  CheckCircle2, AlertTriangle, Zap, Target, ArrowRight
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { mockBudgetAllocations } from '../data/mockData'

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#fbbf24', '#fb7185', '#a78bfa']

interface BudgetParams {
  totalBudget: number
  priorityWeight: number
  trafficWeight: number
  ageWeight: number
  complaintsWeight: number
  clusterRadius: number
}

const defaultParams: BudgetParams = {
  totalBudget: 50_000_000,
  priorityWeight: 40,
  trafficWeight: 25,
  ageWeight: 20,
  complaintsWeight: 15,
  clusterRadius: 2.5,
}

function Slider({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string, value: number, min: number, max: number,
  step?: number, unit?: string, onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(90deg, #6366f1 ${((value - min) / (max - min)) * 100}%, #2a2a4a ${((value - min) / (max - min)) * 100}%)`
        }}
      />
      <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  )
}

export function BudgetPage() {
  const [params, setParams] = useState<BudgetParams>(defaultParams)
  const [running, setRunning] = useState(false)
  const [optimized, setOptimized] = useState(false)
  const [activeAlgo, setActiveAlgo] = useState<'lp' | 'ga' | 'rl'>('lp')

  const updateParam = (k: keyof BudgetParams) => (v: number) =>
    setParams(p => ({ ...p, [k]: v }))

  const runOptimizer = () => {
    setRunning(true)
    setOptimized(false)
    setTimeout(() => { setRunning(false); setOptimized(true) }, 2200)
  }

  // Simulated optimization result
  const optimizationResult = {
    roadsSelected: 34,
    totalCost: params.totalBudget * 0.94,
    savings: params.totalBudget * 0.22,
    roi: 3.4,
    efficiencyGain: 27,
    trafficDisruptionReduced: 41,
  }

  const allocationBreakdown = [
    { name: 'Full Reconstruction', value: 38, cost: params.totalBudget * 0.38 },
    { name: 'Resurfacing', value: 27, cost: params.totalBudget * 0.27 },
    { name: 'Pothole Repair', value: 18, cost: params.totalBudget * 0.18 },
    { name: 'Crack Sealing', value: 12, cost: params.totalBudget * 0.12 },
    { name: 'Patching', value: 5, cost: params.totalBudget * 0.05 },
  ]

  const radarData = [
    { metric: 'Cost Efficiency', value: 87 },
    { metric: 'Risk Coverage', value: 94 },
    { metric: 'Traffic Impact', value: 72 },
    { metric: 'Coverage', value: 81 },
    { metric: 'Timeline', value: 88 },
    { metric: 'ROI', value: 91 },
  ]

  const cityAlloc = mockBudgetAllocations.map(c => ({
    city: c.city,
    budgeted: c.totalBudget / 1e6,
    spent: c.spent / 1e6,
    savings: c.savings / 1e6,
    efficiency: c.efficiency,
  }))

  const totalWeight = params.priorityWeight + params.trafficWeight +
    params.ageWeight + params.complaintsWeight

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Budget Optimization Engine</h1>
          <p className="text-slate-400 text-sm mt-1">
            Linear Programming · Genetic Algorithm · Reinforcement Learning · Knapsack
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['lp', 'ga', 'rl'] as const).map(algo => (
            <button key={algo}
                    onClick={() => setActiveAlgo(algo)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      activeAlgo === algo
                        ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40'
                        : 'text-slate-400 border border-surface-border hover:text-white'
                    }`}>
              {algo === 'lp' ? 'Lin. Prog.' : algo === 'ga' ? 'Genetic Algo' : 'RL Policy'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ── Parameter Tuner ───────────────────────────────── */}
        <div className="card p-5 space-y-5">
          <div>
            <div className="label mb-1">Optimizer Parameters</div>
            <h3 className="text-white font-semibold">Configure Constraints</h3>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Total Budget</span>
                <span className="text-emerald-400 font-bold">
                  ₹{(params.totalBudget / 1e6).toFixed(0)}M
                </span>
              </div>
              <input type="range" min={10_000_000} max={200_000_000} step={5_000_000}
                     value={params.totalBudget}
                     onChange={e => updateParam('totalBudget')(Number(e.target.value))}
                     className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                     style={{
                       background: `linear-gradient(90deg, #34d399 ${((params.totalBudget - 10e6) / 190e6) * 100}%, #2a2a4a ${((params.totalBudget - 10e6) / 190e6) * 100}%)`
                     }} />
            </div>

            <div className="border-t border-surface-border pt-4">
              <div className="label mb-3">Priority Weights</div>
              <div className="space-y-3.5">
                <Slider label="Risk Priority" value={params.priorityWeight}
                        min={0} max={60} unit="%" onChange={updateParam('priorityWeight')} />
                <Slider label="Traffic Load" value={params.trafficWeight}
                        min={0} max={50} unit="%" onChange={updateParam('trafficWeight')} />
                <Slider label="Road Age" value={params.ageWeight}
                        min={0} max={40} unit="%" onChange={updateParam('ageWeight')} />
                <Slider label="Citizen Complaints" value={params.complaintsWeight}
                        min={0} max={30} unit="%" onChange={updateParam('complaintsWeight')} />
              </div>
              <div className={`mt-2 text-xs text-right font-semibold ${
                totalWeight === 100 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                Total: {totalWeight}% {totalWeight !== 100 && '(must sum to 100)'}
              </div>
            </div>

            <div className="border-t border-surface-border pt-4">
              <Slider label="Cluster Radius" value={params.clusterRadius}
                      min={0.5} max={10} step={0.5} unit=" km"
                      onChange={updateParam('clusterRadius')} />
              <div className="text-[10px] text-slate-500 mt-1">
                Geographically cluster repairs to minimize crew travel
              </div>
            </div>
          </div>

          {/* Run Button */}
          <button
            id="run-optimizer-btn"
            onClick={runOptimizer}
            disabled={running}
            className="btn-primary w-full justify-center"
          >
            {running ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run {activeAlgo.toUpperCase()} Optimizer
              </>
            )}
          </button>

          <button onClick={() => setParams(defaultParams)}
                  className="btn-secondary w-full justify-center text-sm py-2">
            <RotateCcw className="w-3.5 h-3.5" />Reset to Defaults
          </button>
        </div>

        {/* ── Results Panel ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {optimized ? (
            <>
              {/* Result KPIs */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Target, label: 'Roads Selected', value: optimizationResult.roadsSelected, color: '#6366f1', unit: '' },
                  { icon: DollarSign, label: 'Budget Used', value: `₹${(optimizationResult.totalCost/1e6).toFixed(1)}M`, color: '#34d399', unit: '' },
                  { icon: TrendingUp, label: 'ROI Multiplier', value: `${optimizationResult.roi}x`, color: '#fbbf24', unit: '' },
                  { icon: CheckCircle2, label: 'Cost Savings', value: `₹${(optimizationResult.savings/1e6).toFixed(1)}M`, color: '#22d3ee', unit: '' },
                  { icon: Zap, label: 'Efficiency Gain', value: `+${optimizationResult.efficiencyGain}%`, color: '#a78bfa', unit: '' },
                  { icon: AlertTriangle, label: 'Traffic Disruption', value: `-${optimizationResult.trafficDisruptionReduced}%`, color: '#34d399', unit: '' },
                ].map(k => (
                  <div key={k.label} className="card p-4 text-center">
                    <k.icon className="w-5 h-5 mx-auto mb-1" style={{ color: k.color }} />
                    <div className="text-lg font-black" style={{ color: k.color }}>{k.value}</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Allocation Breakdown */}
                <div className="card p-4">
                  <div className="label mb-2">Budget Allocation</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={allocationBreakdown} cx="50%" cy="50%"
                           innerRadius={40} outerRadius={65}
                           paddingAngle={3} dataKey="value">
                        {allocationBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i]} opacity={0.9} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => [`${v}%`]}
                        contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1 mt-2">
                    {allocationBreakdown.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                          <span className="text-slate-400">{d.name}</span>
                        </div>
                        <span className="text-white font-semibold">
                          ₹{(d.cost / 1e6).toFixed(1)}M
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimization Radar */}
                <div className="card p-4">
                  <div className="label mb-2">Optimization Quality</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#2a2a4a" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: '#64748b' }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} />
                      <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* City Budget Bar */}
              <div className="card p-4">
                <div className="label mb-3">City Budget Performance</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={cityAlloc} barSize={18} barGap={2}>
                    <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }}
                           tickFormatter={v => `₹${v}M`} />
                    <Tooltip
                      formatter={(v: number) => [`₹${v.toFixed(0)}M`]}
                      contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
                    />
                    <Bar dataKey="budgeted" fill="#2a2a4a" radius={[4, 4, 0, 0]} name="Budgeted" />
                    <Bar dataKey="spent" fill="#6366f1" radius={[4, 4, 0, 0]} name="Spent" />
                    <Bar dataKey="savings" fill="#34d399" radius={[4, 4, 0, 0]} name="Savings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Recommendation */}
              <div className="card p-4 border border-brand-500/30"
                   style={{ background: 'rgba(99,102,241,0.05)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white mb-1">Budget Agent Recommendation</div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      The {activeAlgo.toUpperCase()} optimizer selected <strong className="text-white">34 road segments</strong> for repair,
                      prioritizing {params.priorityWeight}% by risk score. Geographic clustering reduced crew dispatch costs by
                      <strong className="text-emerald-400"> ₹{(optimizationResult.savings * 0.3 / 1e6).toFixed(1)}M</strong>.
                      Scheduling critical segments before monsoon season (Jun–Sep) prevents an estimated
                      <strong className="text-white"> ₹{(optimizationResult.savings * 0.7 / 1e6).toFixed(1)}M</strong> in emergency repair costs.
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-12 text-center h-full flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <Target className="w-8 h-8 text-brand-400" />
              </div>
              <div>
                <div className="text-white font-semibold mb-1">Configure & Run Optimizer</div>
                <div className="text-slate-500 text-sm max-w-xs mx-auto">
                  Set your budget constraints and priority weights, then run the {activeAlgo.toUpperCase()} algorithm.
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ArrowRight className="w-3 h-3 text-brand-400" />
                Supports LP · Genetic Algorithm · RL Policy
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
