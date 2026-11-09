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
  const chaseLook = useRef(new THREE.Vector3(0, 0, 20));
  const smoothSteer = useRef(0);
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

      // Check Launch Inputs (R, Forward, Space, or Action)
      const ax = readAxes();
      if (ax.forward > 0.1 || ax.boost || ax.action || ax.pitch < -0.1) {
        undock();
        audio.thud(60, 0.35, 0.6);
        audio.voice("Reviver detached. Orbit cleanup sortie active.");
      }
    } else {
      // --- 2. ACTIVE 6-DOF FLIGHT OPERATIONS ---
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

      // --- 6-DOF ROTATIONAL CONTROLS ---
      // Pitch: W / S or ↑ / ↓
      // Yaw: A / D or ← / →
      // Roll: Q / E
      const rotRate = ROT_ACCEL * 1.5;

      currentEuler.current.x += ax.pitch * rotRate * dt;
      currentEuler.current.y -= ax.yaw * rotRate * dt;
      currentEuler.current.z -= ax.roll * rotRate * dt;

      // RCS Rotational Damper (toggled by X)
      if (sim.damp) {
        if (Math.abs(ax.pitch) < 0.05) {
          currentEuler.current.x += (0 - currentEuler.current.x) * (1 - Math.exp(-3.5 * dt));
        }
        if (Math.abs(ax.roll) < 0.05) {
          currentEuler.current.z += (0 - currentEuler.current.z) * (1 - Math.exp(-4.5 * dt));
        }
      }

      // Clamp pitch to avoid gimbal flipping
      currentEuler.current.x = Math.max(-1.4, Math.min(1.4, currentEuler.current.x));

      sim.quat.setFromEuler(currentEuler.current);

      // --- 6-DOF TRANSLATIONAL CONTROLS ---
      // Forward / Retrograde: R / F
      // Sway Left / Right: J / L
      // Heave Up / Down: Space / C
      // Boost: Shift (Hold)
      sim.boosting = ax.boost && hasFuel;

      const forwardSpeed = sim.boosting
        ? BOOST_ACCEL
        : ax.forward > 0
        ? TRANS_ACCEL
        : ax.forward < 0
        ? -TRANS_ACCEL * 0.5
        : 0;

      const swaySpeed = ax.sway * TRANS_ACCEL * 0.7;
      const heaveSpeed = ax.heave * TRANS_ACCEL * 0.7;

      // Transform local 6-DOF translation to world space
      const localTrans = T1.set(swaySpeed, heaveSpeed, forwardSpeed);
      const targetVel = T2.copy(localTrans).applyQuaternion(sim.quat);
      sim.thrustWorld.copy(targetVel);

      sim.thrustAmount = ax.forward;
      sim.steerAmount = ax.yaw;
      sim.swayAmount = ax.sway;
      sim.heaveAmount = ax.heave;
      sim.rollAmount = ax.roll;

      const hasMotion =
        Math.abs(ax.forward) > 0.05 ||
        Math.abs(ax.sway) > 0.05 ||
        Math.abs(ax.heave) > 0.05 ||
        sim.boosting;

      if (hasMotion && hasFuel) {
        sim.vel.lerp(targetVel, 1 - Math.exp(-5.5 * dt));
        const rate = sim.boosting ? BOOST_FUEL_RATE : TRANS_FUEL_RATE;
        const totalInput = Math.abs(ax.forward) + Math.abs(ax.sway) * 0.5 + Math.abs(ax.heave) * 0.5;
        sim.fuel = Math.max(0, sim.fuel - rate * dt * Math.max(0.6, totalInput));
        audio.setHiss(sim.boosting ? 1.4 : Math.abs(ax.forward) > 0.1 ? 0.8 : 0.4);
      } else {
        // Orbital drift deceleration
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

    // --- ROCK-SOLID, SILKY-SMOOTH CHASE CAMERA (ZERO SHAKE) ---
    if (sim.view === 0) {
      // Optical Bow Sensor Cam
      const fwd = T1.set(0, 0, 1).applyQuaternion(sim.quat);
      cam.position.copy(sim.pos).add(fwd.clone().multiplyScalar(1.5));
      cam.lookAt(T2.copy(sim.pos).add(fwd.clone().multiplyScalar(100)));
      cam.fov = sim.boosting ? 70 : 62;
      cam.updateProjectionMatrix();
    } else if (sim.view === 1) {
      // Third-Person Chase Cam - Smooth critically damped tracking
      const chaseDist = sim.boosting ? -12.5 : -11.0;
      const camOffset = T1.set(0, 3.2, chaseDist).applyQuaternion(sim.quat);
      const targetCamPos = T2.copy(sim.pos).add(camOffset);

      // Critically damped spring follow
      chasePos.current.lerp(targetCamPos, 1 - Math.exp(-8.5 * dt));
      cam.position.copy(chasePos.current);

      // Filtered forward look point (eliminates any angular wobble)
      const targetLook = T3.set(0, 0.35, 20).applyQuaternion(sim.quat).add(sim.pos);
      chaseLook.current.lerp(targetLook, 1 - Math.exp(-11.0 * dt));
      cam.lookAt(chaseLook.current);

      // Stable FOV (avoid continuous projection matrix recalculation)
      const targetFov = sim.boosting ? 64 : 60;
      if (Math.abs(targetFov - cam.fov) > 0.05) {
        cam.fov += (targetFov - cam.fov) * (1 - Math.exp(-4 * dt));
        cam.updateProjectionMatrix();
      }
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
