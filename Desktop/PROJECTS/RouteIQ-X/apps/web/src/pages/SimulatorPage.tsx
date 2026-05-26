import { useState, useEffect } from 'react'
import {
  Sliders, CloudRain, DollarSign, Activity, Play, RefreshCw, Zap,
  TrendingDown, TrendingUp, HelpCircle, ShieldAlert, BarChart3, AlertCircle
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import clsx from 'clsx'

// ── Mock Initial Trajectory ──────────────────────────────────────────
const INITIAL_TRAJECTORY = [
  { month: 'Jun', rhi: 74, simulatedRhi: 74 },
  { month: 'Jul', rhi: 71, simulatedRhi: 68 },
  { month: 'Aug', rhi: 67, simulatedRhi: 58 },
  { month: 'Sep', rhi: 64, simulatedRhi: 51 },
  { month: 'Oct', rhi: 62, simulatedRhi: 48 },
  { month: 'Nov', rhi: 60, simulatedRhi: 46 },
  { month: 'Dec', rhi: 58, simulatedRhi: 45 },
]

export function SimulatorPage() {
  const [monsoonIntensity, setMonsoonIntensity] = useState(50) // 0-100%
  const [budgetCut, setBudgetCut] = useState(0) // 0-100%
  const [trafficLoad, setTrafficLoad] = useState(20) // -50% to +100%
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState(INITIAL_TRAJECTORY)
  const [activeTab, setActiveTab] = useState<'rhi' | 'impact'>('rhi')

  const runSimulation = () => {
    setIsSimulating(true)
    setTimeout(() => {
      // Calculate impact factors
      const monsoonFactor = 1 + (monsoonIntensity - 50) / 100 * 0.4
      const budgetFactor = 1 + budgetCut / 100 * 0.5
      const trafficFactor = 1 + trafficLoad / 100 * 0.3

      const updated = INITIAL_TRAJECTORY.map((pt, idx) => {
        if (idx === 0) return pt
        const baseDrop = pt.rhi - INITIAL_TRAJECTORY[idx - 1].rhi
        const amplifiedDrop = baseDrop * monsoonFactor * trafficFactor * budgetFactor
        const simulatedRhi = Math.max(10, Math.round(INITIAL_TRAJECTORY[idx - 1].simulatedRhi + amplifiedDrop))
        return {
          ...pt,
          simulatedRhi,
        }
      })
      setSimulationResult(updated)
      setIsSimulating(false)
    }, 800)
  }

  // Auto run simulation when values change
  useEffect(() => {
    runSimulation()
  }, [monsoonIntensity, budgetCut, trafficLoad])

  const latestSimulated = simulationResult[simulationResult.length - 1].simulatedRhi
  const latestBase = INITIAL_TRAJECTORY[INITIAL_TRAJECTORY.length - 1].rhi
  const rhiDivergence = latestSimulated - latestBase
  const statusTier = latestSimulated < 30 ? 'critical' : latestSimulated < 50 ? 'high' : latestSimulated < 70 ? 'medium' : 'low'

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Digital Twin Simulator</h1>
          <p className="text-slate-400 text-sm mt-1">
            Predict systemic infrastructure degradation trajectories under multi-variable adversarial stress tests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMonsoonIntensity(50)
              setBudgetCut(0)
              setTrafficLoad(20)
            }}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Parameters
          </button>
          <div className="badge-cyan text-xs">Simulacra-v4.1 Eng.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Control Column (Sliders & What-If Factors) */}
        <div className="card p-6 flex flex-col gap-6 h-fit">
          <div className="flex items-center gap-2 border-b border-surface-border pb-3">
            <Sliders className="w-5 h-5 text-brand-400" />
            <h2 className="text-sm font-semibold text-white">Adversarial Stressors</h2>
          </div>

          {/* Monsoon stressor */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                Monsoon Precipitation
              </label>
              <span className="text-xs font-bold text-cyan-400">{monsoonIntensity * 10} mm / day</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={monsoonIntensity}
              onChange={(e) => setMonsoonIntensity(Number(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Dry Spell</span>
              <span>Baseline (500mm)</span>
              <span>Extreme Flooding</span>
            </div>
          </div>

          {/* Budget restriction stressor */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Maintenance Budget Cut
              </label>
              <span className="text-xs font-bold text-emerald-400">{budgetCut}% Reduction</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={budgetCut}
              onChange={(e) => setBudgetCut(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Full Funding</span>
              <span>Mild cuts</span>
              <span>Severe Restructuring</span>
            </div>
          </div>

          {/* Traffic overloading stressor */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-400" />
                Traffic Load Factor
              </label>
              <span className="text-xs font-bold text-brand-400">
                {trafficLoad >= 0 ? `+${trafficLoad}` : trafficLoad}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="150"
              value={trafficLoad}
              onChange={(e) => setTrafficLoad(Number(e.target.value))}
              className="w-full accent-brand-500 h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>-50% (Lockdown)</span>
              <span>Normal baseline</span>
              <span>+150% (Heavy freight redirect)</span>
            </div>
          </div>

          {/* Simulation status / insight widget */}
          <div className={clsx(
            'p-4 rounded-xl border flex flex-col gap-2 mt-2',
            statusTier === 'critical' ? 'bg-rose-500/10 border-rose-500/30' :
            statusTier === 'high' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-brand-500/10 border-brand-500/30'
          )}>
            <div className="flex items-center gap-2">
              <ShieldAlert className={clsx('w-4 h-4', statusTier === 'critical' ? 'text-rose-400' : 'text-amber-400')} />
              <span className="text-[11px] font-bold uppercase tracking-wide text-white">Systemic Risk Warning</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {statusTier === 'critical' && 'Extreme parameters simulated. Over 74% of minor road segments will collapse into failures within 90 days. Budget cuts fully prohibit localized crew dispatches.'}
              {statusTier === 'high' && 'Noticeable RHI degradation acceleration observed. Heavy precipitation and budget stagnation place significant strain on national highway bypass loops.'}
              {statusTier === 'medium' && 'Acceptable degradation trajectory. Infrastructure RHI remains above municipal failure margins under mild stress factors.'}
              {statusTier === 'low' && 'Fully optimal system state. Road resilience remains exceptional due to sufficient maintenance and light traffic loading.'}
            </p>
          </div>
        </div>

        {/* Center / Right Column (Graphs & Comparative Twin Matrix) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Simulated Graph Card */}
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Twin Trajectory Divergence (90-Day Forecast)</h2>
                <p className="text-xs text-slate-500">Comparing original AI base forecast versus stress-tested simulation</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-brand-500" />
                  <span className="text-slate-400">Baseline Forecast</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-cyan-400" />
                  <span className="text-slate-400">Simulated Stressor</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationResult}>
                  <defs>
                    <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[10, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161627', borderColor: '#2a2a4a' }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rhi"
                    name="Base RHI"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="simulatedRhi"
                    name="Stress Simulated RHI"
                    stroke="#22d3ee"
                    strokeWidth={3.5}
                    strokeDasharray="5 5"
                    dot={{ fill: '#22d3ee', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-surface-border/50 pt-4">
              <div className="bg-surface rounded-xl p-3">
                <span className="text-[10px] text-slate-500 block">Baseline Final RHI</span>
                <span className="text-lg font-black text-brand-400">{latestBase}/100</span>
              </div>
              <div className="bg-surface rounded-xl p-3">
                <span className="text-[10px] text-slate-500 block">Simulated Stress Final RHI</span>
                <span className="text-lg font-black text-cyan-400">{latestSimulated}/100</span>
              </div>
              <div className="bg-surface rounded-xl p-3">
                <span className="text-[10px] text-slate-500 block">Final Deviation</span>
                <span className={clsx(
                  'text-lg font-black flex items-center gap-1',
                  rhiDivergence < 0 ? 'text-rose-400' : 'text-emerald-400'
                )}>
                  {rhiDivergence < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  {rhiDivergence > 0 ? `+${rhiDivergence}` : rhiDivergence} RHI
                </span>
              </div>
            </div>
          </div>

          {/* Matrix What-if Analysis Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-surface-border pb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Systemic Stress Amplifiers</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pavement Shear Index</span>
                  <span className="text-slate-200 font-semibold font-mono">{(monsoonIntensity * 0.04 + trafficLoad * 0.02 + 1).toFixed(2)}x</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill bg-cyan-400" style={{ width: `${Math.min(100, monsoonIntensity * 0.7 + trafficLoad * 0.3)}%` }} />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Maintenance Backlog Expansion</span>
                  <span className="text-slate-200 font-semibold font-mono">{(budgetCut * 1.5).toFixed(0)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill bg-emerald-400" style={{ width: `${budgetCut}%` }} />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Forecast Instability Variance</span>
                  <span className="text-slate-200 font-semibold font-mono">{(monsoonIntensity * 0.12).toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill bg-brand-400" style={{ width: `${monsoonIntensity}%` }} />
                </div>
              </div>
            </div>

            {/* Twin Material visualizer grid (Ultra Level) */}
            <div className="card p-5 space-y-4 relative overflow-hidden hologram-scan">
              <div className="flex items-center justify-between border-b border-surface-border pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Twin Pavement Cross-Section</h3>
                </div>
                <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  REAL-TIME SIMULATION
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { name: 'Surface Wear Layer', h: 100 - (trafficLoad * 0.2 + monsoonIntensity * 0.1), color: '#34d399', stress: trafficLoad > 40 },
                  { name: 'Binder Course', h: 100 - (trafficLoad * 0.15 + monsoonIntensity * 0.05), color: '#22d3ee', stress: trafficLoad > 70 },
                  { name: 'Base Aggregate', h: 100 - (monsoonIntensity * 0.35 + budgetCut * 0.2), color: '#a78bfa', stress: monsoonIntensity > 50 },
                  { name: 'Soil Subgrade', h: 100 - (monsoonIntensity * 0.6), color: '#fb7185', stress: monsoonIntensity > 80 }
                ].map((layer) => {
                  const health = Math.max(10, Math.round(layer.h))
                  return (
                    <div key={layer.name} className="bg-surface rounded-xl p-2.5 border border-surface-border flex flex-col justify-between items-center text-center relative overflow-hidden transition-all duration-300 hover:border-brand-500/30 hover:scale-105">
                      <div className="text-[9px] font-bold text-slate-400 leading-tight h-8 flex items-center justify-center">
                        {layer.name}
                      </div>

                      <div className="w-full h-12 bg-surface-card rounded-lg border border-surface-border/50 relative overflow-hidden flex items-end mt-2">
                        {/* Fluid animated height indicator */}
                        <div
                          className="w-full rounded-b-lg transition-all duration-500 relative"
                          style={{
                            height: `${health}%`,
                            background: `linear-gradient(to top, ${layer.color}50, ${layer.color})`
                          }}
                        >
                          {/* Pulsating hot-spots on high stress values */}
                          {layer.stress && (
                            <span className="absolute inset-0 bg-red-500/30 animate-pulse" />
                          )}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                          {health}%
                        </div>
                      </div>

                      <div className="text-[8px] text-slate-500 font-semibold tracking-wide mt-2">
                        {layer.stress ? '🚨 OVERLOADED' : '✓ STABLE'}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-[9px] text-slate-500 leading-normal flex items-start gap-1.5 bg-surface/50 p-2 rounded-lg border border-surface-border/40">
                <AlertCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  Simulation maps volumetric stress through structural layers. Dynamic precipitation swells subgrade soils, causing binder course shear risk index alerts.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
