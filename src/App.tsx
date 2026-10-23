import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroSection } from './components/HeroSection';
import { Navigation, TabType } from './components/Navigation';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { DigitalTwinMap } from './pages/DigitalTwinMap';
import { SustainabilityPlanner } from './pages/SustainabilityPlanner';
import { ScenarioLab } from './pages/ScenarioLab';
import { EquityAnalysis } from './pages/EquityAnalysis';
import { Recommendations } from './pages/Recommendations';
import { ReportModal } from './components/ReportModal';
import { NEIGHBOURHOODS } from './data/neighbourhoods';
import { SCENARIO_PRESETS } from './lib/scenarios/scenarioEngine';
import { runOptimisationEngine } from './lib/optimisation/engine';
import {
  BudgetConfig,
  ScenarioPreset,
  ScenarioParams,
  OptimisationResult
} from './types';
import { ArrowUp, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { AnimatedCounter } from './components/AnimatedCounter';

const STORAGE_KEY_BUDGET = 'nagara_ai_budget_v1';
const STORAGE_KEY_EQUITY = 'nagara_ai_equity_v1';

export function App() {
  const [showHero, setShowHero] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<ScenarioPreset>('baseline');
  const [activeScenarioParams, setActiveScenarioParams] = useState<ScenarioParams>(
    SCENARIO_PRESETS.baseline
  );
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Initialize Budget Config with localStorage persistence where available
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(() => {
    try {
      const savedBudget = localStorage.getItem(STORAGE_KEY_BUDGET);
      const savedEquity = localStorage.getItem(STORAGE_KEY_EQUITY);
      return {
        totalBudgetCr: savedBudget ? Number(savedBudget) : 25,
        equityWeight: savedEquity ? Number(savedEquity) : 0.5,
        activeInterventions: [
          'urban-forest',
          'green-roof',
          'rainwater-harvest',
          'drainage-sponge'
        ],
        riskFocus: 'balanced'
      };
    } catch {
      return {
        totalBudgetCr: 25,
        equityWeight: 0.5,
        activeInterventions: [
          'urban-forest',
          'green-roof',
          'rainwater-harvest',
          'drainage-sponge'
        ],
        riskFocus: 'balanced'
      };
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET, budgetConfig.totalBudgetCr.toString());
      localStorage.setItem(STORAGE_KEY_EQUITY, budgetConfig.equityWeight.toString());
    } catch {
      // Ignore if localStorage is restricted
    }
  }, [budgetConfig.totalBudgetCr, budgetConfig.equityWeight]);

  // Reactive Optimisation Calculation
  const optimisationResult: OptimisationResult = useMemo(() => {
    return runOptimisationEngine(NEIGHBOURHOODS, budgetConfig, activeScenarioParams);
  }, [budgetConfig, activeScenarioParams]);

  // Quick reset to default settings
  const handleResetToBaseline = () => {
    setCurrentScenario('baseline');
    setActiveScenarioParams(SCENARIO_PRESETS.baseline);
    setBudgetConfig({
      totalBudgetCr: 25,
      equityWeight: 0.5,
      activeInterventions: [
        'urban-forest',
        'green-roof',
        'rainwater-harvest',
        'drainage-sponge'
      ],
      riskFocus: 'balanced'
    });
    setSelectedWardId(null);
  };

  const handleSelectScenarioPreset = (preset: ScenarioPreset) => {
    setCurrentScenario(preset);
    setActiveScenarioParams(SCENARIO_PRESETS[preset]);
  };

  // Navigation handlers
  const handleExploreMap = (wardId?: string) => {
    setShowHero(false);
    setActiveTab('map');
    if (wardId) {
      setSelectedWardId(wardId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRunPlanner = (wardId?: string) => {
    setShowHero(false);
    setActiveTab('planner');
    if (wardId) {
      setSelectedWardId(wardId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050907] text-[#e5ece8] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Sticky Header */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentScenario={currentScenario}
        onResetToBaseline={handleResetToBaseline}
        totalBudgetCr={budgetConfig.totalBudgetCr}
        onOpenReportModal={() => setReportModalOpen(true)}
        showHero={showHero}
        setShowHero={setShowHero}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {showHero ? (
          <HeroSection
            onExploreMap={() => handleExploreMap()}
            onRunPlanner={() => handleRunPlanner()}
          />
        ) : null}

        {/* Tabbed Interactive Workspace */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Quick HUD bar if Hero is collapsed */}
          {!showHero && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-7 p-3.5 rounded-2xl glass-panel border border-emerald-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHero(true)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>← Hero Experience</span>
                </button>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-200 capitalize font-bold">
                  {activeTab.replace('-', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-3.5 font-mono text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Modelled Score: </span>
                  <span className="font-bold text-white">
                    <AnimatedCounter value={optimisationResult.overallSustainabilityIndex.after} />/100
                  </span>
                </span>
                <span className="text-zinc-700">|</span>
                <span className="text-zinc-300">
                  CapEx Utilised:{' '}
                  <span className="font-bold text-emerald-300">
                    ₹<AnimatedCounter value={optimisationResult.totalCostCr} decimals={2} /> Cr
                  </span>
                </span>
              </div>
            </motion.div>
          )}

          {/* Tab Views with Animation */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <OverviewDashboard
                  wards={NEIGHBOURHOODS}
                  optimisationResult={optimisationResult}
                  onNavigateToMap={handleExploreMap}
                  onNavigateToPlanner={handleRunPlanner}
                  totalBudgetCr={budgetConfig.totalBudgetCr}
                />
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <DigitalTwinMap
                  wards={NEIGHBOURHOODS}
                  selectedWardId={selectedWardId}
                  onSelectWard={setSelectedWardId}
                  optimisationResult={optimisationResult}
                  onPlanForWard={handleRunPlanner}
                />
              </motion.div>
            )}

            {activeTab === 'planner' && (
              <motion.div
                key="planner"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <SustainabilityPlanner
                  wards={NEIGHBOURHOODS}
                  budgetConfig={budgetConfig}
                  onUpdateBudgetConfig={setBudgetConfig}
                  optimisationResult={optimisationResult}
                  onTriggerOptimisation={() => {
                    setBudgetConfig({ ...budgetConfig });
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'scenarios' && (
              <motion.div
                key="scenarios"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <ScenarioLab
                  currentScenario={currentScenario}
                  onSelectScenarioPreset={handleSelectScenarioPreset}
                  activeScenarioParams={activeScenarioParams}
                  onUpdateScenarioParams={setActiveScenarioParams}
                  optimisationResult={optimisationResult}
                  budgetConfig={budgetConfig}
                />
              </motion.div>
            )}

            {activeTab === 'equity' && (
              <motion.div
                key="equity"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <EquityAnalysis
                  wards={NEIGHBOURHOODS}
                  allocations={optimisationResult.allocations}
                  budgetConfig={budgetConfig}
                  onUpdateEquityWeight={(val) =>
                    setBudgetConfig({ ...budgetConfig, equityWeight: val })
                  }
                />
              </motion.div>
            )}

            {activeTab === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <Recommendations
                  wards={NEIGHBOURHOODS}
                  optimisationResult={optimisationResult}
                  budgetConfig={budgetConfig}
                  currentScenario={activeScenarioParams}
                  onOpenReportModal={() => setReportModalOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Official Executive Dossier Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        wards={NEIGHBOURHOODS}
        optimisationResult={optimisationResult}
        budgetConfig={budgetConfig}
        scenario={activeScenarioParams}
      />

      {/* Comprehensive Climate-Tech Footer */}
      <footer className="border-t border-emerald-950/60 bg-[#030605] py-12 mt-20 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="font-display font-extrabold text-white text-base tracking-tight">NAGARA AI</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 font-bold">
                ENTERPRISE DECISION PROTOCOL v2.4
              </span>
            </div>
            <p className="text-zinc-400 text-xs italic font-display">
              "Every Rupee. Every Neighbourhood. A Better City."
            </p>
            <p className="text-[11px] text-zinc-500 leading-relaxed max-w-md">
              AI-driven urban sustainability decision engine for Indian municipal planning, disaster risk reduction, and equitable capital allocation.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400 text-xs font-medium">
            <button
              onClick={() => {
                setShowHero(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back to Hero</span>
            </button>
            <button
              onClick={() => setReportModalOpen(true)}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Export Executive Dossier
            </button>
            <button
              onClick={handleResetToBaseline}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Reset Baseline
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
