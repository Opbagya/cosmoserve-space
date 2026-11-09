import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { audio } from "./audio";
import { readAxes } from "./input";
import {
  BOOST_ACCEL,
  BOOST_FUEL_RATE,
  FUEL_CAPACITY,
  MOTHERCRAFT_DOCK_PORT,
  RECHARGE_RATE,
  REENTRY_CORRIDOR_POS,
  REENTRY_CORRIDOR_RADIUS,
  ROT_ACCEL,
  TRANS_ACCEL,
  TRANS_FUEL_RATE,
  releaseCapturedDebris,
  sim,
  triggerCapture,
  undock,
  type ScreenPt,
} from "./sim";

const T1 = new THREE.Vector3();
const T2 = new THREE.Vector3();
const T3 = new THREE.Vector3();
const DQ = new THREE.Quaternion();
const CAM_POS = new THREE.Vector3();
const PJ = new THREE.Vector3();

function projectToScreen(
  cam: THREE.Camera,
  pos: THREE.Vector3,
  out: ScreenPt & { dist: number },
) {
  out.dist = sim.pos.distanceTo(pos);
  PJ.copy(pos).project(cam);

  const behind = PJ.z > 1.0;
  let x = PJ.x;
  let y = PJ.y;

  if (behind) {
    x = -x;
    y = -y;
  }

  out.on = !behind && Math.abs(x) < 0.95 && Math.abs(y) < 0.95;

  if (!out.on) {
    const m = Math.max(Math.abs(x), Math.abs(y), 1e-5);
    x = (x / m) * 0.92;
    y = (y / m) * 0.9;
  }

  out.x = x * 0.5 + 0.5;
  out.y = -y * 0.5 + 0.5;
}

let alarmTimer = 0;
let rechargeAudioTimer = 0;

export function SimLoop() {
  const chasePos = useRef(new THREE.Vector3(0, 4, -12));
  const currentEuler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const cam = state.camera as THREE.PerspectiveCamera;

    if (sim.screen !== "playing") return;

    sim.time += dt;

    if (sim.flashTimer > 0) {
      sim.flashTimer -= dt;
    }

    if (sim.dockCooldown > 0) {
      sim.dockCooldown -= dt;
    }

    // --- 1. DOCKED AT MOTHERCRAFT ---
    if (sim.docked) {
      sim.pos.copy(MOTHERCRAFT_DOCK_PORT);
      sim.vel.set(0, 0, 0);
      sim.angVel.set(0, 0, 0);
      sim.quat.identity();
      currentEuler.current.set(0, 0, 0, "YXZ");

      // Super-fast Instantaneous Refuel (< 0.4s)
      if (sim.fuel < FUEL_CAPACITY || sim.hull < 100) {
        sim.recharging = true;
        sim.fuel = Math.min(FUEL_CAPACITY, sim.fuel + RECHARGE_RATE * dt);
        sim.hull = Math.min(100, sim.hull + 120 * dt);

        rechargeAudioTimer += dt;
        if (rechargeAudioTimer >= 0.08) {
          audio.rechargeHum(sim.fuel / FUEL_CAPACITY);
          rechargeAudioTimer = 0;
        }
      } else {
        sim.recharging = false;
      }

      // Check Launch Inputs (W, Up, Space, or Action)
      const ax = readAxes();
      if (ax.thrust > 0.1 || ax.boost || ax.action) {
        undock();
        audio.thud(60, 0.35, 0.6);
        audio.voice("Reviver detached. Orbit cleanup sortie active.");
      }
    } else {
      // --- 2. ACTIVE FLIGHT OPERATIONS ---
      const ax = readAxes();
      const hasFuel = sim.fuel > 0;

      // Distance to Mothercraft
      sim.distToMothercraft = sim.pos.distanceTo(sim.mothercraftPos);

      // Dynamic Return Fuel Calculation
      const minReturnFuel = Math.min(
        80,
        Math.max(6, (sim.distToMothercraft / 1000) * 35 + 8),
      );
      sim.fuelNeededToReturn = minReturnFuel;

      // Bingo Fuel Alert
      if (sim.fuel <= minReturnFuel + 3 && sim.distToMothercraft > 35) {
        sim.bingoWarning = true;
        alarmTimer += dt;
        if (alarmTimer >= 3.0) {
          audio.bingoWarning();
          alarmTimer = 0;
        }
      } else {
        sim.bingoWarning = false;
      }

      // Check Re-Docking (ONLY if dockCooldown has expired!)
      const distToDock = sim.pos.distanceTo(MOTHERCRAFT_DOCK_PORT);
      if (sim.dockCooldown <= 0 && distToDock <= 18.0) {
        sim.docked = true;
        sim.fuel = FUEL_CAPACITY;
        sim.hull = 100;
        sim.flashMessage = "DOCKED AT MOTHERCRAFT · REFUELING COMPLETE";
        sim.flashTimer = 3.5;
        audio.grappleLock();
        audio.voice("Docking confirmed. Rapid refueling complete.");
      }

      // --- SIMPLE, RESPONSIVE STEERING & FLIGHT ---
      sim.thrustAmount = ax.thrust;
      sim.steerAmount = ax.steer;

      // Steer left/right with A/D or Arrow Left/Right
      currentEuler.current.y -= ax.steer * ROT_ACCEL * dt;

      // Pitch with R/F with gentle auto-trim stabilization
      if (Math.abs(ax.pitch) > 0.05) {
        currentEuler.current.x = Math.max(
          -0.85,
          Math.min(0.85, currentEuler.current.x + ax.pitch * ROT_ACCEL * dt),
        );
      } else {
        // Softly re-center pitch to orbital plane
        currentEuler.current.x += (0 - currentEuler.current.x) * (1 - Math.exp(-2.2 * dt));
      }

      // Natural banking roll when turning
      const targetRoll = -ax.steer * 0.38;
      currentEuler.current.z += (targetRoll - currentEuler.current.z) * (1 - Math.exp(-6.5 * dt));

      sim.quat.setFromEuler(currentEuler.current);

      // --- RESPONSIVE FORWARD FLIGHT ---
      sim.boosting = ax.boost && hasFuel;
      const targetSpeed = sim.boosting
        ? BOOST_ACCEL
        : ax.thrust > 0
        ? TRANS_ACCEL
        : ax.thrust < 0
        ? -TRANS_ACCEL * 0.4
        : 0;

      // Forward vector in facing direction
      const fwd = T1.set(0, 0, 1).applyQuaternion(sim.quat);
      const targetVel = T2.copy(fwd).multiplyScalar(hasFuel ? targetSpeed : 0);
      sim.thrustWorld.copy(fwd).multiplyScalar(ax.thrust);

      // Smoothly align craft velocity to heading (arcade responsiveness)
      if (Math.abs(ax.thrust) > 0.05 || sim.boosting) {
        sim.vel.lerp(targetVel, 1 - Math.exp(-5.5 * dt));
        const rate = sim.boosting ? BOOST_FUEL_RATE : TRANS_FUEL_RATE;
        sim.fuel = Math.max(0, sim.fuel - rate * dt);
        audio.setHiss(sim.boosting ? 1.4 : 0.7);
      } else {
        // Natural gradual orbital deceleration when letting go of throttle
        sim.vel.multiplyScalar(1 - Math.min(0.4, 0.8 * dt));
        audio.setHiss(0);
      }

      // Advance position
      sim.pos.addScaledVector(sim.vel, dt);

      // Atmospheric Re-entry Corridor Detection
      sim.distToCorridor = sim.pos.distanceTo(REENTRY_CORRIDOR_POS);
      sim.inReentryCorridor = sim.distToCorridor <= REENTRY_CORRIDOR_RADIUS;
      sim.deorbitReady = sim.capturedDebrisId !== null && sim.inReentryCorridor;

      // Atmospheric roar sound when in re-entry zone
      if (sim.inReentryCorridor) {
        const proximity = Math.max(0, 1.0 - sim.distToCorridor / REENTRY_CORRIDOR_RADIUS);
        audio.setRoar(proximity * 0.6);
      } else {
        audio.setRoar(0);
      }

      // Check Closest Debris Target
      const available = sim.debris.filter((d) => !d.deorbited && !d.captured);
      let closestDist = Infinity;
      let closestId: string | null = null;
      for (const d of available) {
        const dist = sim.pos.distanceTo(d.pos);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = d.id;
        }
      }
      sim.captureTargetId = closestId;
      sim.canCapture = closestDist <= 35.0;
    }

    // --- SCREEN PROJECTIONS FOR HUD ---
    projectToScreen(cam, sim.mothercraftPos, sim.mothercraftScreen);
    projectToScreen(cam, REENTRY_CORRIDOR_POS, sim.corridorScreen);

    sim.debris.forEach((deb) => {
      projectToScreen(cam, deb.pos, deb.screenPt);
    });

    // --- SMOOTH CHASE CAMERA WITH DYNAMIC INERTIA & MOTION BLUR FOV ---
    const speed = sim.vel.length();

    if (sim.view === 0) {
      // Optical Bow Sensor Cam
      const fwd = T1.set(0, 0, 1).applyQuaternion(sim.quat);
      cam.position.copy(sim.pos).add(fwd.clone().multiplyScalar(1.5));
      cam.lookAt(T2.copy(sim.pos).add(fwd.clone().multiplyScalar(100)));
      const targetFov = sim.boosting ? 76 : 62 + Math.min(8, speed * 0.2);
      cam.fov += (targetFov - cam.fov) * (1 - Math.exp(-6 * dt));
      cam.updateProjectionMatrix();
    } else if (sim.view === 1) {
      // Third-Person Chase Cam (Dynamic spring follow with velocity lag)
      const chaseDist = sim.boosting ? -13.5 : -10.8 - Math.min(2.5, speed * 0.08);
      const chaseHeight = 3.1 + (sim.boosting ? 0.35 : 0);
      const camOffset = T1.set(0, chaseHeight, chaseDist).applyQuaternion(sim.quat);
      const targetCamPos = T2.copy(sim.pos).add(camOffset);

      // Camera Spring Lag
      chasePos.current.lerp(targetCamPos, 1 - Math.exp(-7.5 * dt));

      // Atmospheric turbulence & boost micro-rumble
      let shakeY = 0;
      let shakeX = 0;
      if (sim.boosting) {
        shakeY = (Math.random() - 0.5) * 0.06;
        shakeX = (Math.random() - 0.5) * 0.06;
      } else if (sim.inReentryCorridor) {
        const prox = Math.max(0, 1.0 - sim.distToCorridor / REENTRY_CORRIDOR_RADIUS);
        shakeY = Math.sin(sim.time * 30) * 0.1 * prox;
        shakeX = Math.cos(sim.time * 24) * 0.08 * prox;
      }

      cam.position.set(
        chasePos.current.x + shakeX,
        chasePos.current.y + shakeY,
        chasePos.current.z,
      );

      // Look slightly ahead of Reviver with lead angle
      const lookAheadDist = 18 + Math.min(10, speed * 0.4);
      const lookAhead = T3.set(0, 0.4, lookAheadDist).applyQuaternion(sim.quat);
      cam.lookAt(T1.copy(sim.pos).add(lookAhead));

      // Dynamic Speed FOV
      const targetFov = sim.boosting ? 68 : 58 + Math.min(7, speed * 0.22);
      cam.fov += (targetFov - cam.fov) * (1 - Math.exp(-5.5 * dt));
      cam.updateProjectionMatrix();
    } else {
      // Mothercraft Overview Cam
      cam.position.set(0, 18, -32).add(sim.mothercraftPos);
      cam.lookAt(sim.pos);
      cam.fov = 50;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
