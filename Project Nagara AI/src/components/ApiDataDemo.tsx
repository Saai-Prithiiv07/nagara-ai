/**
 * Frontend Component: Real-Time API Data & Telemetry Integration
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Async data fetching from RESTful API
 * - Real-time WebSocket connection state
 * - Loading and error UI states
 * - Interactive AI Decision Brief generation
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Wifi, AlertTriangle, Cpu, Database, Check } from 'lucide-react';
import { expressApp } from '../server/app';

interface WardApiData {
  wardId: string;
  wardName: string;
  totalAllocatedCost: number;
  allocationCount: number;
}

export const ApiDataDemo: React.FC = () => {
  const [wards, setWards] = useState<WardApiData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Fetch data asynchronously from backend REST API
  const fetchWardsFromApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await expressApp.handleRequest({
        method: 'GET',
        path: '/api/v1/wards',
      });

      if (response.statusCode === 200) {
        setWards((response.body as any).wards || []);
      } else {
        setError((response.body as any).message || 'Failed to load wards from backend');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardsFromApi();
    // Simulate active WebSocket connection
    setWsConnected(true);
  }, []);

  const handleGenerateAiBrief = async () => {
    setAiLoading(true);
    try {
      const response = await expressApp.handleRequest({
        method: 'POST',
        path: '/api/v1/ai/decision-brief',
        body: { wardId: 'ward-03', budgetCr: 30.0 },
      });
      if (response.statusCode === 200) {
        setAiBrief((response.body as any).brief.executiveSummary);
      }
    } catch (err) {
      setAiBrief(`AI Generation error: ${(err as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl text-slate-100 my-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Live Backend Telemetry & REST API</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrates async data fetching, WebSocket telemetry, and AI synthesis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-xs">
            <Wifi className={`w-3.5 h-3.5 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className={wsConnected ? 'text-emerald-300' : 'text-slate-400'}>
              {wsConnected ? 'WebSocket Live' : 'Disconnected'}
            </span>
          </div>

          <button
            onClick={fetchWardsFromApi}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Refetch API Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
          <span className="text-xs">Fetching ward telemetry from REST API (/api/v1/wards)...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">API Fetch Failed</p>
            <p className="text-xs text-red-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Success State */}
      {!loading && !error && wards.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {wards.slice(0, 6).map((ward) => (
              <div
                key={ward.wardId}
                className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-slate-400">{ward.wardId}</span>
                  <p className="text-sm font-medium text-white">{ward.wardName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-400 font-mono">₹{ward.totalAllocatedCost} Cr</span>
                  <p className="text-[11px] text-slate-400">{ward.allocationCount} interventions</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Decision Brief Integration */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">AI Resilience Synthesizer:</span> Streamline
              decision briefs with structured LLM JSON outputs.
            </div>

            <button
              onClick={handleGenerateAiBrief}
              disabled={aiLoading}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Cpu className="w-3.5 h-3.5" />
              {aiLoading ? 'Synthesizing...' : 'Run AI Decision Brief'}
            </button>
          </div>

          {aiBrief && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <Check className="w-3.5 h-3.5" />
                <span>AI Synthesis Result (Structured Output):</span>
              </div>
              <p>{aiBrief}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
