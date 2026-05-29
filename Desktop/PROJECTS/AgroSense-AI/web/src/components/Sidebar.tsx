import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Globe, 
  CloudRain, 
  Sprout, 
  BellRing, 
  CreditCard, 
  LogOut, 
  User as UserIcon,
  Layers
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout, upgradeTier } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Spatial Risk GIS', icon: Globe },
    { path: '/forecasting', label: 'Rainfall Forecast', icon: CloudRain },
    { path: '/crop-advisory', label: 'Crop Yield & Recs', icon: Sprout },
    { path: '/alerts', label: 'Alert Dispatcher', icon: BellRing },
    { path: '/billing', label: 'Billing Tiers', icon: CreditCard },
  ];

  const getTierBadgeStyles = (tier: string) => {
    switch (tier) {
      case 'farmer':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'agribusiness':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'insurance':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'government':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  return (
    <aside className="w-80 bg-slate-950/85 backdrop-blur-xl border-r border-emerald-950/30 min-h-screen flex flex-col justify-between py-8 px-6 fixed left-0 top-0 z-30">
      <div className="flex flex-col gap-8">
        {/* Brand Logo Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-emerald-500/10 rounded-xl mb-3 border border-emerald-500/20">
            <Sprout className="w-8 h-8 text-brand-green" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
            AgroSense AI
          </h2>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block mt-1">
            Vidarbha Regional Center
          </span>
        </div>

        {/* User Card */}
        {user && (
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-brand-blue/10 rounded-lg">
                <UserIcon className="w-4 h-4 text-brand-blue" />
              </div>
              <div className="truncate">
                <p className="text-xs text-slate-400">Active Profile</p>
                <h4 className="font-semibold text-sm truncate text-white">{user.email}</h4>
              </div>
            </div>
            <span className={`inline-block text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getTierBadgeStyles(user.subscription_tier)}`}>
              Tier: {user.subscription_tier}
            </span>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-emerald-600/30 to-blue-600/30 text-white border border-emerald-500/25 shadow-md shadow-emerald-500/5' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1 border border-transparent'}
              `}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-6">
        {/* Quick Swappable testing triggers */}
        <div className="border-t border-white/5 pt-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Quick Switch Modes
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button 
              onClick={() => upgradeTier('farmer')}
              className="py-1.5 px-2 bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 rounded-lg font-semibold hover:bg-emerald-900/30 transition"
            >
              🚜 Farmer
            </button>
            <button 
              onClick={() => upgradeTier('agribusiness')}
              className="py-1.5 px-2 bg-blue-950/20 text-blue-400 border border-blue-500/20 rounded-lg font-semibold hover:bg-blue-900/30 transition"
            >
              🏢 Corp
            </button>
            <button 
              onClick={() => upgradeTier('insurance')}
              className="py-1.5 px-2 bg-purple-950/20 text-purple-400 border border-purple-500/20 rounded-lg font-semibold hover:bg-purple-900/30 transition"
            >
              🛡️ Insur
            </button>
            <button 
              onClick={() => upgradeTier('government')}
              className="py-1.5 px-2 bg-amber-950/20 text-amber-400 border border-amber-500/20 rounded-lg font-semibold hover:bg-amber-900/30 transition"
            >
              🏛️ Gov
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-brand-red hover:bg-brand-red/10 border border-transparent hover:border-brand-red/20 transition-all duration-200"
        >
          <LogOut className="w-4.5 h-4.5" />
          Logout Profile
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
