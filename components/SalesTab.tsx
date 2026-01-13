import React, { useState, useEffect } from 'react';
import { Sale, Language, Currency, StoreType } from '../types';
import { addSale, deleteSale, getAppData } from '../services/storageService';
import { TRANSLATIONS } from '../constants';
import { Plus, Search, Trash2, Calendar, FileText } from 'lucide-react';interface SalesTabProps {
  lang: Language;
  onUpdate: () => void;
  store: StoreType;
}

const SalesTab: React.FC<SalesTabProps> = ({ lang, onUpdate, store }) => {
  const t = TRANSLATIONS[lang];
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    currency: 'IQD' as Currency,
    note: ''
  });
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    query: ''
  });

  const loadData = async () => {
    try {
      const data = await getAppData();
      setSales(data.sales);
    } catch (error) {
      console.error('Failed to load sales:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;
    setLoading(true);

    try {
      // Optimistic update: add to UI immediately
      const newSale = await addSale({
        date: form.date,
        amount: parseFloat(form.amount),
        currency: form.currency,
        note: form.note,
        store: store
      });

      // Update UI with new sale optimistically
      setSales(prev => [newSale, ...prev]);
      
      // Reset form (keep date/currency for convenience)
      setForm({ ...form, amount: '', note: '' });
      
      // Callback for parent component
      onUpdate();
      
      // Background sync (non-blocking)
      loadData().catch(console.error);
    } catch (error) {
      console.error("Failed to add sale:", error);
      alert(t.errorSave || "Error saving data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t.confirmClear)) {
      setLoading(true);
      try {
        // Optimistic update: remove from UI immediately
        setSales(prev => prev.filter(s => s.id !== id));
        
        // Then persist
        await deleteSale(id);
        
        // Callback
        onUpdate();
      } catch (error) {
        console.error("Failed to delete sale:", error);
        alert(t.errorDelete || "Error deleting record.");
        // Reload on error to restore correct state
        loadData();
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredSales = sales
    .filter(s => s.store === store)
    .filter(s => {
      const matchesQuery = s.code.toLowerCase().includes(filter.query.toLowerCase()) || 
                           (s.note && s.note.toLowerCase().includes(filter.query.toLowerCase()));
      const matchesStart = filter.startDate ? s.date >= filter.startDate : true;
      const matchesEnd = filter.endDate ? s.date <= filter.endDate : true;
      return matchesQuery && matchesStart && matchesEnd;
    });

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Input Form */}
      <div className="glass-panel p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-4 font-[Orbitron]">
          <div className="p-3 bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/30 rounded-xl">
            <Plus size={24} className="text-[var(--accent-main)]" />
          </div>
          {t.addSale}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.date}</label>
            <input 
              type="date" 
              required
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-[var(--accent-main)] transition-colors"
              value={form.date}
              onChange={e => setForm({...form, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.amount}</label>
            <input 
              type="number" 
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-[var(--text-primary)] text-lg font-mono focus:outline-none focus:border-[var(--accent-main)] transition-colors"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.currency}</label>
            <select 
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-[var(--accent-main)] transition-colors"
              value={form.currency}
              onChange={e => setForm({...form, currency: e.target.value as Currency})}
            >
              <option value="IQD">{t.iqd}</option>
              <option value="USD">{t.usd}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.note}</label>
            <input 
              type="text" 
              placeholder="..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-[var(--accent-main)] transition-colors"
              value={form.note}
              onChange={e => setForm({...form, note: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/50 hover:bg-[var(--accent-main)] hover:text-[#02040a] text-[var(--accent-main)] font-bold font-[Orbitron] py-4 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(0,0,0,0.1)] active:scale-95 uppercase tracking-widest text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : t.save}
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
          <input 
            type="text" 
            placeholder={t.search}
            className="w-full pl-14 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-[var(--accent-main)] transition-all placeholder:text-[var(--text-secondary)]"
            value={filter.query}
            onChange={e => setFilter({...filter, query: e.target.value})}
          />
        </div>
        <div className="flex gap-4">
          <input 
            type="date" 
            className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-secondary)] text-base focus:outline-none focus:border-[var(--accent-main)]"
            value={filter.startDate}
            onChange={e => setFilter({...filter, startDate: e.target.value})}
          />
          <span className="self-center text-[var(--text-secondary)] font-bold text-xl">-</span>
          <input 
            type="date" 
            className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-secondary)] text-base focus:outline-none focus:border-[var(--accent-main)]"
            value={filter.endDate}
            onChange={e => setFilter({...filter, endDate: e.target.value})}
          />
        </div>
      </div>

      {/* List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base text-[var(--text-secondary)]">
            <thead className="bg-[var(--bg-secondary)] text-[var(--text-primary)] uppercase text-sm font-bold font-[Rajdhani] tracking-widest border-b border-[var(--glass-border)]">
              <tr>
                <th className="px-8 py-5">{t.code}</th>
                <th className="px-8 py-5">{t.date}</th>
                <th className="px-8 py-5">{t.amount}</th>
                <th className="px-8 py-5">{t.note}</th>
                <th className="px-8 py-5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-[var(--text-secondary)]">
                    <div className="flex flex-col items-center gap-4">
                      <FileText size={64} className="opacity-20" />
                      <p className="font-[Orbitron] uppercase tracking-widest text-lg opacity-50">{t.noData}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[var(--accent-main)]/5 transition-colors group">
                    <td className="px-8 py-5 font-mono text-[var(--accent-main)] text-base">{sale.code}</td>
                    <td className="px-8 py-5 text-[var(--text-primary)]">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-[var(--text-secondary)]" />
                        {sale.date}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-2 font-bold font-[Orbitron] text-xl ${sale.currency === 'USD' ? 'text-[var(--accent-main)]' : 'text-[#00d9f5]'}`}>
                        {sale.amount.toLocaleString()} 
                        <span className="text-xs opacity-60 ml-1 border border-current px-1.5 py-0.5 rounded">{sale.currency === 'USD' ? t.usd : t.iqd}</span>
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[var(--text-secondary)] truncate max-w-[250px] text-lg">{sale.note || '-'}</td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(sale.id)}
                        className="p-3 text-[var(--text-secondary)] hover:text-[#ff2a6d] hover:bg-[#ff2a6d]/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={22} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTab;
