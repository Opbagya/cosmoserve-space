import { useState } from "react";
import {
  Camera,
  ExternalLink,
  Flame,
  HelpCircle,
  Home,
  Monitor,
  Music,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Video,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { audio } from "./audio";
import { emergencyDock, returnToMainMenu, sim } from "./sim";

interface OperationsMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenAbout: () => void;
}

type TabType = "operations" | "audio" | "controls" | "camera" | "about";

export function OperationsMenu({ onResume, onRestart, onOpenAbout }: OperationsMenuProps) {
  const [activeTab, setActiveTab] = useState<TabType>("operations");
  const [masterVol, setMasterVol] = useState(Math.round(audio.masterVolume * 100));
  const [musicVol, setMusicVol] = useState(Math.round(audio.musicVolume * 100));
  const [sfxVol, setSfxVol] = useState(Math.round(audio.sfxVolume * 100));
  const [voiceOn, setVoiceOn] = useState(audio.voiceEnabled);
  const [invertPitch, setInvertPitch] = useState(sim.invertPitch);
  const [dampOn, setDampOn] = useState(sim.damp);
  const [sensitivity, setSensitivity] = useState(sim.sensitivity || 1.0);
  const [activeView, setActiveView] = useState(sim.view);
  const [particlesHigh, setParticlesHigh] = useState(sim.particlesHigh);

  const handleMasterChange = (val: number) => {
    setMasterVol(val);
    audio.setMasterVolume(val / 100);
  };

  const handleMusicChange = (val: number) => {
    setMusicVol(val);
    audio.setMusicVolume(val / 100);
  };

  const handleSfxChange = (val: number) => {
    setSfxVol(val);
    audio.setSfxVolume(val / 100);
  };

  const handleVoiceToggle = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    audio.setVoiceEnabled(next);
  };

  const handleInvertPitchToggle = () => {
    const next = !invertPitch;
    setInvertPitch(next);
    sim.invertPitch = next;
    sim.flashMessage = next ? "PITCH INVERTED: W = UP, S = DOWN" : "PITCH STANDARD: W = DOWN, S = UP";
    sim.flashTimer = 2.5;
  };

  const handleDampToggle = () => {
    const next = !dampOn;
    setDampOn(next);
    sim.damp = next;
    sim.flashMessage = next ? "RCS ROTATIONAL DAMPER: ENGAGED" : "RCS ROTATIONAL DAMPER: MANUAL DRIFT";
    sim.flashTimer = 2.5;
  };

  const handleSensitivity = (val: number) => {
    setSensitivity(val);
    sim.sensitivity = val;
  };

  const handleCameraChange = (viewIndex: number) => {
    setActiveView(viewIndex);
    sim.view = viewIndex;
    audio.beep(1200, 0.05);
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

  const minutes = Math.floor(sim.time / 60);
  const seconds = Math.floor(sim.time % 60).toString().padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-6 font-hud">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] rounded-xl border border-white/10 bg-[#090b10] shadow-2xl text-zinc-100 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono-tech tracking-[0.25em] text-zinc-400 uppercase">
                <span>Reviver ADR</span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400">Flight Operations Paused</span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold tracking-tight text-white">
                MISSION OPERATIONS & SETTINGS MENU
              </h2>
            </div>
          </div>

          <button
            onClick={onResume}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 transition"
            title="Resume Flight (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Mission Status Telemetry Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 py-2.5 bg-black/40 border-b border-white/[0.06] text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono-tech text-zinc-500 uppercase tracking-wider">Targets Cleared</span>
            <span className="font-mono-tech font-bold text-zinc-200">
              {sim.clearedCount} / {sim.totalDebris} Debris
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono-tech text-zinc-500 uppercase tracking-wider">Remaining Fuel</span>
            <span className={`font-mono-tech font-bold ${sim.fuel < 20 ? "text-amber-400" : "text-emerald-400"}`}>
              {sim.fuel.toFixed(1)}% ΔV
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono-tech text-zinc-500 uppercase tracking-wider">Distance to Base</span>
            <span className="font-mono-tech font-bold text-zinc-200">
              {sim.docked ? "DOCKED" : `${sim.distToMothercraft.toFixed(0)}m`}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono-tech text-zinc-500 uppercase tracking-wider">Mission Time</span>
            <span className="font-mono-tech font-bold text-zinc-200">
              {minutes}:{seconds}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto border-b border-white/[0.08] px-5 bg-white/[0.01]">
          <button
            onClick={() => setActiveTab("operations")}
            className={`flex items-center gap-2 px-3 py-3 text-xs font-mono-tech tracking-wider uppercase border-b-2 transition whitespace-nowrap ${
              activeTab === "operations"
                ? "border-emerald-400 text-white font-bold bg-white/[0.04]"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Play size={13} />
            <span>Operations</span>
          </button>

          <button
            onClick={() => setActiveTab("audio")}
            className={`flex items-center gap-2 px-3 py-3 text-xs font-mono-tech tracking-wider uppercase border-b-2 transition whitespace-nowrap ${
              activeTab === "audio"
                ? "border-emerald-400 text-white font-bold bg-white/[0.04]"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Volume2 size={13} />
            <span>Audio & Sound</span>
          </button>

          <button
            onClick={() => setActiveTab("controls")}
            className={`flex items-center gap-2 px-3 py-3 text-xs font-mono-tech tracking-wider uppercase border-b-2 transition whitespace-nowrap ${
              activeTab === "controls"
                ? "border-emerald-400 text-white font-bold bg-white/[0.04]"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sliders size={13} />
            <span>Controls & Tuning</span>
          </button>

          <button
            onClick={() => setActiveTab("camera")}
            className={`flex items-center gap-2 px-3 py-3 text-xs font-mono-tech tracking-wider uppercase border-b-2 transition whitespace-nowrap ${
              activeTab === "camera"
                ? "border-emerald-400 text-white font-bold bg-white/[0.04]"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Camera size={13} />
            <span>Camera & Visuals</span>
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2 px-3 py-3 text-xs font-mono-tech tracking-wider uppercase border-b-2 transition whitespace-nowrap ${
              activeTab === "about"
                ? "border-emerald-400 text-white font-bold bg-white/[0.04]"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ExternalLink size={13} />
            <span>Cosmoserve Links</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. OPERATIONS TAB */}
          {activeTab === "operations" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                <h3 className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider mb-3">
                  Flight Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={onResume}
                    className="flex items-center justify-center gap-2 rounded-lg bg-zinc-100 hover:bg-white py-3 text-xs font-bold tracking-wider text-zinc-950 transition active:scale-98 shadow-md"
                  >
                    <Play size={14} />
                    <span>RESUME SORTIE (ESC)</span>
                  </button>

                  <button
                    onClick={onRestart}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] py-3 text-xs font-mono-tech tracking-wider text-zinc-200 transition active:scale-98"
                  >
                    <RotateCcw size={14} />
                    <span>RESTART MISSION</span>
                  </button>

                  <button
                    onClick={handleEmergencyDock}
                    className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/15 py-3 text-xs font-mono-tech tracking-wider text-amber-300 transition active:scale-98"
                  >
                    <Zap size={14} className="text-amber-400" />
                    <span>EMERGENCY DOCK & REFUEL</span>
                  </button>

                  <button
                    onClick={handleReturnToWebpage}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] py-3 text-xs font-mono-tech tracking-wider text-zinc-300 transition active:scale-98"
                  >
                    <Home size={14} />
                    <span>EXIT TO COSMOSERVE WEBPAGE</span>
                  </button>
                </div>
              </div>

              {/* Quick Guide Card */}
              <div className="rounded-lg border border-white/[0.06] bg-black/40 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between text-zinc-300 font-semibold font-mono-tech text-[11px] uppercase">
                  <span>Sortie Objectives</span>
                  <span className="text-emerald-400 font-normal">Active Debris Removal</span>
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  1. Navigate towards targeted defunct satellites in Low Earth Orbit.<br />
                  2. Approach within 35 meters and press <strong className="text-emerald-400">F</strong> to engage soft-robotic capture paddles.<br />
                  3. Ferry debris to the sub-120km entry corridor and press <strong className="text-amber-400">Space</strong> to de-orbit.<br />
                  4. Return to the Mothercraft depot whenever fuel drops low for rapid refill.
                </p>
              </div>
            </div>
          )}

          {/* 2. AUDIO TAB */}
          {activeTab === "audio" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-200 font-semibold font-mono-tech uppercase">
                    <Volume2 size={15} className="text-emerald-400" />
                    <span>Master Audio Volume</span>
                  </div>
                  <span className="font-mono-tech text-zinc-300 font-bold">{masterVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVol}
                  onChange={(e) => handleMasterChange(Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-200 font-semibold font-mono-tech uppercase">
                    <Music size={15} className="text-cyan-400" />
                    <span>Ambient Score (Interstellar / Blade Runner)</span>
                  </div>
                  <span className="font-mono-tech text-zinc-300 font-bold">{musicVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVol}
                  onChange={(e) => handleMusicChange(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-200 font-semibold font-mono-tech uppercase">
                    <Flame size={15} className="text-amber-400" />
                    <span>RCS Thrusters & Effects SFX</span>
                  </div>
                  <span className="font-mono-tech text-zinc-300 font-bold">{sfxVol}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVol}
                  onChange={(e) => handleSfxChange(Number(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                <div>
                  <span className="font-semibold text-zinc-200 font-mono-tech uppercase">Mission Control Voice Announcer</span>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Synthesized dispatch updates during flight</div>
                </div>
                <button
                  onClick={handleVoiceToggle}
                  className={`px-3 py-1.5 rounded text-xs font-mono-tech tracking-wider border transition ${
                    voiceOn
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-white/[0.03] text-zinc-500 border-white/[0.08]"
                  }`}
                >
                  {voiceOn ? "ENABLED" : "MUTED"}
                </button>
              </div>
            </div>
          )}

          {/* 3. CONTROLS TAB */}
          {activeTab === "controls" && (
            <div className="space-y-4 text-xs">
              {/* Pitch Inversion & Damper */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                  <div>
                    <span className="font-semibold text-zinc-200 font-mono-tech uppercase">Pitch Axis (W / S)</span>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {invertPitch ? "Inverted (W: Down, S: Up)" : "Standard (W: Up, S: Down)"}
                    </div>
                  </div>
                  <button
                    onClick={handleInvertPitchToggle}
                    className={`px-3 py-1.5 rounded text-xs font-mono-tech tracking-wider border transition ${
                      invertPitch
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-white/[0.04] text-zinc-300 border-white/10"
                    }`}
                  >
                    {invertPitch ? "INVERTED" : "STANDARD"}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                  <div>
                    <span className="font-semibold text-zinc-200 font-mono-tech uppercase">RCS Auto-Damper (X)</span>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {dampOn ? "Engaged (Level Hold)" : "Manual Drift"}
                    </div>
                  </div>
                  <button
                    onClick={handleDampToggle}
                    className={`px-3 py-1.5 rounded text-xs font-mono-tech tracking-wider border transition ${
                      dampOn
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-white/[0.04] text-zinc-500 border-white/10"
                    }`}
                  >
                    {dampOn ? "ENGAGED" : "DRIFT"}
                  </button>
                </div>
              </div>

              {/* Sensitivity Slider */}
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-zinc-200 font-mono-tech uppercase">
                    Steering & Attitude Sensitivity
                  </div>
                  <span className="font-mono-tech text-zinc-300 font-bold">{sensitivity.toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  {[0.5, 1.0, 1.5, 2.0].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleSensitivity(val)}
                      className={`flex-1 py-1.5 rounded text-xs font-mono-tech border transition ${
                        sensitivity === val
                          ? "bg-zinc-100 text-zinc-950 font-bold border-white"
                          : "bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:bg-white/[0.06]"
                      }`}
                    >
                      {val.toFixed(1)}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Keybindings Reference Matrix */}
              <div className="rounded-lg border border-white/[0.08] bg-black/50 p-4">
                <div className="text-[11px] font-mono-tech tracking-widest text-zinc-400 mb-3 uppercase">
                  Complete Flight Controls Reference
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">Forward Thrust</span>
                    <span className="font-mono-tech text-white font-bold">↑ or R</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">Reverse / Brake</span>
                    <span className="font-mono-tech text-white font-bold">↓ or Ctrl</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">Pitch (Nose Up / Down)</span>
                    <span className="font-mono-tech text-white font-bold">W / S</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">Yaw (Turn Left / Right)</span>
                    <span className="font-mono-tech text-white font-bold">A / D (or ← / →)</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">Roll (Bank Left / Right)</span>
                    <span className="font-mono-tech text-white font-bold">Q / E</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">Heave (Vertical Up / Down)</span>
                    <span className="font-mono-tech text-white font-bold">Space / C</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">Nitro Turbo Boost</span>
                    <span className="font-mono-tech text-amber-400 font-semibold">Shift (Hold)</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">Robotic Pickup / Release</span>
                    <span className="font-mono-tech text-emerald-400 font-bold">F</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">Atmospheric De-Orbit</span>
                    <span className="font-mono-tech text-amber-400 font-semibold">Space (in Zone)</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">Launch from Base</span>
                    <span className="font-mono-tech text-zinc-100 font-semibold">Space or ↑</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">Cycle Camera View</span>
                    <span className="font-mono-tech text-zinc-100 font-semibold">V</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/[0.02] px-3 py-1.5 border border-white/[0.04]">
                    <span className="text-zinc-400">RCS Damper Toggle</span>
                    <span className="font-mono-tech text-zinc-100 font-semibold">X</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. CAMERA TAB */}
          {activeTab === "camera" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
                <span className="font-semibold text-zinc-200 font-mono-tech uppercase">
                  Active Camera Perspective
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 1, name: "Third-Person Chase", desc: "Trailing craft with smooth momentum" },
                    { id: 0, name: "Cockpit Boresight", desc: "Front sensory camera overlay" },
                    { id: 2, name: "Orbital Tactical", desc: "Elevated vantage point" },
                  ].map((cam) => (
                    <button
                      key={cam.id}
                      onClick={() => handleCameraChange(cam.id)}
                      className={`flex flex-col text-left p-3 rounded-lg border transition ${
                        activeView === cam.id
                          ? "bg-zinc-100 text-zinc-950 border-white font-semibold"
                          : "bg-white/[0.03] text-zinc-300 border-white/[0.06] hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className="font-mono-tech text-xs">{cam.name}</span>
                      <span className={`text-[10px] mt-1 ${activeView === cam.id ? "text-zinc-700" : "text-zinc-500"}`}>
                        {cam.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                <div>
                  <span className="font-semibold text-zinc-200 font-mono-tech uppercase">
                    Supersonic Diamonds & Cryo Mist
                  </span>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Volumetric rocket exhaust shader effects
                  </div>
                </div>
                <button
                  onClick={() => {
                    const next = !particlesHigh;
                    setParticlesHigh(next);
                    sim.particlesHigh = next;
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-mono-tech tracking-wider border transition ${
                    particlesHigh
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-white/[0.04] text-zinc-500 border-white/10"
                  }`}
                >
                  {particlesHigh ? "ENHANCED" : "MINIMAL"}
                </button>
              </div>
            </div>
          )}

          {/* 5. ABOUT & LINKS TAB */}
          {activeTab === "about" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
                <span className="font-semibold text-zinc-200 font-mono-tech uppercase">
                  Cosmoserve Space Official Channels
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="https://cosmoserve.space/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ExternalLink size={15} className="text-zinc-400 group-hover:text-white transition" />
                      <div>
                        <div className="font-semibold">Official Website</div>
                        <div className="text-[10px] text-zinc-500 font-mono-tech">cosmoserve.space</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono-tech text-zinc-400 group-hover:text-white transition">VISIT ↗</span>
                  </a>

                  <a
                    href="https://youtu.be/UjeyJfsrWME"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Video size={15} className="text-zinc-400 group-hover:text-white transition" />
                      <div>
                        <div className="font-semibold">Watch Overview</div>
                        <div className="text-[10px] text-zinc-500 font-mono-tech">YouTube · Cosmoserve Space</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono-tech text-zinc-400 group-hover:text-white transition">WATCH ↗</span>
                  </a>
                </div>
              </div>

              {/* Founder Bio Card */}
              <div className="rounded-lg border border-white/[0.06] bg-black/40 p-4 space-y-2">
                <div className="text-zinc-200 font-semibold">Dr. Chiranjeevi Phanindra B, Ph.D</div>
                <div className="text-[11px] text-zinc-500 font-mono-tech">Founder & CEO · Former ISRO Scientist</div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Cosmoserve Space is developing active debris capture technology and commercial in-orbit servicing solutions from T-Hub Hyderabad. Partnered with Skyroot Aerospace leadership and Pixxel Space for in-orbit demonstrations to secure sustainable orbits for human space exploration.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Persistent Bar */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3.5 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono-tech text-[10px]">ESC</kbd>
            <span>to resume flight</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://cosmoserve.space/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-white transition"
            >
              <span>cosmoserve.space</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={onResume}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-zinc-100 hover:bg-white text-xs font-bold text-zinc-950 transition active:scale-95 shadow-md"
            >
              <Play size={13} />
              <span>RESUME SORTIE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
