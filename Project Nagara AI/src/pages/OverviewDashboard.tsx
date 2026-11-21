import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  CloudRain,
  Droplets,
  TreePine,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldAlert,
  Sliders,
  ChevronRight,
  Activity,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { Neighbourhood, OptimisationResult } from '../types';
import { AnimatedCounter } from '../components/AnimatedCounter';

interface OverviewDashboardProps {
  wards: Neighbourhood[];
  optimisationResult: OptimisationResult;
  onNavigateToMap: (wardId?: string) => void;
  onNavigateToPlanner: () => void;
  totalBudgetCr: number;
}

// Custom Glassmorphic Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-[#091510]/95 border border-emerald-500/35 backdrop-blur-xl shadow-2xl text-xs space-y-1.5 font-sans">
        <div className="font-bold text-white font-display border-b border-zinc-800 pb-1 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] font-mono text-emerald-400">Diagnostic</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5" style={{ color: entry.color || entry.fill }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
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

// Helper for ward archetype photography
const getWardArchetypeImage = (wardId: string) => {
  if (wardId.includes('peenya')) return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80'; // Industrial fabric
  if (wardId.includes('bellandur')) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80'; // Lake catchment
  if (wardId.includes('krpuram')) return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500&q=80'; // Transit & rail node
  if (wardId.includes('shivajinagar')) return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=500&q=80'; // Dense historic commercial
  if (wardId.includes('jayanagar')) return 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=80'; // Urban canopy
  if (wardId.includes('whitefield')) return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80'; // Tech corridor
  return 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=500&q=80';
};

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  wards,
  optimisationResult,
  onNavigateToMap,
  onNavigateToPlanner,
  totalBudgetCr
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Radar data comparing citywide average risks
  const radarData = [
    {
      hazard: 'Heat Island',
      Baseline: 62.1,
      'Post-Optimisation': optimisationResult.cityHeatRisk.after,
      fullMark: 100
    },
    {
      hazard: 'Flood Hazard',
      Baseline: 65.0,
      'Post-Optimisation': optimisationResult.cityFloodRisk.after,
      fullMark: 100
    },
    {
      hazard: 'Water Stress',
      Baseline: 74.4,
      'Post-Optimisation': optimisationResult.cityWaterStress.after,
      fullMark: 100
    },
    {
      hazard: 'Canopy Void',
      Baseline: 100 - 15.6,
      'Post-Optimisation': Number((100 - optimisationResult.cityGreenCoverPct.after).toFixed(1)),
      fullMark: 100
    },
    {
      hazard: 'Spatial Inequity',
      Baseline: 44.2,
      'Post-Optimisation': Number((optimisationResult.equityGiniCoefficient.after * 100).toFixed(1)),
      fullMark: 100
    }
  ];

  // Bar chart data for ward-level thermal vs green cover
  const wardBarData = wards.map(w => ({
    name: w.name.split(' ')[0],
    fullName: w.name,
    heatRisk: w.baselineHeatRisk,
    floodRisk: w.baselineFloodRisk,
    greenCover: w.baselineGreenCoverPct,
    vulnerability: w.socioEconomicVulnerability
  }));

  // Identify high-priority wards
  const priorityWards = [...wards]
    .map(w => {
      const composite = Math.round(
        w.baselineHeatRisk * 0.3 + w.baselineFloodRisk * 0.35 + w.baselineWaterStress * 0.25 + w.socioEconomicVulnerability * 0.1
      );
      return { ...w, compositeRisk: composite };
    })
    .sort((a, b) => b.compositeRisk - a.compositeRisk)
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-14">
      {/* Overview Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 p-7 rounded-3xl glass-panel-elevated border border-emerald-500/25 shadow-2xl bg-gradient-to-r from-[#071d14] via-[#092218] to-[#05140e]"
      >
        {/* Subtle Photographic Smart City Backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-screen"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071d14]/90 via-[#071d14]/75 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Macro City Sustainability Diagnostics • v2.4</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1.5 tracking-tight">
            Greater Bengaluru Urban Agglomeration
          </h2>
          <p className="text-sm text-emerald-200/75 mt-1.5 max-w-2xl leading-relaxed">
            Real-time synthesis across 10 indicative municipal wards representing 1.87M citizens. Evaluating multi-hazard climate vulnerabilities and optimal capital interventions.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={onNavigateToPlanner}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2.5 transition-all cursor-pointer active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span>Open Decision Planner</span>
          </button>
        </div>
      </motion.div>

      {/* Top 6 Stat Cards with Animated Counter Rollers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Sustainability Index */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl glass-panel border border-emerald-500/20 relative group transition-all"
        >
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
            <span>SUSTAINABILITY INDEX</span>
            <div className="relative">
              <Info
                className="w-3.5 h-3.5 text-emerald-400/60 cursor-pointer hover:text-emerald-300"
                onMouseEnter={() => setActiveTooltip('sustain')}
                onMouseLeave={() => setActiveTooltip(null)}
              />
              {activeTooltip === 'sustain' && (
                <div className="absolute top-5 right-0 z-30 w-56 p-3 rounded-xl bg-zinc-950 border border-emerald-500/40 text-[11px] text-zinc-300 shadow-2xl pointer-events-none">
                  Composite 0–100 urban resilience score synthesising heat, flooding, aquifer recharge, and canopy coverage.
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              <AnimatedCounter value={optimisationResult.overallSustainabilityIndex.after} />
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{optimisationResult.overallSustainabilityIndex.deltaPct}% post-interventions</span>
          </div>
        </motion.div>

        {/* Urban Heat Risk */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl glass-panel border border-amber-500/20 relative transition-all"
        >
          <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
            <span>URBAN HEAT RISK</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-amber-300">
              <AnimatedCounter value={optimisationResult.cityHeatRisk.after} decimals={1} />
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>{optimisationResult.cityHeatRisk.deltaPct}% cooler micro-zones</span>
          </div>
        </motion.div>

        {/* Flood Risk */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl glass-panel border border-cyan-500/20 relative transition-all"
        >
          <div className="flex items-center justify-between text-xs text-cyan-400 font-mono">
            <span>FLOOD HAZARD INDEX</span>
            <CloudRain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-300">
              <AnimatedCounter value={optimisationResult.cityFloodRisk.after} decimals={1} />
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{optimisationResult.cityFloodRisk.deltaPct}% inundation reduction</span>
          </div>
        </motion.div>

        {/* Water Stress */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl glass-panel border border-blue-500/20 relative transition-all"
        >
          <div className="flex items-center justify-between text-xs text-blue-400 font-mono">
            <span>WATER STRESS</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-blue-300">
              <AnimatedCounter value={optimisationResult.cityWaterStress.after} decimals={1} />
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{optimisationResult.cityWaterStress.deltaPct}% tanker relief</span>
          </div>
        </motion.div>

        {/* Green Cover */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl glass-panel border border-emerald-500/20 relative transition-all"
        >
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
            <span>CITY GREEN COVER</span>
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-300">
              <AnimatedCounter value={optimisationResult.cityGreenCoverPct.after} decimals={1} suffix="%" />
            </span>
            <span className="text-xs text-zinc-400 font-mono">canopy</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{optimisationResult.cityGreenCoverPct.deltaPct}% canopy gain</span>
          </div>
        </motion.div>

        {/* Planning Budget */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl glass-panel border border-teal-500/20 relative transition-all"
        >
          <div className="flex items-center justify-between text-xs text-teal-400 font-mono">
            <span>PLANNING BUDGET</span>
            <Wallet className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              ₹<AnimatedCounter value={totalBudgetCr} />
            </span>
            <span className="text-xs text-teal-300/80 font-mono">Cr</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400 flex items-center justify-between">
            <span>Spend: ₹{optimisationResult.totalCostCr} Cr</span>
            <span className="text-emerald-400 font-bold">{optimisationResult.budgetUtilizationPct}%</span>
          </div>
        </motion.div>
      </div>

      {/* Main Charts: Multi-Hazard Radar & Ward Vulnerability Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Chart (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-3xl glass-panel border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white font-display">Citywide Hazard Footprint</h3>
              <p className="text-xs text-zinc-400">Baseline Risk vs Post-Optimisation Contraction</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
              Pareto Model
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="rgba(16, 185, 129, 0.18)" />
                <PolarAngleAxis
                  dataKey="hazard"
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#6b7280', fontSize: 9 }}
                />
                <Radar
                  name="Current Baseline"
                  dataKey="Baseline"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Optimised Portfolio"
                  dataKey="Post-Optimisation"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.42}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Tooltip content={<CustomChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[11px] text-zinc-400 text-center italic leading-relaxed">
            Outer perimeter represents peak hazard exposure. The green polygon illustrates the contracted risk boundary under optimal capital allocation.
          </p>
        </div>

        {/* Bar Chart (7 cols) */}
        <div className="lg:col-span-7 p-7 rounded-3xl glass-panel border border-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-white font-display">Ward-Level Vulnerability & Canopy Inequity</h3>
                <p className="text-xs text-zinc-400">Heat Island Severity (Amber) vs Existing Green Cover % (Emerald)</p>
              </div>
              <span className="text-xs font-mono text-emerald-400">10 Ward Diagnostics</span>
            </div>

            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={11}
                    tick={{ fill: '#9ca3af' }}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="heatRisk" name="Heat Island Risk (0-100)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="greenCover" name="Green Cover %" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-950/40 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Significant spatial disparity: Peenya (7.2% canopy) vs Jayanagar (32.4% canopy).</span>
            <button
              onClick={() => onNavigateToMap()}
              className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Explore Spatial Twin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hydrological Valley Catchments & Ecological Corridors */}
      <div className="p-6 rounded-3xl glass-panel border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-zinc-950 to-teal-950/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <CloudRain className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Greater Bengaluru Primary Hydrological Basins & Drainage Corridors
              </h3>
              <p className="text-xs text-zinc-400">
                Macro-watershed vulnerability status governing ward-level flood cascading and aquifer recharge.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-semibold">
            Catchment Diagnostics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vrishabhavathi Basin */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/35 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white font-display">Vrishabhavathi Basin (West)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Runoff 84%
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Wards: Peenya, Malleshwaram • High impervious concrete density, acute thermal heat retention.
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '84%' }} />
            </div>
          </div>

          {/* K&C Valley Basin */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-cyan-500/35 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white font-display">K&C Valley Basin (East)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                Runoff 92%
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Wards: Bellandur, Koramangala, Whitefield • Critical flash-flood choke point, requires bioswales.
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full" style={{ width: '92%' }} />
            </div>
          </div>

          {/* Hebbal Basin */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-emerald-500/35 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white font-display">Hebbal Basin (North)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Recharge 68%
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Wards: Yelahanka, Northern peri-urban belt • Prime opportunity for Miyawaki forests & recharge wells.
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '68%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Priority Neighbourhoods Section */}
      <div className="p-7 rounded-3xl glass-panel border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Neighbourhoods Requiring Priority Intervention</h3>
              <p className="text-xs text-zinc-400">Identified via multi-hazard vulnerability index (Socio-economic stress + Climate exposure)</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
            Top 4 Critical Clusters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {priorityWards.map(ward => (
            <motion.div
              key={ward.id}
              whileHover={{ y: -3 }}
              className="rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-lg overflow-hidden group"
            >
              <div>
                {/* Ward Archetype Photographic Header */}
                <div className="relative h-28 w-full overflow-hidden">
                  <img
                    src={getWardArchetypeImage(ward.id)}
                    alt={ward.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                  
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold text-emerald-200 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                      Ward #{ward.wardNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-red-950/90 border border-red-500/50 text-red-300 backdrop-blur-md shadow-md">
                      Risk {ward.compositeRisk}/100
                    </span>
                  </div>

                  <div className="absolute bottom-1.5 left-3 right-3">
                    <h4 className="text-sm font-bold text-white font-display truncate drop-shadow">{ward.name}</h4>
                    <div className="text-[10px] text-zinc-300 font-mono">{ward.zone}</div>
                  </div>
                </div>

                <div className="p-4 pt-2">
                  <p className="text-xs text-zinc-300 leading-snug line-clamp-2">
                    {ward.primaryVulnerabilityNote}
                  </p>

                  {/* Micro Risk Bars */}
                  <div className="mt-3 space-y-1.5 text-[10px] font-mono">
                    <div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Heat:</span>
                        <span className="text-amber-300">{ward.baselineHeatRisk}/100</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${ward.baselineHeatRisk}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Flood:</span>
                        <span className="text-cyan-300">{ward.baselineFloodRisk}/100</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${ward.baselineFloodRisk}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => onNavigateToMap(ward.id)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Locate on Twin</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-zinc-500 font-mono">{(ward.population / 1000).toFixed(0)}k pop</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
