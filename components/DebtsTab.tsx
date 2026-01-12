import React, { useState, useEffect } from 'react';
import { Debt, Language, Currency, DebtType, StoreType } from '../types';
import { addDebt, addDebtPayment, deleteDebt, getAppData } from '../services/storageService';
import { TRANSLATIONS } from '../constants';
import { Plus, Search, Trash2, User, Phone, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

interface DebtsTabProps {
  lang: Language;
  onUpdate: () => void;
  store: StoreType;
}

const DebtsTab: React.FC<DebtsTabProps> = ({ lang, onUpdate, store }) => {
  const t = TRANSLATIONS[lang];
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<DebtType>('owed_to_us');
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  
  // Forms
  const [form, setForm] = useState({
    personName: '',
    phone: '',
    amount: '',
    currency: 'IQD' as Currency,
    dueDate: '',
    note: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    note: ''
  });

  const [filter, setFilter] = useState({ query: '' });

  const loadData = async () => {
    const data = await getAppData();
    setDebts(data.debts);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.personName || !form.amount) return;
    setLoading(true);

    try {
        await addDebt({
            type: activeType,
            personName: form.personName,
            phone: form.phone,
            totalAmount: parseFloat(form.amount),
            currency: form.currency,
            createdDate: new Date().toISOString().split('T')[0],
            dueDate: form.dueDate,
            note: form.note,
            store: store
        });

        setForm({ personName: '', phone: '', amount: '', currency: 'IQD', dueDate: '', note: '' });
        await loadData();
        onUpdate();
    } catch (error) {
        console.error("Failed to add debt", error);
        alert("Error saving record.");
    } finally {
        setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal || !paymentForm.amount) return;
    
    // Find debt to get currency
    const debt = debts.find(d => d.id === showPaymentModal);
    if(!debt) return;
    
    setLoading(true);

    try {
        await addDebtPayment(showPaymentModal, {
            date: new Date().toISOString().split('T')[0],
            amount: parseFloat(paymentForm.amount),
            currency: debt.currency,
            note: paymentForm.note
        });

        setPaymentForm({ amount: '', note: '' });
        setShowPaymentModal(null);
        await loadData();
        onUpdate();
    } catch (error) {
        console.error("Failed to add payment", error);
        alert("Error saving payment.");
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t.confirmClear)) {
      setLoading(true);
      try {
          await deleteDebt(id);
          await loadData();
          onUpdate();
      } catch (error) {
          console.error("Failed to delete debt", error);
          alert("Error deleting record.");
      } finally {
          setLoading(false);
      }
    }
  };

  const filteredDebts = debts
    .filter(d => d.store === store)
    .filter(d => 
        d.type === activeType &&
        (d.personName.toLowerCase().includes(filter.query.toLowerCase()) || d.code.toLowerCase().includes(filter.query.toLowerCase()))
    );

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'paid': return 'text-[var(--accent-main)] bg-[var(--accent-main)]/10 border-[var(--accent-main)]/30';
          case 'partial': return 'text-[#00d9f5] bg-[#00d9f5]/10 border-[#00d9f5]/30';
          default: return 'text-[#ff2a6d] bg-[#ff2a6d]/10 border-[#ff2a6d]/30';
      }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'paid': return t.paid;
          case 'partial': return t.partial;
          default: return t.unpaid;
      }
  };

  const activeColor = activeType === 'owed_to_us' ? 'text-[var(--accent-main)]' : 'text-[#ff2a6d]';
  const activeBg = activeType === 'owed_to_us' ? 'bg-[var(--accent-main)]' : 'bg-[#ff2a6d]';
  const activeBorder = activeType === 'owed_to_us' ? 'border-[var(--accent-main)]' : 'border-[#ff2a6d]';

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Type Toggles */}
      <div className="flex p-1.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--glass-border)] relative">
        <button 
            onClick={() => setActiveType('owed_to_us')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-base font-bold font-[Orbitron] uppercase tracking-widest transition-all duration-300 ${activeType === 'owed_to_us' ? 'bg-[var(--accent-main)] text-[#02040a] shadow-[0_0_15px_var(--accent-glow)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
            <ArrowDownRight size={22} />
            {t.owedToUsLabel}
        </button>
        <button 
            onClick={() => setActiveType('we_owe')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-base font-bold font-[Orbitron] uppercase tracking-widest transition-all duration-300 ${activeType === 'we_owe' ? 'bg-[#ff2a6d] text-[#02040a] shadow-[0_0_15px_rgba(255,42,109,0.4)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
            <ArrowUpRight size={22} />
            {t.weOweLabel}
        </button>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-8 rounded-2xl border-t-4" style={{borderColor: activeType === 'owed_to_us' ? 'var(--accent-main)' : '#ff2a6d'}}>
        <h3 className={`text-xl font-bold mb-8 flex items-center gap-4 font-[Orbitron] ${activeColor}`}>
            <div className={`p-3 rounded-xl border bg-opacity-10 ${activeBg} ${activeBorder.replace('border', 'border-opacity-30')}`}>
                <Plus size={24} />
            </div>
            {t.addDebt}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.personName}</label>
            <input 
              type="text" required
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-current transition-colors"
              value={form.personName} onChange={e => setForm({...form, personName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.phone}</label>
            <input 
              type="text" 
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-current transition-colors"
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.amount}</label>
            <div className="flex">
                <input 
                    type="number" required min="0" step="0.01"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-l-xl px-5 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-current transition-colors"
                    value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                />
                <select 
                    className="bg-[var(--bg-secondary)] border border-l-0 border-[var(--glass-border)] rounded-r-xl px-3 text-sm text-[var(--text-secondary)] focus:outline-none"
                    value={form.currency} onChange={e => setForm({...form, currency: e.target.value as Currency})}
                >
                    <option value="IQD">IQD</option>
                    <option value="USD">USD</option>
                </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.dueDate}</label>
            <input 
              type="date"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-current transition-colors"
              value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className={`w-full font-bold font-[Orbitron] py-4 px-6 rounded-xl transition-all shadow-[0_0_15px_currentColor] uppercase tracking-widest text-lg hover:brightness-110 active:scale-95 disabled:opacity-50 ${activeBg} text-[#02040a]`}>
              {loading ? '...' : t.save}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
        <input 
          type="text" placeholder={t.search}
          className={`w-full pl-14 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-primary)] text-lg focus:outline-none transition-all placeholder:text-[var(--text-secondary)] focus:border-${activeType === 'owed_to_us' ? 'teal' : 'rose'}-500`}
          value={filter.query} onChange={e => setFilter({...filter, query: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredDebts.map(debt => {
            const paidAmount = debt.payments.reduce((sum, p) => sum + p.amount, 0);
            const remaining = debt.totalAmount - paidAmount;
            const progress = (paidAmount / debt.totalAmount) * 100;

            return (
                <div key={debt.id} className={`glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-l-[6px] transition-all hover:bg-[var(--glass-border)] group ${activeType === 'owed_to_us' ? 'border-l-[var(--accent-main)]' : 'border-l-[#ff2a6d]'}`}>
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                            <h4 className="text-2xl font-bold text-[var(--text-primary)] font-[Rajdhani]">{debt.personName}</h4>
                            <span className={`text-[10px] px-2.5 py-1 rounded-md border uppercase font-bold tracking-wider ${getStatusColor(debt.status)}`}>
                                {getStatusLabel(debt.status)}
                            </span>
                            <span className="text-xs font-mono text-[var(--text-secondary)] border border-[var(--glass-border)] px-1.5 py-0.5 rounded">{debt.code}</span>
                        </div>
                        <div className="flex flex-wrap gap-8 text-sm text-[var(--text-secondary)] font-mono">
                             {debt.phone && <span className="flex items-center gap-2"><Phone size={14} className="text-slate-600"/> {debt.phone}</span>}
                             <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-600"/> {debt.createdDate}</span>
                             {debt.dueDate && <span className="flex items-center gap-2 text-[#ff2a6d]"><AlertCircle size={14}/> Due: {debt.dueDate}</span>}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 min-w-[220px]">
                        <span className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">{t.amount}</span>
                        <span className="text-3xl font-bold text-[var(--text-primary)] font-[Orbitron] tracking-tight">
                            {debt.totalAmount.toLocaleString()} <span className={`text-sm ${activeColor}`}>{debt.currency}</span>
                        </span>
                        <div className="w-full bg-[var(--glass-border)] h-2 rounded-full mt-2 overflow-hidden">
                            <div className={`h-full rounded-full ${activeBg} shadow-[0_0_5px_currentColor]`} style={{width: `${progress}%`}}></div>
                        </div>
                        <span className="text-xs text-[var(--text-secondary)] font-mono mt-1">{t.remaining}: <span className="text-[var(--text-primary)] font-bold text-base">{remaining.toLocaleString()}</span></span>
                    </div>

                    <div className="flex gap-3 self-end md:self-center">
                        {debt.status !== 'paid' && (
                            <button 
                                onClick={() => setShowPaymentModal(debt.id)}
                                className="p-3.5 bg-[var(--accent-main)]/10 hover:bg-[var(--accent-main)] text-[var(--accent-main)] hover:text-black rounded-xl border border-[var(--accent-main)]/30 transition-colors" title={t.addPayment}
                            >
                                <DollarSign size={24} />
                            </button>
                        )}
                        <button 
                            onClick={() => handleDelete(debt.id)}
                            className="p-3.5 bg-[var(--bg-secondary)] hover:bg-[#ff2a6d] text-[var(--text-secondary)] hover:text-black rounded-xl border border-[var(--glass-border)] transition-colors"
                        >
                            <Trash2 size={24} />
                        </button>
                    </div>
                </div>
            );
        })}
        
        {filteredDebts.length === 0 && (
            <div className="text-center py-24 text-[var(--text-secondary)] flex flex-col items-center gap-6">
                <User size={80} className="opacity-10" />
                <p className="font-[Orbitron] uppercase tracking-widest text-xl opacity-50">{t.noData}</p>
            </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
          <div className="fixed inset-0 bg-[#02040a]/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
              <div className="glass-panel p-10 rounded-2xl w-full max-w-lg shadow-[0_0_60px_rgba(0,0,0,0.6)] animate-fade-in border border-[var(--glass-border)]">
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-8 font-[Orbitron] flex items-center gap-3">
                      <DollarSign className="text-[var(--accent-main)]" size={28}/>
                      {t.addPayment}
                  </h3>
                  <form onSubmit={handlePaymentSubmit} className="space-y-8">
                      <div>
                        <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.amount}</label>
                        <input 
                            type="number" required min="0" step="0.01" autoFocus
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-6 py-4 text-[var(--text-primary)] text-2xl font-[Orbitron] focus:outline-none focus:border-[var(--accent-main)]"
                            value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--text-secondary)] mb-3 font-bold uppercase tracking-wider">{t.note}</label>
                        <input 
                            type="text" 
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl px-6 py-4 text-[var(--text-primary)] text-lg focus:outline-none focus:border-[var(--accent-main)]"
                            value={paymentForm.note} onChange={e => setPaymentForm({...paymentForm, note: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                          <button type="button" onClick={() => setShowPaymentModal(null)} className="flex-1 py-4 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-slate-700 font-bold uppercase tracking-wider font-[Orbitron] text-lg">Cancel</button>
                          <button type="submit" disabled={loading} className="flex-1 py-4 rounded-xl bg-[var(--accent-main)] text-[#02040a] hover:brightness-110 font-bold uppercase tracking-wider font-[Orbitron] shadow-[0_0_15px_var(--accent-glow)] text-lg disabled:opacity-50">Confirm</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default DebtsTab;