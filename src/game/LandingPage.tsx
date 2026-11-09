import { useState } from "react";
import {
  ArrowRight,
  Compass,
  Crosshair,
  ExternalLink,
  Flame,
  Gamepad2,
  Radio,
  RotateCcw,
  Shield,
  Video,
  X,
  Zap,
} from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
  onOpenAbout: () => void;
}

const SATELLITE_TARGETS = [
  {
    id: "deb-2",
    name: "Pixxel EarthObs-1",
    type: "Defunct Multi-Spectral Bus",
    mass: "380 KG",
    alt: "418 KM",
    spin: "0.52 RAD/S",
    status: "CRITICAL DEBRIS",
    tagColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    desc: "Decommissioned Earth observation satellite with stuck photovoltaic boom.",
    motionClass: "animate-float-slow",
  },
  {
    id: "deb-1",
    name: "SLV Spent Upper Stage",
    type: "Rocket Booster Casing",
    mass: "1,420 KG",
    alt: "432 KM",
    spin: "0.28 RAD/S",
    status: "HIGH MASS HAZARD",
    tagColor: "text-red-400 border-red-500/30 bg-red-500/10",
    desc: "Heavy depleted cryogenic rocket casing in tumbling decaying orbit.",
    motionClass: "animate-float-delay",
  },
  {
    id: "deb-3",
    name: "ComSat Solar Array Truss",
    type: "Severed Wing Structure",
    mass: "210 KG",
    alt: "405 KM",
    spin: "0.85 RAD/S",
    status: "HIGH GLARE",
    tagColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    desc: "Severed solar array generating intense solar glints in tracking radar.",
    motionClass: "animate-float-slow",
  },
];

export function LandingPage({ onStart }: LandingPageProps) {
  const [controlsOpen, setControlsOpen] = useState(false);
  const [selectedSat, setSelectedSat] = useState(0);

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between p-6 md:p-12 font-hud text-zinc-100 select-none overflow-y-auto pointer-events-auto">
      {/* Top Header - Aule Space Style */}
      <header className="flex items-start justify-between gap-4 w-full">
        {/* Brand Logo with direct link to original website */}
        <a
          href="https://cosmoserve.space/"
          target="_blank"
          rel="noreferrer"
          className="group flex flex-col"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-white group-hover:text-zinc-200 transition">
              cosmoserve
            </span>
            <span className="text-xs sm:text-sm font-normal text-white/60 tracking-wider">
              space
            </span>
          </div>
          <span className="text-[10px] font-mono-tech tracking-widest text-emerald-400 uppercase mt-0.5">
            Active Debris Removal
          </span>
        </a>

        {/* Top-Right Discovery Card linking to original website */}
        <a
          href="https://cosmoserve.space/"
          target="_blank"
          rel="noreferrer"
          className="group max-w-[60%] sm:max-w-xs border-b border-white/20 pb-2.5 text-right transition hover:border-white/40"
        >
          <span className="block text-[11px] sm:text-xs text-white/60">
            What if space debris could be harvested?
          </span>
          <span className="mt-1 flex items-center justify-end gap-2 text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition">
            <span>Discover Cosmoserve Space</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
          <span className="mt-1 block text-[10px] text-white/50">
            Founded by former ISRO scientist Dr. Chiranjeevi Phanindra
          </span>
        </a>
      </header>

      {/* Main Content: Left Editorial + Right Satellites with Motion Effects */}
      <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        {/* Left Column: Simple, Small to Read, Aesthetic */}
        <div className="lg:col-span-7 max-w-xl space-y-6">
          <div className="flex items-center gap-2.5 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono-tech tracking-[0.2em] text-[11px] uppercase">
              ORBITAL DEBRIS HARVEST // 001
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.05] text-white">
            Cosmoserve Space<br />
            <span className="text-white/45">Orbital simulator.</span>
          </h1>

          <p className="max-w-md text-sm sm:text-base leading-relaxed text-white/70 font-sans font-light">
            7,000+ tons of dead satellites. One mission to restore orbit.<br />
            Take the controls of the Reviver servicer, capture tumbling debris with soft-robotic paddles, and de-orbit cleanly over Point Nemo.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onStart}
              className="flex items-center gap-2 rounded-full bg-zinc-100 hover:bg-white px-7 py-3 text-sm font-bold text-zinc-950 transition active:scale-95 shadow-xl hover:shadow-emerald-500/10"
            >
              <span>Begin mission</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setControlsOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.09] px-5 py-3 text-sm font-mono-tech text-white/80 transition"
            >
              <Gamepad2 size={15} />
              <span>Flight controls</span>
            </button>

            <a
              href="https://cosmoserve.space/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.09] px-4 py-3 text-xs font-mono-tech text-white/70 hover:text-white transition"
              title="Visit official website"
            >
              <span>cosmoserve.space</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Minimal 3-Stat Strip (Aule Space Style) */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-5 max-w-md">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-display text-white">420 km</div>
              <div className="mt-1 text-[11px] text-white/50 font-mono-tech">Low Earth orbit</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-display text-white">120 km</div>
              <div className="mt-1 text-[11px] text-white/50 font-mono-tech">Re-entry interface</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-display text-emerald-400">4x Clamps</div>
              <div className="mt-1 text-[11px] text-white/50 font-mono-tech">Soft-robotic paddles</div>
            </div>
          </div>

          {/* 3-Step Teaser */}
          <div className="flex flex-wrap gap-5 text-xs text-white/50 font-mono-tech">
            <span>01 / Intercept debris</span>
            <span>02 / Paddle clamp</span>
            <span>03 / Point Nemo burn</span>
          </div>
        </div>

        {/* Right Column: Satellites with Motion Effects & Radar Scanning */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 text-xs font-mono-tech tracking-wider text-zinc-400">
            <span className="flex items-center gap-2">
              <Radio size={12} className="text-emerald-400 animate-pulse" />
              <span>ORBITAL TARGETS IN RANGE</span>
            </span>
            <span className="text-[10px] text-zinc-500">LIVE SENSOR RADAR</span>
          </div>

          {/* Floating Motion Satellite Cards */}
          <div className="space-y-3">
            {SATELLITE_TARGETS.map((sat, idx) => {
              const isSelected = selectedSat === idx;
              return (
                <div
                  key={sat.id}
                  onClick={() => setSelectedSat(idx)}
                  className={`relative overflow-hidden rounded-xl border backdrop-blur-md p-4 transition-all duration-300 cursor-pointer ${
                    sat.motionClass
                  } ${
                    isSelected
                      ? "border-emerald-400/50 bg-black/60 shadow-lg shadow-emerald-500/10 scale-[1.02]"
                      : "border-white/10 bg-black/35 hover:border-white/25 hover:bg-black/50"
                  }`}
                >
                  {/* Subtle animated scanning laser line */}
                  <div className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent animate-scan" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{sat.name}</span>
                        <span
                          className={`text-[9px] font-mono-tech px-1.5 py-0.5 rounded border ${sat.tagColor}`}
                        >
                          {sat.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono-tech">
                        {sat.type} • {sat.mass}
                      </div>
                    </div>

                    {/* Animated Reticle Ping */}
                    <div className="relative flex h-6 w-6 items-center justify-center">
                      <div className="absolute h-5 w-5 rounded-full border border-emerald-400/40 animate-pulse-glow" />
                      <Crosshair size={13} className="text-emerald-400" />
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed font-sans font-light">
                    {sat.desc}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px] font-mono-tech text-zinc-400">
                    <span>ALT: {sat.alt}</span>
                    <span>TUMBLE: {sat.spin}</span>
                    <span className="text-emerald-400">SOFT-ROBOTIC READY</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick link to original website for partnership details */}
          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-zinc-400">
            <span>In-orbit demonstration partner: Pixxel Space</span>
            <a
              href="https://cosmoserve.space/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition"
            >
              cosmoserve.space ↗
            </a>
          </div>
        </div>
      </div>

      {/* Footer - Minimal Single Line */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/15 pt-5 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <span>COSMOSERVE SPACE</span>
          <span>•</span>
          <span>T-Hub Hyderabad</span>
        </div>

        <div className="flex items-center gap-5">
          <a
            href="https://cosmoserve.space/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition underline underline-offset-4"
          >
            cosmoserve.space
          </a>
          <span>•</span>
          <a
            href="https://youtu.be/UjeyJfsrWME"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition underline underline-offset-4"
          >
            Founder video
          </a>
          <span>•</span>
          <a
            href="https://aule-adventure.pages.dev/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition underline underline-offset-4"
          >
            aule-adventure.pages.dev
          </a>
        </div>
      </footer>

      {/* Flight Controls Compact Modal */}
      {controlsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-xl border border-white/15 bg-[#090b10] p-6 text-zinc-100 shadow-2xl">
            <button
              onClick={() => setControlsOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white transition"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <h3 className="font-display text-lg font-bold text-white mb-1">Flight Controls</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Cosmoserve Reviver flight & soft-robotic capture keys.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Forward Thrust</span>
                <span className="font-mono-tech text-white font-bold">↑ or R</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Reverse / Brake</span>
                <span className="font-mono-tech text-white font-bold">↓ or Ctrl</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Pitch (Nose Down / Up)</span>
                <span className="font-mono-tech text-white font-bold">W / S</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Yaw (Turn Left / Right)</span>
                <span className="font-mono-tech text-white font-bold">A / D (or ← / →)</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Roll (CCW / CW)</span>
                <span className="font-mono-tech text-white font-bold">Q / E</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Nitro Turbo Boost</span>
                <span className="font-mono-tech text-amber-400 font-semibold">Shift (Hold)</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Robotic Pickup (Capture)</span>
                <span className="font-mono-tech text-emerald-400 font-bold">F</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Atmospheric De-Orbit</span>
                <span className="font-mono-tech text-amber-400 font-semibold">Space (in Zone)</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Operations & Settings Menu</span>
                <span className="font-mono-tech text-zinc-100 font-bold">ESC / P</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4">
              <a
                href="https://cosmoserve.space/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1"
              >
                <span>cosmoserve.space</span>
                <ExternalLink size={11} />
              </a>

              <button
                onClick={() => setControlsOpen(false)}
                className="px-4 py-1.5 rounded-full bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-white transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
