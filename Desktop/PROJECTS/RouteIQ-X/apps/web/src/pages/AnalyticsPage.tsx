import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  CartesianGrid, Legend, ReferenceLine
} from 'recharts'
import { Brain, TrendingDown, Calendar, CloudRain, Thermometer, Wind } from 'lucide-react'
import { generateDegradationForecast, generateTrafficData, mockRoadSegments } from '../data/mockData'

const generateClimateCorrelation = () =>
  Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    rainfall: [12, 8, 22, 45, 88, 210, 380, 290, 150, 60, 25, 14][i],
    rhiDrop: [1.2, 0.8, 2.1, 3.8, 5.5, 8.2, 12.1, 9.8, 6.2, 3.1, 1.8, 1.0][i],
    complaints: [28, 19, 45, 89, 134, 289, 421, 356, 198, 87, 42, 31][i],
  }))

const generateSegmentScatter = () =>
  mockRoadSegments.map(seg => ({
    x: seg.age,
    y: seg.rhi,
    z: seg.complaints,
    name: seg.name,
    city: seg.city,
  }))

export function AnalyticsPage() {
  const [forecastHorizon, setForecastHorizon] = useState<30 | 60 | 90>(60)
  const forecasts = generateDegradationForecast()
  const traffic = generateTrafficData()
  const climate = generateClimateCorrelation()
  const scatter = generateSegmentScatter()

  const modelMetrics = [
    { model: 'TFT', mae: 3.2, rmse: 4.1, r2: 0.94, mape: 4.8 },
    { model: 'LSTM', mae: 3.8, rmse: 4.9, r2: 0.91, mape: 5.6 },
    { model: 'Prophet', mae: 4.5, rmse: 5.8, r2: 0.88, mape: 6.9 },
    { model: 'XGBoost', mae: 2.9, rmse: 3.7, r2: 0.96, mape: 4.2 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Predictive Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            LSTM · Prophet · Temporal Fusion Transformer · XGBoost ensemble forecasting
          </p>
        </div>
        <div className="flex items-center gap-2">
          {([30, 60, 90] as const).map(h => (
            <button key={h}
                    onClick={() => setForecastHorizon(h)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      forecastHorizon === h
                        ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40'
                        : 'text-slate-400 border border-surface-border hover:text-white'
                    }`}>
              {h}d forecast
            </button>
          ))}
        </div>
      </div>

      {/* Model Performance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {modelMetrics.map(m => (
          <div key={m.model} className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-brand-400" />
              <span className="font-bold text-white">{m.model}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">R² Score</span>
                <span className="text-emerald-400 font-bold">{m.r2}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">MAE</span>
                <span className="text-white">{m.mae}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">RMSE</span>
                <span className="text-white">{m.rmse}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">MAPE</span>
                <span className="text-amber-400">{m.mape}%</span>
              </div>
            </div>
            <div className="progress-bar mt-3">
              <div className="progress-fill"
                   style={{ width: `${m.r2 * 100}%`, background: 'linear-gradient(90deg, #6366f1, #22d3ee)' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Forecast Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="label mb-1">Ensemble Forecast</div>
            <h3 className="text-white font-semibold">Road Health Index — {forecastHorizon}-Day Trajectory</h3>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-rose-400 font-semibold">Avg -8.2 RHI projected</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={forecasts.slice(0, Math.ceil(forecastHorizon / 30))}>
            <defs>
              <linearGradient id="rhiArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="tftArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <ReferenceLine y={30} stroke="#fb7185" strokeDasharray="4 4"
                           label={{ value: 'Critical', fill: '#fb7185', fontSize: 10 }} />
            <ReferenceLine y={50} stroke="#fbbf24" strokeDasharray="4 4"
                           label={{ value: 'High Risk', fill: '#fbbf24', fontSize: 10 }} />
            <Area type="monotone" dataKey="confidence_upper" stroke="none" fill="#6366f120" name="Upper CI" />
            <Area type="monotone" dataKey="rhi" stroke="#6366f1" strokeWidth={2.5}
                  fill="url(#rhiArea)" name="Actual RHI" dot={{ fill: '#6366f1', r: 4 }} />
            <Area type="monotone" dataKey="predicted" stroke="#22d3ee" strokeWidth={2}
                  strokeDasharray="6 3" fill="url(#tftArea)" name="TFT Predicted" dot={false} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Climate Correlation */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="label">Climate Intelligence</div>
              <h3 className="text-white font-semibold text-sm">Rainfall vs RHI Degradation</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={climate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="rainfall" stroke="#22d3ee"
                    strokeWidth={2} dot={false} name="Rainfall (mm)" />
              <Line yAxisId="right" type="monotone" dataKey="rhiDrop" stroke="#fb7185"
                    strokeWidth={2} dot={{ fill: '#fb7185', r: 3 }} name="RHI Drop" />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Heatmap */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="w-4 h-4 text-amber-400" />
            <div>
              <div className="label">Traffic Analytics</div>
              <h3 className="text-white font-semibold text-sm">24-Hour Volume Profile</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={traffic.filter((_, i) => i % 2 === 0)} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
              />
              <Bar dataKey="volume" fill="#6366f1" radius={[2, 2, 0, 0]} name="Volume" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scatter: Age vs RHI */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="label">Geospatial Correlation</div>
            <h3 className="text-white font-semibold text-sm">Road Age vs Health Index</h3>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
            <XAxis dataKey="x" name="Age (years)" tick={{ fontSize: 11, fill: '#64748b' }}
                   label={{ value: 'Road Age (years)', fill: '#64748b', fontSize: 11, dy: 15 }} />
            <YAxis dataKey="y" name="RHI" domain={[0, 100]}
                   tick={{ fontSize: 11, fill: '#64748b' }}
                   label={{ value: 'RHI', fill: '#64748b', fontSize: 11, angle: -90, dx: -15 }} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#2a2a4a' }}
              contentStyle={{ background: '#161627', border: '1px solid #2a2a4a', borderRadius: '10px' }}
              formatter={(v: number, name: string) => [v, name === 'x' ? 'Age' : 'RHI']}
            />
            <Scatter name="Road Segments" data={scatter} fill="#6366f1" opacity={0.8}
                     shape="circle" />
            <ReferenceLine y={30} stroke="#fb7185" strokeDasharray="4 4" />
            <ReferenceLine y={70} stroke="#34d399" strokeDasharray="4 4" />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 border-dashed border-rose-400 border-t" />Critical Threshold (30)</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 border-dashed border-emerald-400 border-t" />Healthy Threshold (70)</div>
        </div>
      </div>
    </div>
  )
}
