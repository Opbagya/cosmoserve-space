import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Flame,
  Gamepad2,
  Globe2,
  Info,
  Play,
  RotateCcw,
  ShieldCheck,
  Video,
  X,
  Zap,
} from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
  onOpenAbout: () => void;
}

export function LandingPage({ onStart, onOpenAbout }: LandingPageProps) {
  const [controlsOpen, setControlsOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-black/75 backdrop-blur-[3px] font-hud text-zinc-100 select-none">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-black/40 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <a
            href="https://cosmoserve.space/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 group transition"
          >
            <span className="font-display text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-zinc-200">
              COSMOSERVE
            </span>
            <span className="text-xs font-mono-tech tracking-widest text-zinc-400 uppercase">
              SPACE
            </span>
          </a>
          <span className="hidden sm:inline-block h-3.5 w-px bg-white/20" />
          <span className="hidden sm:inline-block text-[11px] font-mono-tech text-zinc-400">
            Active Debris Removal
          </span>
        </div>

        {/* Right Nav Links */}
        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="https://cosmoserve.space/"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition group"
          >
            <span>Visit Official Site</span>
            <ExternalLink size={12} className="text-zinc-500 group-hover:text-white transition" />
          </a>

          <a
            href="https://youtu.be/UjeyJfsrWME"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition group"
          >
            <Video size={13} className="text-zinc-400" />
            <span>Video</span>
          </a>

          <button
            onClick={() => setControlsOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08] transition"
          >
            <Gamepad2 size={13} />
            <span className="hidden sm:inline">Controls</span>
          </button>

          <button
            onClick={onStart}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white px-4 py-1.5 text-xs font-bold tracking-wider text-zinc-950 transition active:scale-95 shadow-md"
          >
            <span>LAUNCH SORTIE</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Main Hero & Content Flow */}
      <main className="mx-auto max-w-5xl px-6 py-12 md:py-20 md:px-12 space-y-16">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-tech tracking-[0.25em] text-zinc-400 uppercase">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ORBITAL DEBRIS REMEDIATION</span>
            <span className="text-zinc-600">•</span>
            <span>SORTIE 001 // MISSION EMBRACE</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300">T-HUB HYDERABAD</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
            Cosmoserve Space<br />
            <span className="text-zinc-400 font-light">Autonomous ADR Simulator.</span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-zinc-300 leading-relaxed font-sans font-light">
            Over 7,000 metric tons of non-operational satellites and debris threaten global space infrastructure. 
            Founded by former ISRO scientist <strong className="text-white font-medium">Dr. Chiranjeevi Phanindra</strong>, 
            Cosmoserve Space develops compliant soft-robotic capture mechanisms to secure tumbling spacecraft and perform clean, controlled de-orbit burns into Earth&apos;s upper atmosphere.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onStart}
              className="flex items-center gap-2.5 rounded-xl bg-zinc-100 hover:bg-white px-8 py-3.5 text-sm font-bold tracking-wider text-zinc-950 transition active:scale-95 shadow-xl"
            >
              <Play size={16} />
              <span>LAUNCH MISSION</span>
            </button>

            <button
              onClick={() => setControlsOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-5 py-3.5 text-sm font-mono-tech tracking-wider text-zinc-200 transition"
            >
              <Gamepad2 size={16} />
              <span>FLIGHT CONTROLS</span>
            </button>

            <button
              onClick={onOpenAbout}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-5 py-3.5 text-sm font-mono-tech tracking-wider text-zinc-200 transition"
            >
              <Info size={16} />
              <span>ADR TECHNOLOGY & TEAM</span>
            </button>

            <a
              href="https://youtu.be/UjeyJfsrWME"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-5 py-3.5 text-sm font-mono-tech tracking-wider text-zinc-300 transition"
            >
              <Video size={16} className="text-zinc-400" />
              <span>WATCH VIDEO</span>
            </a>
          </div>

          {/* Key Metrics Strip (Aule Space Style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.12] pt-8 mt-10">
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-white">~420 km</div>
              <div className="mt-1 text-xs text-zinc-400 font-mono-tech uppercase tracking-wider">
                Low Earth Orbit Base
              </div>
            </div>

            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-white">120 km</div>
              <div className="mt-1 text-xs text-zinc-400 font-mono-tech uppercase tracking-wider">
                Point Nemo Re-entry Interface
              </div>
            </div>

            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-emerald-400">4x Clamps</div>
              <div className="mt-1 text-xs text-zinc-400 font-mono-tech uppercase tracking-wider">
                Soft-Robotic Compliant Paddles
              </div>
            </div>

            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-amber-400">&lt; 1.0 s</div>
              <div className="mt-1 text-xs text-zinc-400 font-mono-tech uppercase tracking-wider">
                Mothercraft Fast Refuel
              </div>
            </div>
          </div>

          {/* 3-Step Sortie Operational Flow */}
          <div className="flex flex-wrap gap-6 pt-4 text-xs font-mono-tech text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="text-zinc-200 font-bold">01 /</span> Undock & Intercept Debris
            </span>
            <span className="flex items-center gap-2">
              <span className="text-zinc-200 font-bold">02 /</span> Soft-Robotic Paddle Clamp
            </span>
            <span className="flex items-center gap-2">
              <span className="text-zinc-200 font-bold">03 /</span> Sub-120km Atmospheric Burn
            </span>
          </div>
        </div>

        {/* Spacecraft Duo Architecture Section */}
        <section className="space-y-6 border-t border-white/[0.08] pt-12">
          <div>
            <div className="text-[11px] font-mono-tech tracking-[0.25em] text-zinc-400 uppercase">
              System Architecture
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Mothercraft & Reviver Duo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Mothercraft Depot */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-base font-bold text-white tracking-wide">
                  Orbital Mothercraft Depot
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-white/[0.06] text-zinc-300">
                  PERMANENT STATION
                </span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                Acts as an autonomous in-orbit resupply base. Houses propellant reserves, photovoltaic arrays for battery charging, and optical tracking radar to coordinate regional space junk sorting. Refuels the Reviver servicer in under a second upon docking.
              </p>
            </div>

            {/* Reviver Servicer */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-base font-bold text-white tracking-wide">
                  Reviver ADR Servicer Craft
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-emerald-500/20 text-emerald-300">
                  ACTIVE SERVICER
                </span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-sans text-xs">
                An agile, high-precision maneuver vehicle equipped with patented white compliant robotic capture paddles. Encloses tumbling dead satellites securely without generating new micro-fragmentation, then executes delta-V burns toward Earth&apos;s re-entry zone.
              </p>
            </div>
          </div>
        </section>

        {/* Atmospheric Re-Entry & Point Nemo Section */}
        <section className="space-y-6 border-t border-white/[0.08] pt-12">
          <div>
            <div className="text-[11px] font-mono-tech tracking-[0.25em] text-zinc-400 uppercase">
              De-Orbit Physics
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Atmospheric Re-entry & Point Nemo Disposal
            </h2>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-6 space-y-4">
            <p className="text-zinc-300 leading-relaxed font-sans text-sm">
              In space debris remediation, leaving debris in decaying orbits can take decades. By towing dead satellites below the <strong className="text-white">120-kilometer atmospheric interface threshold</strong>, aerodynamic drag increases exponentially.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-3.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="font-mono-tech text-emerald-400 font-semibold mb-1">Sub-120km Interface</div>
                <div className="text-zinc-400 text-[11px] leading-relaxed">
                  Upper mesosphere density generates hypersonic shock heating, naturally incinerating the debris structure.
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="font-mono-tech text-cyan-400 font-semibold mb-1">Point Nemo Corridor</div>
                <div className="text-zinc-400 text-[11px] leading-relaxed">
                  The Oceanic Pole of Inaccessibility in the South Pacific Ocean—farthest from any human landmass on Earth.
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="font-mono-tech text-amber-400 font-semibold mb-1">Reusable Reviver Craft</div>
                <div className="text-zinc-400 text-[11px] leading-relaxed">
                  The Reviver releases debris into the corridor and executes an immediate retrograde burn to return safely to the Mothercraft depot.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership & Ecosystem Section */}
        <section className="space-y-6 border-t border-white/[0.08] pt-12">
          <div>
            <div className="text-[11px] font-mono-tech tracking-[0.25em] text-zinc-400 uppercase">
              Leadership & Partners
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Backed by Global Aerospace Leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-1.5">
              <div className="text-sm font-semibold text-white">Dr. Chiranjeevi Phanindra B, Ph.D</div>
              <div className="text-[11px] text-zinc-400 font-mono-tech">Founder & CEO · Former ISRO Scientist</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Pioneering active space debris removal, soft-robotic capture mechanisms, and international ADR commercialization from Hyderabad.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-1.5">
              <div className="text-sm font-semibold text-white">Pawan Kumar Chandana</div>
              <div className="text-[11px] text-zinc-400 font-mono-tech">Founding Partner · Co-founder of Skyroot Aerospace</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Guiding orbital launch vehicle integration, mission logistics, and commercial aerospace scale across India.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-1.5">
              <div className="text-sm font-semibold text-white">Laura Crabtree</div>
              <div className="text-[11px] text-zinc-400 font-mono-tech">Advisor · SpaceX Dragon Flight Operations Veteran</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                CORE operator for SpaceX Dragon missions to the International Space Station and CEO of mission software pioneer Epsilon3.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-1.5">
              <div className="text-sm font-semibold text-white">Pixxel Space Partnership</div>
              <div className="text-[11px] text-zinc-400 font-mono-tech">In-Orbit Demonstration Partner</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Providing flight-proven satellite platforms to host and demonstrate Cosmoserve&apos;s soft-robotic capture payload in Low Earth Orbit.
              </p>
            </div>
          </div>
        </section>

        {/* Flight Controls Reference Matrix on Webpage */}
        <section className="space-y-6 border-t border-white/[0.08] pt-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono-tech tracking-[0.25em] text-zinc-400 uppercase">
                Sim Controls Reference
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-white tracking-tight">
                Reviver Flight & ADR Operations
              </h2>
            </div>
            <button
              onClick={onStart}
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white px-4 py-2 text-xs font-bold text-zinc-950 transition active:scale-95 shadow-md"
            >
              <span>LAUNCH NOW</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3.5 py-2 border border-white/[0.06]">
              <span className="text-zinc-400">Regular Move (Fwd/Rev/Turn)</span>
              <span className="font-mono-tech text-white font-bold">↑ / ↓ / ← / →</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3.5 py-2 border border-white/[0.06]">
              <span className="text-zinc-400">Pitch (Nose Down / Up)</span>
              <span className="font-mono-tech text-white font-bold">W / S</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3.5 py-2 border border-white/[0.06]">
              <span className="text-zinc-400">Yaw & Bank Roll</span>
              <span className="font-mono-tech text-white font-bold">A / D</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3.5 py-2 border border-white/[0.06]">
              <span className="text-zinc-400">Nitro Turbo Boost</span>
              <span className="font-mono-tech text-amber-400 font-semibold">Shift (Hold)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3.5 py-2 border border-white/[0.06]">
              <span className="text-zinc-400">Robotic Pickup (Capture)</span>
              <span className="font-mono-tech text-emerald-400 font-bold">Alt / Command</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3.5 py-2 border border-white/[0.06]">
              <span className="text-zinc-400">Atmospheric De-Orbit</span>
              <span className="font-mono-tech text-amber-400 font-semibold">Space (in Zone)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3.5 py-2 border border-white/[0.06]">
              <span className="text-zinc-400">Launch from Base</span>
              <span className="font-mono-tech text-zinc-100 font-semibold">Space or ↑</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3.5 py-2 border border-white/[0.06]">
              <span className="text-zinc-400">Cycle Camera View</span>
              <span className="font-mono-tech text-zinc-100 font-semibold">V</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3.5 py-2 border border-white/[0.06]">
              <span className="text-zinc-400">In-Flight Operations Menu</span>
              <span className="font-mono-tech text-zinc-100 font-bold">ESC / P</span>
            </div>
          </div>
        </section>

        {/* Final Launch Banner */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8 md:p-12 text-center space-y-5">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to Clean Low Earth Orbit?
          </h2>
          <p className="max-w-xl mx-auto text-sm text-zinc-400 leading-relaxed">
            Take the controls of the Cosmoserve Reviver. Secure non-operational satellites and protect orbital spaceflight for generations to come.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onStart}
              className="flex items-center gap-2 rounded-xl bg-zinc-100 hover:bg-white px-8 py-3.5 text-sm font-bold text-zinc-950 transition active:scale-95 shadow-xl"
            >
              <Play size={16} />
              <span>LAUNCH SORTIE</span>
            </button>
            <a
              href="https://cosmoserve.space/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-6 py-3.5 text-sm font-mono-tech text-zinc-200 transition"
            >
              <span>VISIT OFFICIAL WEBSITE</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.08] pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-zinc-300">COSMOSERVE SPACE</span>
            <span>•</span>
            <span>T-Hub Hyderabad, India</span>
          </div>

          <div className="flex items-center gap-4">
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
              href="https://youtu.be/UjeyJfsrWME"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-200 transition underline underline-offset-4"
            >
              YouTube
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
        </footer>
      </main>

      {/* Flight Controls Modal Overlay */}
      {controlsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#090b10] p-6 text-zinc-100 shadow-2xl">
            <button
              onClick={() => setControlsOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white transition"
            >
              <X size={18} />
            </button>

            <h3 className="font-display text-xl font-bold text-white mb-2">Flight Controls</h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              Keyboard and mobile controls for the Cosmoserve Reviver servicer craft.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Regular Move (Fwd/Rev/Turn)</span>
                <span className="font-mono-tech text-white font-bold">↑ / ↓ / ← / →</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Pitch (Nose Down / Up)</span>
                <span className="font-mono-tech text-white font-bold">W / S</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Yaw & Bank Roll</span>
                <span className="font-mono-tech text-white font-bold">A / D</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Nitro Turbo Boost</span>
                <span className="font-mono-tech text-amber-400 font-semibold">Shift (Hold)</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Robotic Pickup (Capture)</span>
                <span className="font-mono-tech text-emerald-400 font-bold">Alt / Command</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">Atmospheric De-Orbit</span>
                <span className="font-mono-tech text-amber-400 font-semibold">Space (in Zone)</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 border border-white/[0.05]">
                <span className="text-zinc-400">In-Flight Operations Menu</span>
                <span className="font-mono-tech text-zinc-100 font-bold">ESC / P</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setControlsOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-950 hover:bg-white transition"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
