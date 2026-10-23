import React from 'react';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  CloudRain,
  Flame,
  Droplets,
  DollarSign,
  RotateCcw,
  Sparkles,
  Sliders
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  ScenarioParams,
  ScenarioPreset,
  OptimisationResult,
  BudgetConfig
} from '../types';
import { SCENARIO_PRESETS } from '../lib/scenarios/scenarioEngine';

interface ScenarioLabProps {
  currentScenario: ScenarioPreset;
  onSelectScenarioPreset: (preset: ScenarioPreset) => void;
  activeScenarioParams: ScenarioParams;
  onUpdateScenarioParams: (params: ScenarioParams) => void;
  optimisationResult: OptimisationResult;
  budgetConfig: BudgetConfig;
}

// Custom Glassmorphic Tooltip
const CustomScenarioTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-[#08140f]/95 border border-cyan-500/35 backdrop-blur-xl shadow-2xl text-xs space-y-1 font-sans">
        <div className="font-bold text-white font-display border-b border-zinc-800 pb-1 flex justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] font-mono text-cyan-400">Stress Test</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5" style={{ color: entry.fill }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span className="text-zinc-300 font-sans">{entry.name}:</span>
            </span>
            <span className="font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ScenarioLab: React.FC<ScenarioLabProps> = ({
  currentScenario,
  onSelectScenarioPreset,
  activeScenarioParams,
  onUpdateScenarioParams,
  optimisationResult,
  budgetConfig
}) => {
  const presets: ScenarioPreset[] = [
    'baseline',
    'extreme-monsoon',
    'severe-drought',
    'urban-heatwave',
    'fiscal-austerity'
  ];

  const handleCustomParamChange = (field: keyof ScenarioParams, val: number) => {
    onUpdateScenarioParams({
      ...activeScenarioParams,
      [field]: val
    });
  };

  // Compare baseline vs current scenario outcomes
  const scenarioComparisonData = [
    {
      metric: 'Heat Hazard',
      Baseline: 62.1,
      Simulated: optimisationResult.cityHeatRisk.after
    },
    {
      metric: 'Flood Hazard',
      Baseline: 65.0,
      Simulated: optimisationResult.cityFloodRisk.after
    },
    {
      metric: 'Water Stress',
      Baseline: 74.4,
      Simulated: optimisationResult.cityWaterStress.after
    },
    {
      metric: 'Sustainability',
      Baseline: 48.5,
      Simulated: optimisationResult.overallSustainabilityIndex.after
    }
  ];

  return (
    <div className="space-y-8 pb-14">
      {/* Scenario Lab Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-7 rounded-3xl glass-panel-elevated border border-emerald-500/25 shadow-2xl bg-gradient-to-r from-[#071d18] via-[#09221c] to-[#051410] flex flex-col md:flex-row md:items-center justify-between gap-5"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-2">
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
            <span>Climate Stress Testing & Scenario Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Scenario Lab: Municipal Climate Shock Tests
          </h2>
          <p className="text-sm text-emerald-200/75 mt-1.5 max-w-2xl leading-relaxed">
            Simulate how extreme weather shocks alter optimal intervention strategies. When a cloudburst strikes, the decision engine automatically reallocates capital to sponge drainage corridors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onSelectScenarioPreset('baseline')}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Reset to Baseline</span>
          </button>
        </div>
      </motion.div>

      {/* Preset Scenario Cards with Cinematic Atmospheric Backdrops */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {presets.map(key => {
          const preset = SCENARIO_PRESETS[key];
          const isSelected = currentScenario === key;

          const scenarioImageMap: Record<string, string> = {
            'baseline': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80',
            'extreme-monsoon': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=400&q=80',
            'severe-drought': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
            'urban-heatwave': 'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=400&q=80',
            'fiscal-austerity': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
          };

          return (
            <motion.div
              key={key}
              whileHover={{ y: -3 }}
              onClick={() => onSelectScenarioPreset(key)}
              className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group min-h-[175px] ${
                isSelected
                  ? 'border-emerald-400 shadow-xl shadow-emerald-950/80 ring-2 ring-emerald-400/40'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Cinematic Weather Photography Backdrop with Dark Mask */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-25"
                style={{ backgroundImage: `url('${scenarioImageMap[key]}')` }}
              />
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#060e0a] via-[#060e0a]/85 to-[#060e0a]/70" />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-emerald-400 ring-4 ring-emerald-500/25' : 'bg-zinc-600'}`} />
                  {isSelected && (
                    <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider bg-emerald-500/30 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mt-2.5 font-display tracking-tight">{preset.name}</h4>
                <p className="text-[11px] text-zinc-300/90 mt-1 line-clamp-3 leading-snug">
                  {preset.tagline}
                </p>
              </div>

              <div className="relative z-10 mt-4 pt-2.5 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Rain: <span className="text-cyan-300">{preset.rainfallMultiplier}x</span></span>
                <span>Heat: <span className="text-amber-300">{preset.heatMultiplier}x</span></span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Sliders & Live Scenario Dynamic Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Sliders (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-3xl glass-panel border border-emerald-500/20 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display">Parametric Scenario Knobs</h3>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">Continuous Stress Tuning</span>
          </div>

          {/* Rainfall Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                <span>Monsoonal Deluge Surge:</span>
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {activeScenarioParams.rainfallMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="3.0"
              step="0.1"
              value={activeScenarioParams.rainfallMultiplier}
              onChange={e => handleCustomParamChange('rainfallMultiplier', Number(e.target.value))}
              className="w-full accent-cyan-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0.3x (Arid Deficit)</span>
              <span>1.0x (Normal)</span>
              <span>3.0x (Cloudburst Flash)</span>
            </div>
          </div>

          {/* Temperature Anomaly */}
          <div className="space-y-2 pt-3 border-t border-zinc-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Urban Heat Island Factor:</span>
              </span>
              <span className="font-mono font-bold text-amber-300">
                {activeScenarioParams.heatMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.05"
              value={activeScenarioParams.heatMultiplier}
              onChange={e => handleCustomParamChange('heatMultiplier', Number(e.target.value))}
              className="w-full accent-amber-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0.8x (Mild Spring)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Extreme 44°C Peak)</span>
            </div>
          </div>

          {/* Water Stress Multiplier */}
          <div className="space-y-2 pt-3 border-t border-zinc-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Aquifer Stress Multiplier:</span>
              </span>
              <span className="font-mono font-bold text-blue-300">
                {activeScenarioParams.waterStressMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={activeScenarioParams.waterStressMultiplier}
              onChange={e => handleCustomParamChange('waterStressMultiplier', Number(e.target.value))}
              className="w-full accent-blue-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Budget Shock Factor */}
          <div className="space-y-2 pt-3 border-t border-zinc-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Municipal Fiscal Multiplier:</span>
              </span>
              <span className="font-mono font-bold text-emerald-300">
                {activeScenarioParams.budgetMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="1.5"
              step="0.05"
              value={activeScenarioParams.budgetMultiplier}
              onChange={e => handleCustomParamChange('budgetMultiplier', Number(e.target.value))}
              className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0.4x (Severe Austerity)</span>
              <span>1.0x (Full Budget)</span>
              <span>1.5x (Federal Stimulus)</span>
            </div>
          </div>
        </div>

        {/* Right: Comparative Stress Test Visualisation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-7 rounded-3xl glass-panel border border-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Scenario Resilience Footprint
                </h3>
                <p className="text-xs text-zinc-400">
                  Comparing Historical Baseline vs Real-Time Dynamic Scenario Response
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
                {activeScenarioParams.name}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="metric" stroke="#6b7280" fontSize={11} tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} />
                  <Tooltip content={<CustomScenarioTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Strategic Shift Explanation */}
            <div className="mt-5 p-4 rounded-2xl bg-zinc-950/75 border border-emerald-500/20 text-xs text-zinc-300 space-y-2">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modelled Strategic Shift in Allocation:</span>
              </div>
              <p className="leading-relaxed">
                {currentScenario === 'extreme-monsoon' &&
                  'Under severe cloudburst shocks, the marginal utility of Bioswale & Sponge City corridors spikes by 240%. The optimiser shifts capital out of canopy expansion towards high-volume detention basins in Bellandur and Koramangala.'}
                {currentScenario === 'severe-drought' &&
                  'Under acute water table collapse, decentralized Rainwater Harvesting wells yield the highest risk-mitigation ratio. Funds are prioritized into outer peri-urban wards (Whitefield & Electronic City) to prevent tanker crisis disruption.'}
                {currentScenario === 'urban-heatwave' &&
                  'Under extreme heatwaves, Miyawaki forests and vegetative cool roofs receive top priority. Peenya and Shivajinagar industrial clusters are allocated maximal units to blunt heat mortality.'}
                {currentScenario === 'fiscal-austerity' &&
                  'Under a 40% capital reduction, the optimiser executes surgical deployment: low-cost high-density Sedum roofs and targeted recharge pits are retained while expensive civil drainage corridors are phased.'}
                {currentScenario === 'baseline' &&
                  'Baseline normal conditions yield a balanced portfolio across heat abatement, stormwater detention, and groundwater recharge.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
