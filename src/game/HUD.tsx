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
  BatteryCharging,
  Compass,
  Crosshair,
  Flame,
  Gauge,
  Navigation,
  Radio,
  RefreshCw,
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
  useTick(12);

  const fuelPct = Math.max(0, Math.min(100, (sim.fuel / FUEL_CAPACITY) * 100));
  const returnFuelPct = Math.max(5, Math.min(95, sim.fuelNeededToReturn));
  const currentTarget = sim.debris.find((d) => d.id === sim.captureTargetId);
  const carriedDebris = sim.debris.find((d) => d.id === sim.capturedDebrisId);

  const isLowFuel = sim.fuel <= sim.fuelNeededToReturn + 4 && !sim.docked;
  const isDocked = sim.docked;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-6 font-hud select-none">
      {/* --- TOP TELEMETRY BAR --- */}
      <div className="flex items-start justify-between gap-4">
        {/* Cosmoserve Mission Status Box */}
        <div className="pointer-events-auto flex flex-col gap-1 rounded border border-cyan-500/30 bg-[#070b16]/80 p-3 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2 text-xs tracking-widest text-cyan-400">
            <Radio size={14} className="animate-pulse text-cyan-300" />
            <span className="font-bold">COSMOSERVE SPACE · MISSION EMBRACE</span>
          </div>

          <div className="mt-1 flex items-baseline gap-4">
            <div>
              <span className="text-[10px] tracking-wider text-slate-400">ORBITAL ALTITUDE</span>
              <div className="font-mono-tech text-base sm:text-lg text-slate-100">
                450.2 <span className="text-xs text-cyan-400">KM (LEO)</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] tracking-wider text-slate-400">VELOCITY</span>
              <div className="font-mono-tech text-base sm:text-lg text-slate-100">
                {sim.vel.length().toFixed(2)} <span className="text-xs text-cyan-400">M/S</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] tracking-wider text-slate-400">DEBRIS CLEARED</span>
              <div className="font-mono-tech text-base sm:text-lg text-emerald-400">
                {sim.clearedCount} / {sim.totalDebris}
              </div>
            </div>
          </div>

          {/* Hull Integrity */}
          <div className="mt-1 flex items-center gap-2 text-xs">
            <Shield size={12} className="text-cyan-400" />
            <span className="text-[10px] text-slate-400">HULL INTEGRITY:</span>
            <span className="font-mono-tech text-slate-200">{sim.hull.toFixed(0)}%</span>
            {sim.damp && (
              <span className="ml-2 rounded border border-cyan-500/40 bg-cyan-950/60 px-1 text-[9px] text-cyan-300">
                RCS DAMP ON
              </span>
            )}
          </div>
        </div>

        {/* Central Objective Flash Notification */}
        {sim.flashTimer > 0 && (
          <div className="hidden sm:flex flex-col items-center">
            <div className="rounded border border-amber-500/50 bg-[#0d1222]/90 px-4 py-2 text-center backdrop-blur-md shadow-xl animate-fade-in">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-amber-300 glow-amber">
                {sim.flashMessage}
              </span>
            </div>
          </div>
        )}

        {/* Top-Right Mothercraft & Reentry Distance Gauges */}
        <div className="pointer-events-auto flex flex-col gap-2 rounded border border-cyan-500/30 bg-[#070b16]/80 p-3 backdrop-blur-md shadow-lg text-right">
          <div className="flex items-center justify-end gap-2 text-xs tracking-wider text-slate-300">
            <span>MOTHERCRAFT DEPOT</span>
            <Compass size={14} className="text-cyan-400" />
          </div>

          <div className="font-mono-tech text-base sm:text-xl font-bold text-slate-100">
            {isDocked ? (
              <span className="text-emerald-400">HARD DOCKED</span>
            ) : (
              <span>
                {sim.distToMothercraft.toFixed(1)} <span className="text-xs text-cyan-400">M</span>
              </span>
            )}
          </div>

          <div className="border-t border-slate-700/50 pt-1 text-[11px] text-slate-400">
            ENTRY CORRIDOR:{" "}
            <span
              className={
                sim.inReentryCorridor
                  ? "font-bold text-emerald-400 glow-cyan"
                  : "text-slate-200"
              }
            >
              {sim.distToCorridor.toFixed(0)} M
            </span>
          </div>
        </div>
      </div>

      {/* --- FLOATING BORESIGHT CROSSHAIR --- */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border border-cyan-400/30" />
          <div className="absolute h-1 w-1 rounded-full bg-cyan-400" />
          <div className="absolute h-4 w-[1px] bg-cyan-400/60 -top-5" />
          <div className="absolute h-4 w-[1px] bg-cyan-400/60 -bottom-5" />
          <div className="absolute w-4 h-[1px] bg-cyan-400/60 -left-5" />
          <div className="absolute w-4 h-[1px] bg-cyan-400/60 -right-5" />
        </div>
      </div>

      {/* --- FLOATING TARGET RETICLES --- */}
      {/* Mothercraft Marker */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
        style={{
          left: `${sim.mothercraftScreen.x * 100}%`,
          top: `${sim.mothercraftScreen.y * 100}%`,
        }}
      >
        <div className="flex flex-col items-center">
          <div className="h-6 w-6 rounded border border-cyan-400 bg-cyan-950/40 p-0.5 text-center text-[9px] text-cyan-300">
            DEPOT
          </div>
          <span className="mt-0.5 text-[9px] tracking-widest text-cyan-400">
            {sim.distToMothercraft.toFixed(0)}M
          </span>
        </div>
      </div>

      {/* Re-entry Corridor Marker */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
        style={{
          left: `${sim.corridorScreen.x * 100}%`,
          top: `${sim.corridorScreen.y * 100}%`,
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className={`h-7 w-7 rounded-full border-2 ${
              sim.inReentryCorridor
                ? "border-emerald-400 bg-emerald-950/60 text-emerald-300"
                : "border-amber-400 bg-amber-950/40 text-amber-300"
            } flex items-center justify-center text-[10px] font-bold`}
          >
            DISP
          </div>
          <span className="mt-0.5 text-[9px] tracking-widest text-amber-400">
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
                deb.id === sim.captureTargetId ? "scale-110" : "opacity-75"
              }`}
            >
              <div
                className={`h-6 w-6 border ${
                  deb.id === sim.captureTargetId
                    ? "border-amber-400 text-amber-300"
                    : "border-slate-500 text-slate-400"
                } flex items-center justify-center text-[8px] font-bold`}
              >
                JUNK
              </div>
              <span className="mt-0.5 text-[8px] tracking-wider text-slate-300">
                {deb.screenPt.dist.toFixed(0)}M
              </span>
            </div>
          </div>
        ))}

      {/* --- BOTTOM SECTION: FUEL GAUGE & DYNAMIC RETURN LINE --- */}
      <div className="flex flex-col gap-3">
        {/* ACTION PROMPTS BANNER */}
        <div className="flex items-center justify-center">
          {isDocked && (
            <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-emerald-500/60 bg-emerald-950/80 px-6 py-3 shadow-xl backdrop-blur-md">
              <BatteryCharging size={20} className="animate-bounce text-emerald-300" />
              <div>
                <div className="text-xs font-bold tracking-wider text-emerald-200">
                  DOCKED AT MOTHERCRAFT · FAST RECHARGING & REPAIRING
                </div>
                <div className="text-[11px] text-emerald-400/80">
                  Press <span className="font-bold underline text-white">[SPACE]</span> or Throttle Forward to Undock
                </div>
              </div>
              <button
                onClick={undock}
                className="ml-3 rounded border border-emerald-400 bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition"
              >
                UNDOCK
              </button>
            </div>
          )}

          {!isDocked && sim.deorbitReady && (
            <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-amber-500 bg-amber-950/90 px-6 py-3 shadow-2xl backdrop-blur-md animate-pulse">
              <Flame size={22} className="text-amber-400" />
              <div>
                <div className="text-sm font-bold tracking-widest text-amber-300">
                  ATMOSPHERIC ENTRY CORRIDOR REACHED
                </div>
                <div className="text-xs text-amber-200/90">
                  Ready to de-orbit {carriedDebris?.name}. Press <span className="font-bold underline text-white">[SPACE]</span> or click Release
                </div>
              </div>
              <button
                onClick={() => releaseCapturedDebris(true)}
                className="ml-3 rounded border border-amber-300 bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-500 active:scale-95 transition"
              >
                DE-ORBIT BURN
              </button>
            </div>
          )}

          {!isDocked && sim.canCapture && !sim.capturedDebrisId && (
            <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-cyan-400 bg-cyan-950/90 px-6 py-3 shadow-2xl backdrop-blur-md animate-bounce">
              <Crosshair size={22} className="text-cyan-300" />
              <div>
                <div className="text-sm font-bold tracking-widest text-cyan-200">
                  SOFT ROBOTIC CAPTURE LOCK AVAILABLE
                </div>
                <div className="text-xs text-cyan-300/80">
                  Target: {currentTarget?.name} · Press <span className="font-bold underline text-white">[E]</span> or Click Capture
                </div>
              </div>
              <button
                onClick={triggerCapture}
                className="ml-3 rounded border border-cyan-300 bg-cyan-600 px-5 py-2 text-xs font-bold text-white hover:bg-cyan-500 active:scale-95 transition"
              >
                CAPTURE
              </button>
            </div>
          )}

          {!isDocked && isLowFuel && (
            <div className="flex items-center gap-2 rounded border border-rose-500 bg-rose-950/90 px-4 py-2 shadow-xl backdrop-blur-md">
              <AlertTriangle size={18} className="text-rose-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-rose-300 glow-danger">
                ⚠️ BINGO FUEL THRESHOLD REACHED · RETURN TO MOTHERCRAFT REQUIRED
              </span>
            </div>
          )}
        </div>

        {/* MAIN HUD BOTTOM TELEMETRY CONTAINER */}
        <div className="pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 rounded-lg border border-cyan-500/30 bg-[#060914]/85 p-3 sm:p-4 backdrop-blur-md shadow-2xl">
          {/* Target Info */}
          <div className="flex flex-col gap-1 sm:max-w-xs">
            <span className="text-[10px] tracking-wider text-slate-400">
              {sim.capturedDebrisId ? "GRAPPLED PAYLOAD" : "TRACKED DEBRIS TARGET"}
            </span>
            <div className="text-sm font-bold text-slate-100 truncate">
              {sim.capturedDebrisId
                ? carriedDebris?.name
                : currentTarget
                ? currentTarget.name
                : "ALL TARGETS CLEARED"}
            </div>
            <div className="text-[11px] text-slate-400">
              {sim.capturedDebrisId ? (
                <span className="text-emerald-400 font-semibold">
                  TOWING TO ATMOSPHERIC REENTRY ZONE (~120KM)
                </span>
              ) : currentTarget ? (
                `Range: ${sim.pos.distanceTo(currentTarget.pos).toFixed(1)}m · Rel Vel: ${sim.vel.distanceTo(currentTarget.vel).toFixed(2)}m/s`
              ) : (
                "Return to Mothercraft for mission debrief"
              )}
            </div>
          </div>

          {/* ADVANCED DYNAMIC FUEL GAUGE WITH FLOATING RETURN LINE */}
          <div className="flex flex-1 max-w-xl flex-col gap-1.5 px-2">
            <div className="flex items-center justify-between text-xs tracking-wider">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Gauge size={14} className="text-cyan-400" />
                <span>PROPULSION ΔV (FUEL)</span>
              </span>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-amber-300 font-mono-tech">
                  MIN RETURN NEEDED: {returnFuelPct.toFixed(0)}%
                </span>
                <span
                  className={`font-mono-tech font-bold ${
                    isLowFuel ? "text-rose-400" : "text-cyan-300"
                  }`}
                >
                  {fuelPct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Fuel Bar Container */}
            <div className="relative h-6 w-full overflow-hidden rounded border border-cyan-500/40 bg-[#081020]">
              {/* Dynamic Return Fuel Threshold Marker (Floating Line / Area) */}
              <div
                className="absolute inset-y-0 left-0 bg-amber-500/20 border-r-2 border-amber-400 z-10 transition-all duration-150"
                style={{ width: `${returnFuelPct}%` }}
              >
                <div className="absolute right-1 top-0 text-[8px] font-bold text-amber-300">
                  RETURN
                </div>
              </div>

              {/* Current Fuel Level */}
              <div
                className={`h-full transition-all duration-100 ${
                  isDocked
                    ? "bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-300 animate-pulse"
                    : isLowFuel
                    ? "bg-gradient-to-r from-rose-600 to-amber-500"
                    : "bg-gradient-to-r from-cyan-600 via-cyan-400 to-emerald-400"
                }`}
                style={{ width: `${fuelPct}%` }}
              />

              {/* Grid calibration tick marks */}
              <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-30">
                {[0, 20, 40, 60, 80, 100].map((tick) => (
                  <div key={tick} className="h-full w-[1px] bg-white" />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>0% (DEPLETED)</span>
              <span>SUFFICIENT FOR 2-3 SATELLITES</span>
              <span>100% (FULL ΔV)</span>
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex items-center gap-2">
            {sim.capturedDebrisId ? (
              <button
                onClick={() => releaseCapturedDebris(sim.inReentryCorridor)}
                className={`flex items-center gap-1.5 rounded px-4 py-2 text-xs font-bold transition active:scale-95 ${
                  sim.inReentryCorridor
                    ? "border border-amber-400 bg-amber-600 text-white hover:bg-amber-500 shadow-lg"
                    : "border border-slate-500 bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Flame size={14} />
                <span>{sim.inReentryCorridor ? "DE-ORBIT" : "RELEASE"}</span>
              </button>
            ) : (
              <button
                onClick={triggerCapture}
                disabled={!sim.canCapture}
                className={`flex items-center gap-1.5 rounded px-4 py-2 text-xs font-bold transition active:scale-95 ${
                  sim.canCapture
                    ? "border border-cyan-400 bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg"
                    : "border border-slate-700 bg-slate-900/60 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Crosshair size={14} />
                <span>GRAPPLE [E]</span>
              </button>
            )}

            <button
              onClick={() => {
                sim.damp = !sim.damp;
                audio.beep(sim.damp ? 1400 : 700, 0.06);
              }}
              className={`rounded border px-3 py-2 text-xs font-semibold transition ${
                sim.damp
                  ? "border-cyan-400 bg-cyan-950 text-cyan-300"
                  : "border-slate-700 bg-slate-900 text-slate-400"
              }`}
            >
              DAMP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mobile virtual touch sticks for touchscreen devices */
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
      {/* Left Stick: Translation (Sway / Surge) */}
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        <div
          ref={leftStick}
          className="relative h-28 w-28 touch-none rounded-full border-2 border-cyan-500/40 bg-cyan-950/40 backdrop-blur-sm"
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
            className="absolute h-10 w-10 rounded-full border border-cyan-300 bg-cyan-400/30"
            style={{
              left: `calc(50% + ${leftK.x * 35}px - 20px)`,
              top: `calc(50% - ${leftK.y * 35}px - 20px)`,
            }}
          />
        </div>
        <span className="text-[10px] tracking-wider text-cyan-400">TRANSLATE</span>
      </div>

      {/* Right Stick: Rotation (Pitch / Yaw) */}
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        <div
          ref={rightStick}
          className="relative h-28 w-28 touch-none rounded-full border-2 border-cyan-500/40 bg-cyan-950/40 backdrop-blur-sm"
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
            className="absolute h-10 w-10 rounded-full border border-cyan-300 bg-cyan-400/30"
            style={{
              left: `calc(50% + ${rightK.x * 35}px - 20px)`,
              top: `calc(50% - ${rightK.y * 35}px - 20px)`,
            }}
          />
        </div>
        <span className="text-[10px] tracking-wider text-cyan-400">ROTATE</span>
      </div>
    </div>
  );
}
