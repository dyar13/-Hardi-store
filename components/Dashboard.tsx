import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { AppData, Language, StoreType } from '../types';
import { getAppData } from '../services/storageService';
import { TRANSLATIONS } from '../constants';
import StatCard from './StatCard';
import { ShoppingCart, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
 lang: Language;
 store: StoreType;
}

const Dashboard: React.FC<DashboardProps> = ({ lang, store }) => {
 const t = TRANSLATIONS[lang];
 const [data, setData] = useState<AppData>({ sales: [], purchases: [], debts: [] });
 const [today] = useState(new Date().toISOString().split('T')[0]);
 const [isLoading, setIsLoading] = useState(true);

 // Lazy load data with debouncing
 useEffect(() => {
 setIsLoading(true);
 const timer = setTimeout(async () => {
 const d = await getAppData();
 setData(d);
 setIsLoading(false);
 }, 100);
 return () => clearTimeout(timer);
 }, [store]);

 const currentMonth = today.substring(0, 7);

 // Optimized calculation function
 const calculateTotal = useCallback((items: any[], currency: 'USD' | 'IQD', dateFilter?: string, dateType: 'day' | 'month' = 'day') => {
 if (!items.length) return 0;
 return items
 .filter(item => item.store === store && item.currency === currency)
 .filter(item => {
 if (!dateFilter) return true;
 if (dateType === 'day') return item.date === dateFilter;
 return item.date?.startsWith(dateFilter.substring(0, 7)) ?? false;
 })
 .reduce((sum, item) => sum + (item.amount || item.totalCost || 0), 0);
 }, [store]);

 // Memoized KPI calculations
 const kpis = useMemo(() => {
 const sUSD = calculateTotal(data.sales, 'USD', currentMonth, 'month');
 const sIQD = calculateTotal(data.sales, 'IQD', currentMonth, 'month');
 const pUSD = calculateTotal(data.purchases, 'USD', currentMonth, 'month');
 const pIQD = calculateTotal(data.purchases, 'IQD', currentMonth, 'month');
 return { salesMonthUSD: sUSD, salesMonthIQD: sIQD, purchasesMonthUSD: pUSD, purchasesMonthIQD: pIQD, netUSD: sUSD - pUSD, netIQD: sIQD - pIQD };
 }, [data.sales, data.purchases, currentMonth, calculateTotal]);

 // Memoized debt calculations with early exit
 const debts = useMemo(() => {
 if (!data.debts.length) return { weOweUSD: 0, weOweIQD: 0, owedToUsUSD: 0, owedToUsIQD: 0 };
 const result = { weOweUSD: 0, weOweIQD: 0, owedToUsUSD: 0, owedToUsIQD: 0 };
 data.debts.filter(d => d.store === store).forEach(d => {
 const paid = d.payments?.reduce((s: number, p: any) => s + p.amount, 0) ?? 0;
 const remaining = d.totalAmount - paid;
 if (d.type === 'we_owe') {
 if (d.currency === 'USD') result.weOweUSD += remaining;
 else result.weOweIQD += remaining;
 } else {
 if (d.currency === 'USD') result.owedToUsUSD += remaining;
 else result.owedToUsIQD += remaining;
 }
 });
 return result;
 }, [data.debts, store]);

 // Simplified chart data with reduced points
 const lineChartData = useMemo(() => {
 const dates = [];
 for (let i = 6; i >= 0; i--) {
 const d = new Date();
 d.setDate(d.getDate() - i);
 dates.push(d.toISOString().split('T')[0].slice(5));
 }
 return dates.map(dateStr => {
 const fullDate = new Date().getFullYear() + '-' + dateStr;
 const sales = calculateTotal(data.sales, 'IQD', fullDate);
 return { name: dateStr, value: Math.round(sales / 1000) * 1000 }; // Round to thousands
 });
 }, [data.sales, calculateTotal]);

 // Simplified donut data
 const donutData = useMemo(() => {
 const arr = [
 { name: t.owedToUsLabel, value: debts.owedToUsIQD, color: 'var(--accent-main)' },
 { name: t.weOweLabel, value: debts.weOweIQD, color: '#ff2a6d' }
 ].filter(d => d.value > 0);
 return arr.length === 0 ? [{ name: 'Clear', value: 1, color: '#1e293b' }] : arr;
 }, [debts.owedToUsIQD, debts.weOweIQD, t]);

 // Limited activity feed (only 5 items)
 const recentActivities = useMemo(() => {
 if (!data.sales.length && !data.purchases.length && !data.debts.length) return [];
 const combined = [
 ...data.sales.filter(s => s.store === store).slice(0, 2).map(s => ({ ...s, type: 'sale' as const })),
 ...data.purchases.filter(p => p.store === store).slice(0, 2).map(p => ({ ...p, type: 'purchase' as const })),
 ...data.debts.filter(d => d.store === store).slice(0, 1).map(d => ({ ...d, type: 'debt' as const }))
 ];
 return combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 5);
 }, [data, store]);

 const CustomTooltip = useCallback(({ active, payload, label }: any) => {
 if (!active || !payload?.length) return null;
 return (
 <div className="glass-panel p-4 rounded-lg border border-[var(--accent-main)]/30 shadow-[0_0_20px_var(--accent-glow)]">
 <p className="text-[var(--accent-main)] text-sm font-mono mb-2 uppercase">{label}</p>
 <p className="text-[var(--text-primary)] text-lg font-bold font-[Orbitron]">{payload[0].value.toLocaleString()} IQD</p>
 </div>
 );
 }, []);

 if (isLoading) {
 return <div className="flex items-center justify-center h-screen text-[var(--text-secondary)]" style={{ opacity: 0.5 }}>Loading...</div>;
 }

 return (
 <div className="flex flex-col gap-8 animate-fade-in pb-8 h-full">
 {/* KPI Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 <StatCard title={t.thisMonth} amountUSD={kpis.salesMonthUSD} amountIQD={kpis.salesMonthIQD} icon={<TrendingUp />} colorClass="text-emerald-400" labels={{ usd: t.usd, iqd: t.iqd }} />
 <StatCard title={t.totalPurchases} amountUSD={kpis.purchasesMonthUSD} amountIQD={kpis.purchasesMonthIQD} icon={<ShoppingCart />} colorClass="text-cyan-400" labels={{ usd: t.usd, iqd: t.iqd }} />
 <StatCard title={t.netBalance} amountUSD={kpis.netUSD} amountIQD={kpis.netIQD} icon={<Wallet />} colorClass={kpis.netIQD >= 0 ? "text-emerald-400" : "text-rose-400"} labels={{ usd: t.usd, iqd: t.iqd }} />
 </div>

 {/* Financial Cards */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <div className="glass-panel p-8 rounded-xl border-l-[4px] border-l-[#ff2a6d]">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-[var(--text-secondary)] text-base font-bold font-[Rajdhani]">{t.weOweLabel}</h3>
 <ArrowUpRight className="text-[#ff2a6d]" size={28} />
 </div>
 <p className="text-4xl font-bold font-[Orbitron]">{debts.weOweIQD.toLocaleString()}</p>
 <span className="text-xs text-[#ff2a6d]">{t.iqd}</span>
 </div>
 <div className="glass-panel p-8 rounded-xl border-l-[4px] border-l-[var(--accent-main)]">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-[var(--text-secondary)] text-base font-bold font-[Rajdhani]">{t.owedToUsLabel}</h3>
 <ArrowDownRight className="text-[var(--accent-main)]" size={28} />
 </div>
 <p className="text-4xl font-bold font-[Orbitron]">{debts.owedToUsIQD.toLocaleString()}</p>
 <span className="text-xs text-[var(--accent-main)]">{t.iqd}</span>
 </div>
 </div>

 {/* Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="glass-panel p-6 rounded-xl min-h-[300px]">
 <h3 className="text-sm text-[var(--text-secondary)] font-[Rajdhani] mb-4">Debt Distribution</h3>
 <ResponsiveContainer width="100%" height={200}>
 <PieChart>
 <Pie data={donutData} innerRadius={60} outerRadius={80} paddingAngle={6} dataKey="value" stroke="none">
 {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
 </Pie>
 </PieChart>
 </ResponsiveContainer>
 </div>
 <div className="lg:col-span-2 glass-panel p-8 rounded-xl min-h-[300px]">
 <h3 className="text-[var(--text-secondary)] font-[Rajdhani] mb-4">Weekly Sales Trend</h3>
 <ResponsiveContainer width="100%" height={250}>
 <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
 <XAxis dataKey="name" stroke="var(--text-secondary)" />
 <YAxis stroke="var(--text-secondary)" />
 <Tooltip content={<CustomTooltip />} />
 <Area type="monotone" dataKey="value" stroke="var(--accent-main)" fill="rgba(0, 245, 160, 0.1)" isAnimationActive={false} />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Activity Feed */}
 <div className="glass-panel p-8 rounded-xl">
 <h3 className="text-[var(--text-primary)] font-[Orbitron] text-lg mb-6">Recent Activity</h3>
 <div className="space-y-4">
 {recentActivities.length === 0 ? (
 <div className="text-center py-8 text-[var(--text-secondary)]">
 No recent activity
 </div>
 ) : (
 recentActivities.map((item, idx) => (
 <div key={idx} className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-xl">
 <div>
 <h4 className="font-bold text-[var(--text-primary)]">{(item as any).note || (item as any).productName || 'Transaction'}</h4>
 <p className="text-xs text-[var(--text-secondary)]">{(item as any).date || (item as any).createdDate}</p>
 </div>
 <span className="text-lg font-bold">{((item as any).amount || (item as any).totalCost || (item as any).totalAmount || 0).toLocaleString()}</span>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 );
};

export default Dashboard;
