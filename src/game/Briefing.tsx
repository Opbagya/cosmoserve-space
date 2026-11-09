import {
  ExternalLink,
  Flame,
  Play,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface BriefingProps {
  onStart: () => void;
  onOpenAbout: () => void;
}

export function Briefing({ onStart, onOpenAbout }: BriefingProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/80 p-4 sm:p-6 backdrop-blur-xl font-hud">
      <div className="relative w-full max-w-4xl rounded-lg border border-white/10 bg-[#090b10] p-6 sm:p-10 text-zinc-100 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono-tech tracking-[0.25em] text-zinc-400">
              <span>COSMOSERVE SPACE</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-200">MISSION EMBRACE</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
              ORBITAL ACTIVE DEBRIS REMOVAL
            </h1>
          </div>

          <button
            onClick={onOpenAbout}
            className="flex items-center gap-1.5 rounded border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08] transition"
          >
            <span>ABOUT MISSION</span>
            <ExternalLink size={12} />
          </button>
        </div>

        {/* 3-Column Architecture Matrix */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold tracking-wider font-mono-tech">
              <Zap size={14} className="text-zinc-400" />
              <span>THE DUO ARCHITECTURE</span>
            </div>
            <p className="mt-2 text-zinc-400 leading-relaxed">
              Pilot the <strong className="text-zinc-200">Reviver</strong> servicer craft docked at the orbital <strong className="text-zinc-200">Mothercraft</strong> depot. Equipped with adaptive soft-robotic capture arms developed by Cosmoserve Space (founded by former ISRO scientist <strong className="text-zinc-200">Dr. Chiranjeevi Phanindra</strong>).
            </p>
          </div>

          <div className="rounded border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold tracking-wider font-mono-tech">
              <Flame size={14} className="text-amber-400" />
              <span>SUB-120KM RE-ENTRY BURN</span>
            </div>
            <p className="mt-2 text-zinc-400 leading-relaxed">
              Capture non-operational satellites and tow them to the <strong className="text-zinc-200">Atmospheric Re-entry Corridor (~120 km)</strong> above Point Nemo. Hypersonic aerodynamic drag naturally incinerates the debris upon entry.
            </p>
          </div>

          <div className="rounded border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold tracking-wider font-mono-tech">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>DYNAMIC ΔV & RECHARGE</span>
            </div>
            <p className="mt-2 text-zinc-400 leading-relaxed">
              Fuel supports <strong className="text-zinc-200">2–3 satellite cleanups</strong> per sortie. Watch the <strong className="text-amber-400">return needle</strong> on your fuel gauge. Returning to the Mothercraft replenishes tanks in <strong className="text-zinc-200">&lt; 1 second</strong>.
            </p>
          </div>
        </div>

        {/* Flight & System Controls */}
        <div className="mt-6 rounded border border-white/[0.06] bg-black/40 p-4">
          <div className="text-[11px] font-mono-tech tracking-widest text-zinc-400 mb-3 uppercase">
            Flight Telemetry & Controls
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex flex-col">
              <span className="font-mono-tech text-zinc-200 font-semibold">W or ↑</span>
              <span className="text-zinc-500 text-[11px]">Forward Thrusters</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-zinc-200 font-semibold">S or ↓</span>
              <span className="text-zinc-500 text-[11px]">Brake / Reverse</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-zinc-200 font-semibold">A / D or ← / →</span>
              <span className="text-zinc-500 text-[11px]">Steer Left / Right</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-zinc-100 font-bold text-emerald-400">⌘ Cmd / Alt / C</span>
              <span className="text-zinc-400 text-[11px]">Soft Robotic Capture</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-zinc-200 font-semibold">Space / Enter</span>
              <span className="text-zinc-500 text-[11px]">Launch / De-orbit Burn</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-zinc-200 font-semibold">Shift</span>
              <span className="text-zinc-500 text-[11px]">Turbo Boost Burn</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-zinc-200 font-semibold">R / F</span>
              <span className="text-zinc-500 text-[11px]">Pitch Trim Down / Up</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech text-zinc-200 font-semibold">V / Esc</span>
              <span className="text-zinc-500 text-[11px]">Camera / Pause</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <a
              href="https://cosmoserve.space/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-200 transition underline underline-offset-4"
            >
              cosmoserve.space
            </a>
            <span>•</span>
            <a
              href="https://aule-adventure.pages.dev/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-200 transition underline underline-offset-4"
            >
              aule-adventure.pages.dev
            </a>
          </div>

          <button
            onClick={onStart}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded bg-zinc-100 px-8 py-3 text-sm font-bold tracking-wider text-zinc-950 hover:bg-white active:scale-95 transition shadow-lg"
          >
            <Play size={16} />
            <span>LAUNCH SORTIE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
