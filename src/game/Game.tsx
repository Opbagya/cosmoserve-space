import { useEffect, useState } from "react";
import { audio } from "./audio";
import { attachKeyboard } from "./input";
import { resetSim, sim, undock, triggerCapture, releaseCapturedDebris } from "./sim";
import { SpaceScene } from "./Scene";
import { HUD, TouchControls, useTick } from "./HUD";
import { Briefing } from "./Briefing";
import { CosmoserveModal } from "./CosmoserveModal";
import {
  Camera,
  ExternalLink,
  Info,
  Music2,
  Pause,
  Play,
  RotateCcw,
  VolumeX,
} from "lucide-react";

export function Game() {
  useTick(8);
  const [, setRun] = useState(0);
  const [isTouch, setTouch] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);

  const toggleMusic = () => {
    audio.init();
    audio.music(!musicOn);
    setMusicOn(!musicOn);
  };

  const togglePause = () => {
    if (sim.screen === "playing") {
      sim.screen = "paused";
      audio.setHiss(0);
      audio.setRoar(0);
      audio.suspend(true);
    } else if (sim.screen === "paused") {
      sim.screen = "playing";
      audio.suspend(false);
    }
  };

  const cycleView = () => {
    sim.view = (sim.view + 1) % 3;
    audio.beep(1200, 0.05);
  };

  const startMission = () => {
    audio.init();
    audio.suspend(false);
    resetSim();
    setRun((r) => r + 1);
    sim.screen = "playing";
    sim.view = 1;
    audio.music(musicOn);
    audio.voice("Mission Embrace initialized. Welcome aboard Cosmoserve Reviver.");
  };

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);

    return attachKeyboard((code) => {
      if (code === "KeyP" || code === "Escape") togglePause();
      if (sim.screen !== "playing") return;

      if (code === "KeyV") cycleView();
      if (code === "KeyE") {
        if (sim.canCapture) {
          triggerCapture();
          audio.grappleLock();
        } else if (sim.capturedDebrisId) {
          releaseCapturedDebris(sim.inReentryCorridor);
          if (sim.inReentryCorridor) audio.disintegrationExplosion();
        }
      }
      if (code === "Space" || code === "Enter") {
        if (sim.docked) {
          undock();
          audio.thud(60, 0.35, 0.6);
          audio.voice("Reviver detached. Orbit cleanup sortie active.");
        } else if (sim.deorbitReady) {
          releaseCapturedDebris(true);
          audio.disintegrationExplosion();
        } else if (sim.canCapture) {
          triggerCapture();
          audio.grappleLock();
        }
      }
      if (sim.docked && (code === "KeyW" || code === "ArrowUp")) {
        undock();
        audio.thud(60, 0.35, 0.6);
        audio.voice("Reviver detached. Orbit cleanup sortie active.");
      }
    });
  }, []);

  useEffect(() => {
    return () => audio.stopMusic();
  }, []);

  const s = sim.screen;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#050609] select-none font-hud text-zinc-100">
      {/* 3D WebGL Space Scene */}
      <SpaceScene />

      {/* Real-time Telemetry HUD */}
      {(s === "playing" || s === "paused") && <HUD />}

      {/* Top Utility Controls */}
      {s === "playing" && (
        <div className="fixed right-4 top-4 z-30 flex items-center gap-2">
          <button
            onClick={() => setAboutOpen(true)}
            title="About Cosmoserve Space"
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-black/50 text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition backdrop-blur-md"
          >
            <Info size={14} />
          </button>

          <button
            onClick={cycleView}
            title="Cycle Camera View"
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-black/50 text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition backdrop-blur-md"
          >
            <Camera size={14} />
          </button>

          <button
            onClick={toggleMusic}
            title={musicOn ? "Mute Ambient Score" : "Play Ambient Score"}
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-black/50 text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition backdrop-blur-md"
          >
            {musicOn ? <Music2 size={14} /> : <VolumeX size={14} />}
          </button>

          <button
            onClick={togglePause}
            title="Pause Flight"
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-black/50 text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition backdrop-blur-md"
          >
            <Pause size={14} />
          </button>
        </div>
      )}

      {/* Mobile Virtual Sticks */}
      {s === "playing" && isTouch && <TouchControls />}

      {/* Mission Briefing Modal */}
      {s === "briefing" && (
        <Briefing onStart={startMission} onOpenAbout={() => setAboutOpen(true)} />
      )}

      {/* About Cosmoserve Modal */}
      {aboutOpen && <CosmoserveModal onClose={() => setAboutOpen(false)} />}

      {/* Paused Menu */}
      {s === "paused" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-lg border border-white/10 bg-[#090b10] p-6 text-center shadow-2xl">
            <h2 className="font-mono-tech text-xs tracking-[0.25em] text-zinc-400 uppercase">
              Flight Operations
            </h2>
            <div className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
              SIMULATION PAUSED
            </div>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Orbital telemetry frozen. Reviver in automated attitude hold.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={togglePause}
                className="flex items-center justify-center gap-2 rounded bg-zinc-100 hover:bg-white py-2.5 text-xs font-bold tracking-wider text-zinc-950 transition active:scale-98"
              >
                <Play size={14} />
                <span>RESUME SORTIE</span>
              </button>

              <button
                onClick={startMission}
                className="flex items-center justify-center gap-2 rounded border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] py-2 text-xs font-mono-tech tracking-wider text-zinc-300 transition"
              >
                <RotateCcw size={13} />
                <span>RESTART MISSION</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Complete Victory Screen */}
      {s === "success" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-6">
          <div className="w-full max-w-xl rounded-lg border border-white/10 bg-[#090b10] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 text-[11px] font-mono-tech tracking-[0.25em] text-emerald-400 uppercase">
              <span>Sortie Complete</span>
              <span className="text-zinc-600">•</span>
              <span>All Debris De-orbited</span>
            </div>

            <h2 className="mt-2 font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
              ORBIT SUSTAINABILITY ACHIEVED
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Every targeted space debris object was secured via Cosmoserve&apos;s soft-robotic capture arm and guided into the atmospheric re-entry corridor, incinerating cleanly in the upper mesosphere over Point Nemo.
            </p>

            {/* Scorecard */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="text-[10px] font-mono-tech text-zinc-500 uppercase tracking-wider">CLEARED</div>
                <div className="font-mono-tech text-lg font-bold text-zinc-100">
                  {sim.clearedCount} / {sim.totalDebris}
                </div>
              </div>

              <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="text-[10px] font-mono-tech text-zinc-500 uppercase tracking-wider">REMAINING ΔV</div>
                <div className="font-mono-tech text-lg font-bold text-zinc-100">
                  {sim.fuel.toFixed(1)}%
                </div>
              </div>

              <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="text-[10px] font-mono-tech text-zinc-500 uppercase tracking-wider">FLIGHT TIME</div>
                <div className="font-mono-tech text-lg font-bold text-zinc-100">
                  {Math.floor(sim.time / 60)}:
                  {Math.floor(sim.time % 60)
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>

              <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="text-[10px] font-mono-tech text-zinc-500 uppercase tracking-wider">TOTAL SCORE</div>
                <div className="font-mono-tech text-lg font-bold text-zinc-100">
                  {sim.score.total}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.08] pt-6">
              <a
                href="https://cosmoserve.space/"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded bg-zinc-100 hover:bg-white px-6 py-2.5 text-xs font-bold tracking-wider text-zinc-950 transition shadow-lg active:scale-98"
              >
                <span>EXPLORE COSMOSERVE SPACE</span>
                <ExternalLink size={13} />
              </a>

              <button
                onClick={startMission}
                className="w-full sm:w-auto rounded border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] px-5 py-2.5 text-xs font-mono-tech tracking-wider text-zinc-300 transition"
              >
                FLY SORTIE AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
