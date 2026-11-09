import { useState } from "react";
import { setBriefingViewMode, sim } from "./sim";
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
}

const SATELLITE_TARGETS = [
  {
    id: "deb-1",
    name: "ISRO EOS-04 (RISAT SAR)",
    type: "C-Band Radar Earth Observation Satellite",
    mass: "1,710 KG",
    alt: "529 KM",
    spin: "0.42 RAD/S",
    status: "ORBITAL TARGET",
    tagColor: "text-amber-300 border-amber-400/20 bg-amber-400/10",
    desc: "Indian synthetic aperture radar satellite with deployable 3.6m parabolic antenna dish in decaying orbit.",
    motionClass: "animate-float-slow",
  },
  {
    id: "deb-2",
    name: "ISRO PSLV Upper Stage (POEM)",
    type: "PS4 Orbital Platform Booster",
    mass: "1,450 KG",
    alt: "460 KM",
    spin: "0.26 RAD/S",
    status: "HEAVY CASING",
    tagColor: "text-red-300 border-red-400/20 bg-red-400/10",
    desc: "Depleted Polar Satellite Launch Vehicle 4th stage with dual liquid rocket engines and solar platform.",
    motionClass: "animate-float-delay",
  },
  {
    id: "deb-3",
    name: "CSS Tiangong / ISS Module Truss",
    type: "Station Pressurized Module & Solar Array",
    mass: "890 KG",
    alt: "415 KM",
    spin: "0.68 RAD/S",
    status: "STRUCTURAL TRUSS",
    tagColor: "text-cyan-300 border-cyan-400/20 bg-cyan-400/10",
    desc: "Pressurized cylinder with APAS berthing ring, integrated carbon truss, and solar wing fragment.",
    motionClass: "animate-float-slow",
  },
];

export function LandingPage({ onStart }: LandingPageProps) {
  const [controlsOpen, setControlsOpen] = useState(false);
  const [selectedSat, setSelectedSat] = useState(0);
  const [viewMode, setViewMode] = useState<"satellite" | "mothership">(sim.briefingViewMode || "satellite");

  const handleToggleView = (mode: "satellite" | "mothership") => {
    setViewMode(mode);
    setBriefingViewMode(mode, SATELLITE_TARGETS[selectedSat]?.id);
  };

  const handleSelectSat = (idx: number) => {
    setSelectedSat(idx);
    setViewMode("satellite");
    setBriefingViewMode("satellite", SATELLITE_TARGETS[idx]?.id);
  };

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
              className="flex items-center gap-2 rounded-full bg-white hover:bg-zinc-100 px-7 py-3 text-sm font-bold text-zinc-950 transition active:scale-95 shadow-xl hover:shadow-white/10"
            >
              <span>Begin sortie</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setControlsOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-5 py-3 text-sm font-mono-tech text-white/90 transition backdrop-blur-md"
            >
              <Gamepad2 size={15} />
              <span>Flight controls</span>
            </button>

            <a
              href="https://cosmoserve.space/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-4 py-3 text-xs font-mono-tech text-white/70 hover:text-white transition backdrop-blur-md"
              title="Visit official website"
            >
              <span>cosmoserve.space</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Minimal Clean Status Line */}
          <div className="flex items-center gap-6 border-t border-white/10 pt-4 text-xs font-mono-tech text-zinc-400">
            <span>ORBIT: 420 KM</span>
            <span>DISPOSAL: SUB-120 KM</span>
            <span className="text-emerald-400">PADDLES: SOFT-ROBOTIC</span>
          </div>
        </div>

        {/* Right Column: Satellites with Motion Effects & Radar Scanning */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-mono-tech tracking-wider text-zinc-400">
            <span className="flex items-center gap-2">
              <Radio size={12} className="text-emerald-400 animate-pulse" />
              <span>3D RADAR TRACKING</span>
            </span>

            {/* Reversible 3D View Switcher */}
            <div className="flex items-center rounded-full bg-white/[0.05] p-0.5 border border-white/10 backdrop-blur-xl">
              <button
                onClick={() => handleToggleView("satellite")}
                className={`px-3 py-1 rounded-full text-[10px] font-mono-tech transition ${
                  viewMode === "satellite"
                    ? "bg-white text-zinc-950 font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Cinematic orbital tracking of targeted space debris"
              >
                🛰️ Satellite View
              </button>
              <button
                onClick={() => handleToggleView("mothership")}
                className={`px-3 py-1 rounded-full text-[10px] font-mono-tech transition ${
                  viewMode === "mothership"
                    ? "bg-white text-zinc-950 font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Return to orbital Mothercraft depot & Reviver base"
              >
                🛸 Mothership Base
              </button>
            </div>
          </div>

          {/* Floating Motion Satellite Cards */}
          <div className="space-y-3">
            {SATELLITE_TARGETS.map((sat, idx) => {
              const isSelected = selectedSat === idx;
              return (
                <div
                  key={sat.id}
                  onClick={() => handleSelectSat(idx)}
                  className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl p-4 transition-all duration-300 cursor-pointer ${
                    sat.motionClass
                  } ${
                    isSelected
                      ? "border-white/40 bg-white/[0.08] shadow-2xl scale-[1.02]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  {/* Subtle animated scanning laser line */}
                  <div className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent animate-scan" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-white">{sat.name}</span>
                        <span
                          className={`text-[9px] font-mono-tech px-2 py-0.5 rounded-full border ${sat.tagColor}`}
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
                      <div className="absolute h-5 w-5 rounded-full border border-white/20 animate-pulse-glow" />
                      <Crosshair size={13} className="text-zinc-300" />
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-zinc-300 leading-relaxed font-sans font-light">
                    {sat.desc}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px] font-mono-tech text-zinc-400">
                    <span>ALT: {sat.alt}</span>
                    <span>TUMBLE: {sat.spin}</span>
                    {isSelected && viewMode === "satellite" ? (
                      <span className="text-emerald-300 font-bold flex items-center gap-1 animate-pulse">
                        ● 3D CAMERA TRACKING
                      </span>
                    ) : (
                      <span className="text-zinc-400">SOFT-ROBOTIC READY</span>
                    )}
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
                <span className="text-zinc-400">Pitch (Nose Up / Down)</span>
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
