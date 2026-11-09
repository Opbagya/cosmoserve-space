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
  Flame,
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
      if (code === "KeyX") {
        sim.damp = !sim.damp;
        audio.beep(sim.damp ? 1400 : 700, 0.06);
      }
      if (code === "KeyE") {
        triggerCapture();
        audio.grappleLock();
      }
      if (code === "Space") {
        if (sim.docked) {
          undock();
          audio.thud(55, 0.3, 0.5);
        } else if (sim.deorbitReady) {
          releaseCapturedDebris(true);
          audio.disintegrationExplosion();
        }
      }
    });
  }, []);

  useEffect(() => {
    return () => audio.stopMusic();
  }, []);

  const s = sim.screen;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#030611] select-none font-hud text-slate-100">
      {/* 3D WebGL Space Canvas */}
      <SpaceScene />

      {/* Cockpit & Orbital Telemetry HUD */}
      {(s === "playing" || s === "paused") && <HUD />}

      {/* Top Action Bar (Music, View, About, Pause) */}
      {s === "playing" && (
        <div className="fixed right-4 top-4 z-30 flex items-center gap-2">
          <button
            onClick={() => setAboutOpen(true)}
            title="About Cosmoserve Space"
            className="flex h-9 w-9 items-center justify-center rounded border border-cyan-500/40 bg-[#070b16]/80 text-cyan-300 hover:bg-cyan-900/40 active:scale-95 transition backdrop-blur-md"
          >
            <Info size={16} />
          </button>

          <button
            onClick={cycleView}
            title="Cycle Camera View"
            className="flex h-9 w-9 items-center justify-center rounded border border-cyan-500/40 bg-[#070b16]/80 text-cyan-300 hover:bg-cyan-900/40 active:scale-95 transition backdrop-blur-md"
          >
            <Camera size={16} />
          </button>

          <button
            onClick={toggleMusic}
            title={musicOn ? "Mute Cosmic Score" : "Play Cosmic Score"}
            className="flex h-9 w-9 items-center justify-center rounded border border-cyan-500/40 bg-[#070b16]/80 text-cyan-300 hover:bg-cyan-900/40 active:scale-95 transition backdrop-blur-md"
          >
            {musicOn ? <Music2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={togglePause}
            title="Pause Mission"
            className="flex h-9 w-9 items-center justify-center rounded border border-cyan-500/40 bg-[#070b16]/80 text-cyan-300 hover:bg-cyan-900/40 active:scale-95 transition backdrop-blur-md"
          >
            <Pause size={16} />
          </button>
        </div>
      )}

      {/* Mobile Virtual Sticks */}
      {s === "playing" && isTouch && <TouchControls />}

      {/* Mission Briefing Modal */}
      {s === "briefing" && (
        <Briefing onStart={startMission} onOpenAbout={() => setAboutOpen(true)} />
      )}

      {/* About Cosmoserve Space Details Modal */}
      {aboutOpen && <CosmoserveModal onClose={() => setAboutOpen(false)} />}

      {/* Paused Screen */}
      {s === "paused" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-cyan-500/40 bg-[#070b16] p-6 sm:p-8 text-center shadow-2xl">
            <h2 className="font-display text-3xl font-extrabold tracking-widest text-cyan-400">
              MISSION PAUSED
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Orbital telemetry suspended. Reviver in station-keeping hold.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={togglePause}
                className="flex items-center justify-center gap-2 rounded-lg border border-cyan-400 bg-cyan-600 px-6 py-3 font-bold text-white hover:bg-cyan-500 transition"
              >
                <Play size={16} />
                <span>RESUME MISSION</span>
              </button>

              <button
                onClick={startMission}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-6 py-2.5 text-xs text-slate-300 hover:bg-slate-800 transition"
              >
                <RotateCcw size={14} />
                <span>RESTART MISSION</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Success Victory Screen */}
      {s === "success" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-xl border border-emerald-500/50 bg-[#050914] p-6 sm:p-10 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-emerald-400">
              <span>ALL TARGETS DE-ORBITED</span>
              <span>•</span>
              <span>MISSION EMBRACE SUCCESS</span>
            </div>

            <h2 className="mt-2 font-display text-3xl sm:text-5xl font-black text-white">
              ORBIT SUSTAINABILITY ACHIEVED
            </h2>

            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Every hazardous space debris target was captured using Cosmoserve&apos;s soft-robotic gripper and de-orbited into the atmospheric entry interface, cleanly dispersing above the Pacific Ocean.
            </p>

            {/* Scorecard */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded border border-emerald-500/30 bg-emerald-950/30 p-3">
                <div className="text-[10px] text-slate-400 tracking-wider">CLEARED</div>
                <div className="font-mono-tech text-xl font-bold text-emerald-400">
                  {sim.clearedCount} / {sim.totalDebris}
                </div>
              </div>

              <div className="rounded border border-cyan-500/30 bg-cyan-950/30 p-3">
                <div className="text-[10px] text-slate-400 tracking-wider">FINAL FUEL</div>
                <div className="font-mono-tech text-xl font-bold text-cyan-300">
                  {sim.fuel.toFixed(1)}%
                </div>
              </div>

              <div className="rounded border border-amber-500/30 bg-amber-950/30 p-3">
                <div className="text-[10px] text-slate-400 tracking-wider">MISSION TIME</div>
                <div className="font-mono-tech text-xl font-bold text-amber-300">
                  {Math.floor(sim.time / 60)}:
                  {Math.floor(sim.time % 60)
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>

              <div className="rounded border border-purple-500/30 bg-purple-950/30 p-3">
                <div className="text-[10px] text-slate-400 tracking-wider">TOTAL SCORE</div>
                <div className="font-mono-tech text-xl font-bold text-purple-300">
                  {sim.score.total}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <a
                href="https://cosmoserve.space/"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-cyan-400 bg-cyan-600 px-6 py-3 font-display font-bold text-white hover:bg-cyan-500 transition shadow-lg"
              >
                <span>EXPLORE COSMOSERVE SPACE →</span>
                <ExternalLink size={14} />
              </a>

              <button
                onClick={startMission}
                className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-900 px-6 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
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
