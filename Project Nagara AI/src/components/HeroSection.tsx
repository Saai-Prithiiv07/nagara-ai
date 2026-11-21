import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Compass,
  Cpu,
  ChevronDown,
  Sparkles,
  TreePine,
  CloudRain,
  Flame,
  Wind,
  ShieldCheck,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { City3DCanvas } from './City3DCanvas';

interface HeroSectionProps {
  onExploreMap: () => void;
  onRunPlanner: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreMap,
  onRunPlanner
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isCalmMode, setIsCalmMode] = useState<boolean>(false);

  // Atmospheric Particle Mist in 2D Background Overlay
  useEffect(() => {
    if (prefersReducedMotion || isCalmMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.6,
      speedX: (Math.random() - 0.35) * 0.3,
      speedY: -Math.random() * 0.28 - 0.08,
      opacity: Math.random() * 0.45 + 0.15,
      hue: Math.random() > 0.4 ? 155 : 175
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = `hsla(${p.hue}, 85%, 68%, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion, isCalmMode]);

  return (
    <div className="relative min-h-[94vh] flex flex-col justify-between overflow-hidden border-b border-emerald-950/40 bg-radial from-[#091f16] via-[#06120e] to-[#040806]">
      {/* Real High-Resolution Smart City Photography Layer (Blended at 12% Opacity) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-12 bg-cover bg-center mix-blend-luminosity"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1600&q=80')"
        }}
      />

      {/* Floating 2D Particle Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-70"
      />

      {/* Volumetric Radial Glows */}
      <div className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-emerald-500/12 blur-[140px] rounded-full" />
      <div className="pointer-events-none absolute top-1/4 -right-40 w-[600px] h-[600px] bg-teal-500/8 blur-[160px] rounded-full" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#050907] via-[#050907]/90 to-transparent z-10" />

      {/* Top Banner Status Bar */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-7 flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-xs font-mono text-emerald-300 backdrop-blur-md shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold tracking-wider">MUNICIPAL CLIMATE RESILIENCE PROTOCOL v2.4</span>
        </div>

        <button
          onClick={() => setIsCalmMode(!isCalmMode)}
          className="text-xs px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-500/20 text-emerald-400 hover:text-emerald-200 hover:border-emerald-400/40 transition-all cursor-pointer font-mono"
          title="Toggle low motion/calm mist atmosphere"
        >
          {isCalmMode ? 'Enable Atmospheric Dynamics' : 'Calm Motion Mode'}
        </button>
      </div>

      {/* Main Hero Showcase */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Vision, Brand, Story, Actions (6 cols) */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Urban Sustainability Decision Engine</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display leading-[1.05]">
              NAGARA <span className="text-gradient-emerald">AI</span>
            </h1>
            <p className="mt-3 text-xl sm:text-2xl font-medium text-emerald-100/90 font-display italic tracking-wide">
              "Every Rupee. Every Neighbourhood. A Better City."
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-emerald-100/80 max-w-2xl leading-relaxed font-sans"
          >
            A high-fidelity decision engine engineered for Indian municipal planners. Model multi-hazard climate risks, optimise scarce green infrastructure budgets, simulate monsoonal cloudbursts, and guarantee socio-spatial equity across every ward.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-2 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={onExploreMap}
              className="group relative inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-black font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-110 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <Compass className="w-5 h-5 text-black group-hover:rotate-45 transition-transform duration-300" />
              <span>Explore City Digital Twin</span>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </button>

            <button
              onClick={onRunPlanner}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/50 text-emerald-200 font-semibold text-sm sm:text-base border border-emerald-500/30 hover:border-emerald-400/60 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-950/60"
            >
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span>Run Sustainability Optimiser</span>
            </button>
          </motion.div>

          {/* Micro Proof Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-4 grid grid-cols-3 gap-6 border-t border-emerald-900/40 max-w-xl"
          >
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300">
                <AnimatedCounter value={10} suffix=" Wards" />
              </div>
              <div className="text-xs text-emerald-400/70 font-mono mt-0.5">Bengaluru Digital Twin</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-300">
                <AnimatedCounter value={50} prefix="₹" suffix=" Cr" />
              </div>
              <div className="text-xs text-emerald-400/70 font-mono mt-0.5">CapEx Decision Space</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-300">
                Rawlsian
              </div>
              <div className="text-xs text-emerald-400/70 font-mono mt-0.5">Spatial Equity Weighting</div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Full Interactive 3D WebGL City Digital Twin (6 cols) */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <City3DCanvas />
        </div>
      </div>

      {/* Bottom Transition Trigger */}
      <div className="relative z-20 pb-5 text-center">
        <button
          onClick={onExploreMap}
          className="group inline-flex flex-col items-center text-xs font-mono text-emerald-400/75 hover:text-emerald-300 transition-all cursor-pointer"
        >
          <span className="tracking-widest uppercase text-[11px] font-semibold group-hover:tracking-wider transition-all">
            Enter Sustainability Platform
          </span>
          <ChevronDown className="w-4 h-4 mt-1 animate-bounce text-emerald-400" />
        </button>
      </div>
    </div>
  );
};
