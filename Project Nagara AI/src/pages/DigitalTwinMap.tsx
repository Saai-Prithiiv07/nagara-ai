import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Flame,
  CloudRain,
  Droplets,
  TreePine,
  Layers,
  MapPin,
  X,
  ShieldAlert,
  Thermometer,
  Info,
  RefreshCw,
  Compass,
  ArrowRight,
  ChevronRight,
  Sliders,
  Building2
} from 'lucide-react';
import { Neighbourhood, OptimisationResult } from '../types';

export type MapMetricFilter = 'composite' | 'heat' | 'flood' | 'water' | 'green';
export type WardArchetypeFilter = 'all' | 'industrial' | 'valley' | 'tech' | 'heritage';
export type BasemapType = 'osm' | 'esri' | 'tactical';

interface DigitalTwinMapProps {
  wards: Neighbourhood[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string | null) => void;
  optimisationResult: OptimisationResult;
  onPlanForWard: (wardId: string) => void;
}

// Helper for ward archetype photography
const getWardArchetypeImage = (wardId: string) => {
  if (wardId.includes('peenya')) return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'; // Industrial fabric
  if (wardId.includes('bellandur')) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'; // Lake catchment
  if (wardId.includes('krpuram')) return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'; // Transit & rail node
  if (wardId.includes('shivajinagar')) return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80'; // Dense historic commercial
  if (wardId.includes('jayanagar')) return 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80'; // Urban canopy
  if (wardId.includes('whitefield')) return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'; // Tech corridor
  return 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80';
};

// Helper to center the map when a ward is selected
function MapRecenter({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 13, { duration: 1.2 });
    }
  }, [coords, map]);
  return null;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({
  wards,
  selectedWardId,
  onSelectWard,
  optimisationResult,
  onPlanForWard
}) => {
  const [activeFilter, setActiveFilter] = useState<MapMetricFilter>('composite');
  const [archetypeFilter, setArchetypeFilter] = useState<WardArchetypeFilter>('all');
  const [basemap, setBasemap] = useState<BasemapType>('osm');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter] = useState<[number, number]>([12.9716, 77.5946]); // Bengaluru Center

  const selectedWard = wards.find(w => w.id === selectedWardId) || null;

  // Filtered wards by archetype and search query
  const filteredWards = wards.filter(w => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.keyLandmarks.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (archetypeFilter === 'industrial') {
      return w.id.includes('peenya');
    } else if (archetypeFilter === 'valley') {
      return w.id.includes('koramangala') || w.id.includes('bellandur') || w.id.includes('yelahanka');
    } else if (archetypeFilter === 'tech') {
      return w.id.includes('whitefield') || w.id.includes('electroniccity');
    } else if (archetypeFilter === 'heritage') {
      return w.id.includes('jayanagar') || w.id.includes('malleshwaram') || w.id.includes('shivajinagar');
    }
    return true;
  });

  // Allocations for selected ward
  const selectedWardAllocations = selectedWard
    ? optimisationResult.allocations.filter(a => a.wardId === selectedWard.id)
    : [];

  // Function to determine polygon and marker color by metric
  const getMetricValue = (ward: Neighbourhood): number => {
    switch (activeFilter) {
      case 'heat':
        return ward.baselineHeatRisk;
      case 'flood':
        return ward.baselineFloodRisk;
      case 'water':
        return ward.baselineWaterStress;
      case 'green':
        return ward.baselineGreenCoverPct;
      case 'composite':
      default:
        return Math.round(
          ward.baselineHeatRisk * 0.3 +
          ward.baselineFloodRisk * 0.35 +
          ward.baselineWaterStress * 0.25 +
          ward.socioEconomicVulnerability * 0.1
        );
    }
  };

  const getColorForMetric = (ward: Neighbourhood): string => {
    const val = getMetricValue(ward);

    if (activeFilter === 'green') {
      if (val >= 25) return '#10b981'; // lush
      if (val >= 15) return '#34d399';
      if (val >= 10) return '#fbbf24';
      return '#ef4444'; // critical void
    }

    if (val >= 80) return '#ef4444'; // critical
    if (val >= 65) return '#f59e0b'; // high
    if (val >= 45) return '#eab308'; // moderate
    return '#10b981'; // baseline
  };

  return (
    <div className="relative space-y-4 pb-12">
      {/* Smart-City Command Bar */}
      <div className="p-5 rounded-3xl glass-panel-elevated border border-emerald-500/25 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Metric Layer Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 mr-1 flex items-center gap-1.5 font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>GIS LAYER:</span>
          </span>

          <button
            onClick={() => setActiveFilter('composite')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeFilter === 'composite'
                ? 'bg-emerald-500 text-black font-extrabold shadow-lg shadow-emerald-500/30'
                : 'bg-zinc-950/70 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            Composite Multi-Hazard
          </button>

          <button
            onClick={() => setActiveFilter('heat')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'heat'
                ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/30'
                : 'bg-zinc-950/70 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Heat Island (UHI)</span>
          </button>

          <button
            onClick={() => setActiveFilter('flood')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'flood'
                ? 'bg-cyan-500 text-black font-extrabold shadow-lg shadow-cyan-500/30'
                : 'bg-zinc-950/70 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <CloudRain className="w-3 h-3 text-cyan-400" />
            <span>Flood Inundation</span>
          </button>

          <button
            onClick={() => setActiveFilter('water')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'water'
                ? 'bg-blue-500 text-black font-extrabold shadow-lg shadow-blue-500/30'
                : 'bg-zinc-950/70 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Droplets className="w-3 h-3 text-blue-400" />
            <span>Aquifer / Water Stress</span>
          </button>

          <button
            onClick={() => setActiveFilter('green')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'green'
                ? 'bg-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-600/30'
                : 'bg-zinc-950/70 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <TreePine className="w-3 h-3 text-emerald-400" />
            <span>Canopy Cover %</span>
          </button>
        </div>

        {/* Search & Reset */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search ward or landmark..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950/90 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {selectedWard && (
            <button
              onClick={() => onSelectWard(null)}
              className="text-xs px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Reset selection"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Archetypes & Free Basemap Provider */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        {/* Archetype Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-zinc-500 text-[11px] whitespace-nowrap">ZONE FILTER:</span>
          {(['all', 'industrial', 'valley', 'tech', 'heritage'] as WardArchetypeFilter[]).map(type => (
            <button
              key={type}
              onClick={() => setArchetypeFilter(type)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer capitalize whitespace-nowrap ${
                archetypeFilter === type
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-850'
              }`}
            >
              {type === 'all' ? 'All 10 Wards' : type}
            </button>
          ))}
        </div>

        {/* Free Basemap Selector (No API Key Required) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/60 p-1 rounded-xl border border-zinc-800">
          <span className="text-zinc-500 text-[10px] px-2 font-semibold">BASEMAP:</span>
          <button
            onClick={() => setBasemap('osm')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
              basemap === 'osm'
                ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/30'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="OpenStreetMap Standard (Free, Public, No API Key)"
          >
            OSM Dark
          </button>
          <button
            onClick={() => setBasemap('esri')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
              basemap === 'esri'
                ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/30'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Esri Dark Gray Canvas (Free, Native Dark Base)"
          >
            Esri Dark
          </button>
          <button
            onClick={() => setBasemap('tactical')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
              basemap === 'tactical'
                ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/30'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Tactical Vector Grid (100% Offline Digital Twin)"
          >
            Vector Grid
          </button>
        </div>
      </div>

      {/* Interactive Map Surface */}
      <div className="relative w-full h-[640px] rounded-3xl overflow-hidden border border-emerald-500/25 glass-panel shadow-2xl">
        {/* Offline Tactical Grid Background when in tactical mode */}
        {basemap === 'tactical' && (
          <div className="absolute inset-0 pointer-events-none z-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
        )}

        {/* Leaflet Map Canvas */}
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          className={`w-full h-full z-0 map-${basemap}`}
        >
          <MapRecenter coords={selectedWard ? selectedWard.coordinates : null} />

          {/* Clean TileLayer: OpenStreetMap or Esri (Zero API Keys, Zero Watermarks) */}
          {basemap === 'osm' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {basemap === 'esri' && (
            <TileLayer
              attribution='Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a> &mdash; DeLorme, NAVTEQ'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
          )}

          {/* Polygons and Interactive Node Markers */}
          {filteredWards.map(ward => {
            const isSelected = selectedWardId === ward.id;
            const color = getColorForMetric(ward);
            const val = getMetricValue(ward);

            return (
              <React.Fragment key={ward.id}>
                {/* Ward Polygon Layer */}
                <Polygon
                  positions={ward.polygonBoundary}
                  pathOptions={{
                    color: isSelected ? '#ffffff' : color,
                    weight: isSelected ? 3.5 : 2,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.5 : 0.28,
                    dashArray: isSelected ? undefined : '5, 5'
                  }}
                  eventHandlers={{
                    click: () => onSelectWard(ward.id)
                  }}
                />

                {/* Marker with Outer Pulse Ring on Active */}
                {isSelected && (
                  <CircleMarker
                    center={ward.coordinates}
                    radius={22}
                    pathOptions={{
                      color: '#34d399',
                      weight: 1.5,
                      fillColor: '#10b981',
                      fillOpacity: 0.15
                    }}
                  />
                )}

                <CircleMarker
                  center={ward.coordinates}
                  radius={isSelected ? 10 : 7.5}
                  pathOptions={{
                    color: '#ffffff',
                    weight: isSelected ? 3 : 1.5,
                    fillColor: color,
                    fillOpacity: 0.95
                  }}
                  eventHandlers={{
                    click: () => onSelectWard(ward.id)
                  }}
                >
                  <Popup>
                    <div className="p-1.5 space-y-1.5 font-sans">
                      <div className="text-xs font-bold text-emerald-400 font-display">{ward.name}</div>
                      <div className="text-[10px] text-zinc-300">Ward #{ward.wardNumber} • {ward.zone}</div>
                      <div className="text-xs font-mono font-semibold mt-1">
                        {activeFilter.toUpperCase()}: <span style={{ color }}>{val}{activeFilter === 'green' ? '%' : '/100'}</span>
                      </div>
                      <button
                        onClick={() => onSelectWard(ward.id)}
                        className="mt-2 text-[10px] px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold w-full text-center cursor-pointer shadow-sm hover:bg-emerald-500 transition-colors"
                      >
                        Inspect Ward Details
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Legend Overlay HUD */}
        <div className="absolute bottom-5 left-5 z-20 p-4 rounded-2xl bg-[#060c09]/90 border border-emerald-500/30 backdrop-blur-xl text-xs font-mono shadow-2xl max-w-xs pointer-events-auto">
          <div className="font-bold text-white text-[11px] mb-2.5 flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>GIS SCALE: {activeFilter.toUpperCase()}</span>
            </span>
            <span className="text-[10px] text-zinc-400">Indicative</span>
          </div>
          <div className="space-y-1.5 text-[10px]">
            {activeFilter === 'green' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#10b981]" />
                  <span>≥ 25% High Tree Canopy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#34d399]" />
                  <span>15% – 24% Moderate Canopy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#ef4444]" />
                  <span>&lt; 10% Acute Concrete Desert</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#ef4444]" />
                  <span>80 – 100: Severe Critical Hazard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#f59e0b]" />
                  <span>65 – 79: High Vulnerability</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#eab308]" />
                  <span>45 – 64: Moderate Exposure</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#10b981]" />
                  <span>&lt; 45: Baseline Resilient</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Selected Ward Slide-Over Drawer */}
        <AnimatePresence>
          {selectedWard && (
            <motion.div
              initial={{ x: 340, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 340, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] z-30 p-6 rounded-3xl bg-[#06100c]/96 border border-emerald-500/45 backdrop-blur-2xl shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Header Image & Ward Identification */}
                <div className="relative h-36 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-3xl">
                  <img
                    src={getWardArchetypeImage(selectedWard.id)}
                    alt={selectedWard.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06100c] via-[#06100c]/60 to-transparent" />
                  
                  <button
                    onClick={() => onSelectWard(null)}
                    className="absolute top-3.5 right-3.5 p-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-white/10 backdrop-blur-md"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-2.5 left-4 right-4">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold backdrop-blur-md">
                      Ward #{selectedWard.wardNumber} • {selectedWard.zone}
                    </span>
                    <h3 className="text-xl font-bold text-white font-display mt-1 tracking-tight drop-shadow">
                      {selectedWard.name}
                    </h3>
                  </div>
                </div>

                {/* Vulnerability Context Note */}
                <p className="text-xs text-zinc-300 leading-relaxed bg-black/50 p-3.5 rounded-2xl border border-zinc-800">
                  {selectedWard.primaryVulnerabilityNote}
                </p>

                {/* Key Indicators 2x2 Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-amber-500/25">
                    <div className="text-[10px] text-amber-400 font-bold">SURFACE TEMP</div>
                    <div className="text-base font-bold text-white mt-0.5">{selectedWard.avgSurfaceTempC}°C</div>
                    <div className="text-[9px] text-zinc-400">Heat Risk: {selectedWard.baselineHeatRisk}/100</div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-cyan-500/25">
                    <div className="text-[10px] text-cyan-400 font-bold">FLOOD HAZARD</div>
                    <div className="text-base font-bold text-white mt-0.5">{selectedWard.baselineFloodRisk}/100</div>
                    <div className="text-[9px] text-zinc-400">Runoff Basin Index</div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-blue-500/25">
                    <div className="text-[10px] text-blue-400 font-bold">WATER STRESS</div>
                    <div className="text-base font-bold text-white mt-0.5">{selectedWard.baselineWaterStress}/100</div>
                    <div className="text-[9px] text-zinc-400">Borewell Depletion</div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-emerald-500/25">
                    <div className="text-[10px] text-emerald-400 font-bold">GREEN COVER</div>
                    <div className="text-base font-bold text-white mt-0.5">{selectedWard.baselineGreenCoverPct}%</div>
                    <div className="text-[9px] text-zinc-400">Tree Canopy</div>
                  </div>
                </div>

                {/* Demographics & Anchors */}
                <div className="mt-4 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-zinc-400">
                    <span>Population:</span>
                    <span className="font-mono text-white font-bold">{selectedWard.population.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Informal/Vulnerable:</span>
                    <span className="font-mono text-purple-300 font-bold">{selectedWard.vulnerablePopulationPct}%</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Spatial Footprint:</span>
                    <span className="font-mono text-white">{selectedWard.areaKm2} km²</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                    <span className="font-semibold text-zinc-300">Landmarks:</span> {selectedWard.keyLandmarks.join(', ')}
                  </div>
                </div>

                {/* Modelled Portfolio Allocations */}
                <div className="mt-4">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>ALLOCATED PORTFOLIO</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {selectedWardAllocations.length} Active
                    </span>
                  </div>

                  {selectedWardAllocations.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedWardAllocations.map(alloc => (
                        <div
                          key={alloc.id}
                          className="p-3 rounded-xl bg-emerald-950/45 border border-emerald-500/35 text-xs"
                        >
                          <div className="flex justify-between font-bold text-emerald-300">
                            <span>{alloc.interventionName}</span>
                            <span className="font-mono">₹{alloc.costCr} Cr</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-1">
                            {alloc.units} units deployed • {alloc.selectionReason}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 p-3 rounded-xl bg-zinc-900/60 text-xs text-zinc-400 italic text-center">
                      No capital interventions allocated under current constraints.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-emerald-900/50">
                <button
                  onClick={() => onPlanForWard(selectedWard.id)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
                >
                  Plan Interventions for {selectedWard.name.split(' ')[0]}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
