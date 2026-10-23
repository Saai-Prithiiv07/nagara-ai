import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Cpu,
  FlaskConical,
  Scale,
  FileCheck2,
  Menu,
  X,
  Printer,
  Info,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ScenarioPreset } from '../types';

export type TabType = 'overview' | 'map' | 'planner' | 'scenarios' | 'equity' | 'recommendations';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentScenario: ScenarioPreset;
  onResetToBaseline: () => void;
  totalBudgetCr: number;
  onOpenReportModal: () => void;
  showHero: boolean;
  setShowHero: (show: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  currentScenario,
  onResetToBaseline,
  totalBudgetCr,
  onOpenReportModal,
  showHero,
  setShowHero
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: '1. Overview', icon: LayoutDashboard },
    { id: 'map', label: '2. City Digital Twin', icon: MapPin },
    { id: 'planner', label: '3. Sustainability Planner', icon: Cpu },
    { id: 'scenarios', label: '4. Scenario Lab', icon: FlaskConical },
    { id: 'equity', label: '5. Equity Analysis', icon: Scale },
    { id: 'recommendations', label: '6. Recommendations', icon: FileCheck2 },
  ];

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (showHero) {
      setShowHero(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-950/60 bg-[#050907]/92 backdrop-blur-2xl">
      {/* Top Banner Notice */}
      <div className="bg-emerald-950/35 border-b border-emerald-500/10 px-4 py-1.5 text-center text-[11px] text-emerald-300/80 flex items-center justify-center gap-2">
        <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-sans">
          Illustrative Decision-Support Demo — Greater Bengaluru Municipal Context. Synthetic GIS layers, not live telemetry.
        </span>
        <button
          onClick={onResetToBaseline}
          className="ml-2 text-emerald-400 hover:text-emerald-200 underline cursor-pointer inline-flex items-center gap-1 font-mono transition-colors"
          title="Reset to default ₹25 Cr & baseline scenario"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHero(!showHero)}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-600 to-emerald-900 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-400/35 transition-all">
                <div className="w-full h-full bg-[#07130f] rounded-[10px] flex items-center justify-center">
                  <span className="text-white font-extrabold text-lg font-display tracking-wider">N</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-lg tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    NAGARA
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-mono text-emerald-300 font-bold">
                    AI
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400/70 font-mono tracking-tight hidden sm:block">
                  Every Rupee. Every Neighbourhood.
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Nav Tabs with Animated Floating Backdrop Pill */}
          <nav className="hidden lg:flex items-center gap-1 relative bg-black/40 p-1 rounded-xl border border-emerald-900/40">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !showHero;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id as TabType)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-zinc-400 hover:text-emerald-200 hover:bg-emerald-950/30'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-emerald-500/25 border border-emerald-400/40 rounded-lg shadow-sm"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Badges & CTAs */}
          <div className="flex items-center gap-2.5">
            {/* Quick Scenario Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${currentScenario === 'baseline' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span className="capitalize">{currentScenario.replace('-', ' ')}</span>
            </div>

            {/* Quick Budget Badge */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-mono text-emerald-300 font-semibold shadow-sm">
              <span className="text-zinc-400">CapEx:</span>
              <span className="text-white font-bold">₹{totalBudgetCr} Cr</span>
            </div>

            {/* Executive Report Modal Trigger */}
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95"
              title="Export Executive Sustainability Dossier"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export Dossier</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden px-4 pt-2 pb-5 bg-[#060e0a] border-b border-emerald-900/50 space-y-1 overflow-hidden"
          >
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id as TabType)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
