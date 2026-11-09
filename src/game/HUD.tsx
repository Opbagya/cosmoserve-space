import { useEffect, useRef, useState } from "react";
import {
  FUEL_CAPACITY,
  MOTHERCRAFT_DOCK_PORT,
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
  Radio,
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

  const isLowFuel = sim.fuel <= sim.fuelNeededToReturn + 4 && !sim.docked;
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
              <span className="text-[10px] font-mono-tech tracking-wider text-zinc-500">ALTITUDE</span>
              <div className="font-mono-tech text-base sm:text-lg font-medium text-zinc-100">
                450.2 <span className="text-xs text-zinc-500">KM</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono-tech tracking-wider text-zinc-500">VELOCITY</span>
              <div className="font-mono-tech text-base sm:text-lg font-medium text-zinc-100">
                {sim.vel.length().toFixed(2)} <span className="text-xs text-zinc-500">M/S</span>
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
              <span className="text-emerald-400 font-semibold tracking-wider">HARD DOCKED</span>
            ) : (
              <span>
                {sim.distToMothercraft.toFixed(1)} <span className="text-xs text-zinc-500">M</span>
              </span>
            )}
          </div>

          <div className="text-[10px] font-mono-tech tracking-wider text-zinc-400">
            ENTRY CORRIDOR:{" "}
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

      {/* --- SLEEK FLOATING TARGET RETICLES --- */}
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
            BASE
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
                deb.id === sim.captureTargetId ? "scale-105 opacity-90" : "opacity-45"
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
                {deb.screenPt.dist.toFixed(0)}M
              </span>
            </div>
          </div>
        ))}

      {/* --- CONTEXTUAL ACTION BANNER --- */}
      <div className="flex flex-col items-center gap-2">
        {isDocked && (
          <div className="pointer-events-auto flex items-center gap-4 rounded-md telemetry-panel-elevated px-5 py-2.5 shadow-2xl border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <div className="text-xs font-mono-tech tracking-wide text-zinc-200">
                DOCKED AT BASE · FAST REFUELING COMPLETE
              </div>
            </div>
            <button
              onClick={undock}
              className="rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-4 py-1.5 text-xs tracking-wider transition active:scale-95"
            >
              UNDOCK [SPACE]
            </button>
          </div>
        )}

        {!isDocked && sim.deorbitReady && (
          <div className="pointer-events-auto flex items-center gap-4 rounded-md telemetry-panel-elevated px-5 py-2.5 shadow-2xl border border-amber-500/40">
            <Flame size={16} className="text-amber-400" />
            <div className="text-xs font-mono-tech tracking-wide text-zinc-200">
              RE-ENTRY CORRIDOR REACHED (~120KM) · READY TO DE-ORBIT
            </div>
            <button
              onClick={() => releaseCapturedDebris(true)}
              className="rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-1.5 text-xs tracking-wider transition active:scale-95"
            >
              DE-ORBIT BURN [SPACE]
            </button>
          </div>
        )}

        {!isDocked && sim.canCapture && !sim.capturedDebrisId && (
          <div className="pointer-events-auto flex items-center gap-4 rounded-md telemetry-panel-elevated px-5 py-2.5 shadow-2xl border border-zinc-400/40">
            <Crosshair size={16} className="text-zinc-200" />
            <div className="text-xs font-mono-tech tracking-wide text-zinc-200">
              TARGET IN CAPTURE RANGE · {currentTarget?.name}
            </div>
            <button
              onClick={triggerCapture}
              className="rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-4 py-1.5 text-xs tracking-wider transition active:scale-95"
            >
              CAPTURE [E]
            </button>
          </div>
        )}

        {!isDocked && isLowFuel && (
          <div className="flex items-center gap-2 rounded-md bg-amber-950/80 border border-amber-500/50 px-4 py-2 text-xs font-mono-tech tracking-wider text-amber-200">
            <AlertTriangle size={14} className="text-amber-400" />
            <span>BINGO FUEL THRESHOLD REACHED · RETURN BURN REQUIRED</span>
          </div>
        )}
      </div>

      {/* --- BOTTOM SECTION: HIGH-PRECISION FUEL GAUGE --- */}
      <div className="pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 rounded-md telemetry-panel p-4 shadow-2xl">
        {/* Tracked Target Spec */}
        <div className="flex flex-col gap-0.5 sm:max-w-xs">
          <span className="text-[10px] font-mono-tech tracking-wider text-zinc-500">
            {sim.capturedDebrisId ? "GRAPPLED PAYLOAD" : "CURRENT TARGET"}
          </span>
          <div className="text-sm font-semibold text-zinc-100 truncate">
            {sim.capturedDebrisId
              ? carriedDebris?.name
              : currentTarget
              ? currentTarget.name
              : "ALL TARGETS DE-ORBITED"}
          </div>
          <div className="text-[11px] font-mono-tech text-zinc-400">
            {sim.capturedDebrisId ? (
              <span className="text-amber-400 font-medium">TOWING TO ATMOSPHERIC ENTRY ZONE</span>
            ) : currentTarget ? (
              `RANGE ${sim.pos.distanceTo(currentTarget.pos).toFixed(1)}M · REL VEL ${sim.vel.distanceTo(currentTarget.vel).toFixed(2)}M/S`
            ) : (
              "SORTIE COMPLETE · DOCK AT MOTHERCRAFT"
            )}
          </div>
        </div>

        {/* Advanced Fuel Gauge with Dynamic Return Indicator */}
        <div className="flex flex-1 max-w-xl flex-col gap-1 px-1">
          <div className="flex items-center justify-between text-[11px] font-mono-tech tracking-wider">
            <span className="text-zinc-400 font-medium flex items-center gap-1.5">
              <Gauge size={13} className="text-zinc-400" />
              <span>PROPULSION ΔV</span>
            </span>

            <div className="flex items-center gap-4">
              <span className="text-[10px] text-amber-400 font-medium">
                RETURN NEEDED: {returnFuelPct.toFixed(0)}%
              </span>
              <span
                className={`font-semibold ${
                  isLowFuel ? "text-amber-400" : "text-zinc-100"
                }`}
              >
                {fuelPct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Precision Fuel Bar Track */}
          <div className="relative h-4 w-full overflow-hidden rounded-sm bg-zinc-950 border border-white/10">
            {/* Dynamic Return Fuel Threshold Marker */}
            <div
              className="absolute inset-y-0 left-0 bg-amber-500/15 border-r border-amber-400/90 z-10 transition-all duration-100"
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

          <div className="flex items-center justify-between text-[9px] font-mono-tech text-zinc-500">
            <span>0%</span>
            <span>CAPACITY: 2–3 SATELLITES</span>
            <span>100% (RAPID RECHARGE)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {sim.capturedDebrisId ? (
            <button
              onClick={() => releaseCapturedDebris(sim.inReentryCorridor)}
              className="rounded bg-zinc-200 hover:bg-white text-zinc-950 font-bold px-3.5 py-2 text-xs tracking-wider transition active:scale-95"
            >
              {sim.inReentryCorridor ? "DE-ORBIT" : "RELEASE"}
            </button>
          ) : (
            <button
              onClick={triggerCapture}
              disabled={!sim.canCapture}
              className={`rounded px-3.5 py-2 text-xs font-bold tracking-wider transition active:scale-95 ${
                sim.canCapture
                  ? "bg-zinc-200 hover:bg-white text-zinc-950"
                  : "bg-zinc-900 border border-white/10 text-zinc-600 cursor-not-allowed"
              }`}
            >
              CAPTURE [E]
            </button>
          )}

          <button
            onClick={() => {
              sim.damp = !sim.damp;
              audio.beep(sim.damp ? 1400 : 700, 0.06);
            }}
            className={`rounded px-3 py-2 text-xs font-mono-tech tracking-wider border transition ${
              sim.damp
                ? "border-zinc-300 bg-zinc-800 text-zinc-100 font-semibold"
                : "border-white/10 bg-zinc-950 text-zinc-500"
            }`}
          >
            DAMP
          </button>
        </div>
      </div>
    </div>
  );
}

/** Mobile virtual touch sticks */
export function TouchControls() {
  const leftStick = useRef<HTMLDivElement>(null);
  const rightStick = useRef<HTMLDivElement>(null);
  const [leftK, setLeftK] = useState({ x: 0, y: 0 });
  const [rightK, setRightK] = useState({ x: 0, y: 0 });

  const handleStick = (
    e: React.PointerEvent,
    ref: React.RefObject<HTMLDivElement | null>,
    setK: (v: { x: number; y: number }) => void,
    onMove: (x: number, y: number) => void,
  ) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = -(e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const m = Math.hypot(x, y);
    if (m > 1) {
      x /= m;
      y /= m;
    }
    setK({ x, y });
    onMove(Math.abs(x) > 0.12 ? x : 0, Math.abs(y) > 0.12 ? y : 0);
  };

  const endStick = (
    setK: (v: { x: number; y: number }) => void,
    onMove: (x: number, y: number) => void,
  ) => {
    setK({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div className="fixed inset-x-0 bottom-24 z-30 flex items-end justify-between px-4 pointer-events-none sm:hidden">
      {/* Left Stick: Translation */}
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        <div
          ref={leftStick}
          className="relative h-28 w-28 touch-none rounded-full border border-white/20 bg-black/60 backdrop-blur-md"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            handleStick(e, leftStick, setLeftK, (x, y) => {
              touch.tx = x;
              touch.ty = y;
            });
          }}
          onPointerMove={(e) =>
            e.buttons &&
            handleStick(e, leftStick, setLeftK, (x, y) => {
              touch.tx = x;
              touch.ty = y;
            })
          }
          onPointerUp={() => endStick(setLeftK, (x, y) => {
            touch.tx = x;
            touch.ty = y;
          })}
          onPointerCancel={() => endStick(setLeftK, (x, y) => {
            touch.tx = x;
            touch.ty = y;
          })}
        >
          <div
            className="absolute h-9 w-9 rounded-full bg-white/40 border border-white/60"
            style={{
              left: `calc(50% + ${leftK.x * 35}px - 18px)`,
              top: `calc(50% - ${leftK.y * 35}px - 18px)`,
            }}
          />
        </div>
        <span className="text-[10px] font-mono-tech tracking-wider text-zinc-400">TRANSLATE</span>
      </div>

      {/* Right Stick: Rotation */}
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        <div
          ref={rightStick}
          className="relative h-28 w-28 touch-none rounded-full border border-white/20 bg-black/60 backdrop-blur-md"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            handleStick(e, rightStick, setRightK, (x, y) => {
              touch.rx = x;
              touch.ry = y;
            });
          }}
          onPointerMove={(e) =>
            e.buttons &&
            handleStick(e, rightStick, setRightK, (x, y) => {
              touch.rx = x;
              touch.ry = y;
            })
          }
          onPointerUp={() => endStick(setRightK, (x, y) => {
            touch.rx = x;
            touch.ry = y;
          })}
          onPointerCancel={() => endStick(setRightK, (x, y) => {
            touch.rx = x;
            touch.ry = y;
          })}
        >
          <div
            className="absolute h-9 w-9 rounded-full bg-white/40 border border-white/60"
            style={{
              left: `calc(50% + ${rightK.x * 35}px - 18px)`,
              top: `calc(50% - ${rightK.y * 35}px - 18px)`,
            }}
          />
        </div>
        <span className="text-[10px] font-mono-tech tracking-wider text-zinc-400">ROTATE</span>
      </div>
    </div>
  );
}
