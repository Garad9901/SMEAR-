import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  desc?: string;
  delta?: string | number;
  deltaType?: 'positive' | 'negative' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  desc,
  delta,
  deltaType = 'positive',
}) => {
  const getDeltaStyles = () => {
    if (deltaType === 'positive') return 'text-brand-green bg-brand-green/10 border-brand-green/20';
    if (deltaType === 'negative') return 'text-brand-red bg-brand-red/10 border-brand-red/20';
    return 'text-slate-400 bg-white/5 border-white/10';
  };

  return (
    <div className="glass-panel p-6 hover:border-emerald-500/25 group transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl group-hover:border-brand-green/25 group-hover:bg-brand-green/10 transition duration-300">
          <Icon className="w-5 h-5 text-slate-400 group-hover:text-brand-green transition" />
        </div>
      </div>
      
      {(delta || desc) && (
        <div className="flex items-center gap-2 mt-2">
          {delta && (
            <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${getDeltaStyles()}`}>
              {delta}
            </span>
          )}
          {desc && (
            <span className="text-xs text-slate-400 truncate">
              {desc}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
