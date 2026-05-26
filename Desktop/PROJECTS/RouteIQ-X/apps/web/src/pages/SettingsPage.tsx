import { useState } from 'react'
import {
  Settings, Shield, Users, Key, Globe, Bell, Database,
  Cpu, CheckCircle2, AlertTriangle, Eye, EyeOff, Copy
} from 'lucide-react'
import clsx from 'clsx'

const tabs = [
  { id: 'general',    label: 'General',    icon: Settings },
  { id: 'security',   label: 'Security',   icon: Shield },
  { id: 'users',      label: 'Users & RBAC', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: Globe },
  { id: 'alerts',     label: 'Alerts',     icon: Bell },
  { id: 'system',     label: 'System',     icon: Cpu },
]

const users = [
  { id: 1, name: 'Arjun Kumar', email: 'arjun@mumbaicorp.gov.in', role: 'Admin', status: 'active', city: 'Mumbai', lastLogin: '2026-05-26 21:45' },
  { id: 2, name: 'Priya Sharma', email: 'priya@delhi.gov.in', role: 'Analyst', status: 'active', city: 'Delhi', lastLogin: '2026-05-26 18:30' },
  { id: 3, name: 'Raj Patel', email: 'raj@bengaluru.gov.in', role: 'Viewer', status: 'active', city: 'Bengaluru', lastLogin: '2026-05-25 14:00' },
  { id: 4, name: 'Sarah Chen', email: 'schen@sfpw.gov', role: 'Analyst', status: 'active', city: 'San Francisco', lastLogin: '2026-05-26 09:15' },
  { id: 5, name: 'Marcus Williams', email: 'mwilliams@tfl.gov.uk', role: 'Viewer', status: 'inactive', city: 'London', lastLogin: '2026-05-20 11:30' },
]

const integrations = [
  { name: 'Sentinel-2 (ESA)', type: 'Satellite Imagery', status: 'connected', lastSync: '5 min ago', color: '#34d399' },
  { name: 'OpenStreetMap', type: 'Road Network', status: 'connected', lastSync: '2 min ago', color: '#34d399' },
  { name: 'OpenWeatherMap', type: 'Climate Data', status: 'connected', lastSync: '10 min ago', color: '#34d399' },
  { name: 'Open311', type: 'Citizen Complaints', status: 'connected', lastSync: '1 min ago', color: '#34d399' },
  { name: 'TomTom Traffic', type: 'Traffic Flow', status: 'error', lastSync: '2 hours ago', color: '#fb7185' },
  { name: 'Google Maps Platform', type: 'Geocoding', status: 'connected', lastSync: '5 min ago', color: '#34d399' },
  { name: 'Pinecone', type: 'Vector Memory', status: 'connected', lastSync: 'Live', color: '#34d399' },
  { name: 'MLflow', type: 'Model Registry', status: 'connected', lastSync: 'Live', color: '#34d399' },
]

const roleColors: Record<string, string> = {
  Admin: 'badge-critical',
  Analyst: 'badge-warning',
  Viewer: 'badge-info',
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Platform configuration · API keys · RBAC · Integrations · System health
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Tabs Sidebar */}
        <div className="card p-3 h-fit">
          <div className="space-y-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                id={`settings-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                  activeTab === tab.id
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-surface-hover'
                )}>
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* ── General ─────────────────────────────────── */}
          {activeTab === 'general' && (
            <div className="card p-6 space-y-5">
              <h2 className="text-white font-bold">General Configuration</h2>
              {[
                { label: 'Platform Name', value: 'RouteIQ X', type: 'text' },
                { label: 'Organization', value: 'Mumbai Municipal Corporation', type: 'text' },
                { label: 'Tenant ID', value: 'mmc-in-001', type: 'text', mono: true },
                { label: 'Primary Region', value: 'ap-south-1 (Mumbai)', type: 'select' },
                { label: 'Data Retention (days)', value: '365', type: 'number' },
                { label: 'Sync Interval (minutes)', value: '15', type: 'number' },
              ].map(f => (
                <div key={f.label}>
                  <label className="label mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type}
                    defaultValue={f.value}
                    className={clsx(
                      'w-full bg-surface border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white',
                      'focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30',
                      f.mono ? 'font-mono' : ''
                    )}
                  />
                </div>
              ))}
              <button onClick={handleSave} className="btn-primary text-sm">
                {saved ? <><CheckCircle2 className="w-4 h-4" />Saved!</> : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ── Security ────────────────────────────────── */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="text-white font-bold mb-4">API Keys</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Platform API Key', key: 'riq_pk_e7f3a1c9d2b4...8f2a' },
                    { label: 'Read-Only Key', key: 'riq_ro_b3c1f9e2a7d4...2e1c' },
                    { label: 'Webhook Secret', key: 'whsec_a9f3b2c1d4e7...9c3a' },
                  ].map(k => (
                    <div key={k.label} className="bg-surface rounded-xl p-4 border border-surface-border">
                      <div className="label mb-2">{k.label}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 font-mono text-sm text-slate-300 bg-black/30 px-3 py-2 rounded-lg">
                          {showKey ? k.key : k.key.replace(/[a-z0-9]/g, '•')}
                        </div>
                        <button onClick={() => setShowKey(s => !s)}
                                className="p-2 text-slate-400 hover:text-white transition-colors">
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-white font-bold mb-4">Security Features</h3>
                <div className="space-y-3">
                  {[
                    { label: 'OAuth2 + JWT Authentication', enabled: true },
                    { label: 'Multi-Factor Authentication', enabled: true },
                    { label: 'IP Allowlist Enforcement', enabled: false },
                    { label: 'Zero-Trust Network Policy', enabled: true },
                    { label: 'Row-Level Security (PostGIS)', enabled: true },
                    { label: 'Audit Log Streaming (ELK)', enabled: true },
                    { label: 'GDPR Data Anonymization', enabled: true },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between py-2 border-b border-surface-border/50">
                      <span className="text-sm text-slate-300">{f.label}</span>
                      <div className={`w-10 h-5 rounded-full transition-all cursor-pointer relative ${
                        f.enabled ? 'bg-brand-600' : 'bg-surface-border'
                      }`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                          f.enabled ? 'left-5' : 'left-0.5'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Users ───────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-surface-border flex items-center justify-between">
                <h3 className="text-white font-bold">Users & RBAC ({users.length})</h3>
                <button className="btn-primary text-xs py-1.5 px-3">
                  <Users className="w-3 h-3" />Invite User
                </button>
              </div>
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>City/Tenant</th>
                    <th>Status</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 
                                          flex items-center justify-center text-white text-xs font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`${roleColors[user.role]} text-[10px]`}>{user.role}</span></td>
                      <td className="text-slate-400">{user.city}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'
                          }`} />
                          <span className="text-xs capitalize text-slate-400">{user.status}</span>
                        </div>
                      </td>
                      <td className="text-xs font-mono text-slate-500">{user.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Integrations ────────────────────────────── */}
          {activeTab === 'integrations' && (
            <div className="card p-5">
              <h3 className="text-white font-bold mb-4">Data Source Integrations</h3>
              <div className="space-y-3">
                {integrations.map(int => (
                  <div key={int.name}
                       className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-surface-border hover:border-brand-500/20 transition-all">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                         style={{ background: `${int.color}20`, border: `1px solid ${int.color}30` }}>
                      <Database className="w-4 h-4" style={{ color: int.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{int.name}</div>
                      <div className="text-xs text-slate-500">{int.type}</div>
                    </div>
                    <div className="text-xs text-slate-600">Last sync: {int.lastSync}</div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold"
                         style={{ color: int.color }}>
                      {int.status === 'connected'
                        ? <><CheckCircle2 className="w-3.5 h-3.5" />Connected</>
                        : <><AlertTriangle className="w-3.5 h-3.5" />Error</>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── System ──────────────────────────────────── */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'PostgreSQL + PostGIS', value: '15.4 / 3.4', status: 'healthy' },
                  { label: 'Redis', value: '7.2.4', status: 'healthy' },
                  { label: 'Apache Kafka', value: '3.7.0', status: 'healthy' },
                  { label: 'Apache Airflow', value: '2.9.1', status: 'healthy' },
                  { label: 'Kubernetes (EKS)', value: 'v1.29.3', status: 'healthy' },
                  { label: 'Prometheus + Grafana', value: '2.51 / 10.4', status: 'healthy' },
                ].map(s => (
                  <div key={s.label} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">{s.label}</div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">{s.value}</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Healthy
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="card p-5">
              <h3 className="text-white font-bold mb-4">Alert Configuration</h3>
              <div className="space-y-4">
                {[
                  { label: 'Critical RHI Threshold', value: '30', unit: 'RHI score' },
                  { label: 'High Risk RHI Threshold', value: '50', unit: 'RHI score' },
                  { label: 'Budget Utilization Alert', value: '85', unit: '%' },
                  { label: 'Model Drift Alert', value: '0.05', unit: 'drift score' },
                  { label: 'Complaint Cluster Threshold', value: '50', unit: 'complaints/week' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-4">
                    <label className="flex-1 text-sm text-slate-300">{f.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={f.value}
                        className="w-24 bg-surface border border-surface-border rounded-lg px-3 py-2 
                                   text-sm text-white text-right focus:outline-none focus:border-brand-500/50"
                      />
                      <span className="text-xs text-slate-500 w-24">{f.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
