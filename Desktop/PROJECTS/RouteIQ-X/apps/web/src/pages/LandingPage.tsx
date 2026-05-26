import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Zap, Satellite, Brain, Globe, Shield, BarChart3,
  ArrowRight, Play, ChevronDown, MapPin, Activity,
  Cpu, Database, Network, Lock, TrendingUp, CheckCircle2
} from 'lucide-react'

const FEATURES = [
  {
    icon: Satellite, title: 'Satellite Intelligence',
    desc: 'Sentinel-2 imagery analyzed by EfficientNet & YOLOv8 to detect cracks, potholes, and surface deformation at city scale.',
    color: 'cyan', glow: '#22d3ee',
  },
  {
    icon: Brain, title: 'Autonomous AI Agents',
    desc: '8 specialized agents orchestrated via LangGraph — GIS, Climate, Maintenance, Budget, Risk, Forecasting, Verification & Audit.',
    color: 'brand', glow: '#6366f1',
  },
  {
    icon: TrendingUp, title: '60–90 Day Forecasting',
    desc: 'LSTM, Prophet & Temporal Fusion Transformers predict road failure trajectories weeks before visible deterioration.',
    color: 'emerald', glow: '#10b981',
  },
  {
    icon: BarChart3, title: 'Budget Optimization',
    desc: 'Linear Programming, Genetic Algorithms & RL policies maximize repair ROI within constrained municipal budgets.',
    color: 'amber', glow: '#f59e0b',
  },
  {
    icon: Database, title: 'Cloud-Native Data Pipeline',
    desc: 'Kafka streaming + Airflow ETL ingests OSM, OpenWeatherMap, Open311 complaints, and CSV uploads at massive scale.',
    color: 'brand', glow: '#6366f1',
  },
  {
    icon: Shield, title: 'Enterprise Security',
    desc: 'OAuth2 + JWT + RBAC, multi-tenant isolation, zero-trust networking, government-grade audit logging.',
    color: 'rose', glow: '#f43f5e',
  },
]

const STATS = [
  { value: '1.8M+', label: 'Road Segments Monitored' },
  { value: '23', label: 'Cities Deployed' },
  { value: '₹79.6Cr', label: 'Maintenance Savings' },
  { value: '94.7%', label: 'AI Detection Accuracy' },
  { value: '8', label: 'Autonomous AI Agents' },
  { value: '60–90d', label: 'Failure Prediction Window' },
]

const DATA_SOURCES = [
  'Sentinel-2 Satellite API', 'OpenStreetMap', 'OpenWeatherMap',
  'Open311 Complaints', 'TomTom Traffic', 'Municipal CSV Uploads',
]

function AnimatedCounter({ value, duration = 2000 }: { value: string, duration?: number }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const num = parseFloat(value.replace(/[^0-9.]/g, ''))
          const suffix = value.replace(/[0-9.]/g, '')
          if (isNaN(num)) { setDisplay(value); return }
          let start = 0
          const increment = num / (duration / 16)
          const timer = setInterval(() => {
            start += increment
            if (start >= num) { setDisplay(value); clearInterval(timer) }
            else setDisplay(start.toFixed(num % 1 !== 0 ? 1 : 0) + suffix)
          }, 16)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, duration])

  return <div ref={ref}>{display}</div>
}

export function LandingPage() {
  const navigate = useNavigate()
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(i => (i + 1) % FEATURES.length), 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-surface text-white overflow-x-hidden">
      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center"
                 style={{ boxShadow: '0 0 16px rgba(99,102,241,0.6)' }}>
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg">RouteIQ X</span>
          </div>

          <div className="hidden md:flex items-center gap-6 ml-8 text-sm text-slate-400">
            {['Platform', 'Use Cases', 'Architecture', 'Pricing'].map(item => (
              <button key={item} className="hover:text-white transition-colors">{item}</button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="badge-success text-xs">v2.4.0 — Production</span>
            <button
              id="launch-platform-btn"
              onClick={() => navigate('/app/dashboard')}
              className="btn-primary text-sm py-2.5"
            >
              Launch Platform
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
               style={{
                 backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
                 backgroundSize: '60px 60px'
               }} />
          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
               style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
               style={{ background: 'radial-gradient(circle, #22d3ee, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
               style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 
                          border border-brand-500/30 mb-8 text-sm text-brand-400 font-medium">
            <Activity className="w-4 h-4 animate-pulse" />
            Software-Only · Zero Hardware Dependency · Cloud-Native SaaS
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
            <span className="text-white">Autonomous</span>
            <br />
            <span className="gradient-text">Infrastructure</span>
            <br />
            <span className="text-white">Intelligence</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            RouteIQ X is the world's most advanced <strong className="text-white">AI-powered road maintenance platform</strong> —
            predicting degradation 60–90 days early, optimizing ₹500M+ budgets, and deploying
            8 autonomous AI agents across 23 smart cities worldwide.
            <span className="text-brand-400"> Entirely software-defined.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              id="hero-launch-btn"
              onClick={() => navigate('/app/dashboard')}
              className="btn-primary text-base px-8 py-4"
            >
              <Zap className="w-5 h-5" />
              Launch Platform
            </button>
            <button
              id="hero-map-btn"
              onClick={() => navigate('/app/map')}
              className="btn-secondary text-base px-8 py-4"
            >
              <MapPin className="w-5 h-5" />
              View Live Map
            </button>
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-base">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Live Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {STATS.map((stat, i) => (
              <div key={i}
                   className="glass rounded-2xl p-4 text-center hover:border-brand-500/40 transition-all">
                <div className="text-2xl font-black gradient-text">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-5 h-5 text-slate-600" />
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="label mb-3">Capabilities</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-white">Enterprise-Grade</span>{' '}
            <span className="gradient-text">AI Stack</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Built on the same distributed systems principles used by Google, Palantir, and Datadog —
            engineered specifically for public infrastructure intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`card p-6 cursor-pointer transition-all duration-300 ${
                activeFeature === i ? 'border-brand-500/50' : ''
              }`}
              style={activeFeature === i ? { boxShadow: `0 0 30px ${f.glow}20` } : {}}
              onClick={() => setActiveFeature(i)}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                   style={{ background: `${f.glow}20`, border: `1px solid ${f.glow}40` }}>
                <f.icon className="w-6 h-6" style={{ color: f.glow }} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Architecture ────────────────────────────────── */}
      <section className="py-24 bg-surface-card border-y border-surface-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="label mb-3">Architecture</div>
            <h2 className="text-4xl font-black text-white mb-4">
              Cloud-Native <span className="gradient-text">Microservices</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: Satellite, label: 'Data Ingestion', items: ['Sentinel-2 API', 'OSM / Open311', 'OpenWeatherMap', 'CSV Uploads'], color: '#22d3ee' },
              { icon: Cpu, label: 'AI / ML Engine', items: ['YOLOv8 Vision', 'XGBoost RHI', 'LSTM Forecasting', 'LangGraph Agents'], color: '#6366f1' },
              { icon: Network, label: 'Orchestration', items: ['Apache Kafka', 'Airflow ETL', 'Celery + Redis', 'Temporal WF'], color: '#10b981' },
              { icon: Lock, label: 'Security & Ops', items: ['OAuth2 + RBAC', 'Multi-Tenant', 'Prometheus + Grafana', 'ArgoCD GitOps'], color: '#f59e0b' },
            ].map((layer, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                       style={{ background: `${layer.color}20`, border: `1px solid ${layer.color}40` }}>
                    <layer.icon className="w-5 h-5" style={{ color: layer.color }} />
                  </div>
                  <span className="font-bold text-white text-sm">{layer.label}</span>
                </div>
                <div className="space-y-2">
                  {layer.items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: layer.color }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data Sources ────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="label mb-2">Zero Hardware Required</div>
          <h2 className="text-3xl font-black text-white">
            100% Public Data Sources
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {DATA_SOURCES.map((src, i) => (
            <div key={i}
                 className="glass px-5 py-2.5 rounded-full text-sm text-slate-300 font-medium
                            hover:border-brand-500/50 hover:text-white transition-all cursor-default">
              {src}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center gradient-border p-12">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 to-cyan-500 
                          flex items-center justify-center mx-auto mb-6"
               style={{ boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}>
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Ready to Transform<br />
            <span className="gradient-text">Your City's Infrastructure?</span>
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Deploy RouteIQ X in your city in under 24 hours. No hardware. No IoT. No vendor lock-in.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              id="cta-launch-btn"
              onClick={() => navigate('/app/dashboard')}
              className="btn-primary text-base px-10 py-4"
            >
              <Zap className="w-5 h-5" />
              Launch Platform
            </button>
            <button className="btn-secondary text-base px-10 py-4">
              Request Enterprise Demo
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-surface-border py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white">RouteIQ X</span>
            <span className="text-slate-600 text-sm">— Autonomous Infrastructure Intelligence</span>
          </div>
          <div className="text-slate-600 text-sm">
            © 2026 RouteIQ X. All rights reserved. MIT License.
          </div>
        </div>
      </footer>
    </div>
  )
}
