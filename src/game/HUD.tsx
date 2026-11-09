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
              onClick={undock}
              className="flex items-center gap-2 rounded bg-white hover:bg-zinc-200 text-black font-bold px-5 py-2 text-xs tracking-wider transition active:scale-95 shadow-md"
            >
              <Rocket size={14} />
              <span>LAUNCH [SPACE / W]</span>
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
              onClick={() => releaseCapturedDebris(true)}
              className="rounded bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 text-xs tracking-wider transition active:scale-95 shadow-md"
            >
              DE-ORBIT BURN [SPACE]
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
              onClick={triggerCapture}
              className="flex items-center gap-2 rounded bg-white hover:bg-zinc-200 text-black font-bold px-5 py-2 text-xs tracking-wider transition active:scale-95 shadow-md"
            >
              <span>CAPTURE</span>
              <span className="rounded bg-black/15 px-1.5 py-0.5 text-[10px] font-mono-tech text-zinc-800">
                [E / CLICK]
              </span>
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
              `RANGE ${sim.pos.distanceTo(currentTarget.pos).toFixed(0)}M`
            ) : (
              "SORTIE COMPLETE · DOCK AT BASE"
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
            <span>R/F: FWD/REV · W/S: PITCH · A/D: YAW · Q/E: ROLL · J/L: SWAY · SPACE/C: HEAVE · E: CAPTURE · X: DAMP</span>
            <span>100% (RAPID RECHARGE)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isDocked ? (
            <button
              onClick={undock}
              className="rounded bg-white hover:bg-zinc-200 text-black font-bold px-4 py-2 text-xs tracking-wider transition active:scale-95 shadow-md"
            >
              LAUNCH [SPACE / R]
            </button>
          ) : sim.capturedDebrisId ? (
            <button
              onClick={() => releaseCapturedDebris(sim.inReentryCorridor)}
              className="rounded bg-zinc-200 hover:bg-white text-zinc-950 font-bold px-4 py-2 text-xs tracking-wider transition active:scale-95"
            >
              {sim.inReentryCorridor ? "DE-ORBIT [SPACE]" : "RELEASE [E]"}
            </button>
          ) : (
            <button
              onClick={triggerCapture}
              disabled={!sim.canCapture}
              className={`flex items-center gap-1.5 rounded px-4 py-2 text-xs font-bold tracking-wider transition active:scale-95 ${
                sim.canCapture
                  ? "bg-white text-black hover:bg-zinc-200 shadow-md"
                  : "bg-zinc-900 border border-white/10 text-zinc-600 cursor-not-allowed"
              }`}
            >
              <span>CAPTURE</span>
              <span className="text-[10px] opacity-75">[E]</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** 6-DOF virtual touch controls for mobile matching the flight matrix */
export function TouchControls() {
  const leftStickRef = useRef<HTMLDivElement>(null);
  const rightStickRef = useRef<HTMLDivElement>(null);
  const [leftKnob, setLeftKnob] = useState({ x: 0, y: 0 });
  const [rightKnob, setRightKnob] = useState({ x: 0, y: 0 });

  // Left Stick: Vertical = Forward / Retrograde (R/F), Horizontal = Sway (J/L)
  const handleLeftPointer = (e: React.PointerEvent) => {
    if (!leftStickRef.current) return;
    const r = leftStickRef.current.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = -(e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    setLeftKnob({ x, y });
    touch.sway = x;
    touch.forward = y;
  };

  const endLeftPointer = () => {
    setLeftKnob({ x: 0, y: 0 });
    touch.sway = 0;
    touch.forward = 0;
  };

  // Right Stick: Vertical = Pitch (W/S), Horizontal = Yaw (A/D)
  const handleRightPointer = (e: React.PointerEvent) => {
    if (!rightStickRef.current) return;
    const r = rightStickRef.current.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = -(e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    setRightKnob({ x, y });
    touch.yaw = x;
    touch.pitch = -y; // Up pushes nose down
  };

  const endRightPointer = () => {
    setRightKnob({ x: 0, y: 0 });
    touch.yaw = 0;
    touch.pitch = 0;
  };

  return (
    <div className="fixed inset-x-0 bottom-24 z-30 flex items-end justify-between px-4 sm:px-6 pointer-events-none sm:hidden">
      {/* Left Stick: Forward / Retrograde (Vertical) & Sway Left / Right (Horizontal) */}
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        <div
          ref={leftStickRef}
          className="relative h-26 w-26 touch-none rounded-full border border-white/20 bg-black/60 backdrop-blur-md"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            handleLeftPointer(e);
          }}
          onPointerMove={(e) => e.buttons && handleLeftPointer(e)}
          onPointerUp={endLeftPointer}
          onPointerCancel={endLeftPointer}
        >
          <div
            className="absolute h-9 w-9 rounded-full bg-white/40 border border-white/60"
            style={{
              left: `calc(50% + ${leftKnob.x * 32}px - 18px)`,
              top: `calc(50% - ${leftKnob.y * 32}px - 18px)`,
            }}
          />
        </div>
        <span className="text-[9px] font-mono-tech tracking-wider text-zinc-400">
          FWD/REV · SWAY
        </span>
      </div>

      {/* Center 6-DOF Touch Buttons: Roll (Q/E) & Heave (Up/Down) */}
      <div className="pointer-events-auto flex items-center gap-1.5 mb-1">
        <div className="flex flex-col gap-1">
          <button
            onPointerDown={() => (touch.roll = -1)}
            onPointerUp={() => (touch.roll = 0)}
            className="h-8 w-9 rounded border border-white/15 bg-black/60 text-[10px] font-mono-tech font-bold text-zinc-300 active:bg-white active:text-black"
          >
            Q ↺
          </button>
          <button
            onPointerDown={() => (touch.roll = 1)}
            onPointerUp={() => (touch.roll = 0)}
            className="h-8 w-9 rounded border border-white/15 bg-black/60 text-[10px] font-mono-tech font-bold text-zinc-300 active:bg-white active:text-black"
          >
            E ↻
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <button
            onPointerDown={() => (touch.heave = 1)}
            onPointerUp={() => (touch.heave = 0)}
            className="h-8 w-9 rounded border border-white/15 bg-black/60 text-[10px] font-mono-tech font-bold text-zinc-300 active:bg-white active:text-black"
          >
            ▲ UP
          </button>
          <button
            onPointerDown={() => (touch.heave = -1)}
            onPointerUp={() => (touch.heave = 0)}
            className="h-8 w-9 rounded border border-white/15 bg-black/60 text-[10px] font-mono-tech font-bold text-zinc-300 active:bg-white active:text-black"
          >
            ▼ DN
          </button>
        </div>
      </div>

      {/* Right Stick: Pitch (Vertical) & Yaw (Horizontal) + Actions */}
      <div className="pointer-events-auto flex items-end gap-2">
        <div className="flex flex-col items-center gap-1">
          <div
            ref={rightStickRef}
            className="relative h-26 w-26 touch-none rounded-full border border-white/20 bg-black/60 backdrop-blur-md"
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              handleRightPointer(e);
            }}
            onPointerMove={(e) => e.buttons && handleRightPointer(e)}
            onPointerUp={endRightPointer}
            onPointerCancel={endRightPointer}
          >
            <div
              className="absolute h-9 w-9 rounded-full bg-white/40 border border-white/60"
              style={{
                left: `calc(50% + ${rightKnob.x * 32}px - 18px)`,
                top: `calc(50% - ${rightKnob.y * 32}px - 18px)`,
              }}
            />
          </div>
          <span className="text-[9px] font-mono-tech tracking-wider text-zinc-400">
            PITCH · YAW
          </span>
        </div>

        {/* Action Column */}
        <div className="flex flex-col gap-1.5">
          <button
            onPointerDown={() => (touch.boost = true)}
            onPointerUp={() => (touch.boost = false)}
            className="h-10 w-12 rounded border border-white/20 bg-black/60 text-[10px] font-mono-tech font-bold text-amber-300 active:bg-amber-400 active:text-black"
          >
            BOOST
          </button>

          {sim.docked ? (
            <button
              onClick={undock}
              className="h-10 w-12 rounded bg-white text-black text-[10px] font-mono-tech font-bold active:scale-95 shadow-lg"
            >
              UNDOCK
            </button>
          ) : (
            <button
              onClick={sim.inReentryCorridor ? () => releaseCapturedDebris(true) : triggerCapture}
              className={`h-10 w-12 rounded text-[10px] font-mono-tech font-bold active:scale-95 shadow-lg ${
                sim.inReentryCorridor
                  ? "bg-amber-400 text-black"
                  : sim.capturedDebrisId
                  ? "bg-zinc-200 text-black"
                  : sim.canCapture
                  ? "bg-emerald-400 text-black animate-pulse"
                  : "bg-zinc-800 text-zinc-400 border border-white/20"
              }`}
            >
              {sim.inReentryCorridor ? "DEORB" : sim.capturedDebrisId ? "DROP" : "GRAP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
