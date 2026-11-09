import * as THREE from "three";
import { clearKeys } from "./input";

export const NOSE_OFFSET = 2.0; // Distance from Reviver center to capture arm tip
export const MOTHERCRAFT_DOCK_PORT = new THREE.Vector3(0, 0, 24); // Docking collar on Mothercraft
export const MOTHERCRAFT_RADIUS = 16.0;

// Earth & Orbital Metrics
export const EARTH_RADIUS = 20000;
export const EARTH_CENTER = new THREE.Vector3(0, -21400, -1200);

// Sub-120 km Atmospheric Entry Interface
export const REENTRY_ALTITUDE_THRESHOLD = 260;
export const REENTRY_CORRIDOR_POS = new THREE.Vector3(0, -140, 220);
export const REENTRY_CORRIDOR_RADIUS = 320;

// Propulsion & Fuel Calibration
export const FUEL_CAPACITY = 100.0;
export const TRANS_ACCEL = 26.0; // Responsive arcade forward thrust
export const BOOST_ACCEL = 55.0; // Turbo boost
export const ROT_ACCEL = 2.0;   // Smooth steering rate
export const TRANS_FUEL_RATE = 0.32; // Generous: easily cleans 3+ satellites
export const BOOST_FUEL_RATE = 0.75;
export const ROT_FUEL_RATE = 0.04;
export const RECHARGE_RATE = 250.0; // Instantaneous recharge (< 0.4s to 100%)

export const SUN_DIR = new THREE.Vector3(0.92, 0.35, 0.16).normalize();

export type Screen = "briefing" | "playing" | "paused" | "success" | "failed";

export interface DebrisTarget {
  id: string;
  name: string;
  type: "rocket_stage" | "defunct_sat" | "solar_wing" | "shrapnel_cluster" | "sensor_bus";
  description: string;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  quat: THREE.Quaternion;
  angVel: THREE.Vector3;
  radius: number;
  massKg: number;
  captured: boolean;
  deorbited: boolean;
  burnProgress: number; // 0 to 1 during atmospheric incineration
  screenPt: { x: number; y: number; on: boolean; dist: number };
}

export interface ScreenPt {
  x: number;
  y: number;
  on: boolean;
}

export const INITIAL_DEBRIS: Omit<DebrisTarget, "screenPt">[] = [
  {
    id: "deb-1",
    name: "SLV Spent Upper Stage",
    type: "rocket_stage",
    description: "Depleted rocket booster casing in decaying elliptical orbit.",
    pos: new THREE.Vector3(28, 8, 72),
    vel: new THREE.Vector3(0.02, 0.01, 0.02),
    quat: new THREE.Quaternion(),
    angVel: new THREE.Vector3(0.04, 0.08, 0.02),
    radius: 4.5,
    massKg: 1420,
    captured: false,
    deorbited: false,
    burnProgress: 0,
  },
  {
    id: "deb-2",
    name: "Pixxel EarthObs-1 (Dead Bus)",
    type: "defunct_sat",
    description: "Decommissioned multi-spectral satellite with stuck solar boom.",
    pos: new THREE.Vector3(-32, 12, 95),
    vel: new THREE.Vector3(-0.02, 0.01, -0.01),
    quat: new THREE.Quaternion(),
    angVel: new THREE.Vector3(0.06, 0.02, 0.05),
    radius: 3.2,
    massKg: 380,
    captured: false,
    deorbited: false,
    burnProgress: 0,
  },
  {
    id: "deb-3",
    name: "ComSat Solar Array Truss",
    type: "solar_wing",
    description: "Severed photovoltaic wing reflecting high-intensity glare.",
    pos: new THREE.Vector3(55, 16, 140),
    vel: new THREE.Vector3(0.02, -0.01, 0.02),
    quat: new THREE.Quaternion(),
    angVel: new THREE.Vector3(0.08, 0.03, 0.05),
    radius: 3.8,
    massKg: 210,
    captured: false,
    deorbited: false,
    burnProgress: 0,
  },
  {
    id: "deb-4",
    name: "Fengyun High-Risk Fragment",
    type: "shrapnel_cluster",
    description: "Tumbling hypervelocity jagged titanium shrapnel cluster.",
    pos: new THREE.Vector3(-45, -18, 170),
    vel: new THREE.Vector3(0.03, -0.02, 0.01),
    quat: new THREE.Quaternion(),
    angVel: new THREE.Vector3(0.12, 0.1, 0.08),
    radius: 2.6,
    massKg: 95,
    captured: false,
    deorbited: false,
    burnProgress: 0,
  },
  {
    id: "deb-5",
    name: "Legacy NavSat Transponder",
    type: "sensor_bus",
    description: "Spin-stabilized navigation satellite with dead battery cells.",
    pos: new THREE.Vector3(30, -22, 210),
    vel: new THREE.Vector3(-0.02, 0.02, -0.02),
    quat: new THREE.Quaternion(),
    angVel: new THREE.Vector3(0.03, 0.06, 0.04),
    radius: 3.4,
    massKg: 520,
    captured: false,
    deorbited: false,
    burnProgress: 0,
  },
];

export const sim = {
  screen: "briefing" as Screen,
  runId: 0,

  // Player Vehicle (Reviver Servicer)
  pos: new THREE.Vector3(0, 0, 24),
  vel: new THREE.Vector3(),
  quat: new THREE.Quaternion(),
  angVel: new THREE.Vector3(),
  thrustWorld: new THREE.Vector3(),
  thrustRot: new THREE.Vector3(),
  thrustAmount: 0,
  steerAmount: 0,
  swayAmount: 0,
  heaveAmount: 0,
  rollAmount: 0,

  // Systems
  fuel: FUEL_CAPACITY,
  hull: 100,
  time: 0,
  damp: true,
  view: 1, // 0: Cockpit/Sensor, 1: Third-person Chase, 2: Mothercraft Base Cam
  boosting: false,
  invertPitch: false, // Standard: W = nose down (-1), S = nose up (+1)
  sensitivity: 1.0,   // Control rate multiplier (0.5x to 2.0x)
  particlesHigh: true,// Enhanced thruster vapor and particles

  // Mothercraft & Docking
  mothercraftPos: new THREE.Vector3(0, 0, 0),
  mothercraftQuat: new THREE.Quaternion(),
  docked: true, // Starts attached to Mothercraft
  dockCooldown: 0, // Prevents instant re-docking loop!
  recharging: false,
  rechargeProgress: 0,
  distToMothercraft: 0,
  fuelNeededToReturn: 8, // Dynamic return marker calculation
  bingoWarning: false,

  // Soft Robotic Capture System
  captureArmState: 0, // 0: retracted, 1: fully gripping
  capturedDebrisId: null as string | null,
  captureTargetId: "deb-1" as string | null,
  canCapture: false,

  // Atmospheric Entry Corridor
  inReentryCorridor: false,
  distToCorridor: 0,
  deorbitReady: false,

  // Debris List
  debris: [] as DebrisTarget[],
  clearedCount: 0,
  totalDebris: 5,

  // Mission Log & Events
  flashMessage: "DOCKED AT MOTHERCRAFT · PRESS [SPACE] OR CLICK LAUNCH",
  flashTimer: 4.0,
  failReason: "",
  score: {
    total: 0,
    debrisBonus: 0,
    precisionBonus: 0,
    fuelBonus: 0,
    timeBonus: 0,
  },

  // HUD Tracking Projection
  mothercraftScreen: { x: 0.5, y: 0.5, on: false, dist: 0 },
  corridorScreen: { x: 0.5, y: 0.5, on: false, dist: 0 },
};

export function resetSim() {
  clearKeys();
  sim.runId++;
  sim.screen = "briefing";
  sim.pos.copy(MOTHERCRAFT_DOCK_PORT);
  sim.vel.set(0, 0, 0);
  sim.quat.identity();
  sim.angVel.set(0, 0, 0);
  sim.thrustWorld.set(0, 0, 0);
  sim.thrustRot.set(0, 0, 0);
  sim.thrustAmount = 0;
  sim.steerAmount = 0;
  sim.swayAmount = 0;
  sim.heaveAmount = 0;
  sim.rollAmount = 0;

  sim.fuel = FUEL_CAPACITY;
  sim.hull = 100;
  sim.time = 0;
  sim.damp = true;
  sim.view = 1;
  sim.boosting = false;

  sim.docked = true;
  sim.dockCooldown = 0;
  sim.recharging = false;
  sim.rechargeProgress = 0;
  sim.distToMothercraft = 0;
  sim.fuelNeededToReturn = 8;
  sim.bingoWarning = false;

  sim.captureArmState = 0;
  sim.capturedDebrisId = null;
  sim.captureTargetId = "deb-1";
  sim.canCapture = false;

  sim.inReentryCorridor = false;
  sim.deorbitReady = false;
  sim.clearedCount = 0;

  sim.debris = INITIAL_DEBRIS.map((d) => ({
    ...d,
    pos: d.pos.clone(),
    vel: d.vel.clone(),
    quat: d.quat.clone(),
    angVel: d.angVel.clone(),
    captured: false,
    deorbited: false,
    burnProgress: 0,
    screenPt: { x: 0.5, y: 0.5, on: false, dist: 0 },
  }));

  sim.flashMessage = "DOCKED AT MOTHERCRAFT · PRESS [SPACE] OR CLICK LAUNCH";
  sim.flashTimer = 5.0;
  sim.score = {
    total: 0,
    debrisBonus: 0,
    precisionBonus: 0,
    fuelBonus: 0,
    timeBonus: 0,
  };
}

/** Undock from Mothercraft - cleanly moves player forward and starts flight */
export function undock() {
  if (!sim.docked) return;
  sim.docked = false;
  sim.recharging = false;
  sim.dockCooldown = 5.0; // 5-second cooldown so you CANNOT accidentally re-dock immediately!
  
  // Position ship cleanly 25 meters forward outside the docking collar
  sim.pos.copy(MOTHERCRAFT_DOCK_PORT).add(new THREE.Vector3(0, 0, 25));
  sim.quat.identity();
  // Neutral station-keeping: zero initial velocity, zero auto-boost until player thrusts
  sim.vel.set(0, 0, 0);
  sim.thrustAmount = 0;
  sim.boosting = false;
  
  sim.flashMessage = "REVIVER DETACHED · USE [↑ / R] FORWARD THRUST";
  sim.flashTimer = 3.5;
}

/** Trigger Soft Robotic Capture mechanism */
export function triggerCapture() {
  if (sim.capturedDebrisId) {
    // Release debris
    releaseCapturedDebris(false);
    return;
  }

  // Find nearest valid debris target
  const available = sim.debris.filter((d) => !d.deorbited && !d.captured);
  let closest: DebrisTarget | null = null;
  let minDist = Infinity;

  for (const d of available) {
    const dist = sim.pos.distanceTo(d.pos);
    if (dist < minDist) {
      minDist = dist;
      closest = d;
    }
  }

  if (closest && minDist <= 35.0) {
    closest.captured = true;
    sim.capturedDebrisId = closest.id;
    sim.captureArmState = 1.0;
    sim.flashMessage = `GRAPPLED: ${closest.name.toUpperCase()} · FLY TO DISPOSAL ZONE`;
    sim.flashTimer = 4.0;
  } else {
    sim.flashMessage = closest
      ? `GET CLOSER: RANGE ${minDist.toFixed(0)}M (NEED <35M)`
      : `NO TARGET IN RANGE`;
    sim.flashTimer = 2.0;
  }
}

/** Release grappled debris (normal release or de-orbit atmospheric burn) */
export function releaseCapturedDebris(isDeorbit: boolean) {
  if (!sim.capturedDebrisId) return;
  const target = sim.debris.find((d) => d.id === sim.capturedDebrisId);
  if (target) {
    target.captured = false;
    if (isDeorbit) {
      target.deorbited = true;
      target.burnProgress = 0.01;
      // Kick debris downwards into atmospheric entry
      target.vel.set(0, -15, 20);
      sim.clearedCount++;
      sim.score.debrisBonus += 1500;
      sim.score.total += 1500;

      // Select next available target
      const nextTarget = sim.debris.find((d) => !d.deorbited && d.id !== target.id);
      sim.captureTargetId = nextTarget ? nextTarget.id : null;

      sim.flashMessage = `${target.name.toUpperCase()} DE-ORBITED · DISPERSED IN ATMOSPHERE`;
      sim.flashTimer = 4.0;

      if (sim.clearedCount >= sim.totalDebris) {
        setTimeout(() => {
          sim.screen = "success";
        }, 2500);
      }
    } else {
      sim.flashMessage = `${target.name.toUpperCase()} RELEASED`;
      sim.flashTimer = 2.5;
    }
  }
  sim.capturedDebrisId = null;
  sim.captureArmState = 0.0;
}

/** Emergency Dock at Mothercraft Depot */
export function emergencyDock() {
  if (sim.capturedDebrisId) {
    releaseCapturedDebris(false);
  }
  sim.docked = true;
  sim.recharging = false;
  sim.fuel = FUEL_CAPACITY;
  sim.hull = 100;
  sim.pos.copy(MOTHERCRAFT_DOCK_PORT);
  sim.vel.set(0, 0, 0);
  sim.angVel.set(0, 0, 0);
  sim.quat.identity();
  sim.flashMessage = "EMERGENCY DOCK: CRAFT SECURED AT MOTHERCRAFT · REFUEL COMPLETE";
  sim.flashTimer = 4.0;
}

/** Return to Main Landing Webpage */
export function returnToMainMenu() {
  if (sim.capturedDebrisId) {
    releaseCapturedDebris(false);
  }
  sim.screen = "briefing";
  sim.docked = true;
  sim.recharging = false;
  sim.fuel = FUEL_CAPACITY;
  sim.pos.copy(MOTHERCRAFT_DOCK_PORT);
  sim.vel.set(0, 0, 0);
  sim.angVel.set(0, 0, 0);
  sim.quat.identity();
}
