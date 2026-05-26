import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, LabelList, Cell, Legend
} from 'recharts'
import { BarChart3, TrendingUp, DollarSign, Award, Target, HelpCircle, Activity } from 'lucide-react'
import clsx from 'clsx'

// ── Multi-City Performance Data ──────────────────────────────────────
const CITY_METRICS = [
  { name: 'Mumbai', rhi: 68, budgetSpend: 42.5, compliance: 92, alertsCount: 23, roi: 3.4, color: '#22d3ee' },
  { name: 'Delhi', rhi: 62, budgetSpend: 38.0, compliance: 88, alertsCount: 31, roi: 2.8, color: '#fb7185' },
  { name: 'Bengaluru', rhi: 71, budgetSpend: 28.5, compliance: 95, alertsCount: 12, roi: 3.9, color: '#34d399' },
  { name: 'Pune', rhi: 74, budgetSpend: 18.2, compliance: 91, alertsCount: 8, roi: 4.2, color: '#a78bfa' },
  { name: 'Chennai', rhi: 65, budgetSpend: 31.0, compliance: 85, alertsCount: 19, roi: 3.1, color: '#fbbf24' },
]

export function ComparisonPage() {
  const [metricKey, setMetricKey] = useState<'rhi' | 'budgetSpend' | 'compliance' | 'roi'>('rhi')

  const sortedData = [...CITY_METRICS].sort((a, b) => b[metricKey] - a[metricKey])

  const scatterData = CITY_METRICS.map(c => ({
    name: c.name,
    x: c.budgetSpend,
    y: c.rhi,
    roi: c.roi
  }))

  const metricsConfig = {
    rhi: { label: 'Avg RHI Score', unit: '', color: '#6366f1' },
    budgetSpend: { label: 'Budget Alloc. (₹M)', unit: 'M', color: '#34d399' },
    compliance: { label: 'SLA Compliance (%)', unit: '%', color: '#22d3ee' },
    roi: { label: 'Est. Project ROI (x)', unit: 'x', color: '#fbbf24' },
  }

  const bestPerformer = CITY_METRICS.reduce((prev, current) => (prev.rhi > current.rhi) ? prev : current)
  const mostEfficient = CITY_METRICS.reduce((prev, current) => (prev.roi > current.roi) ? prev : current)

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">City Comparison Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Compare multi-municipal performance metrics, budget allocation efficiency, and ROI index matrices
          </p>
        </div>
        <div className="flex items-center gap-1 bg-surface border border-surface-border rounded-xl p-1">
          {(['rhi', 'budgetSpend', 'compliance', 'roi'] as const).map(key => (
            <button
              key={key}
              onClick={() => setMetricKey(key)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all',
                metricKey === key
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                  : 'text-slate-500 border border-transparent hover:text-white'
              )}
            >
              {key === 'budgetSpend' ? 'Budget' : key}
            </button>
          ))}
        </div>
      </div>

      {/* Top Highlights Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Top RHI Performer</span>
            <span className="text-base font-bold text-white">{bestPerformer.name}</span>
            <span className="text-xs text-brand-400 block mt-0.5">Average RHI: {bestPerformer.rhi}/100</span>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Most Capital Efficient</span>
            <span className="text-base font-bold text-white">{mostEfficient.name}</span>
            <span className="text-xs text-emerald-400 block mt-0.5">Project ROI: {mostEfficient.roi}x yield</span>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Interventions Deployed</span>
            <span className="text-base font-bold text-white">92 Segments</span>
            <span className="text-xs text-cyan-400 block mt-0.5">SLA Compliance: 91.6% avg</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metric Racing / Sorted Bar Chart */}
        <div className="card p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Municipal Performance Rankings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked comparison of cities based on {metricsConfig[metricKey].label}
            </p>
          </div>
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} layout="vertical" margin={{ left: 15, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161627', borderColor: '#2a2a4a' }}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                />
                <Bar dataKey={metricKey} radius={[0, 8, 8, 0]}>
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey={metricKey} position="right" fill="#e2e8f0" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Spend vs RHI Improvement (Correlation Scatter) */}
        <div className="card p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Capital Allocations vs RHI Performance</h2>
            <p className="text-xs text-slate-500 mt-0.5">Scatter matrix analyzing capital expenditure (₹ Millions) versus municipal road health</p>
          </div>
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="Budget Spend" unit="M" stroke="#64748b" label={{ value: 'Capital Allocated (₹M)', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
                <YAxis type="number" dataKey="y" name="Average RHI" unit="" stroke="#64748b" domain={[55, 80]} label={{ value: 'Avg RHI Score', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#161627', borderColor: '#2a2a4a' }}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                />
                <Scatter name="Cities" data={scatterData} fill="#8884d8">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CITY_METRICS[index].color} />
                  ))}
                  <LabelList dataKey="name" position="top" style={{ fill: '#e2e8f0', fontSize: '10px', fontWeight: 'semibold' }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparison Data Table */}
      <div className="card p-5">
        <div className="label mb-3">Complete Comparative Ledger</div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Avg Road Health Index</th>
                <th>Total Capital Spent</th>
                <th>SLA Compliance Rate</th>
                <th>Pending Risk Alerts</th>
                <th>SaaS System ROI</th>
              </tr>
            </thead>
            <tbody>
              {CITY_METRICS.map(row => (
                <tr key={row.name}>
                  <td className="font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: row.color }} />
                    {row.name}
                  </td>
                  <td>
                    <span className="font-mono text-cyan-400 font-bold">{row.rhi}/100</span>
                  </td>
                  <td className="font-mono">₹{row.budgetSpend} Million</td>
                  <td>
                    <span className={clsx(
                      'badge font-semibold',
                      row.compliance >= 90 ? 'badge-success' : 'badge-warning'
                    )}>
                      {row.compliance}%
                    </span>
                  </td>
                  <td className="font-mono text-rose-400 font-bold">{row.alertsCount} alerts</td>
                  <td className="font-mono text-emerald-400 font-bold">{row.roi}x return</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
