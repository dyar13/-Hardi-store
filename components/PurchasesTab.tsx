import React, { useState, useEffect } from 'react';
import { Purchase, Language, Currency, StoreType } from '../types';
import { addPurchase, deletePurchase, getAppData } from '../services/storageService';
import { TRANSLATIONS } from '../constants';
import { Search, Trash2, Package, ShoppingCart } from 'lucide-react';

interface PurchasesTabProps {
  lang: Language;
  onUpdate: () => void;
  store: StoreType;
}

const PurchasesTab: React.FC<PurchasesTabProps> = ({ lang, onUpdate, store }) => {
  const t = TRANSLATIONS[lang];
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    productName: '',
    quantity: '',
    totalCost: '',
    currency: 'IQD' as Currency
  });
  const [filter, setFilter] = useState({ query: '' });

  const loadData = async () => {
    const data = await getAppData();
    setPurchases(data.purchases);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName || !form.quantity || !form.totalCost) return;
    setLoading(true);

    try {
        await addPurchase({
            date: form.date,
            productName: form.productName,
            quantity: parseInt(form.quantity),
            totalCost: parseFloat(form.totalCost),
            currency: form.currency,
            store: store
        });

        setForm({ ...form, productName: '', quantity: '', totalCost: '' });
        await loadData();
        onUpdate();
    } catch (error) {
        console.error("Failed to add purchase", error);
        alert("Error saving record.");
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t.confirmClear)) {
      setLoading(true);
      try {
          await deletePurchase(id);
          await loadData();
          onUpdate();
      } catch (error) {
          console.error("Failed to delete purchase", error);
          alert("Error deleting record.");
      } finally {
          setLoading(false);
      }
    }
  };

  const filteredPurchases = purchases
    .filter(p => p.store === store)
    .filter(p => 
        p.productName.toLowerCase().includes(filter.query.toLowerCase())
    );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Input Form */}
      <div className="glass-panel p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-4 font-[Orbitron]">
            <div className="p-3 bg-[#00d9f5]/10 border border-[#00d9f5]/30 rounded-xl">
                <ShoppingCart size={24} className="text-[#00d9f5]" />
            </div>
            {t.addPurchase}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.date}</label>
            <input 
              type="date" 
              required
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-[#00d9f5] transition-colors"
              value={form.date}
              onChange={e => setForm({...form, date: e.target.value})}
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.productName}</label>
            <input 
              type="text" 
              required
              placeholder={t.productName}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-[#00d9f5] transition-colors"
              value={form.productName}
              onChange={e => setForm({...form, productName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.quantity}</label>
            <input 
              type="number" 
              required
              min="1"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-[#00d9f5] transition-colors"
              value={form.quantity}
              onChange={e => setForm({...form, quantity: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.cost}</label>
            <div className="flex gap-1">
                <input 
                type="number" 
                required
                min="0"
                step="0.01"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-l-xl px-5 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-[#00d9f5] transition-colors"
                value={form.totalCost}
                onChange={e => setForm({...form, totalCost: e.target.value})}
                />
                 <select 
                    className="bg-[var(--bg-secondary)] border border-l-0 border-[var(--glass-border)] rounded-r-xl px-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#00d9f5]"
                    value={form.currency}
                    onChange={e => setForm({...form, currency: e.target.value as Currency})}
                >
                    <option value="IQD">IQD</option>
                    <option value="USD">USD</option>
                </select>
            </div>
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#00d9f5]/10 border border-[#00d9f5]/50 hover:bg-[#00d9f5] hover:text-[#02040a] text-[#00d9f5] font-bold font-[Orbitron] py-4 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(0,217,245,0.15)] hover:shadow-[0_0_30px_rgba(0,217,245,0.5)] active:scale-95 uppercase tracking-widest text-lg disabled:opacity-50"
            >
              {loading ? '...' : t.save}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
        <input 
          type="text" 
          placeholder={t.search}
          className="w-full pl-14 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-[#00d9f5] transition-all placeholder:text-[var(--text-secondary)]"
          value={filter.query}
          onChange={e => setFilter({...filter, query: e.target.value})}
        />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base text-[var(--text-secondary)]">
            <thead className="bg-[var(--bg-secondary)] text-[var(--text-primary)] uppercase text-sm font-bold font-[Rajdhani] tracking-widest border-b border-[var(--glass-border)]">
              <tr>
                <th className="px-8 py-5">{t.date}</th>
                <th className="px-8 py-5">{t.productName}</th>
                <th className="px-8 py-5">{t.quantity}</th>
                <th className="px-8 py-5">{t.cost}</th>
                <th className="px-8 py-5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-[var(--text-secondary)]">
                    <div className="flex flex-col items-center gap-4">
                        <Package size={64} className="opacity-20" />
                        <p className="font-[Orbitron] uppercase tracking-widest text-lg opacity-50">{t.noData}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-[#00d9f5]/5 transition-colors group">
                    <td className="px-8 py-5 font-mono text-[var(--text-primary)] text-base">{p.date}</td>
                    <td className="px-8 py-5 font-bold text-[var(--text-primary)] font-[Rajdhani] text-xl">{p.productName}</td>
                    <td className="px-8 py-5 font-mono text-[#00d9f5] text-lg">{p.quantity}</td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-2 font-bold font-[Orbitron] text-xl ${p.currency === 'USD' ? 'text-[var(--accent-main)]' : 'text-[#00d9f5]'}`}>
                        {p.totalCost.toLocaleString()} 
                        <span className="text-xs opacity-60 ml-1 border border-current px-1.5 py-0.5 rounded">{p.currency === 'USD' ? t.usd : t.iqd}</span>
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(p.id)}
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

export default PurchasesTab;