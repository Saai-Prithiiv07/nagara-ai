import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import {
  Neighbourhood,
  OptimisationResult,
  BudgetConfig,
  ScenarioParams
} from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wards: Neighbourhood[];
  optimisationResult: OptimisationResult;
  budgetConfig: BudgetConfig;
  scenario: ScenarioParams;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  wards,
  optimisationResult,
  budgetConfig,
  scenario
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl bg-[#09130e] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print p-4 bg-[#060c09] border-b border-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white font-display">
              Official Executive Decision Dossier
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print to PDF / Paper</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-zinc-100 bg-[#08120d] print:bg-white print:text-black">
          {/* Document Header */}
          <div className="border-b border-emerald-500/30 print:border-black pb-4 flex justify-between items-start">
            <div>
              <div className="text-xs font-mono text-emerald-400 print:text-emerald-800 uppercase tracking-widest font-bold">
                MUNICIPAL CLIMATE RESILIENCE STRATEGY MEMORANDUM
              </div>
              <h1 className="text-2xl font-bold font-display text-white print:text-black mt-1">
                NAGARA AI: Capital Allocation Executive Dossier
              </h1>
              <div className="text-xs text-zinc-400 print:text-zinc-600 mt-0.5">
                Target Urban Body: Greater Bengaluru Urban Agglomeration • 10 Modelled Wards
              </div>
            </div>

            <div className="text-right text-xs font-mono text-zinc-400 print:text-zinc-700">
              <div>Ref: NAGARA-BLR-{new Date().getFullYear()}-094</div>
              <div>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div className="text-emerald-400 print:text-emerald-800 font-bold">STATUS: ADVISORY READY</div>
            </div>
          </div>

          {/* Key Executive Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-black/40 print:bg-zinc-100 border border-zinc-800 print:border-zinc-300 text-xs font-mono">
            <div>
              <div className="text-zinc-500">Total CapEx Ceiling:</div>
              <div className="text-base font-bold text-white print:text-black">₹{budgetConfig.totalBudgetCr} Cr</div>
            </div>
            <div>
              <div className="text-zinc-500">Allocated Investment:</div>
              <div className="text-base font-bold text-emerald-400 print:text-emerald-700">₹{optimisationResult.totalCostCr} Cr</div>
            </div>
            <div>
              <div className="text-zinc-500">Active Scenario:</div>
              <div className="text-sm font-bold text-white print:text-black">{scenario.name}</div>
            </div>
            <div>
              <div className="text-zinc-500">Rawlsian Equity Weight:</div>
              <div className="text-sm font-bold text-purple-400 print:text-purple-700">{(budgetConfig.equityWeight * 100).toFixed(0)}%</div>
            </div>
          </div>

          {/* Modelled Macro Improvements Table */}
          <div>
            <h3 className="text-sm font-bold text-white print:text-black uppercase font-mono tracking-wider mb-2">
              1. Citywide Resiliency Impact Matrix
            </h3>
            <table className="w-full text-xs text-left border border-zinc-800 print:border-zinc-300">
              <thead className="bg-zinc-900 print:bg-zinc-200 font-mono text-[10px] text-zinc-400 print:text-zinc-800">
                <tr>
                  <th className="p-2.5">Indicator</th>
                  <th className="p-2.5">Pre-Intervention Baseline</th>
                  <th className="p-2.5">Post-Optimisation Modelled</th>
                  <th className="p-2.5">Net Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 print:divide-zinc-300 font-mono">
                <tr>
                  <td className="p-2.5 font-bold">Composite Sustainability Index (0-100)</td>
                  <td className="p-2.5">{optimisationResult.overallSustainabilityIndex.before}</td>
                  <td className="p-2.5 text-emerald-400 print:text-emerald-800 font-bold">{optimisationResult.overallSustainabilityIndex.after}</td>
                  <td className="p-2.5">+{optimisationResult.overallSustainabilityIndex.deltaPct}%</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Urban Heat Island Severity Index</td>
                  <td className="p-2.5">{optimisationResult.cityHeatRisk.before}</td>
                  <td className="p-2.5 text-amber-300 print:text-amber-800">{optimisationResult.cityHeatRisk.after}</td>
                  <td className="p-2.5">{optimisationResult.cityHeatRisk.deltaPct}%</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Monsoon Flood Hazard Index</td>
                  <td className="p-2.5">{optimisationResult.cityFloodRisk.before}</td>
                  <td className="p-2.5 text-cyan-300 print:text-cyan-800">{optimisationResult.cityFloodRisk.after}</td>
                  <td className="p-2.5">{optimisationResult.cityFloodRisk.deltaPct}%</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">City Canopy Cover Percentage</td>
                  <td className="p-2.5">{optimisationResult.cityGreenCoverPct.before}%</td>
                  <td className="p-2.5 text-emerald-400 print:text-emerald-800">{optimisationResult.cityGreenCoverPct.after}%</td>
                  <td className="p-2.5">+{optimisationResult.cityGreenCoverPct.deltaPct}%</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">Spatial Equity Gini Coefficient</td>
                  <td className="p-2.5">{optimisationResult.equityGiniCoefficient.before}</td>
                  <td className="p-2.5 text-purple-300 print:text-purple-800">{optimisationResult.equityGiniCoefficient.after}</td>
                  <td className="p-2.5">{optimisationResult.equityGiniCoefficient.deltaPct}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detailed Recommended Procurement Schedule */}
          <div>
            <h3 className="text-sm font-bold text-white print:text-black uppercase font-mono tracking-wider mb-2">
              2. Recommended Ward-Level Interventions
            </h3>
            <table className="w-full text-xs text-left border border-zinc-800 print:border-zinc-300">
              <thead className="bg-zinc-900 print:bg-zinc-200 font-mono text-[10px] text-zinc-400 print:text-zinc-800">
                <tr>
                  <th className="p-2.5">Ward</th>
                  <th className="p-2.5">Intervention Type</th>
                  <th className="p-2.5">Scale</th>
                  <th className="p-2.5">CapEx (₹)</th>
                  <th className="p-2.5">Key Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 print:divide-zinc-300">
                {optimisationResult.allocations.map(a => (
                  <tr key={a.id}>
                    <td className="p-2.5 font-bold text-white print:text-black">{a.wardName}</td>
                    <td className="p-2.5 text-emerald-300 print:text-emerald-800">{a.interventionName}</td>
                    <td className="p-2.5 font-mono">{a.units} units</td>
                    <td className="p-2.5 font-mono font-bold text-white print:text-black">₹{a.costCr} Cr</td>
                    <td className="p-2.5 text-[11px] text-zinc-300 print:text-zinc-700">{a.selectionReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures & Disclaimers */}
          <div className="pt-6 border-t border-zinc-800 print:border-zinc-400 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="font-bold text-zinc-300 print:text-black">Methodology & Disclaimer:</div>
              <p className="text-[11px] text-zinc-400 print:text-zinc-600 mt-1 leading-relaxed">
                Computed via the NAGARA AI Multi-Attribute Marginal Benefit Greedy Optimisation Model. Figures represent synthetic indicative planning estimates for comparative municipal prioritisation.
              </p>
            </div>
            <div className="flex flex-col justify-end text-right">
              <div className="border-t border-zinc-700 print:border-black pt-2 w-48 ml-auto text-[11px] text-zinc-400 print:text-zinc-800 font-mono">
                Chief Urban Resilience Officer<br />
                Urban Planning Taskforce
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
