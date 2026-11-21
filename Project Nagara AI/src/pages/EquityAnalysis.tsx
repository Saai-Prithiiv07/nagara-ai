import React from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  ShieldAlert,
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Neighbourhood, AllocationItem, BudgetConfig } from '../types';
import { computeEquityAnalysis } from '../lib/equity/equityEngine';

// Ward archetype image helper
const getWardArchetypeImage = (wardId: string) => {
  if (wardId.includes('peenya')) return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80';
  if (wardId.includes('bellandur')) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
  if (wardId.includes('krpuram')) return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80';
  if (wardId.includes('shivajinagar')) return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80';
  return 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=400&q=80';
};

interface EquityAnalysisProps {
  wards: Neighbourhood[];
  allocations: AllocationItem[];
  budgetConfig: BudgetConfig;
  onUpdateEquityWeight: (weight: number) => void;
}

// Custom Glassmorphic Tooltip for Lorenz Curve
const CustomLorenzTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-[#120b1b]/95 border border-purple-500/40 backdrop-blur-xl shadow-2xl text-xs space-y-1 font-sans">
        <div className="font-bold text-white font-display border-b border-zinc-800 pb-1 flex justify-between gap-4">
          <span>Population: {label}%</span>
          <span className="text-[10px] font-mono text-purple-400">Lorenz Point</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs font-mono">
            <span className="text-zinc-300 font-sans">{entry.name}:</span>
            <span className="font-bold text-white">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const EquityAnalysis: React.FC<EquityAnalysisProps> = ({
  wards,
  allocations,
  budgetConfig,
  onUpdateEquityWeight
}) => {
  const equityAnalysis = computeEquityAnalysis(
    wards,
    allocations,
    budgetConfig.totalBudgetCr
  );

  return (
    <div className="space-y-8 pb-14">
      {/* Equity Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden p-7 rounded-3xl glass-panel-elevated border border-purple-500/25 shadow-2xl bg-gradient-to-r from-[#170e24] via-[#12131a] to-[#07130f] flex flex-col md:flex-row md:items-center justify-between gap-5"
      >
        {/* Subtle Photographic Urban Fabric Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-12 pointer-events-none mix-blend-screen"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#170e24]/90 via-[#170e24]/75 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-mono mb-2">
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            <span>Socio-Spatial Justice & Equity Audit</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Environmental Equity & Benefit Distribution
          </h2>
          <p className="text-sm text-zinc-300 mt-1.5 max-w-2xl leading-relaxed">
            Examine whether climate investments reach marginalized, high-vulnerability communities or concentrate solely in affluent commercial corridors.
          </p>
        </div>

        {/* Equity Fairness Badge */}
        <div className="relative z-10 p-4 rounded-2xl bg-purple-950/60 border border-purple-500/35 text-right shadow-xl backdrop-blur-md">
          <div className="text-[10px] font-mono text-purple-300 uppercase font-semibold">Spatial Gini Coefficient</div>
          <div className="text-2xl font-bold font-mono text-white mt-0.5">
            {equityAnalysis.giniCoefficient}
          </div>
          <div className="text-xs text-purple-200 mt-0.5 font-medium">
            Rating: <span className="text-emerald-400 font-bold">{equityAnalysis.equityFairnessRating}</span>
          </div>
        </div>
      </motion.div>

      {/* Interactive Equity Slider & Pareto Trade-off Explainer */}
      <div className="p-7 rounded-3xl glass-panel border border-emerald-500/20 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              <span>Adjust Equity Weight ($\alpha$) Relative to Pure Efficiency</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Slide to simulate the mathematical tension between maximising total aggregate benefit vs rectifying historical spatial inequality.
            </p>
          </div>
          <span className="text-xl font-mono font-bold text-purple-300 px-4 py-1.5 rounded-xl bg-zinc-900 border border-purple-500/30 shadow-md">
            {(budgetConfig.equityWeight * 100).toFixed(0)}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={budgetConfig.equityWeight}
          onChange={e => onUpdateEquityWeight(Number(e.target.value))}
          className="w-full accent-purple-500 bg-zinc-800 h-2.5 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-xs font-mono text-zinc-400">
          <div>
            <span className="font-bold text-white">0% Pure Efficiency (Utilitarian)</span>
            <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Funds flow strictly to cheapest cost-per-benefit interventions.</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-purple-300">100% Rawlsian Justice (Maximin)</span>
            <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Marginal benefits in most vulnerable wards receive up to 2.4x weighting.</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics: Lorenz Curve & Underserved Wards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Lorenz Curve for Benefit Distribution (6 cols) */}
        <div className="lg:col-span-6 p-7 rounded-3xl glass-panel border border-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white font-display">Lorenz Curve of Climate Benefits</h3>
              <p className="text-xs text-zinc-400">Cumulative Population % vs Cumulative Modelled Benefit %</p>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-500/30 font-semibold">
              Gini: {equityAnalysis.giniCoefficient}
            </span>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityAnalysis.lorenzPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="populationPct"
                  stroke="#6b7280"
                  fontSize={11}
                  tick={{ fill: '#9ca3af' }}
                  unit="%"
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip content={<CustomLorenzTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="equalityBenefitPct"
                  name="Perfect Equality (45° Line)"
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="actualBenefitPct"
                  name="Actual Modelled Allocation"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#a855f7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3.5 text-[11px] text-zinc-400 leading-relaxed italic text-center">
            The closer the purple line hugs the diagonal, the more equitably climate risk protection is distributed across socioeconomic strata.
          </p>
        </div>

        {/* High Risk Underserved Communities (6 cols) */}
        <div className="lg:col-span-6 p-7 rounded-3xl glass-panel border border-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>High-Risk Underserved Communities</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Wards with high socio-economic vulnerability (informal housing, low green cover, flood zones).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {equityAnalysis.underservedWards.map(ward => (
                <div
                  key={ward.wardId}
                  className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-purple-500/35 transition-all flex items-center justify-between shadow-md gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getWardArchetypeImage(ward.wardId)}
                      alt={ward.wardName}
                      className="w-11 h-11 rounded-xl object-cover border border-purple-500/25 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{ward.wardName}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-500/25">
                          Vuln: {ward.vulnerabilityScore}/100
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                        Pop Share: {ward.populationPct}% • Budget Share: {ward.budgetSharePct}% (₹{ward.allocatedBudgetCr} Cr)
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full shrink-0 ${
                    ward.status === 'Heavily Prioritised'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      : ward.status === 'Equitably Funded'
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                      : 'bg-red-950/80 text-red-300 border border-red-500/30'
                  }`}>
                    {ward.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-zinc-800 text-[11px] text-zinc-400">
            <span className="font-semibold text-purple-300">Equity Guarantee:</span> When equity weight is raised above 60%, Peenya and Shivajinagar receive guaranteed priority capital commitments before affluent garden suburbs.
          </div>
        </div>
      </div>

      {/* Ward-by-Ward Equity Breakdown Table */}
      <div className="p-7 rounded-3xl glass-panel border border-emerald-500/20 space-y-4">
        <h3 className="text-base font-bold text-white font-display">
          Full Ward Investment & Benefit Distribution Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/90 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Ward Name</th>
                <th className="py-3.5 px-4">Population</th>
                <th className="py-3.5 px-4">Vulnerability Score</th>
                <th className="py-3.5 px-4">CapEx Allocated</th>
                <th className="py-3.5 px-4">Budget Share %</th>
                <th className="py-3.5 px-4">Benefit Share %</th>
                <th className="py-3.5 px-4">Equity Ratio</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {equityAnalysis.profiles.map(p => (
                <tr key={p.wardId} className="hover:bg-purple-950/15 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {p.wardName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-300">
                    {p.population.toLocaleString('en-IN')} ({p.populationPct}%)
                  </td>
                  <td className="py-3.5 px-4 font-mono text-purple-300 font-bold">
                    {p.vulnerabilityScore}/100
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ₹{p.allocatedBudgetCr} Cr
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-300">
                    {p.budgetSharePct}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">
                    {p.benefitSharePct}%
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {p.equityRatio}x
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold ${
                      p.status === 'Heavily Prioritised'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        : p.status === 'Equitably Funded'
                        ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                        : 'bg-red-950/80 text-red-300 border border-red-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rawlsian Distributive Justice Protocol Badge */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-950/80 to-emerald-950/30 border border-purple-500/30 text-xs text-zinc-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold text-white font-display">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Rawlsian Maximin Distributive Justice Formulation</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-500/40 font-semibold">
              John Rawls Theory of Justice (1971)
            </span>
          </div>
          <p className="text-zinc-300 leading-relaxed font-sans">
            Under a pure utilitarian allocation (&alpha; = 0), capital flows to wards with highest density and lowest per-unit installation costs. Under our spatial justice formulation, each ward score is modified as S<sub>i</sub> = B<sub>i</sub> &times; [1 + &alpha; &times; (V<sub>i</sub> / V&#772;)], where V<sub>i</sub> is the socio-economic vulnerability score. At &alpha; &gt; 0.6, the model guarantees the worst-off neighbourhoods receive disproportionate initial capital allocation before marginal investments in resilient zones.
          </p>
        </div>

        {/* Ethical AI & Modeling Assumption Disclosure */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Ethical Model Disclosure & Algorithmic Limitations</span>
          </div>
          <p className="leading-relaxed">
            This model produces indicative planning benchmarks based on multi-hazard synthetic GIS layers and unit benefit constants. It does not replace qualitative municipal ward stakeholder hearings, ground-truth biodiversity surveys, or municipal budgetary deliberations.
          </p>
        </div>
      </div>
    </div>
  );
};
