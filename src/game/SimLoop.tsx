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
  ROT_FUEL_RATE,
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
const CAM_TARGET = new THREE.Vector3();
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
  const chasePos = useRef(new THREE.Vector3(0, 5, -14));

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const cam = state.camera as THREE.PerspectiveCamera;

    if (sim.screen !== "playing") return;

    sim.time += dt;

    if (sim.flashTimer > 0) {
      sim.flashTimer -= dt;
    }

    // --- DOCKED AT MOTHERCRAFT ---
    if (sim.docked) {
      sim.pos.copy(MOTHERCRAFT_DOCK_PORT);
      sim.vel.set(0, 0, 0);
      sim.angVel.set(0, 0, 0);
      sim.quat.identity();

      // Fast Recharging & System Diagnostics
      if (sim.fuel < FUEL_CAPACITY || sim.hull < 100) {
        sim.recharging = true;
        sim.fuel = Math.min(FUEL_CAPACITY, sim.fuel + RECHARGE_RATE * dt);
        sim.hull = Math.min(100, sim.hull + 25 * dt);

        rechargeAudioTimer += dt;
        if (rechargeAudioTimer >= 0.25) {
          audio.rechargeHum(sim.fuel / FUEL_CAPACITY);
          rechargeAudioTimer = 0;
        }
      } else {
        sim.recharging = false;
      }

      const ax = readAxes();
      if (ax.surge > 0.2 || ax.heave > 0.2 || ax.boost) {
        undock();
        audio.thud(55, 0.3, 0.5);
        audio.voice("Reviver detached. Orbit cleanup mission active.");
      }
    } else {
      // --- FREE FLIGHT ADR OPERATIONS ---
      const ax = readAxes();
      const hasFuel = sim.fuel > 0;

      // Distance to Mothercraft
      sim.distToMothercraft = sim.pos.distanceTo(sim.mothercraftPos);

      // Dynamic Return Fuel Calculation
      // Scales with distance: further away = higher required return burn
      const minReturnFuel = Math.min(
        88,
        Math.max(8, (sim.distToMothercraft / 1300) * 45 + 10),
      );
      sim.fuelNeededToReturn = minReturnFuel;

      // Bingo Fuel Alert
      if (sim.fuel <= minReturnFuel + 4 && sim.distToMothercraft > 40) {
        sim.bingoWarning = true;
        alarmTimer += dt;
        if (alarmTimer >= 2.5) {
          audio.bingoWarning();
          alarmTimer = 0;
        }
      } else {
        sim.bingoWarning = false;
      }

      // Check Docking with Mothercraft
      const distToDock = sim.pos.distanceTo(MOTHERCRAFT_DOCK_PORT);
      const relVelToDock = sim.vel.length();

      if (distToDock <= 14.0 && relVelToDock <= 4.2) {
        sim.docked = true;
        sim.flashMessage = "HARD DOCK CONFIRMED · MOTHERCRAFT REFUELING ACTIVE";
        sim.flashTimer = 4.0;
        audio.grappleLock();
        audio.voice("Docking confirmed. Resupply connected.");
      }

      // --- ROTATION (Body Frame) ---
      const cmdRot = T1.set(ax.pitch, ax.yaw, ax.roll);
      const rot = T2.copy(cmdRot).multiplyScalar(hasFuel ? ROT_ACCEL : 0);

      if (sim.damp && hasFuel) {
        // Damp rotational rate when no stick input
        const desired = T3.copy(sim.angVel).multiplyScalar(-2.8);
        if (Math.abs(cmdRot.x) < 0.1) rot.x += Math.max(-ROT_ACCEL, Math.min(ROT_ACCEL, desired.x));
        if (Math.abs(cmdRot.y) < 0.1) rot.y += Math.max(-ROT_ACCEL, Math.min(ROT_ACCEL, desired.y));
        if (Math.abs(cmdRot.z) < 0.1) rot.z += Math.max(-ROT_ACCEL, Math.min(ROT_ACCEL, desired.z));
      }

      sim.angVel.addScaledVector(rot, dt);
      sim.thrustRot.copy(rot);

      if (rot.lengthSq() > 0.01 && hasFuel) {
        sim.fuel = Math.max(0, sim.fuel - ROT_FUEL_RATE * dt);
      }

      const ang = sim.angVel.length() * dt;
      if (ang > 1e-7) {
        DQ.setFromAxisAngle(T3.copy(sim.angVel).normalize(), ang);
        sim.quat.multiply(DQ).normalize();
      }

      // --- TRANSLATION (RCS & Boost) ---
      sim.boosting = ax.boost && hasFuel;
      const transPower = sim.boosting ? BOOST_ACCEL : TRANS_ACCEL;

      const cmdTrans = T1.set(ax.sway, ax.heave, ax.surge);
      if (cmdTrans.lengthSq() > 1.0) cmdTrans.normalize();

      cmdTrans.multiplyScalar(hasFuel ? transPower : 0);
      sim.thrustWorld.copy(cmdTrans).applyQuaternion(sim.quat);
      sim.vel.addScaledVector(sim.thrustWorld, dt);

      // Damp linear velocity slightly in orbit to simulate RCS cruise stability
      sim.vel.multiplyScalar(1 - Math.min(0.2, 0.018 * dt));

      // Advance Position
      sim.pos.addScaledVector(sim.vel, dt);

      // Consume Fuel
      if (cmdTrans.lengthSq() > 0.05 && hasFuel) {
        const rate = sim.boosting ? BOOST_FUEL_RATE : TRANS_FUEL_RATE;
        sim.fuel = Math.max(0, sim.fuel - rate * dt);
        audio.setHiss(sim.boosting ? 1.5 : 0.8);
      } else {
        audio.setHiss(0);
      }

      // Atmospheric Re-entry Corridor Detection
      sim.distToCorridor = sim.pos.distanceTo(REENTRY_CORRIDOR_POS);
      sim.inReentryCorridor = sim.distToCorridor <= REENTRY_CORRIDOR_RADIUS;
      sim.deorbitReady = sim.capturedDebrisId !== null && sim.inReentryCorridor;

      // Atmospheric roar when inside entry corridor
      if (sim.inReentryCorridor) {
        const proximity = Math.max(0, 1.0 - sim.distToCorridor / REENTRY_CORRIDOR_RADIUS);
        audio.setRoar(proximity * 0.7);
      } else {
        audio.setRoar(0);
      }

      // Soft Robotic Capture Proximity Check
      const target = sim.debris.find(
        (d) => !d.deorbited && !d.captured && d.id === sim.captureTargetId,
      );
      if (target) {
        const d = sim.pos.distanceTo(target.pos);
        const relVel = sim.vel.distanceTo(target.vel);
        sim.canCapture = d <= 18.0 && relVel <= 3.2;
      } else {
        sim.canCapture = false;
      }
    }

    // --- PROJECTIONS FOR SLEEK AEROSPACE HUD ---
    projectToScreen(cam, sim.mothercraftPos, sim.mothercraftScreen);
    projectToScreen(cam, REENTRY_CORRIDOR_POS, sim.corridorScreen);

    sim.debris.forEach((deb) => {
      projectToScreen(cam, deb.pos, deb.screenPt);
    });

    // --- DYNAMIC CAMERA MODES ---
    if (sim.view === 0) {
      // Cockpit / Boresight Optical Sensor View
      CAM_POS.set(0, 0.45, 1.8).applyQuaternion(sim.quat).add(sim.pos);
      CAM_TARGET.set(0, 0, 120).applyQuaternion(sim.quat).add(sim.pos);
      cam.position.copy(CAM_POS);
      cam.lookAt(CAM_TARGET);
      cam.fov = sim.boosting ? 75 : 60;
      cam.updateProjectionMatrix();
    } else if (sim.view === 1) {
      // Cinematic Third-Person Chase Cam
      const offset = T1.set(0, 3.8, -12).applyQuaternion(sim.quat);
      const targetPos = T2.copy(sim.pos).add(offset);
      chasePos.current.lerp(targetPos, 1 - Math.exp(-6.5 * dt));

      cam.position.copy(chasePos.current);
      const lookLead = T3.copy(sim.vel).multiplyScalar(0.4);
      cam.lookAt(T1.copy(sim.pos).add(lookLead));
      cam.fov = sim.boosting ? 72 : 55;
      cam.updateProjectionMatrix();
    } else {
      // Mothercraft Base Surveillance Cam
      CAM_POS.set(8, 14, -28).add(sim.mothercraftPos);
      cam.position.copy(CAM_POS);
      cam.lookAt(sim.pos);
      cam.fov = 50;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
