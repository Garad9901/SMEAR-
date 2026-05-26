import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { AlertTriangle, Filter, Layers, Satellite, Activity, MapPin, Info } from 'lucide-react'
import { mockRoadSegments } from '../data/mockData'
import clsx from 'clsx'
import 'leaflet/dist/leaflet.css'

const riskConfig: Record<string, { color: string; fill: string; label: string }> = {
  critical: { color: '#fb7185', fill: '#fb7185', label: 'Critical (RHI < 30)' },
  high:     { color: '#fbbf24', fill: '#fbbf24', label: 'High (RHI 30–50)' },
  medium:   { color: '#60a5fa', fill: '#60a5fa', label: 'Medium (RHI 50–70)' },
  low:      { color: '#34d399', fill: '#34d399', label: 'Low (RHI > 70)' },
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => { map.flyTo(center, map.getZoom(), { duration: 1.5 }) }, [center, map])
  return null
}

export function MapView() {
  const [filter, setFilter] = useState<string>('all')
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629])
  const [mapZoom] = useState(5)
  const [layerMode, setLayerMode] = useState<'risk' | 'rhi' | 'traffic'>('risk')

  // Interactive Supervisor manual override ledger (Human Element)
  const [overrides, setOverrides] = useState<Record<string, { rhi: number; notes: string }>>({
    'RS-001': { rhi: 85, notes: 'Overridden by Insp. Ramesh: physical resurfacing completed early, waiting for Sentinel tile pass.' }
  })
  const [overrideRhiInput, setOverrideRhiInput] = useState('')
  const [overrideNotesInput, setOverrideNotesInput] = useState('')

  useEffect(() => {
    if (selectedSegment) {
      const existing = overrides[selectedSegment]
      setOverrideRhiInput(existing ? String(existing.rhi) : '')
      setOverrideNotesInput(existing ? existing.notes : '')
    } else {
      setOverrideRhiInput('')
      setOverrideNotesInput('')
    }
  }, [selectedSegment])

  const handleApplyOverride = (id: string) => {
    const parsed = parseInt(overrideRhiInput)
    if (isNaN(parsed) || parsed < 0 || parsed > 100) return
    setOverrides(prev => ({
      ...prev,
      [id]: {
        rhi: parsed,
        notes: overrideNotesInput || 'Supervisor manual inspection note recorded.'
      }
    }))
  }

  const getOverriddenSegment = (seg: typeof mockRoadSegments[0]) => {
    const override = overrides[seg.id]
    if (!override) return seg
    const rhi = override.rhi
    const risk = rhi < 30 ? 'critical' : rhi < 50 ? 'high' : rhi < 70 ? 'medium' : 'low'
    return {
      ...seg,
      rhi,
      risk
    }
  }

  const processedSegments = mockRoadSegments.map(getOverriddenSegment)

  const filtered = processedSegments.filter(r =>
    filter === 'all' || r.risk === filter
  )

  const getRadius = (seg: typeof processedSegments[0]) => {
    if (seg.risk === 'critical') return 18
    if (seg.risk === 'high') return 14
    if (seg.risk === 'medium') return 10
    return 8
  }

  const cityButtons = [
    { label: 'India', center: [20.59, 78.96] as [number, number] },
    { label: 'Mumbai', center: [19.076, 72.877] as [number, number] },
    { label: 'Delhi', center: [28.613, 77.209] as [number, number] },
    { label: 'London', center: [51.509, -0.118] as [number, number] },
    { label: 'Dubai', center: [25.204, 55.270] as [number, number] },
  ]

  const selected = processedSegments.find(r => r.id === selectedSegment)

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Road Health Map</h1>
          <p className="text-slate-400 text-sm mt-1">
            Live geospatial intelligence · {mockRoadSegments.length} segments displayed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="badge-success text-xs flex items-center gap-1.5">
            <Satellite className="w-3 h-3" />Sentinel-2 Live
          </div>
          <div className="badge-info text-xs">OSM Synced</div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Map */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-surface-border"
             style={{ minHeight: '500px' }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ width: '100%', height: '100%', background: '#0f1117' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            <MapController center={mapCenter} />
            {filtered.map(seg => (
              <CircleMarker
                key={seg.id}
                center={[seg.lat, seg.lng]}
                radius={getRadius(seg)}
                pathOptions={{
                  color: riskConfig[seg.risk].color,
                  fillColor: riskConfig[seg.risk].fill,
                  fillOpacity: 0.75,
                  weight: selectedSegment === seg.id ? 3 : 1.5,
                  opacity: 1,
                }}
                eventHandlers={{
                  click: () => setSelectedSegment(seg.id === selectedSegment ? null : seg.id),
                }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '220px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#e2e8f0', marginBottom: '8px' }}>
                      {seg.name}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                      <div style={{ color: '#64748b' }}>RHI Score</div>
                      <div style={{ color: riskConfig[seg.risk].color, fontWeight: 700 }}>{seg.rhi}/100</div>
                      <div style={{ color: '#64748b' }}>Risk Level</div>
                      <div style={{ color: riskConfig[seg.risk].color, textTransform: 'capitalize' }}>{seg.risk}</div>
                      <div style={{ color: '#64748b' }}>Complaints</div>
                      <div style={{ color: '#e2e8f0' }}>{seg.complaints}</div>
                      <div style={{ color: '#64748b' }}>Repair Cost</div>
                      <div style={{ color: '#e2e8f0' }}>₹{(seg.repairCost/1e6).toFixed(1)}M</div>
                      <div style={{ color: '#64748b' }}>Fails By</div>
                      <div style={{ color: '#fbbf24' }}>{seg.predictedFailure}</div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
            {/* City Jump */}
            <div className="glass rounded-xl p-2 space-y-1">
              <div className="text-[10px] text-slate-500 px-1 font-semibold uppercase tracking-wider">Jump to</div>
              {cityButtons.map(btn => (
                <button key={btn.label}
                        onClick={() => setMapCenter(btn.center)}
                        className="block w-full text-left text-xs text-slate-300 hover:text-white 
                                   hover:bg-surface-hover px-2 py-1 rounded-lg transition-colors">
                  <MapPin className="w-3 h-3 inline mr-1.5 text-brand-400" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] glass rounded-xl p-3">
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Risk Legend</div>
            {Object.entries(riskConfig).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: val.color }} />
                {val.label}
              </div>
            ))}
          </div>

          {/* Stats Overlay */}
          <div className="absolute top-4 right-4 z-[1000] glass rounded-xl p-3 space-y-2">
            {Object.entries(riskConfig).map(([risk, val]) => {
              const count = mockRoadSegments.filter(r => r.risk === risk).length
              return (
                <div key={risk} className="flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: val.color }} />
                    <span className="text-slate-400 capitalize">{risk}</span>
                  </div>
                  <span className="text-white font-bold">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-72 flex flex-col gap-3 overflow-y-auto no-scrollbar">
          {/* Filter */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-semibold text-white">Filter by Risk</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                <button key={f}
                        onClick={() => setFilter(f)}
                        className={clsx(
                          'px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all',
                          filter === f
                            ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40'
                            : 'text-slate-400 border border-surface-border hover:text-white hover:border-surface-hover'
                        )}>
                  {f === 'all' ? 'All Risks' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Segment Detail */}
          {selected ? (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-semibold text-white">Segment Detail</span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="text-sm font-bold text-white">{selected.name}</div>
                  <div className="text-xs text-slate-500">{selected.city} · {selected.id}</div>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  selected.risk === 'critical' ? 'badge-critical' :
                  selected.risk === 'high' ? 'badge-warning' : 'badge-success'
                }`}>
                  <AlertTriangle className="w-3 h-3" />
                  {selected.risk.toUpperCase()} RISK
                </div>
                {[
                  ['RHI Score', `${selected.rhi}/100`],
                  ['Road Age', `${selected.age} years`],
                  ['Length', `${selected.length} km`],
                  ['Surface', selected.surface],
                  ['Traffic', selected.trafficLoad],
                  ['Complaints', String(selected.complaints)],
                  ['Repair Cost', `₹${(selected.repairCost/1e6).toFixed(1)}M`],
                  ['Predicted Failure', selected.predictedFailure],
                  ['Last Inspected', selected.lastInspected],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs py-1.5 border-b border-surface-border/50">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}

                {/* Supervisor Override Note Display */}
                {overrides[selected.id] && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-2.5 rounded-xl text-[10px] mt-2 leading-relaxed">
                    <strong>Manual Override Active:</strong> {overrides[selected.id].notes}
                  </div>
                )}

                {/* Supervisor Override Editor (Human Element) */}
                <div className="mt-3 pt-3 border-t border-surface-border/40 space-y-2">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Manual Supervisor Correction
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Override RHI"
                      value={overrideRhiInput}
                      onChange={(e) => setOverrideRhiInput(e.target.value)}
                      className="col-span-1 bg-surface border border-surface-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                    <input
                      type="text"
                      placeholder="Supervisor remark note..."
                      value={overrideNotesInput}
                      onChange={(e) => setOverrideNotesInput(e.target.value)}
                      className="col-span-2 bg-surface border border-surface-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <button
                    onClick={() => handleApplyOverride(selected.id)}
                    className="w-full py-1.5 bg-brand-600/20 hover:bg-brand-600/35 border border-brand-500/30 hover:border-brand-500/50 text-brand-400 font-bold rounded-lg text-[10px] transition-all"
                  >
                    Apply Supervisor Override
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-4 text-center text-sm text-slate-500">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-slate-600" />
              Click a marker to view segment details
            </div>
          )}

          {/* Segment List */}
          <div className="card p-4 flex-1">
            <div className="label mb-3">Segments ({filtered.length})</div>
            <div className="space-y-2">
              {filtered.map(seg => (
                <div key={seg.id}
                     onClick={() => {
                       setSelectedSegment(seg.id)
                       setMapCenter([seg.lat, seg.lng])
                     }}
                     className={clsx(
                       'p-2.5 rounded-xl cursor-pointer transition-all border',
                       selectedSegment === seg.id
                         ? 'border-brand-500/50 bg-brand-500/5'
                         : 'border-surface-border hover:border-surface-hover hover:bg-surface-hover'
                     )}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-white leading-tight">{seg.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{seg.city}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black" style={{ color: riskConfig[seg.risk].color }}>
                        {seg.rhi}
                      </div>
                      <div className="text-[9px] text-slate-600">RHI</div>
                    </div>
                  </div>
                  <div className="progress-bar mt-2">
                    <div className="progress-fill" style={{
                      width: `${seg.rhi}%`,
                      background: riskConfig[seg.risk].color
                    }} />
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
