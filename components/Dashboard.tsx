import React, { useEffect, useState, useMemo } from 'react';
import { AppData, Language, StoreType } from '../types';
import { getAppData } from '../services/storageService';
import { TRANSLATIONS } from '../constants';
import StatCard from './StatCard';
import { ShoppingCart, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Clock, Activity } from 'lucide-react';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'; // Unused chart imports
interface DashboardProps {
  lang: Language;
  store: StoreType;
}

const Dashboard: React.FC<DashboardProps> = ({ lang, store }) => {
  const t = TRANSLATIONS[lang];
  const [data, setData] = useState<AppData>({ sales: [], purchases: [], debts: [] });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [today] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const load = async () => {
        const d = await getAppData();
        setData(d);
    };
    load();
  }, [store]); 

  // --- Memoized Calculations ---
  
  const currentMonth = today.substring(0, 7);

  const calculateTotal = (items: any[], currency: 'USD' | 'IQD', dateFilter?: string, dateType: 'day' | 'month' = 'day') => {
    return items
      .filter(item => item.store === store)
      .filter(item => {
        if (!dateFilter) return true;
        if (dateType === 'day') return item.date === dateFilter;
        return item.date.startsWith(dateFilter.substring(0, 7));
      })
      .filter(item => item.currency === currency)
      .reduce((sum, item) => sum + (item.amount || item.totalCost || 0), 0);
  };

  const { salesMonthUSD, salesMonthIQD, purchasesMonthUSD, purchasesMonthIQD, netUSD, netIQD } = useMemo(() => {
    const sUSD = calculateTotal(data.sales, 'USD', currentMonth, 'month');
    const sIQD = calculateTotal(data.sales, 'IQD', currentMonth, 'month');
    const pUSD = calculateTotal(data.purchases, 'USD', currentMonth, 'month');
    const pIQD = calculateTotal(data.purchases, 'IQD', currentMonth, 'month');
    return {
        salesMonthUSD: sUSD,
        salesMonthIQD: sIQD,
        purchasesMonthUSD: pUSD,
        purchasesMonthIQD: pIQD,
        netUSD: sUSD - pUSD,
        netIQD: sIQD - pIQD
    };
  }, [data.sales, data.purchases, store, currentMonth]);

  const { weOweUSD, weOweIQD, owedToUsUSD, owedToUsIQD } = useMemo(() => {
    const calcDebt = (type: 'we_owe' | 'owed_to_us', currency: 'USD' | 'IQD') => {
        return data.debts
          .filter(d => d.store === store)
          .filter(d => d.type === type && d.currency === currency)
          .reduce((sum, d) => {
              const paid = d.payments.reduce((pSum, p) => pSum + p.amount, 0);
              return sum + (d.totalAmount - paid);
          }, 0);
    };
    return {
        weOweUSD: calcDebt('we_owe', 'USD'),
        weOweIQD: calcDebt('we_owe', 'IQD'),
        owedToUsUSD: calcDebt('owed_to_us', 'USD'),
        owedToUsIQD: calcDebt('owed_to_us', 'IQD')
    };
  }, [data.debts, store]);

  const lineChartData = useMemo(() => {
      const dates = [];
      for(let i=6; i>=0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dates.push(d.toISOString().split('T')[0].slice(5)); // MM-DD
      }
      return dates.map(dateStr => {
        const fullDate = new Date().getFullYear() + '-' + dateStr;
        const sales = calculateTotal(data.sales, 'IQD', fullDate);
        return { name: dateStr, value: sales };
      });
  }, [data.sales, store]);

  const donutData = useMemo(() => {
     const arr = [
        { name: t.owedToUsLabel, value: owedToUsIQD, color: 'var(--accent-main)' }, 
        { name: t.weOweLabel, value: weOweIQD, color: '#ff2a6d' }     
     ].filter(d => d.value > 0);
     if (arr.length === 0) arr.push({ name: 'Clear', value: 1, color: '#1e293b' });
     return arr;
  }, [owedToUsIQD, weOweIQD, t]);

  // --- Live Activity Feed Logic ---
  const recentActivities = useMemo(() => {
    // Explicitly cast to any during the map to avoid union type conflicts in TypeScript
    const combined = [
        ...data.sales.filter(s => s.store === store).map(s => ({ ...s, type: 'sale' as const })),
        ...data.purchases.filter(p => p.store === store).map(p => ({ ...p, type: 'purchase' as const })),
        ...data.debts.filter(d => d.store === store).map(d => ({ ...d, type: 'debt' as const }))
    ];
    // Sort by timestamp descending (newest first)
    return combined.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [data, store]);

  // --- Render ---

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 rounded-lg border border-[var(--accent-main)]/30 shadow-[0_0_20px_var(--accent-glow)]">
          <p className="text-[var(--accent-main)] text-sm font-mono mb-2 uppercase">{label}</p>
          <p className="text-[var(--text-primary)] text-lg font-bold font-[Orbitron]">
             {payload[0].value.toLocaleString()} IQD
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-8 h-full">
      
      {/* ROW 1: 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title={t.thisMonth} 
          amountUSD={salesMonthUSD} amountIQD={salesMonthIQD}
          icon={<TrendingUp />} colorClass="text-emerald-400"
          labels={{ usd: t.usd, iqd: t.iqd }}
        />
        <StatCard 
          title={t.totalPurchases} 
          amountUSD={purchasesMonthUSD} amountIQD={purchasesMonthIQD}
          icon={<ShoppingCart />} colorClass="text-cyan-400"
          labels={{ usd: t.usd, iqd: t.iqd }}
        />
        <StatCard 
          title={t.netBalance} 
          amountUSD={netUSD} amountIQD={netIQD}
          icon={<Wallet />} colorClass={netIQD >= 0 ? "text-emerald-400" : "text-rose-400"}
          labels={{ usd: t.usd, iqd: t.iqd }}
        />
      </div>

      {/* ROW 2: 2 Wide Financial Cards (Red & Teal) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* We Owe (Red) */}
          <div className="glass-panel p-8 rounded-xl border-l-[4px] border-l-[#ff2a6d] relative overflow-hidden group">
              <div className="relative z-10 flex flex-col justify-between h-full gap-6">
                  <div className="flex justify-between items-center">
                      <h3 className="text-[var(--text-secondary)] text-base font-bold font-[Rajdhani] uppercase tracking-widest">{t.weOweLabel}</h3>
                      <ArrowUpRight className="text-[#ff2a6d]" size={28} />
                  </div>
                  <div className="flex gap-10 items-end">
                      <div>
                          <p className="text-4xl md:text-5xl font-[Orbitron] font-bold text-[var(--text-primary)] tracking-tight">{weOweIQD.toLocaleString()}</p>
                          <span className="text-xs text-[#ff2a6d] border border-[#ff2a6d]/30 bg-[#ff2a6d]/10 px-2 py-0.5 rounded uppercase font-bold">IQD</span>
                      </div>
                      <div className="h-10 w-px bg-[var(--text-secondary)]/20"></div>
                      <div>
                          <p className="text-2xl md:text-3xl font-[Orbitron] font-bold text-[var(--text-secondary)]">{weOweUSD.toLocaleString()}</p>
                          <span className="text-xs text-[var(--text-secondary)] border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded uppercase font-bold">USD</span>
                      </div>
                  </div>
              </div>
              {/* Background Glow */}
              <div className="absolute right-0 top-0 w-40 h-40 bg-[#ff2a6d] opacity-[0.03] rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
          </div>

          {/* Owed To Us (Teal) */}
          <div className="glass-panel p-8 rounded-xl border-l-[4px] border-l-[var(--accent-main)] relative overflow-hidden group">
              <div className="relative z-10 flex flex-col justify-between h-full gap-6">
                  <div className="flex justify-between items-center">
                      <h3 className="text-[var(--text-secondary)] text-base font-bold font-[Rajdhani] uppercase tracking-widest">{t.owedToUsLabel}</h3>
                      <ArrowDownRight className="text-[var(--accent-main)]" size={28} />
                  </div>
                  <div className="flex gap-10 items-end">
                      <div>
                          <p className="text-4xl md:text-5xl font-[Orbitron] font-bold text-[var(--text-primary)] tracking-tight">{owedToUsIQD.toLocaleString()}</p>
                          <span className="text-xs text-[var(--accent-main)] border border-[var(--accent-main)]/30 bg-[var(--accent-main)]/10 px-2 py-0.5 rounded uppercase font-bold">IQD</span>
                      </div>
                      <div className="h-10 w-px bg-[var(--text-secondary)]/20"></div>
                      <div>
                          <p className="text-2xl md:text-3xl font-[Orbitron] font-bold text-[var(--text-secondary)]">{owedToUsUSD.toLocaleString()}</p>
                          <span className="text-xs text-[var(--text-secondary)] border border-[var(--glass-border)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded uppercase font-bold">USD</span>
                      </div>
                  </div>
              </div>
              {/* Background Glow */}
              <div className="absolute right-0 top-0 w-40 h-40 bg-[var(--accent-main)] opacity-[0.03] rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
          </div>
      </div>

      {/* ROW 3: Charts & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Donut Chart */}
          <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center relative min-h-[300px]">
              <div className="absolute top-6 left-6 flex items-center gap-2">
                  <h3 className="text-sm text-[var(--text-secondary)] font-[Rajdhani] uppercase tracking-wider">Debt Distribution</h3>
              </div>
              <div className="w-full h-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                         formatter={(value: number) => value.toLocaleString()}
                         contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--glass-border)', fontSize: '14px', color: 'var(--text-primary)', borderRadius: '8px', padding: '10px' }}
                         itemStyle={{ color: 'var(--text-primary)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold font-[Orbitron] text-[var(--text-primary)]">
                        {((owedToUsIQD + weOweIQD) / 1000000).toFixed(1)}M
                      </span>
                  </div>
              </div>
              
              {/* Custom Legend */}
              <div className="w-full flex justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ff2a6d]"></div>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Payable</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-main)]"></div>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Receivable</span>
                  </div>
              </div>
          </div>

          {/* Line Chart */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-xl flex flex-col min-h-[300px]">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[var(--text-secondary)] font-[Rajdhani] text-base uppercase tracking-wider">Weekly Sales Trend (IQD)</h3>
                  <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-main)] animate-pulse"></span>
                      <span className="text-xs font-bold text-[var(--accent-main)] border border-[var(--accent-main)]/30 px-2 py-0.5 rounded bg-[var(--accent-main)]/5">LIVE</span>
                  </div>
              </div>
              <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--accent-main)" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="var(--accent-main)" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="var(--text-secondary)" 
                            tick={{fontSize: 12, fill: 'var(--text-secondary)', fontFamily: 'Orbitron'}} 
                            tickLine={false} 
                            axisLine={false}
                            dy={10}
                          />
                          <YAxis 
                            stroke="var(--text-secondary)" 
                            tick={{fontSize: 12, fill: 'var(--text-secondary)', fontFamily: 'Orbitron'}} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `${value / 1000}k`}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--accent-main)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="var(--accent-main)" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorTrend)" 
                            activeDot={{ r: 6, fill: '#fff', stroke: 'var(--accent-main)', strokeWidth: 3 }}
                          />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* NEW: LIVE ACTIVITY FEED */}
      <div className="glass-panel p-8 rounded-xl">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-[var(--text-primary)] font-[Orbitron] text-lg flex items-center gap-3">
                <Activity className="text-[var(--accent-main)]" />
                Live Activity Feed
            </h3>
            <span className="text-xs text-[var(--text-secondary)] font-mono uppercase tracking-widest border border-[var(--glass-border)] px-2 py-1 rounded">Latest 5 Transactions</span>
        </div>
        
        <div className="space-y-4">
            {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-secondary)] opacity-50 font-[Orbitron]">No recent activity</div>
            ) : (
                recentActivities.map((item, idx) => {
                    let icon, color, label;
                    if (item.type === 'sale') {
                        icon = <TrendingUp size={18} />;
                        color = 'text-[var(--accent-main)]';
                        label = 'New Sale';
                    } else if (item.type === 'purchase') {
                        icon = <ShoppingCart size={18} />;
                        color = 'text-cyan-400';
                        label = 'Stock Purchase';
                    } else {
                        icon = <Wallet size={18} />;
                        color = 'text-[#ff2a6d]';
                        label = 'Debt Record';
                    }

                    const val = (item as any).amount || (item as any).totalCost || (item as any).totalAmount;
                    const name = (item as any).note || (item as any).productName || (item as any).personName || 'Transaction';
                    const dateStr = item.type === 'debt' ? (item as any).createdDate : (item as any).date;

                    return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl hover:border-[var(--accent-main)]/30 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full bg-opacity-10 ${color} bg-current`}>
                                    {icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[var(--text-primary)] text-sm md:text-base font-[Rajdhani]">{name}</h4>
                                    <p className={`text-xs uppercase tracking-wider font-bold ${color}`}>{label}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-lg font-bold font-[Orbitron] text-[var(--text-primary)]">
                                    {val.toLocaleString()} <span className="text-xs opacity-50">{item.currency}</span>
                                </span>
                                <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 font-mono">
                                    <Clock size={12} />
                                    {dateStr}
                                </span>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
