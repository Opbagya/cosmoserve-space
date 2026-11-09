import { useState } from "react";
import {
  ExternalLink,
  Flame,
  Home,
  Music,
  Play,
  RotateCcw,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { audio } from "./audio";
import { emergencyDock, returnToMainMenu, sim } from "./sim";

interface OperationsMenuProps {
  onResume: () => void;
  onRestart: () => void;
}

export function OperationsMenu({ onResume, onRestart }: OperationsMenuProps) {
  const [musicOn, setMusicOn] = useState(audio.musicVolume > 0.05);
  const [sfxOn, setSfxOn] = useState(audio.sfxVolume > 0.05);
  const [invertPitch, setInvertPitch] = useState(sim.invertPitch);
  const [dampOn, setDampOn] = useState(sim.damp);

  const handleMusicToggle = () => {
    const next = !musicOn;
    setMusicOn(next);
    audio.setMusicVolume(next ? 0.35 : 0);
  };

  const handleSfxToggle = () => {
    const next = !sfxOn;
    setSfxOn(next);
    audio.setSfxVolume(next ? 0.75 : 0);
  };

  const handleInvertPitchToggle = () => {
    const next = !invertPitch;
    setInvertPitch(next);
    sim.invertPitch = next;
    sim.flashMessage = next ? "PITCH INVERTED: W = DOWN, S = UP" : "PITCH STANDARD: W = UP, S = DOWN";
    sim.flashTimer = 2.5;
  };

  const handleDampToggle = () => {
    const next = !dampOn;
    setDampOn(next);
    sim.damp = next;
    sim.flashMessage = next ? "RCS ROTATIONAL DAMPER: ENGAGED" : "RCS ROTATIONAL DAMPER: MANUAL DRIFT";
    sim.flashTimer = 2.5;
  };

  const handleEmergencyDock = () => {
    emergencyDock();
    onResume();
  };

  const handleReturnToWebpage = () => {
    returnToMainMenu();
    audio.stopMusic();
    audio.setHiss(0);
    audio.setRoar(0);
    audio.suspend(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xl p-4 font-hud select-none">
      <div className="relative flex flex-col w-full max-w-xl rounded-2xl border border-white/10 bg-black/50 p-6 shadow-2xl text-zinc-100 overflow-hidden backdrop-blur-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-[10px] font-mono-tech tracking-[0.2em] text-zinc-400 uppercase">
                COSMOSERVE REVIVER // FLIGHT PAUSED
              </div>
              <h2 className="text-lg font-medium tracking-tight text-white">
                Operations & Settings
              </h2>
            </div>
          </div>

          <button
            onClick={onResume}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 transition"
            title="Resume Flight (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Mission Status Chips */}
        <div className="grid grid-cols-3 gap-2 py-3 border-b border-white/[0.06] text-xs font-mono-tech">
          <div className="rounded-lg bg-white/[0.03] p-2 text-center border border-white/[0.04]">
            <span className="block text-[9px] text-zinc-500 uppercase">Cleared</span>
            <span className="font-bold text-white">{sim.clearedCount} / {sim.totalDebris}</span>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-2 text-center border border-white/[0.04]">
            <span className="block text-[9px] text-zinc-500 uppercase">Propellant ΔV</span>
            <span className={`font-bold ${sim.fuel < 20 ? "text-amber-400" : "text-emerald-400"}`}>
              {sim.fuel.toFixed(0)}%
            </span>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-2 text-center border border-white/[0.04]">
            <span className="block text-[9px] text-zinc-500 uppercase">Depot Base</span>
            <span className="font-bold text-white">
              {sim.docked ? "DOCKED" : `${sim.distToMothercraft.toFixed(0)}M`}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-4">
          <button
            onClick={onResume}
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-100 py-3 text-sm font-bold text-zinc-950 transition active:scale-98 shadow-lg"
          >
            <Play size={15} />
            <span>Resume sortie (Esc)</span>
          </button>

          <button
            onClick={handleEmergencyDock}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] py-2.5 text-xs font-mono-tech text-white transition active:scale-98"
          >
            <Zap size={14} className="text-amber-400" />
            <span>Dock at base</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] py-2.5 text-xs font-mono-tech text-white transition active:scale-98"
          >
            <RotateCcw size={14} />
            <span>Restart sortie</span>
          </button>
        </div>

        {/* Quick Toggles */}
        <div className="grid grid-cols-2 gap-2 pt-4">
          <button
            onClick={handleMusicToggle}
            className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] p-2.5 text-xs transition"
          >
            <span className="flex items-center gap-2 text-zinc-300">
              <Music size={13} className="text-zinc-400" />
              <span>Score audio</span>
            </span>
            <span className={`text-[10px] font-mono-tech px-2 py-0.5 rounded-full ${musicOn ? "bg-white/15 text-white font-bold" : "text-zinc-500"}`}>
              {musicOn ? "ON" : "MUTED"}
            </span>
          </button>

          <button
            onClick={handleDampToggle}
            className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] p-2.5 text-xs transition"
          >
            <span className="text-zinc-300">RCS Damper</span>
            <span className={`text-[10px] font-mono-tech px-2 py-0.5 rounded-full ${dampOn ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-zinc-500"}`}>
              {dampOn ? "ACTIVE" : "DRIFT"}
            </span>
          </button>
        </div>

        {/* Compact Flight Controls Matrix */}
        <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs">
          <div className="text-[10px] font-mono-tech tracking-wider text-zinc-400 uppercase mb-2">
            Flight & ADR Controls Reference
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-mono-tech">
            <div className="flex justify-between text-zinc-400">
              <span>Thrust / Reverse</span>
              <span className="text-white font-bold">↑ / ↓ or R / Ctrl</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Pitch (Up / Down)</span>
              <span className="text-white font-bold">W / S</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Yaw (Turn)</span>
              <span className="text-white font-bold">A / D or ← / →</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Roll Left / Right</span>
              <span className="text-white font-bold">Q / E</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Heave Up / Down</span>
              <span className="text-white font-bold">Space / C</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Nitro Boost</span>
              <span className="text-amber-400 font-bold">Shift</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Robotic Grapple</span>
              <span className="text-emerald-400 font-bold">F</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>De-Orbit Burn</span>
              <span className="text-amber-400 font-bold">Space (in Zone)</span>
            </div>
          </div>
        </div>

        {/* Exit & Official Links */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
          <button
            onClick={handleReturnToWebpage}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition font-mono-tech text-[11px]"
          >
            <Home size={13} />
            <span>Return to home page</span>
          </button>

          <a
            href="https://cosmoserve.space/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition font-mono-tech text-[11px]"
          >
            <span>cosmoserve.space</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
