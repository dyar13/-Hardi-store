import React from 'react';
import { Language, ThemeMode, AccentColor } from '../types';
import { TRANSLATIONS } from '../constants';
import { exportToJSON, importFromJSON, clearAllData } from '../services/storageService';
import { Globe, Palette, Moon, Sun, Download, Upload, Trash2 } from 'lucide-react';interface SettingsTabProps {
  lang: Language;
  setLang: (l: Language) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  accent: AccentColor;
  setAccent: (c: AccentColor) => void;
  onUpdate: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ lang, setLang, theme, setTheme, accent, setAccent, onUpdate }) => {
  const t = TRANSLATIONS[lang];

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importFromJSON(file);
        alert(t.importSuccess);
        onUpdate();
      } catch (err) {
        alert(t.importError);
      }
    }
  };

  const handleClear = async () => {
    if (confirm(t.confirmClear)) {
      await clearAllData();
      onUpdate();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8 font-[Orbitron] uppercase tracking-wider">{t.settings}</h2>

      {/* Language Section */}
      <div className="glass-panel p-8 rounded-xl">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-3 font-[Rajdhani]">
            <Globe size={20} className="text-[var(--accent-main)]" />
            {t.language}
        </h3>
        <div className="flex gap-4">
          <button 
            onClick={() => setLang('en')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all uppercase tracking-widest font-[Orbitron] ${lang === 'en' ? 'bg-[var(--accent-main)] text-[#02040a] shadow-[0_0_15px_var(--accent-glow)]' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white border border-[var(--glass-border)]'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLang('ku')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all uppercase tracking-widest font-[Orbitron] ${lang === 'ku' ? 'bg-[var(--accent-main)] text-[#02040a] shadow-[0_0_15px_var(--accent-glow)]' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white border border-[var(--glass-border)]'}`}
          >
            کوردی
          </button>
        </div>
      </div>

      {/* Theme Section */}
      <div className="glass-panel p-8 rounded-xl">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-3 font-[Rajdhani]">
            <Palette size={20} className="text-[var(--accent-main)]" />
            {t.theme}
        </h3>
        
        {/* Dark/Light Mode */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setTheme('dark')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all uppercase tracking-widest font-[Orbitron] flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-[#0f172a] text-white border border-[var(--accent-main)]' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--glass-border)]'}`}
          >
            <Moon size={18} />
            {t.darkMode}
          </button>
          <button 
            onClick={() => setTheme('light')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all uppercase tracking-widest font-[Orbitron] flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-white text-slate-800 border border-[var(--accent-main)]' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--glass-border)]'}`}
          >
            <Sun size={18} />
            {t.lightMode}
          </button>
        </div>

        {/* Accent Colors */}
        <h4 className="text-sm text-[var(--text-secondary)] mb-4 font-bold uppercase tracking-wider">{t.accentColor}</h4>
        <div className="flex gap-4">
            <button 
                onClick={() => setAccent('green')}
                className={`flex-1 h-12 rounded-xl transition-all border-2 ${accent === 'green' ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                style={{ backgroundColor: '#00f5a0', boxShadow: accent === 'green' ? '0 0 15px rgba(0, 245, 160, 0.4)' : 'none' }}
            />
            <button 
                onClick={() => setAccent('blue')}
                className={`flex-1 h-12 rounded-xl transition-all border-2 ${accent === 'blue' ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                style={{ backgroundColor: '#00d9f5', boxShadow: accent === 'blue' ? '0 0 15px rgba(0, 217, 245, 0.4)' : 'none' }}
            />
            <button 
                onClick={() => setAccent('rose')}
                className={`flex-1 h-12 rounded-xl transition-all border-2 ${accent === 'rose' ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                style={{ backgroundColor: '#ff2a6d', boxShadow: accent === 'rose' ? '0 0 15px rgba(255, 42, 109, 0.4)' : 'none' }}
            />
        </div>
      </div>

      {/* Data Management Section */}
      <div className="glass-panel p-8 rounded-xl">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 font-[Rajdhani]">{t.exportData}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => exportToJSON()}
            className="flex items-center justify-center gap-3 bg-[var(--bg-secondary)] hover:bg-[var(--glass-border)] border border-[var(--glass-border)] text-[var(--text-primary)] font-bold py-4 px-6 rounded-xl transition-all font-[Orbitron] uppercase tracking-wider"
          >
            <Download size={20} className="text-[var(--accent-main)]"/>
            {t.exportData}
          </button>
          <label className="flex items-center justify-center gap-3 bg-[var(--bg-secondary)] hover:bg-[var(--glass-border)] border border-[var(--glass-border)] text-[var(--text-primary)] font-bold py-4 px-6 rounded-xl transition-all cursor-pointer font-[Orbitron] uppercase tracking-wider">
            <Upload size={20} className="text-[#00d9f5]"/>
            {t.importData}
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-[#ff2a6d]/30 bg-[#ff2a6d]/5 rounded-xl p-8 shadow-[0_0_20px_rgba(255,42,109,0.05)]">
        <h3 className="text-lg font-bold text-[#ff2a6d] mb-4 font-[Orbitron] uppercase tracking-wider">{t.dangerZone}</h3>
        <button 
          onClick={handleClear}
          className="w-full flex items-center justify-center gap-3 bg-[#ff2a6d]/10 hover:bg-[#ff2a6d] text-[#ff2a6d] hover:text-[#02040a] border border-[#ff2a6d] font-bold py-4 px-6 rounded-xl transition-all font-[Orbitron] uppercase tracking-wider"
        >
          <Trash2 size={20} />
          {t.clearAll}
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
