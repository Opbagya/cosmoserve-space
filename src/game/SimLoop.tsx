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

      // Check Launch Inputs (ArrowUp, KeyR, Space, or Enter)
      const ax = readAxes();
      if (ax.surge > 0.1 || ax.boost || ax.action) {
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

      // --- 3D ROTATIONAL ATTITUDE & STEERING ---
      const pitchSign = sim.invertPitch ? -1 : 1;
      const sens = Math.max(0.4, Math.min(2.5, sim.sensitivity || 1.0));

      // Pitch: W = Nose Down (-1), S = Nose Up (+1)
      currentEuler.current.x = Math.max(
        -1.35,
        Math.min(1.35, currentEuler.current.x - ax.pitch * pitchSign * ROT_ACCEL * sens * dt),
      );

      // Yaw: A / ArrowLeft = Turn Left (-1), D / ArrowRight = Turn Right (+1)
      currentEuler.current.y -= ax.yaw * ROT_ACCEL * sens * dt;

      // Roll: Natural banking into turn + manual Q/E
      const targetRoll = ax.yaw * 0.4;
      currentEuler.current.z += (targetRoll - currentEuler.current.z) * (1 - Math.exp(-6.5 * dt));
      if (Math.abs(ax.roll) > 0.1) {
        currentEuler.current.z += ax.roll * ROT_ACCEL * sens * dt;
      }

      // RCS Rotational Damper (toggled by X)
      if (sim.damp && Math.abs(ax.pitch) < 0.05) {
        currentEuler.current.x += (0 - currentEuler.current.x) * (1 - Math.exp(-2.5 * dt));
      }

      sim.quat.setFromEuler(currentEuler.current);

      // --- TRANSLATION (Aule Space Direct Physics) ---
      sim.boosting = ax.boost && hasFuel;
      const speed = sim.boosting ? BOOST_ACCEL : TRANS_ACCEL;

      // Forward (+Z in craft frame), Lateral (Starboard screen right), Vertical (+Y dorsal)
      const fwd = T1.set(0, 0, 1).applyQuaternion(sim.quat);
      const right = T3.set(-1, 0, 0).applyQuaternion(sim.quat);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(sim.quat);

      const targetVel = T2.set(0, 0, 0)
        .addScaledVector(fwd, ax.surge * speed)
        .addScaledVector(right, ax.sway * (speed * 0.45))
        .addScaledVector(up, ax.heave * (speed * 0.35));

      sim.thrustWorld.copy(fwd).multiplyScalar(ax.surge);
      // Boosters only fire forward when surge > 0 or boosting
      sim.thrustAmount = sim.boosting ? 1.0 : (ax.surge > 0.05 ? ax.surge : 0);
      sim.steerAmount = ax.yaw;
      sim.swayAmount = ax.sway;
      sim.heaveAmount = ax.heave;

      const hasThrustInput =
        Math.abs(ax.surge) > 0.05 ||
        Math.abs(ax.sway) > 0.05 ||
        Math.abs(ax.heave) > 0.05 ||
        sim.boosting;

      // Snappy acceleration when thruster inputs are held
      if (hasThrustInput && hasFuel) {
        sim.vel.lerp(targetVel, 1 - Math.exp(-7.5 * dt));
        const rate = sim.boosting ? BOOST_FUEL_RATE : TRANS_FUEL_RATE;
        sim.fuel = Math.max(0, sim.fuel - rate * dt);
        audio.setHiss(sim.boosting ? 1.5 : 0.75);
      } else {
        // Natural gradual glide when releasing throttle
        sim.vel.multiplyScalar(1 - Math.min(0.2, 0.4 * dt));
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

      // When in briefing mode or docked at base, provide majestic cinematic view
      let targetCamPos: THREE.Vector3;
      let targetLook: THREE.Vector3;

      if (sim.screen === "briefing") {
        if (sim.briefingViewMode === "satellite") {
          // Dramatic high-definition orbital tracking of the targeted defunct satellite
          const targetDeb =
            sim.debris.find((d) => d.id === sim.briefingTargetSatId) ||
            sim.debris[1] ||
            sim.debris[0];

          if (targetDeb) {
            const time = state.clock.getElapsedTime() * 0.22;
            const dist = targetDeb.radius * 2.8 + 6.0;
            targetCamPos = T2.set(
              targetDeb.pos.x + Math.sin(time) * dist,
              targetDeb.pos.y + Math.sin(time * 0.7) * 2.4 + 1.2,
              targetDeb.pos.z + Math.cos(time) * dist,
            );
            targetLook = T3.copy(targetDeb.pos);
          } else {
            targetCamPos = T2.set(8.5, 6.2, 36.0);
            targetLook = T3.set(0, 0, 24.0);
          }
        } else {
          // Classic Mothercraft Depot & docked Reviver base view
          const time = state.clock.getElapsedTime() * 0.12;
          targetCamPos = T2.set(
            Math.sin(time) * 16.0 + 9.0,
            4.8 + Math.cos(time * 0.7) * 1.5,
            24.0 + Math.cos(time) * 16.0,
          );
          targetLook = T3.set(4.0, 0.5, 35.0);
        }
      } else if (sim.docked) {
        targetCamPos = T2.set(8.5, 6.2, 36.0);
        targetLook = T3.set(0, 0, 24.0);
      } else {
        targetCamPos = T2.copy(sim.pos).add(camOffset);
        targetLook = T3.set(0, 0.35, 20).applyQuaternion(sim.quat).add(sim.pos);
      }

      // Critically damped spring follow
      const lerpSpeed = sim.screen === "briefing" ? 3.0 : 8.5;
      chasePos.current.lerp(targetCamPos, 1 - Math.exp(-lerpSpeed * dt));
      cam.position.copy(chasePos.current);

      // Filtered forward look point (eliminates any angular wobble)
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
