import { useEffect, useRef, useState } from "react";
import {
  FUEL_CAPACITY,
  releaseCapturedDebris,
  sim,
  triggerCapture,
  undock,
} from "./sim";
import { touch } from "./input";
import { audio } from "./audio";
import {
  AlertTriangle,
  Compass,
  Crosshair,
  Flame,
  Gauge,
  Rocket,
  Shield,
  Zap,
} from "lucide-react";

export function useTick(hz: number) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((t) => t + 1), 1000 / hz);
    return () => clearInterval(id);
  }, [hz]);
}

export function HUD() {
  useTick(14);

  const fuelPct = Math.max(0, Math.min(100, (sim.fuel / FUEL_CAPACITY) * 100));
  const returnFuelPct = Math.max(5, Math.min(95, sim.fuelNeededToReturn));
  const currentTarget = sim.debris.find((d) => d.id === sim.captureTargetId);
  const carriedDebris = sim.debris.find((d) => d.id === sim.capturedDebrisId);

  const isLowFuel = sim.fuel <= sim.fuelNeededToReturn + 3 && !sim.docked;
  const isDocked = sim.docked;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 font-hud select-none">
      {/* --- TOP FLIGHT TELEMETRY BAR --- */}
      <div className="flex items-start justify-between gap-4">
        {/* Cosmoserve Mission Readout */}
        <div className="pointer-events-auto flex flex-col gap-1.5 rounded-md telemetry-panel px-4 py-3 text-zinc-100 shadow-xl">
          <div className="flex items-center gap-2 text-[11px] font-mono-tech tracking-[0.2em] text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-zinc-300">COSMOSERVE SPACE</span>
            <span className="text-zinc-600">/</span>
            <span>MISSION EMBRACE</span>
          </div>

          <div className="mt-0.5 flex items-baseline gap-5">
            <div>
              <span className="text-[10px] font-mono-tech tracking-wider text-zinc-500">SPEED</span>
              <div className="font-mono-tech text-base sm:text-lg font-medium text-zinc-100">
                {sim.vel.length().toFixed(1)} <span className="text-xs text-zinc-500">M/S</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono-tech tracking-wider text-zinc-500">CLEARED</span>
              <div className="font-mono-tech text-base sm:text-lg font-semibold text-zinc-100">
                {sim.clearedCount} <span className="text-xs text-zinc-500">/ {sim.totalDebris}</span>
              </div>
            </div>

            <div className="hidden sm:block">
              <span className="text-[10px] font-mono-tech tracking-wider text-zinc-500">HULL</span>
              <div className="font-mono-tech text-base sm:text-lg text-zinc-200">
                {sim.hull.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Center Flight Status Flash */}
        {sim.flashTimer > 0 && (
          <div className="hidden md:flex flex-col items-center">
            <div className="rounded-md telemetry-panel-elevated px-4 py-2 border border-zinc-700/60 shadow-xl">
              <span className="text-xs font-mono-tech tracking-[0.16em] text-zinc-200 font-medium">
                {sim.flashMessage}
              </span>
            </div>
          </div>
        )}

        {/* Top-Right Mothercraft & Corridor Bearing */}
        <div className="pointer-events-auto flex flex-col gap-1.5 rounded-md telemetry-panel px-4 py-3 text-right shadow-xl">
          <div className="flex items-center justify-end gap-1.5 text-[11px] font-mono-tech tracking-wider text-zinc-400">
            <span>MOTHERCRAFT DEPOT</span>
            <Compass size={13} className="text-zinc-400" />
          </div>

          <div className="font-mono-tech text-base sm:text-lg font-medium text-zinc-100">
            {isDocked ? (
              <span className="text-emerald-400 font-semibold tracking-wider">DOCKED</span>
            ) : (
              <span>
                {sim.distToMothercraft.toFixed(0)} <span className="text-xs text-zinc-500">M</span>
              </span>
            )}
          </div>

          <div className="text-[10px] font-mono-tech tracking-wider text-zinc-400">
            DISPOSAL ZONE:{" "}
            <span className={sim.inReentryCorridor ? "text-amber-400 font-bold" : "text-zinc-300"}>
              {sim.distToCorridor.toFixed(0)}M
            </span>
          </div>
        </div>
      </div>

      {/* --- MINIMALIST OPTICAL SENSOR CROSSHAIR --- */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70">
        <div className="relative flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border border-white/20" />
          <div className="absolute h-1 w-1 rounded-full bg-white/70" />
          <div className="absolute h-3 w-[1px] bg-white/40 -top-4" />
          <div className="absolute h-3 w-[1px] bg-white/40 -bottom-4" />
          <div className="absolute w-3 h-[1px] bg-white/40 -left-4" />
          <div className="absolute w-3 h-[1px] bg-white/40 -right-4" />
        </div>
      </div>

      {/* --- FLOATING 3D RETICLES --- */}
      {/* Mothercraft Base Marker */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
        style={{
          left: `${sim.mothercraftScreen.x * 100}%`,
          top: `${sim.mothercraftScreen.y * 100}%`,
        }}
      >
        <div className="flex flex-col items-center opacity-85">
          <div className="h-5 w-5 rounded-sm border border-zinc-400/60 bg-black/40 flex items-center justify-center text-[9px] font-mono-tech text-zinc-300">
            DEPOT
          </div>
          <span className="mt-0.5 text-[9px] font-mono-tech tracking-wider text-zinc-400">
            {sim.distToMothercraft.toFixed(0)}M
          </span>
        </div>
      </div>

      {/* Atmospheric Entry Corridor Reticle */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
        style={{
          left: `${sim.corridorScreen.x * 100}%`,
          top: `${sim.corridorScreen.y * 100}%`,
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className={`px-2 py-0.5 rounded text-[9px] font-mono-tech tracking-wider border ${
              sim.inReentryCorridor
                ? "border-amber-400 bg-amber-950/70 text-amber-200 font-bold"
                : "border-zinc-600 bg-black/60 text-zinc-400"
            }`}
          >
            DISPOSAL ZONE
          </div>
          <span className="mt-0.5 text-[9px] font-mono-tech tracking-wider text-zinc-400">
            {sim.distToCorridor.toFixed(0)}M
          </span>
        </div>
      </div>

      {/* Debris Target Reticles */}
      {sim.debris
        .filter((d) => !d.deorbited && !d.captured)
        .map((deb) => (
          <div
            key={deb.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
            style={{
              left: `${deb.screenPt.x * 100}%`,
              top: `${deb.screenPt.y * 100}%`,
            }}
          >
            <div
              className={`flex flex-col items-center ${
                deb.id === sim.captureTargetId ? "scale-110 opacity-95" : "opacity-45"
              }`}
            >
              <div
                className={`h-4 w-4 rotate-45 border ${
                  deb.id === sim.captureTargetId
                    ? "border-white bg-white/20"
                    : "border-zinc-500 bg-black/40"
                }`}
              />
              <span className="mt-1 text-[8px] font-mono-tech tracking-wider text-zinc-300">
                {deb.name} ({deb.screenPt.dist.toFixed(0)}M)
              </span>
            </div>
          </div>
        ))}

      {/* --- RIGHT-SIDE LATERAL APPROACH & DOCKING CAM --- */}
      {sim.dockingRadar.active && !isDocked && (
        <div className="pointer-events-auto absolute right-4 sm:right-6 top-24 w-72 rounded-2xl border border-white/15 bg-black/80 p-3.5 backdrop-blur-2xl shadow-2xl transition-all duration-300">
          {/* Radar Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 text-[10px] font-mono-tech tracking-widest text-zinc-400 uppercase">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>OPTICAL DOCKING RADAR</span>
            </span>
            <span className="text-emerald-400 font-bold">
              {sim.dockingRadar.alignPct.toFixed(0)}% ALIGN
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-white truncate max-w-[160px]">
              {sim.dockingRadar.targetName}
            </span>
            <span className="font-mono-tech text-[10px] text-zinc-400">
              {sim.dockingRadar.range.toFixed(2)}m
            </span>
          </div>

          {/* DUAL-SCOPE: 1. 2D Boresight Crosshair (Top) + 2. Lateral Profile Rail (Bottom) */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            {/* 1. 2D Boresight Crosshair (True X/Y Azimuth & Elevation) */}
            <div className="relative h-24 rounded-xl border border-white/10 bg-black/70 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:6px_6px]" />
              <div className="absolute inset-x-0 h-px bg-white/15" />
              <div className="absolute inset-y-0 w-px bg-white/15" />
              <div className="absolute h-10 w-10 rounded-full border border-white/20" />
              <div className="absolute h-4 w-4 rounded-full border border-emerald-500/30" />

              {/* Dynamic Satellite Position Pip */}
              {(() => {
                const scale = 3.5;
                const px = Math.max(-38, Math.min(38, (sim.dockingRadar.offsetX || 0) * scale));
                const py = Math.max(-38, Math.min(38, -(sim.dockingRadar.offsetY || 0) * scale));
                const isCentered = Math.hypot(px, py) < 8;

                return (
                  <div
                    className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 transition-all duration-75 flex items-center justify-center"
                    style={{
                      left: `calc(50% + ${px}px)`,
                      top: `calc(50% + ${py}px)`,
                    }}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-sm border ${
                        sim.capturedDebrisId
                          ? "border-emerald-400 bg-emerald-400"
                          : isCentered
                          ? "border-emerald-400 bg-emerald-500/60 shadow-lg shadow-emerald-500/50 animate-pulse"
                          : "border-amber-400 bg-amber-500/50"
                      }`}
                    />
                  </div>
                );
              })()}

              <span className="absolute bottom-1 left-1.5 text-[8px] font-mono-tech text-zinc-500">
                BORESIGHT
              </span>
            </div>

            {/* 2. Lateral Z-Profile Rail (Reviver Bow + Extended Paddles vs Debris) */}
            <div className="relative h-24 rounded-xl border border-white/10 bg-black/70 flex flex-col justify-between p-2 overflow-hidden">
              <span className="text-[8px] font-mono-tech text-zinc-500">
                LATERAL PROFILE
              </span>

              <div className="relative my-auto flex items-center w-full h-12">
                {/* Reviver Bow Schematic */}
                <div className="relative flex flex-col items-center z-10">
                  <div className="h-6 w-3 rounded-sm bg-zinc-400 border border-white/40" />
                  {/* Soft-Robotic White Paddles Animation */}
                  <div
                    className={`absolute -right-2 top-0 h-1.5 w-3 rounded-sm bg-white shadow-sm transition-transform duration-200 ${
                      sim.capturedDebrisId
                        ? "rotate-12 translate-y-0.5"
                        : sim.captureArmState > 0.05
                        ? "-rotate-45 -translate-y-1"
                        : "rotate-0"
                    }`}
                  />
                  <div
                    className={`absolute -right-2 bottom-0 h-1.5 w-3 rounded-sm bg-white shadow-sm transition-transform duration-200 ${
                      sim.capturedDebrisId
                        ? "-rotate-12 -translate-y-0.5"
                        : sim.captureArmState > 0.05
                        ? "rotate-45 translate-y-1"
                        : "rotate-0"
                    }`}
                  />
                </div>

                {/* Range Rail Line with Zone Markers */}
                <div className="relative flex-1 h-0.5 bg-white/20 mx-2">
                  {/* Green Latch Zone (0 to 4.2m) */}
                  <div className="absolute left-0 inset-y-0 w-1/4 bg-emerald-500/50" />
                  {/* Deploy Zone (4.2m to 14m) */}
                  <div className="absolute left-1/4 inset-y-0 w-1/2 bg-amber-500/30" />
                </div>

                {/* Target Satellite Icon on Profile Rail */}
                {(() => {
                  const zDist = Math.max(0, sim.dockingRadar.range);
                  const rightOffset = Math.max(0, Math.min(65, (zDist / 20) * 65));
                  return (
                    <div
                      className="absolute transition-all duration-75 flex items-center justify-center"
                      style={{ right: `${Math.max(4, 65 - rightOffset)}px` }}
                    >
                      <div
                        className={`h-4 w-4 rounded border ${
                          sim.capturedDebrisId
                            ? "border-emerald-400 bg-emerald-500/60"
                            : sim.captureArmState > 0.05
                            ? "border-emerald-300 bg-emerald-400/30"
                            : "border-amber-400 bg-amber-500/30"
                        }`}
                      />
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-between text-[8px] font-mono-tech text-zinc-500">
                <span>0M</span>
                <span>4.2M</span>
                <span>14M+</span>
              </div>
            </div>
          </div>

          {/* Detailed 4-Coordinate Telemetry Matrix */}
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-[10px] font-mono-tech">
            <div className="flex flex-col rounded-lg bg-white/[0.03] p-1.5 border border-white/[0.05]">
              <span className="text-[8px] text-zinc-500 uppercase">Range (Z)</span>
              <span className="font-bold text-white text-xs">
                {sim.dockingRadar.range.toFixed(2)}m
              </span>
            </div>
            <div className="flex flex-col rounded-lg bg-white/[0.03] p-1.5 border border-white/[0.05]">
              <span className="text-[8px] text-zinc-500 uppercase">Lateral (X)</span>
              <span className="font-bold text-zinc-200 text-xs">
                {(sim.dockingRadar.offsetX || 0) >= 0 ? "+" : ""}
                {(sim.dockingRadar.offsetX || 0).toFixed(2)}m
              </span>
            </div>
            <div className="flex flex-col rounded-lg bg-white/[0.03] p-1.5 border border-white/[0.05]">
              <span className="text-[8px] text-zinc-500 uppercase">Vertical (Y)</span>
              <span className="font-bold text-zinc-200 text-xs">
                {(sim.dockingRadar.offsetY || 0) >= 0 ? "+" : ""}
                {(sim.dockingRadar.offsetY || 0).toFixed(2)}m
              </span>
            </div>
          </div>

          {/* Dynamic Status / Paddle Control Button */}
          <div className="mt-2.5">
            {sim.capturedDebrisId ? (
              <div className="flex items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 py-1.5 text-[10px] font-mono-tech text-emerald-300 font-bold">
                ✓ PADDLES LOCKED & SECURED
              </div>
            ) : sim.captureArmState > 0.05 ? (
              <div className="flex items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 py-1.5 text-[10px] font-mono-tech text-emerald-300 font-semibold animate-pulse">
                PADDLES ARMED · APPROACH TO LATCH (&lt;4.2M)
              </div>
            ) : sim.dockingRadar.inEnvelope ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  triggerCapture();
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-zinc-100 py-2 text-[11px] font-mono-tech text-zinc-950 font-bold shadow-md transition active:scale-95"
              >
                <span>DEPLOY PADDLES [F]</span>
              </button>
            ) : (
              <div className="flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] py-1.5 text-[10px] font-mono-tech text-zinc-400">
                APPROACH TARGET (&lt;14M TO ARM)
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CONTEXTUAL ONE-CLICK ACTION BANNER --- */}
      <div className="flex flex-col items-center gap-2">
        {isDocked && (
          <div className="pointer-events-auto flex items-center gap-4 rounded-md telemetry-panel-elevated px-6 py-3 shadow-2xl border border-white/20">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <div className="text-xs font-mono-tech tracking-wide text-zinc-200">
                DOCKED AT MOTHERCRAFT · FUEL 100% · SYSTEMS READY
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                undock();
              }}
              className="flex items-center gap-2 rounded bg-white hover:bg-zinc-200 text-black font-bold px-5 py-2 text-xs tracking-wider transition active:scale-95 shadow-md"
            >
              <Rocket size={14} />
              <span>LAUNCH</span>
            </button>
          </div>
        )}

        {!isDocked && sim.deorbitReady && (
          <div className="pointer-events-auto flex items-center gap-4 rounded-md telemetry-panel-elevated px-6 py-3 shadow-2xl border border-amber-500/50">
            <Flame size={16} className="text-amber-400" />
            <div className="text-xs font-mono-tech tracking-wide text-zinc-200">
              DISPOSAL ZONE REACHED (~120KM) · READY TO DE-ORBIT
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                releaseCapturedDebris(true);
              }}
              className="rounded bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 text-xs tracking-wider transition active:scale-95 shadow-md"
            >
              DE-ORBIT BURN
            </button>
          </div>
        )}

        {!isDocked && sim.canCapture && !sim.capturedDebrisId && (
          <div className="pointer-events-auto flex items-center gap-4 rounded-md telemetry-panel-elevated px-6 py-3 shadow-2xl border border-white/20">
            <Crosshair size={16} className="text-zinc-200" />
            <div className="text-xs font-mono-tech tracking-wide text-zinc-200">
              TARGET IN RANGE · {currentTarget?.name}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                triggerCapture();
              }}
              className="flex items-center gap-2 rounded bg-white hover:bg-zinc-200 text-black font-bold px-5 py-2 text-xs tracking-wider transition active:scale-95 shadow-md"
            >
              <span>PICKUP TARGET</span>
            </button>
          </div>
        )}

        {!isDocked && isLowFuel && (
          <div className="flex items-center gap-2 rounded-md bg-amber-950/80 border border-amber-500/50 px-4 py-2 text-xs font-mono-tech tracking-wider text-amber-200">
            <AlertTriangle size={14} className="text-amber-400" />
            <span>RETURN TO MOTHERCRAFT REQUIRED FOR RECHARGE</span>
          </div>
        )}
      </div>

      {/* --- MINIMALIST SLIM TELEMETRY BAR (NO CLUTTER / NO INSTRUCTIONS) --- */}
      <div className="pointer-events-auto flex items-center justify-between gap-4 rounded-lg telemetry-panel px-4 py-2.5 shadow-2xl border border-white/10 max-w-4xl mx-auto w-full">
        {/* Tracked Target Spec */}
        <div className="flex items-center gap-2 min-w-0 max-w-[240px]">
          <Crosshair size={14} className="text-zinc-400 shrink-0" />
          <div className="truncate">
            <div className="text-xs font-semibold text-zinc-100 truncate">
              {sim.capturedDebrisId
                ? carriedDebris?.name
                : currentTarget
                ? currentTarget.name
                : "ALL TARGETS CLEARED"}
            </div>
            <div className="text-[10px] font-mono-tech text-zinc-400">
              {sim.capturedDebrisId ? (
                <span className="text-amber-400">TOWING TO RE-ENTRY</span>
              ) : currentTarget ? (
                `${sim.pos.distanceTo(currentTarget.pos).toFixed(0)}M`
              ) : (
                "SORTIE COMPLETE"
              )}
            </div>
          </div>
        </div>

        {/* Slim Precision Fuel Bar */}
        <div className="flex flex-1 max-w-md items-center gap-3">
          <span className="text-[10px] font-mono-tech tracking-wider text-zinc-400 shrink-0">
            ΔV
          </span>

          <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-white/10">
            {/* Dynamic Return Fuel Threshold Marker */}
            <div
              className="absolute inset-y-0 left-0 bg-amber-500/20 border-r border-amber-400/90 z-10 transition-all duration-100"
              style={{ width: `${returnFuelPct}%` }}
            />

            {/* Current Propellant Fill */}
            <div
              className={`h-full transition-all duration-75 ${
                isDocked
                  ? "bg-emerald-400"
                  : isLowFuel
                  ? "bg-amber-500"
                  : "bg-zinc-200"
              }`}
              style={{ width: `${fuelPct}%` }}
            />
          </div>

          <span
            className={`text-[11px] font-mono-tech font-semibold shrink-0 ${
              isLowFuel ? "text-amber-400" : "text-zinc-200"
            }`}
          >
            {fuelPct.toFixed(0)}%
          </span>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          {isDocked ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                undock();
              }}
              className="rounded bg-white hover:bg-zinc-200 text-black font-bold px-3.5 py-1.5 text-xs tracking-wider transition active:scale-95 shadow-md"
            >
              LAUNCH
            </button>
          ) : sim.capturedDebrisId ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                releaseCapturedDebris(sim.inReentryCorridor);
              }}
              className="rounded bg-amber-500 hover:bg-amber-400 text-black font-bold px-3.5 py-1.5 text-xs tracking-wider transition active:scale-95 shadow-md font-mono-tech"
            >
              {sim.inReentryCorridor ? "DE-ORBIT [SPACE]" : "THROW DEBRIS [F / SPACE]"}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                triggerCapture();
              }}
              disabled={!sim.canCapture}
              className={`rounded px-3.5 py-1.5 text-xs font-bold tracking-wider transition active:scale-95 font-mono-tech ${
                sim.canCapture
                  ? "bg-white text-black hover:bg-zinc-200 shadow-md"
                  : "bg-zinc-900 border border-white/10 text-zinc-600 cursor-not-allowed"
              }`}
            >
              PICKUP [F]
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Intuitive virtual touch controls for mobile (Flight Stick + Actions) */
export function TouchControls() {
  const stickRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  // Single intuitive flight stick: Vertical = Forward/Reverse, Horizontal = Steer Left/Right
  const handlePointer = (e: React.PointerEvent) => {
    if (!stickRef.current) return;
    const r = stickRef.current.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = -(e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    setKnob({ x, y });
    touch.steer = x;
    touch.thrust = y;
  };

  const endPointer = () => {
    setKnob({ x: 0, y: 0 });
    touch.steer = 0;
    touch.thrust = 0;
  };

  return (
    <div className="fixed inset-x-0 bottom-24 z-30 flex items-end justify-between px-6 pointer-events-none sm:hidden">
      {/* Flight Stick: Vertical = Forward/Reverse, Horizontal = Steer */}
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        <div
          ref={stickRef}
          className="relative h-28 w-28 touch-none rounded-full border border-white/20 bg-black/70 backdrop-blur-md shadow-2xl"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            handlePointer(e);
          }}
          onPointerMove={(e) => e.buttons && handlePointer(e)}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        >
          <div
            className="absolute h-10 w-10 rounded-full bg-white/40 border border-white/70 shadow-md"
            style={{
              left: `calc(50% + ${knob.x * 36}px - 20px)`,
              top: `calc(50% - ${knob.y * 36}px - 20px)`,
            }}
          />
        </div>
        <span className="text-[10px] font-mono-tech tracking-wider text-zinc-300">
          THROTTLE · STEER
        </span>
      </div>

      {/* Action Buttons Column */}
      <div className="pointer-events-auto flex flex-col gap-2">
        <button
          onPointerDown={() => (touch.boost = true)}
          onPointerUp={() => (touch.boost = false)}
          className="h-11 w-14 rounded-md border border-white/20 bg-black/70 text-[11px] font-mono-tech font-bold text-amber-300 active:bg-amber-400 active:text-black shadow-lg"
        >
          NITRO
        </button>

        {sim.docked ? (
          <button
            onClick={undock}
            className="h-11 w-14 rounded-md bg-white text-black text-[11px] font-mono-tech font-bold active:scale-95 shadow-lg"
          >
            LAUNCH
          </button>
        ) : (
          <button
            onClick={sim.inReentryCorridor ? () => releaseCapturedDebris(true) : triggerCapture}
            className={`h-11 w-14 rounded-md text-[11px] font-mono-tech font-bold active:scale-95 shadow-lg ${
              sim.inReentryCorridor
                ? "bg-amber-400 text-black animate-pulse"
                : sim.capturedDebrisId
                ? "bg-zinc-200 text-black"
                : sim.canCapture
                ? "bg-emerald-400 text-black animate-pulse"
                : "bg-zinc-800 text-zinc-400 border border-white/20"
            }`}
          >
            {sim.inReentryCorridor ? "DEORB" : sim.capturedDebrisId ? "DROP" : "PICKUP"}
          </button>
        )}
      </div>
    </div>
  );
}
