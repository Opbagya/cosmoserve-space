import * as THREE from "three";

export const NOSE_OFFSET = 2.0; // Distance from Reviver center to capture arm tip
export const MOTHERCRAFT_DOCK_PORT = new THREE.Vector3(0, 0, 24); // Docking collar on Mothercraft
export const MOTHERCRAFT_RADIUS = 16.0;

// Earth & Orbital Metrics
export const EARTH_RADIUS = 20000;
export const EARTH_CENTER = new THREE.Vector3(0, -21400, -1200);
// Sub-120 km Atmospheric Entry Interface
export const REENTRY_ALTITUDE_THRESHOLD = 260; // Altitude in sim units where aerodynamic entry occurs
export const REENTRY_CORRIDOR_POS = new THREE.Vector3(0, -280, 400);
export const REENTRY_CORRIDOR_RADIUS = 280;

// Propulsion & Fuel Calibration
// Tuned so a full tank easily lasts 2 to 3 de-orbit operations
export const FUEL_CAPACITY = 100.0; // Delta-V percentage / tank units
export const TRANS_ACCEL = 1.6; // m/s² normal translation
export const BOOST_ACCEL = 4.2; // Boost surge
export const ROT_ACCEL = 0.55; // rad/s² angular
export const TRANS_FUEL_RATE = 0.55; // Fuel per second under full thrust
export const BOOST_FUEL_RATE = 1.35; // Fuel per second during boost
export const ROT_FUEL_RATE = 0.12; // Rotational RCS fuel consumption
export const RECHARGE_RATE = 45.0; // 45% per second -> Full recharge in ~2.2s!

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
    pos: new THREE.Vector3(120, 45, 380),
    vel: new THREE.Vector3(0.1, -0.05, 0.08),
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
    pos: new THREE.Vector3(-240, 80, 520),
    vel: new THREE.Vector3(-0.06, 0.04, -0.02),
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
    pos: new THREE.Vector3(340, -60, 680),
    vel: new THREE.Vector3(0.05, 0.02, 0.07),
    quat: new THREE.Quaternion(),
    angVel: new THREE.Vector3(0.12, 0.04, 0.08),
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
    pos: new THREE.Vector3(-180, -90, 890),
    vel: new THREE.Vector3(0.08, -0.06, 0.03),
    quat: new THREE.Quaternion(),
    angVel: new THREE.Vector3(0.18, 0.15, 0.1),
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
    pos: new THREE.Vector3(260, 110, 1150),
    vel: new THREE.Vector3(-0.04, 0.05, -0.05),
    quat: new THREE.Quaternion(),
    angVel: new THREE.Vector3(0.03, 0.09, 0.04),
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

  // Systems
  fuel: FUEL_CAPACITY,
  hull: 100,
  time: 0,
  damp: true,
  view: 1, // 0: Cockpit/Sensor, 1: Third-person Chase, 2: Mothercraft Base Cam
  boosting: false,

  // Mothercraft & Docking
  mothercraftPos: new THREE.Vector3(0, 0, 0),
  mothercraftQuat: new THREE.Quaternion(),
  docked: true, // Starts attached to Mothercraft
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
  flashMessage: "DOCKED AT MOTHERCRAFT · PRESS [SPACE] TO UNDOCK",
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
  sim.runId++;
  sim.screen = "briefing";
  sim.pos.copy(MOTHERCRAFT_DOCK_PORT);
  sim.vel.set(0, 0, 0);
  sim.quat.identity();
  sim.angVel.set(0, 0, 0);
  sim.thrustWorld.set(0, 0, 0);
  sim.thrustRot.set(0, 0, 0);

  sim.fuel = FUEL_CAPACITY;
  sim.hull = 100;
  sim.time = 0;
  sim.damp = true;
  sim.view = 1;
  sim.boosting = false;

  sim.docked = true;
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

  sim.flashMessage = "DOCKED AT MOTHERCRAFT · PRESS [SPACE] OR FORWARD THRUST TO UNDOCK";
  sim.flashTimer = 5.0;
  sim.score = {
    total: 0,
    debrisBonus: 0,
    precisionBonus: 0,
    fuelBonus: 0,
    timeBonus: 0,
  };
}

/** Undock from Mothercraft */
export function undock() {
  if (!sim.docked) return;
  sim.docked = false;
  sim.recharging = false;
  // Apply a gentle forward push away from the docking port
  sim.vel.set(0, 0, 2.5).applyQuaternion(sim.quat);
  sim.flashMessage = "REVIVER SEPARATION CONFIRMED · COMMENCING ADR SORTIE";
  sim.flashTimer = 3.5;
}

/** Trigger Soft Robotic Capture mechanism */
export function triggerCapture() {
  if (sim.capturedDebrisId) {
    // Release debris (e.g. if player wants to drop it or transfer it)
    releaseCapturedDebris(false);
    return;
  }

  // Check if any target is in range and aligned
  const target = sim.debris.find((d) => !d.deorbited && !d.captured && d.id === sim.captureTargetId);
  if (!target) return;

  const d = sim.pos.distanceTo(target.pos);
  const relVel = sim.vel.distanceTo(target.vel);

  if (d <= 18.0 && relVel <= 3.2) {
    target.captured = true;
    sim.capturedDebrisId = target.id;
    sim.captureArmState = 1.0;
    sim.flashMessage = `TARGET GRAPPLED: ${target.name.toUpperCase()} · TRANSIT TO ATMOSPHERIC ENTRY CORRIDOR`;
    sim.flashTimer = 4.5;
  } else {
    sim.flashMessage = `CAPTURE FAILED: RANGE ${d.toFixed(1)}m (REQ <18m) · VEL ${relVel.toFixed(2)}m/s (REQ <3.2m/s)`;
    sim.flashTimer = 2.5;
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
      // Kick debris into retrograde reentry trajectory
      target.vel.set(0, -12, 18);
      // Give Reviver a positive prograde kick upward to safe orbit
      sim.vel.add(new THREE.Vector3(0, 8, -6));
      sim.clearedCount++;
      sim.score.debrisBonus += 1500;
      sim.score.total += 1500;

      // Select next available target
      const nextTarget = sim.debris.find((d) => !d.deorbited && d.id !== target.id);
      sim.captureTargetId = nextTarget ? nextTarget.id : null;

      sim.flashMessage = `DE-ORBIT BURN EXECUTED: ${target.name} ENTERING ATMOSPHERIC ENTRY INTERFACE`;
      sim.flashTimer = 4.5;

      if (sim.clearedCount >= sim.totalDebris) {
        setTimeout(() => {
          sim.screen = "success";
        }, 3000);
      }
    } else {
      sim.flashMessage = `${target.name.toUpperCase()} RELEASED INTO FREE DRIFT`;
      sim.flashTimer = 3.0;
    }
  }
  sim.capturedDebrisId = null;
  sim.captureArmState = 0.0;
}
