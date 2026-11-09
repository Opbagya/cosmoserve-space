import { ExternalLink, X, Video } from "lucide-react";

export function CosmoserveModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 sm:p-6 backdrop-blur-xl font-hud">
      <div className="relative w-full max-w-2xl rounded-lg border border-white/10 bg-[#090b10] p-6 sm:p-8 text-zinc-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-zinc-500 hover:text-zinc-200 transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 text-[11px] font-mono-tech tracking-[0.25em] text-zinc-400">
          <span>COSMOSERVE SPACE</span>
          <span className="text-zinc-600">•</span>
          <span>T-HUB HYDERABAD</span>
        </div>

        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Active Debris Removal (ADR) Technology
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          <strong>Cosmoserve Space</strong> develops active debris capture technology and commercial in-orbit servicing solutions to clean non-operational satellites and hazardous space fragments, ensuring long-term orbital sustainability for human spaceflight and global constellations.
        </p>

        {/* Key People Matrix */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3.5">
            <span className="font-semibold text-zinc-200">Dr. Chiranjeevi Phanindra B, Ph.D</span>
            <div className="text-[11px] text-zinc-500 font-mono-tech mt-0.5">Founder & CEO · Former ISRO Scientist</div>
            <p className="mt-1 text-zinc-400 text-[11px] leading-relaxed">
              Leading India&apos;s active space debris removal programs, soft-robotic capture mechanisms, and international ADR collaboration.
            </p>
          </div>

          <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3.5">
            <span className="font-semibold text-zinc-200">Pawan Kumar Chandana</span>
            <div className="text-[11px] text-zinc-500 font-mono-tech mt-0.5">Founding Partner · Co-founder of Skyroot Aerospace</div>
            <p className="mt-1 text-zinc-400 text-[11px] leading-relaxed">
              Guiding mission architecture, orbital launch integration, and commercial aerospace growth.
            </p>
          </div>

          <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3.5">
            <span className="font-semibold text-zinc-200">Laura Crabtree</span>
            <div className="text-[11px] text-zinc-500 font-mono-tech mt-0.5">Advisor · SpaceX Dragon Flight Operations Veteran</div>
            <p className="mt-1 text-zinc-400 text-[11px] leading-relaxed">
              CORE operator for SpaceX Dragon missions to the ISS, mission systems architect, and CEO of Epsilon3.
            </p>
          </div>

          <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3.5">
            <span className="font-semibold text-zinc-200">Pixxel Space Partnership</span>
            <div className="text-[11px] text-zinc-500 font-mono-tech mt-0.5">In-Orbit Demonstration Partner</div>
            <p className="mt-1 text-zinc-400 text-[11px] leading-relaxed">
              Providing flight-proven satellite platforms to host and demonstrate Cosmoserve&apos;s soft-robotic capture payload in Low Earth Orbit.
            </p>
          </div>
        </div>

        {/* Spacecraft System */}
        <div className="mt-4 rounded border border-white/[0.06] bg-black/40 p-3.5 text-xs">
          <div className="font-semibold font-mono-tech text-zinc-300 text-[11px] uppercase tracking-wider mb-1">
            The Mothercraft & Reviver System
          </div>
          <p className="text-zinc-400 leading-relaxed text-[11px]">
            Cosmoserve uses a coordinated spacecraft duo: the <strong>Mothercraft</strong> acts as an orbital depot for fuel replenishment and mission logistics, while the agile <strong>Reviver</strong> module navigates towards debris, captures it with multi-joint soft robotic grippers, and executes controlled de-orbit burns toward the atmospheric entry interface.
          </p>
        </div>

        {/* Links */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
          <a
            href="https://youtu.be/UjeyJfsrWME"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2 text-xs font-semibold text-zinc-200 transition"
          >
            <Video size={14} className="text-zinc-400" />
            <span>Watch Overview on YouTube</span>
          </a>

          <a
            href="https://cosmoserve.space/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white underline underline-offset-4 transition"
          >
            <span>Visit Official Site (cosmoserve.space)</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
