import { ExternalLink, Video, X } from "lucide-react";

export function CosmoserveModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md font-hud select-none">
      <div className="relative w-full max-w-lg rounded-xl border border-white/15 bg-[#090b10] p-6 text-zinc-100 shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white transition"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono-tech tracking-[0.2em] text-emerald-400 uppercase">
            <span>Cosmoserve Space</span>
            <span className="text-zinc-600">•</span>
            <span>T-Hub Hyderabad</span>
          </div>
          <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            Active Debris Removal (ADR)
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans font-light">
          Cosmoserve Space builds autonomous orbital servicer craft with patented soft-robotic capture paddles to harvest non-operational satellites and perform clean atmospheric de-orbit burns.
        </p>

        {/* Crisp Key Team Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="font-semibold text-zinc-200">Dr. Chiranjeevi Phanindra</div>
            <div className="text-[10px] text-zinc-400 font-mono-tech mt-0.5">Founder & CEO · Ex-ISRO</div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="font-semibold text-zinc-200">Pawan Kumar Chandana</div>
            <div className="text-[10px] text-zinc-400 font-mono-tech mt-0.5">Co-founder, Skyroot Aerospace</div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="font-semibold text-zinc-200">Laura Crabtree</div>
            <div className="text-[10px] text-zinc-400 font-mono-tech mt-0.5">SpaceX Dragon Flight Veteran</div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="font-semibold text-zinc-200">Pixxel Space</div>
            <div className="text-[10px] text-zinc-400 font-mono-tech mt-0.5">LEO Flight Host Partner</div>
          </div>
        </div>

        {/* Direct Links */}
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
          <a
            href="https://youtu.be/UjeyJfsrWME"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-2 text-xs font-mono-tech text-zinc-300 transition"
          >
            <Video size={13} className="text-zinc-400" />
            <span>YouTube video</span>
          </a>

          <a
            href="https://cosmoserve.space/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white px-4 py-2 text-xs font-bold text-zinc-950 transition shadow-md"
          >
            <span>Visit cosmoserve.space</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
