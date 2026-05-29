import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  Zap, 
  Users, 
  Map, 
  Cpu, 
  Smartphone 
} from 'lucide-react';

interface TierDef {
  id: 'free' | 'farmer' | 'agribusiness' | 'insurance' | 'government';
  name: string;
  price: string;
  period: string;
  icon: any;
  desc: string;
  features: string[];
  cta: string;
  color: string;
  glow: string;
}

const TIERS: TierDef[] = [
  {
    id: 'free',
    name: 'Spatial baseline (Free)',
    price: '₹0',
    period: 'forever',
    icon: Map,
    desc: 'Baseline spatiotemporal map projections for smallholder farmers.',
    features: [
      'Basic Vidarbha GIS polygon overlays',
      '7-Day SARIMA weather projections',
      'Manual district inspection logs',
      'Ad-hoc notification center'
    ],
    cta: 'Default Active Tier',
    color: 'border-slate-500/20 text-slate-400 bg-slate-950/40',
    glow: ''
  },
  {
    id: 'farmer',
    name: 'Farmer (Standard)',
    price: '₹149',
    period: 'per month',
    icon: Smartphone,
    desc: 'Unlocking spatiotemporal SMS alerts and deep-learning LSTM projections.',
    features: [
      'Interactive 7-day LSTM rainfall predictions',
      'Spatiotemporal Twilio SMS crop alerts',
      'Daily historical weather trends (5 years)',
      'Direct agronomic guidance insights'
    ],
    cta: 'Subscribe as Farmer',
    color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10 hover:border-emerald-500/60',
    glow: 'shadow-emerald-500/5'
  },
  {
    id: 'agribusiness',
    name: 'Corporate Agribusiness',
    price: '₹1,499',
    period: 'per month',
    icon: Cpu,
    desc: 'Unlocking LightGBM crop advisories and explainable AI SHAP maps.',
    features: [
      'Interactive Soil N-P-K recommendation engine',
      'Horizontal SHAP yield explainability charts',
      'Ensemble weather modeling comparisons',
      'Multi-user spatial district reports'
    ],
    cta: 'Upgrade to Agribusiness',
    color: 'border-blue-500/30 text-blue-400 bg-blue-950/10 hover:border-blue-500/60',
    glow: 'shadow-brand-blue/5'
  },
  {
    id: 'insurance',
    name: 'Crop Insurance Underwriting',
    price: '₹8,999',
    period: 'per month',
    icon: ShieldCheck,
    desc: 'For financial underwriters mapping climate payouts and severe risks.',
    features: [
      'Deep Autoencoder drought anomaly scores',
      'GNN spatial flood propagation layers',
      'Custom risk threshold triggers',
      'PostGIS geometry data exports'
    ],
    cta: 'Upgrade to Insurance Pack',
    color: 'border-purple-500/30 text-purple-400 bg-purple-950/10 hover:border-purple-500/60',
    glow: 'shadow-purple-500/5'
  },
  {
    id: 'government',
    name: 'Administrative / Academic',
    price: '₹19,999',
    period: 'per month',
    icon: Users,
    desc: 'Complete Vidarbha administrative parameters control, seeding and overrides.',
    features: [
      'Twilio regional alert dispatcher control',
      'Full database seeding override triggers',
      'Advanced regional GNN Node risk parameters',
      '24/7 dedicated support & custom GIS integrations'
    ],
    cta: 'Deploy Institutional Tier',
    color: 'border-amber-500/30 text-amber-400 bg-amber-950/10 hover:border-amber-500/60',
    glow: 'shadow-amber-500/5'
  }
];

const Billing: React.FC = () => {
  const { user, upgradeTier } = useAuth();

  const handleUpgrade = (tierId: 'free' | 'farmer' | 'agribusiness' | 'insurance' | 'government') => {
    upgradeTier(tierId);
  };

  return (
    <div className="pl-80 min-h-screen text-slate-100 flex flex-col">
      {/* Top Glass Navigation Bar */}
      <header className="glass-panel sticky top-0 z-20 mx-8 mt-6 px-8 py-5 flex items-center justify-between border border-white/5 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-brand-green animate-pulse" />
            Premium Agronomic Tiers
          </h1>
          <p className="text-xs text-slate-400">
            Activate subscription tiers instantly to test local ML telemetry restrictions and spatiotemporal alerts
          </p>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 p-8 flex flex-col gap-8">
        
        {/* Active subscription summary */}
        <section className="glass-panel p-6 border-l-4 border-emerald-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Active Billing Status
            </span>
            <h2 className="text-2xl font-black text-white">
              Currently Active: <span className="text-emerald-400 capitalize">{user?.subscription_tier} Profile</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              Any feature gate locked in the Spatial risk maps, weather predictions or soil recommendation systems can be instantly unlocked by toggling these packages.
            </p>
          </div>
          <div className="bg-slate-900 border border-white/5 rounded-2xl px-5 py-3 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Next Renewal date</p>
            <strong className="text-sm text-white">June 28, 2026</strong>
          </div>
        </section>

        {/* Pricing Matrix */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {TIERS.map((tier) => {
            const isActive = user?.subscription_tier === tier.id;
            const Icon = tier.icon;
            
            return (
              <div 
                key={tier.id}
                className={`glass-panel p-6 border flex flex-col justify-between transition-all duration-300 shadow-lg ${tier.color} ${tier.glow} ${isActive ? 'ring-2 ring-emerald-500/50 scale-[1.02]' : ''}`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <Icon className="w-5 h-5" />
                    </div>
                    {isActive && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                        Active Now
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-white text-base truncate">{tier.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed min-h-[40px]">{tier.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1.5 py-2">
                    <span className="text-3xl font-black text-white">{tier.price}</span>
                    <span className="text-xs text-slate-400">/ {tier.period}</span>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <ul className="flex flex-col gap-2.5">
                      {tier.features.map((feat, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-[11px] text-slate-300">
                          <Check className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={isActive}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${isActive ? 'bg-slate-900 border border-white/5 text-slate-500 cursor-default' : 'bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer'}`}
                  >
                    {isActive ? "Currently Active" : tier.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* FAQ note */}
        <section className="glass-panel p-5 flex gap-3.5 items-start bg-slate-950/20 max-w-3xl">
          <HelpCircle className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-white">How does role-based security validation work?</h4>
            <p className="text-slate-400 mt-1 leading-relaxed">
              AgroSense AI validates user subscription claims cryptographically on the FastAPI backend through JWT bearer signatures. The quick switch controls above replicate this mechanism instantly for direct front-end developer evaluation.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Billing;
