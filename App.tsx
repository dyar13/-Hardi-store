import React, { useState, useEffect } from 'react';
import { Tab, Language, StoreType, ThemeMode, AccentColor } from './types';
import { TRANSLATIONS } from './constants';
import Dashboard from './components/Dashboard';
import SalesTab from './components/SalesTab';
import PurchasesTab from './components/PurchasesTab';
import DebtsTab from './components/DebtsTab';
import SettingsTab from './components/SettingsTab';
import { LayoutDashboard, ShoppingCart, DollarSign, Settings, Menu, X, ArrowRightLeft, Calendar, Shirt, Footprints } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [lang, setLang] = useState<Language>('ku');
  const [activeStore, setActiveStore] = useState<StoreType>('clothes');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [accent, setAccent] = useState<AccentColor>('green');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const t = TRANSLATIONS[lang];

  const handleUpdate = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('hardi_store_lang') as Language;
    const savedTheme = localStorage.getItem('hardi_store_theme') as ThemeMode;
    const savedAccent = localStorage.getItem('hardi_store_accent') as AccentColor;
    
    if (savedLang) setLang(savedLang);
    if (savedTheme) setTheme(savedTheme);
    if (savedAccent) setAccent(savedAccent);
  }, []);

  const changeLang = (l: Language) => {
    setLang(l);
    localStorage.setItem('hardi_store_lang', l);
  };

  const changeTheme = (m: ThemeMode) => {
    setTheme(m);
    localStorage.setItem('hardi_store_theme', m);
  };

  const changeAccent = (c: AccentColor) => {
    setAccent(c);
    localStorage.setItem('hardi_store_accent', c);
  };

  // Sidebar Nav Item (Left)
  const NavItem = ({ tab, icon, label }: { tab: Tab; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
      }}
      className={`group relative flex flex-col items-center justify-center py-3 px-2 w-24 h-24 rounded-xl transition-all duration-300 mb-4 gap-2
        ${activeTab === tab 
          ? 'text-[var(--accent-main)] bg-[var(--accent-main)]/10 shadow-[0_0_15px_var(--accent-glow)]' 
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'}`}
    >
      <div className={`transition-transform duration-300 ${activeTab === tab ? 'scale-110' : 'group-hover:scale-110'}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 32 })}
      </div>
      
      <span className={`text-[11px] font-bold uppercase tracking-wider font-[Orbitron] text-center leading-tight ${activeTab === tab ? 'text-[var(--accent-main)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
        {label}
      </span>

      {/* Active Indicator Bar */}
      {activeTab === tab && (
          <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-[var(--accent-main)] rounded-r-full shadow-[0_0_8px_var(--accent-main)]"></div>
      )}
    </button>
  );

  return (
    <div 
        className={`flex h-screen overflow-hidden ${lang === 'ku' ? 'dir-rtl' : 'dir-ltr'} theme-${theme} accent-${accent}`} 
        dir={lang === 'ku' ? 'rtl' : 'ltr'}
        style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      
      {/* Sidebar (Left Rail) - Desktop */}
      <div className="hidden md:flex w-28 flex-col items-center py-6 bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--glass-border)] z-20 relative shadow-[5px_0_30px_rgba(0,0,0,0.1)]">
         {/* Logo Icon */}
         <div className="mb-8 p-2">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-main)] to-cyan-400 flex items-center justify-center shadow-[0_0_20px_var(--accent-glow)]">
                 <span className="font-[Orbitron] font-black text-[#02040a] text-3xl">H</span>
             </div>
         </div>
         
         <nav className="flex-1 flex flex-col items-center w-full">
            <NavItem tab="dashboard" icon={<LayoutDashboard />} label={t.dashboard} />
            <NavItem tab="sales" icon={<DollarSign />} label={t.sales} />
            <NavItem tab="inventory" icon={<ShoppingCart />} label={t.inventory} />
            <NavItem tab="debts" icon={<ArrowRightLeft />} label={t.debts} />
            <div className="mt-auto">
                <NavItem tab="settings" icon={<Settings />} label={t.settings} />
            </div>
         </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-32 flex items-center justify-between px-10 relative shrink-0">
            {/* Background Glow for Header */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--accent-main)]/10 via-[var(--bg-primary)]/50 to-transparent pointer-events-none z-0"></div>

            {/* Left: Store Switcher & Date */}
            <div className="hidden md:flex items-center gap-6 relative z-20">
                {/* Store Tabs */}
                <div className="bg-[var(--bg-secondary)] p-1.5 rounded-xl border border-[var(--glass-border)] flex">
                    <button 
                        onClick={() => setActiveStore('clothes')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 font-[Orbitron] text-sm font-bold transition-all ${activeStore === 'clothes' ? 'bg-[var(--accent-main)] text-[#02040a]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        <Shirt size={18} />
                        {t.storeClothes}
                    </button>
                    <button 
                        onClick={() => setActiveStore('shoes')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 font-[Orbitron] text-sm font-bold transition-all ${activeStore === 'shoes' ? 'bg-[var(--accent-main)] text-[#02040a]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        <Footprints size={18} />
                        {t.storeShoes}
                    </button>
                </div>

                <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-4 border border-[var(--accent-main)]/20 bg-[var(--accent-main)]/5">
                    <Calendar size={20} className="text-[var(--accent-main)]" />
                    <span className="font-[Orbitron] text-[var(--text-primary)] text-lg tracking-widest">{new Date().toISOString().split('T')[0]}</span>
                </div>
            </div>

            {/* CENTER: ANIMATED TITLE WITH BANNER */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-visible">
                 <div className="relative flex flex-col items-center">
                     {/* Futuristic Banner Behind Title */}
                     <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 bg-gradient-to-r from-transparent via-[var(--accent-main)]/5 to-transparent">
                         <div className="absolute inset-0 border-y border-[var(--accent-main)]/20"></div>
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[var(--accent-main)] to-transparent"></div>
                         <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[var(--accent-main)] to-transparent"></div>
                     </div>

                     {/* Main Title with Multi-Layer Glow */}
                     <h1 
                         className="text-[48px] font-black font-[Orbitron] italic tracking-[0.3em] text-[var(--text-primary)] relative z-10"
                         style={{
                             textShadow: `
                                 0 0 10px var(--accent-main),
                                 0 0 20px var(--accent-main),
                                 0 0 30px var(--accent-main),
                                 0 0 40px rgba(0, 245, 160, 0.5),
                                 0 0 70px rgba(0, 245, 160, 0.3),
                                 0 0 100px rgba(0, 245, 160, 0.2),
                                 2px 2px 4px rgba(0, 0, 0, 0.8)
                             `,
                             animation: 'breathe 4s ease-in-out infinite, glow-pulse 3s ease-in-out infinite'
                         }}
                     >
                         HARDI STORE
                     </h1>
                     
                     {/* Subtitle */}
                     <div className="flex items-center gap-2 mt-2 relative z-10">
                         <div className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--accent-main)]"></div>
                         <span className="text-xs font-bold tracking-[0.5em] text-[var(--accent-main)] uppercase animate-pulse" style={{ textShadow: '0 0 10px var(--accent-main)' }}>
                             {activeStore === 'clothes' ? t.storeClothes : t.storeShoes}
                         </span>
                         <div className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--accent-main)]"></div>
                     </div>

                     {/* Decorative Corner Brackets */}
                     <div className="absolute -left-16 -top-8 text-[var(--accent-main)]/30 text-6xl font-thin">╱</div>
                     <div className="absolute -right-16 -top-8 text-[var(--accent-main)]/30 text-6xl font-thin">╲</div>
                     <div className="absolute -left-16 -bottom-8 text-[var(--accent-main)]/30 text-6xl font-thin rotate-180">╲</div>
                     <div className="absolute -right-16 -bottom-8 text-[var(--accent-main)]/30 text-6xl font-thin rotate-180">╱</div>
                 </div>
            </div>

            {/* Right: System Status */}
            <div className="hidden md:block text-right relative z-20">
                <div className="text-xs text-[var(--accent-main)] font-[Orbitron] tracking-[0.2em] uppercase mb-2">System Online</div>
                <div className="flex items-center gap-3 justify-end">
                     <span className="w-2 h-2 bg-[var(--accent-main)] rounded-full animate-pulse shadow-[0_0_8px_var(--accent-main)]"></span>
                     <span className="font-[Orbitron] text-[var(--text-secondary)] text-sm">v1.7.1</span>
                </div>
            </div>
            
             {/* Mobile Menu Button */}
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-[var(--text-primary)] p-2 z-50">
                {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth p-6 md:p-8 pb-4">
          {/* Max Width Container for Laptop Optimization */}
          <div className="max-w-[1600px] mx-auto min-h-min flex flex-col">
             {activeTab === 'dashboard' && <Dashboard lang={lang} key={`${updateTrigger}-${activeStore}`} store={activeStore} />}
             {activeTab === 'sales' && <SalesTab lang={lang} onUpdate={handleUpdate} store={activeStore} />}
             {activeTab === 'inventory' && <PurchasesTab lang={lang} onUpdate={handleUpdate} store={activeStore} />}
             {activeTab === 'debts' && <DebtsTab lang={lang} onUpdate={handleUpdate} store={activeStore} />}
             {activeTab === 'settings' && (
                 <SettingsTab 
                    lang={lang} setLang={changeLang} 
                    theme={theme} setTheme={changeTheme}
                    accent={accent} setAccent={changeAccent}
                    onUpdate={handleUpdate} 
                 />
             )}
          </div>
        </main>
        
        {/* Footer Signature */}
        <footer className="h-14 shrink-0 flex items-center justify-between px-10 border-t border-[var(--glass-border)] bg-[var(--bg-primary)]">
            <span className="text-xs text-[var(--text-secondary)] font-[Rajdhani] uppercase tracking-widest opacity-50">Offline Desktop Edition</span>
            <span className="text-[var(--text-secondary)] font-[Rajdhani] uppercase tracking-widest text-sm flex items-center gap-2">
                Created by 
                <span className="text-[var(--accent-main)] font-black text-2xl font-[Orbitron] glow-text drop-shadow-[0_0_10px_var(--accent-glow)]">DYAR</span>
            </span>
        </footer>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute inset-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-xl pt-24 px-6 space-y-6 md:hidden overflow-y-auto">
            {/* Mobile Store Switcher */}
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={() => { setActiveStore('clothes'); setMobileMenuOpen(false); }}
                    className={`flex-1 py-4 rounded-xl font-bold font-[Orbitron] border ${activeStore === 'clothes' ? 'bg-[var(--accent-main)] text-black border-[var(--accent-main)]' : 'text-[var(--text-primary)] border-[var(--glass-border)]'}`}
                >
                    {t.storeClothes}
                </button>
                <button 
                    onClick={() => { setActiveStore('shoes'); setMobileMenuOpen(false); }}
                    className={`flex-1 py-4 rounded-xl font-bold font-[Orbitron] border ${activeStore === 'shoes' ? 'bg-[var(--accent-main)] text-black border-[var(--accent-main)]' : 'text-[var(--text-primary)] border-[var(--glass-border)]'}`}
                >
                    {t.storeShoes}
                </button>
            </div>

            <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className="w-full text-left p-6 rounded-xl bg-[var(--glass-bg)] text-[var(--text-primary)] text-xl font-[Orbitron] border border-[var(--glass-border)]">{t.dashboard}</button>
            <button onClick={() => { setActiveTab('sales'); setMobileMenuOpen(false); }} className="w-full text-left p-6 rounded-xl bg-[var(--glass-bg)] text-[var(--text-primary)] text-xl font-[Orbitron] border border-[var(--glass-border)]">{t.sales}</button>
            <button onClick={() => { setActiveTab('inventory'); setMobileMenuOpen(false); }} className="w-full text-left p-6 rounded-xl bg-[var(--glass-bg)] text-[var(--text-primary)] text-xl font-[Orbitron] border border-[var(--glass-border)]">{t.inventory}</button>
            <button onClick={() => { setActiveTab('debts'); setMobileMenuOpen(false); }} className="w-full text-left p-6 rounded-xl bg-[var(--glass-bg)] text-[var(--text-primary)] text-xl font-[var(--glass-border)]">{t.debts}</button>
            <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }} className="w-full text-left p-6 rounded-xl bg-[var(--glass-bg)] text-[var(--text-primary)] text-xl font-[Orbitron] border border-[var(--glass-border)]">{t.settings}</button>
        </div>
      )}

    </div>
  );
};

export default App;