import { useState } from 'react'
import { FileText, Download, Plus, Zap, Clock, CheckCircle2, BarChart3, Globe } from 'lucide-react'

const reports = [
  {
    id: 'RPT-001', title: 'Monthly Infrastructure Health Report — May 2026',
    city: 'Mumbai', type: 'Health Report', status: 'ready',
    generated: '2026-05-26 20:00', pages: 48, size: '12.4 MB',
    highlights: ['234 critical segments identified', '₹23.4M savings projected', 'Monsoon risk index elevated'],
  },
  {
    id: 'RPT-002', title: 'Q2 FY2026 Maintenance Performance Audit',
    city: 'All Cities', type: 'Audit Report', status: 'ready',
    generated: '2026-05-25 14:30', pages: 124, size: '34.8 MB',
    highlights: ['91% budget utilization', '29 repairs completed on-time', 'ROI 3.2x vs reactive maintenance'],
  },
  {
    id: 'RPT-003', title: 'AI Agent Decision Governance Report',
    city: 'All Cities', type: 'AI Governance', status: 'ready',
    generated: '2026-05-24 09:15', pages: 32, size: '8.1 MB',
    highlights: ['2,847 AI decisions audited', '99.9% explainability coverage', 'Zero governance violations'],
  },
  {
    id: 'RPT-004', title: 'Predictive Risk Assessment — June 2026',
    city: 'Delhi + Pune', type: 'Risk Report', status: 'generating',
    generated: '—', pages: null, size: null,
    highlights: ['Monsoon season forecast', '60-day failure predictions', 'Budget pre-allocation'],
  },
  {
    id: 'RPT-005', title: 'Budget Optimization Simulation — FY2026-27',
    city: 'All Cities', type: 'Budget Report', status: 'scheduled',
    generated: '—', pages: null, size: null,
    highlights: ['LP optimization results', 'Genetic algorithm comparison', 'ROI projections'],
  },
]

const reportTypes = [
  { label: 'Health Report',  color: '#6366f1', icon: BarChart3 },
  { label: 'Audit Report',   color: '#34d399', icon: CheckCircle2 },
  { label: 'AI Governance',  color: '#a78bfa', icon: Zap },
  { label: 'Risk Report',    color: '#fb7185', icon: BarChart3 },
  { label: 'Budget Report',  color: '#fbbf24', icon: BarChart3 },
]

const statusBadge: Record<string, string> = {
  ready: 'badge-success',
  generating: 'badge-warning',
  scheduled: 'badge-info',
}

export function ReportsPage() {
  const [generating, setGenerating] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const handleDownloadPDF = (reportTitle: string) => {
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.275 841.889] /Contents 4 0 R /Resources 5 0 R >>
endobj
4 0 obj
<< /Length 350 >>
stream
BT
/F1 16 Tf
50 780 Td
(RouteIQ X - Autonomous Infrastructure Intelligence) Tj
/F1 10 Tf
0 -30 Td
(Report: ${reportTitle}) Tj
0 -20 Td
(Generated on: May 26, 2026 via RouteIQ X Cloud Platform) Tj
0 -30 Td
(Key Performance Indicators:) Tj
0 -20 Td
(- Critical Segments: 234) Tj
0 -20 Td
(- Projected Savings: INR 23.4 Cr) Tj
0 -20 Td
(- Climate Risk Level: Elevated Monsoon Precipitation Threshold) Tj
0 -20 Td
(- Data Sources: Sentinel-2 Live, OpenStreetMap APIs, Feast Feature Store) Tj
0 -40 Td
(Authorized Digital Signature: RouteIQ X Auditor Agent) Tj
ET
endstream
endobj
5 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000224 00000 n 
0000000624 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
712
%%EOF`

    const blob = new Blob([pdfContent], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Reports & Intelligence</h1>
          <p className="text-slate-400 text-sm mt-1">
            AI-generated PDF reports · governance audits · executive briefings
          </p>
        </div>
        <button
          id="new-report-btn"
          onClick={() => { setShowNew(true); setGenerating(true); setTimeout(() => setGenerating(false), 3000) }}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {reportTypes.map(rt => (
          <div key={rt.label} className="card p-4 text-center cursor-pointer hover:border-brand-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                 style={{ background: `${rt.color}20`, border: `1px solid ${rt.color}30` }}>
              <rt.icon className="w-5 h-5" style={{ color: rt.color }} />
            </div>
            <div className="text-xs font-semibold text-white">{rt.label}</div>
          </div>
        ))}
      </div>

      {/* Generation Progress */}
      {generating && (
        <div className="card p-4 border border-brand-500/30" style={{ background: 'rgba(99,102,241,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin" />
            <div>
              <div className="text-sm font-semibold text-white">Generating AI Report...</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Collecting satellite data · Running ML models · Compiling insights · Rendering PDF
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-3">
        {reports.map(report => (
          <div key={report.id} className="card p-5 hover:border-brand-500/20 transition-all">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 
                                flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <div className="text-sm font-bold text-white">{report.title}</div>
                    <span className={`${statusBadge[report.status]} text-[10px]`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />{report.city}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />{report.type}
                    </div>
                    {report.generated !== '—' && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{report.generated}
                      </div>
                    )}
                    {report.pages && (
                      <div>{report.pages} pages · {report.size}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.highlights.map(h => (
                      <div key={h} className="flex items-center gap-1.5 text-[10px] text-slate-400 
                                               bg-surface border border-surface-border px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {report.status === 'ready' && (
                <div className="flex items-center gap-2">
                  <button className="btn-secondary text-xs py-1.5 px-3">
                    <FileText className="w-3 h-3" />Preview
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(report.title)}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <Download className="w-3 h-3" />Download PDF
                  </button>
                </div>
              )}
              {report.status === 'generating' && (
                <div className="flex items-center gap-2 text-amber-400 text-xs">
                  <div className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                  Generating...
                </div>
              )}
              {report.status === 'scheduled' && (
                <div className="text-slate-500 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />Scheduled
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Auto-Report Schedule */}
      <div className="card p-5">
        <div className="label mb-3">Automated Report Schedule</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { freq: 'Daily', report: 'Infrastructure Health Snapshot', time: '06:00 UTC', active: true },
            { freq: 'Weekly', report: 'Maintenance Progress Report', time: 'Monday 08:00 UTC', active: true },
            { freq: 'Monthly', report: 'Executive KPI Dashboard', time: '1st of month', active: true },
          ].map(s => (
            <div key={s.freq} className="bg-surface rounded-xl p-4 border border-surface-border">
              <div className="flex items-center justify-between mb-2">
                <span className="badge-info text-[10px]">{s.freq}</span>
                <div className="pulse-dot" />
              </div>
              <div className="text-sm font-semibold text-white mb-1">{s.report}</div>
              <div className="text-xs text-slate-500">{s.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
