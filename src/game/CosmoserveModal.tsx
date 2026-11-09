import { ExternalLink, X, Video } from "lucide-react";

export function CosmoserveModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md font-hud">
      <div className="relative w-full max-w-2xl rounded-xl border border-cyan-500/50 bg-[#080d1e] p-6 sm:p-8 text-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-cyan-400">
          <span>COSMOSERVE SPACE</span>
          <span>•</span>
          <span>T-HUB HYDERABAD</span>
        </div>

        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-white">
          Pioneering Active Debris Removal (ADR)
        </h2>

        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          <strong>Cosmoserve Space</strong> develops cutting-edge Active Debris Removal (ADR) technology and commercial in-orbit servicing solutions to capture non-operational satellites and hazardous space junk, ensuring long-term orbital sustainability for human spaceflight and commercial constellations.
        </p>

        {/* Key People */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <span className="font-bold text-cyan-300">Dr. Chiranjeevi Phanindra B, Ph.D</span>
            <div className="text-[11px] text-slate-400 mt-0.5">Founder & CEO · Former ISRO Scientist</div>
            <p className="mt-1 text-slate-300 text-[11px]">
              Spearheading India&apos;s active space debris removal initiatives, soft-robotic capture mechanisms, and international ADR collaboration.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <span className="font-bold text-cyan-300">Pawan Kumar Chandana</span>
            <div className="text-[11px] text-slate-400 mt-0.5">Founding Partner · Co-founder of Skyroot Aerospace</div>
            <p className="mt-1 text-slate-300 text-[11px]">
              Supporting advanced mission architecture, propulsion systems, and commercial space flight integration.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <span className="font-bold text-cyan-300">Laura Crabtree</span>
            <div className="text-[11px] text-slate-400 mt-0.5">Advisor · SpaceX Dragon Flight Operations Veteran</div>
            <p className="mt-1 text-slate-300 text-[11px]">
              CORE operator for SpaceX Dragon to ISS missions, systems architecture expert, and CEO of Epsilon3.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <span className="font-bold text-cyan-300">Pixxel Space Partnership</span>
            <div className="text-[11px] text-slate-400 mt-0.5">In-Orbit Demonstration Partner</div>
            <p className="mt-1 text-slate-300 text-[11px]">
              Pixxel brings its flight-proven satellite platform to host and validate Cosmoserve&apos;s soft-robotic capture payload in Low Earth Orbit.
            </p>
          </div>
        </div>

        {/* Spacecraft Architecture */}
        <div className="mt-5 rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs">
          <div className="font-bold text-cyan-300 mb-1">THE MOTHERCRAFT & REVIVER SYSTEM</div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Cosmoserve uses a coordinated spacecraft duo: the <strong>Mothercraft</strong> acts as an orbital depot for fuel replenishment and mission logistics, while the agile <strong>Reviver</strong> module navigates towards debris, captures it with multi-joint soft robotic grippers, and executes controlled de-orbit burns towards the atmospheric entry interface.
          </p>
        </div>

        {/* Links */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <a
            href="https://youtu.be/UjeyJfsrWME"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded bg-rose-600/90 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-white transition"
          >
            <Video size={16} />
            <span>Watch Video on YouTube</span>
          </a>

          <a
            href="https://cosmoserve.space/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition"
          >
            <span>Visit Official Website (cosmoserve.space)</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
