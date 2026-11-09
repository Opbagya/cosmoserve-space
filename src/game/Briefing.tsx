import {
  ExternalLink,
  Flame,
  Globe,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface BriefingProps {
  onStart: () => void;
  onOpenAbout: () => void;
}

export function Briefing({ onStart, onOpenAbout }: BriefingProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md font-hud">
      <div className="relative w-full max-w-4xl rounded-xl border border-cyan-500/40 bg-[#060a16]/95 p-6 sm:p-10 text-slate-100 shadow-2xl">
        {/* Cosmoserve Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-500/30 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-cyan-400">
              <span>COSMOSERVE SPACE</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400">MISSION EMBRACE</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-4xl font-extrabold tracking-wider text-white">
              ORBITAL ACTIVE DEBRIS REMOVAL
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-900/50 transition"
            >
              <span>ABOUT COSMOSERVE</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* Mission Briefing Context */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2 text-cyan-300 font-bold tracking-wider">
              <Zap size={16} />
              <span>THE COSMOSERVE DUO</span>
            </div>
            <p className="mt-2 text-slate-300 leading-relaxed">
              Command the <strong className="text-cyan-300">Reviver</strong> servicer craft docked at the orbital <strong className="text-cyan-300">Mothercraft</strong> depot. Equipped with adaptive soft-robotic capture tentacles developed by Cosmoserve Space (founded by former ISRO scientist <strong className="text-white">Dr. Chiranjeevi Phanindra</strong>).
            </p>
          </div>

          <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2 text-amber-300 font-bold tracking-wider">
              <Flame size={16} />
              <span>SUB-120KM RE-ENTRY DISPERSAL</span>
            </div>
            <p className="mt-2 text-slate-300 leading-relaxed">
              Capture tumbling space debris (defunct satellites, spent rocket boosters) and tow them down to the designated <strong className="text-amber-300">Atmospheric Re-entry Corridor (~120 km)</strong> where aerodynamic friction naturally incinerates the debris upon entry!
            </p>
          </div>

          <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2 text-emerald-300 font-bold tracking-wider">
              <ShieldCheck size={16} />
              <span>DYNAMIC FUEL & RECHARGE</span>
            </div>
            <p className="mt-2 text-slate-300 leading-relaxed">
              Your fuel allows cleaning <strong className="text-emerald-300">2 to 3 satellites</strong> per run. Watch the <strong className="text-amber-300">floating return line</strong> on your fuel bar—it dynamically indicates the ΔV needed to burn back to the Mothercraft for fast replenishment!
            </p>
          </div>
        </div>

        {/* Flight Controls Cheat Sheet */}
        <div className="mt-6 rounded-lg border border-cyan-500/20 bg-[#0a0f20]/60 p-4">
          <div className="text-xs font-bold tracking-widest text-cyan-400 mb-3">
            FLIGHT & CAPTURE CONTROLS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex flex-col">
              <span className="font-mono-tech text-cyan-300 font-bold">W / S or ↑ / ↓</span>
              <span className="text-slate-400">Pitch Nose Down / Up</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-cyan-300 font-bold">A / D or ← / →</span>
              <span className="text-slate-400">Yaw Left / Right</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-cyan-300 font-bold">Q / E</span>
              <span className="text-slate-400">Roll CCW / CW</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-cyan-300 font-bold">R / F</span>
              <span className="text-slate-400">Forward / Retro Thrust</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-cyan-300 font-bold">Space / C</span>
              <span className="text-slate-400">Heave Up / Down</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-cyan-300 font-bold">Shift (Hold)</span>
              <span className="text-slate-400">Boost Surge</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-cyan-300 font-bold">E / Click</span>
              <span className="text-slate-400">Soft Robotic Capture</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-cyan-300 font-bold">X / V</span>
              <span className="text-slate-400">RCS Damper / Cycle Cam</span>
            </div>
          </div>
        </div>

        {/* Action Buttons & Links */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <a
              href="https://cosmoserve.space/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-cyan-300 transition underline underline-offset-4"
            >
              <span>Visit cosmoserve.space</span>
              <ExternalLink size={12} />
            </a>
            <span>•</span>
            <a
              href="https://aule-adventure.pages.dev/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-cyan-300 transition underline underline-offset-4"
            >
              <span>Aule Adventure</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <button
            onClick={onStart}
            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-lg border border-cyan-400 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 px-8 py-3.5 font-display text-base font-bold tracking-widest text-white shadow-lg hover:brightness-110 active:scale-95 transition"
          >
            <Play size={18} />
            <span>LAUNCH MISSION</span>
          </button>
        </div>
      </div>
    </div>
  );
}
