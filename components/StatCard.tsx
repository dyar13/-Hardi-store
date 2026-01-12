import React from 'react';

interface StatCardProps {
  title: string;
  amountUSD: number;
  amountIQD: number;
  icon: React.ReactNode;
  colorClass: string; // "text-emerald-400" etc.
  labels: { usd: string; iqd: string };
  isNegative?: boolean; // Kept in interface to prevent breaking calls, but ignored in usage
}

const StatCard: React.FC<StatCardProps> = ({ title, amountUSD, amountIQD, icon, colorClass, labels }) => {
  // Map standard colors to our neon palette classes for borders/shadows
  const getColorHex = () => {
      if (colorClass.includes('red') || colorClass.includes('rose')) return '#ff2a6d'; // Neon Red
      if (colorClass.includes('cyan') || colorClass.includes('blue')) return '#00d9f5'; // Neon Cyan
      return '#00f5a0'; // Neon Teal
  };

  const accentColor = getColorHex();

  return (
    <div className="glass-panel p-6 rounded-xl relative group transition-all duration-300 hover:bg-[#0f1729]/80 h-full flex flex-col justify-between">
      {/* Top Row: Title & Icon */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-300 text-sm md:text-base font-bold uppercase tracking-widest font-[Rajdhani] group-hover:text-white transition-colors">
            {title}
        </h3>
        <div className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" style={{ color: accentColor }}>
            {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
        </div>
      </div>

      {/* Values */}
      <div className="space-y-4">
        {/* IQD Main */}
        <div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl lg:text-5xl font-bold font-[Orbitron] text-white tracking-tight">
                    {amountIQD.toLocaleString()}
                </span>
                <span className="text-xs font-bold px-2 py-1 rounded border border-white/10 text-slate-300 bg-white/5">
                    {labels.iqd}
                </span>
            </div>
        </div>

        {/* USD Secondary */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
           <span className="text-xl md:text-2xl font-semibold font-[Orbitron] text-slate-200 group-hover:text-white transition-colors">
               {amountUSD.toLocaleString()}
           </span>
           <span className="text-xs font-bold text-slate-400 bg-[#02040a] px-1.5 py-0.5 rounded border border-slate-800">
               {labels.usd}
           </span>
        </div>
      </div>

      {/* Decorative Neon Bar at Bottom */}
      <div className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 ease-out" style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}></div>
    </div>
  );
};

export default StatCard;