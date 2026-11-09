import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  NOSE_OFFSET,
  SUN_DIR,
  sim,
  type DebrisTarget,
  MOTHERCRAFT_DOCK_PORT,
} from "./sim";
import { getFoil, getSolar, getGlow, getPlasmaFlame } from "./textures";

const hdr = (r: number, g: number, b: number) =>
  new THREE.MeshBasicMaterial({
    color: new THREE.Color(r, g, b),
    toneMapped: false,
  });

export function useSpaceMaterials() {
  return useMemo(() => {
    const gold = getFoil("gold");
    const silver = getFoil("silver");
    const darkFoil = getFoil("dark");
    const solarDeep = getSolar("deep");

    return {
      gold: new THREE.MeshPhysicalMaterial({
        map: gold.map,
        bumpMap: gold.bump,
        bumpScale: 0.55,
        metalness: 0.86,
        roughness: 0.28,
        color: "#ffd982",
        clearcoat: 0.22,
        clearcoatRoughness: 0.25,
      }),
      silver: new THREE.MeshPhysicalMaterial({
        map: silver.map,
        bumpMap: silver.bump,
        bumpScale: 0.45,
        metalness: 0.88,
        roughness: 0.26,
        color: "#f0f4f8",
        clearcoat: 0.2,
      }),
      darkFoil: new THREE.MeshStandardMaterial({
        map: darkFoil.map,
        bumpMap: darkFoil.bump,
        bumpScale: 0.6,
        metalness: 0.65,
        roughness: 0.48,
        color: "#22252e",
      }),
      whiteChassis: new THREE.MeshStandardMaterial({
        color: "#e8edf2",
        metalness: 0.15,
        roughness: 0.38,
      }),
      titanium: new THREE.MeshStandardMaterial({
        color: "#b0b8c4",
        metalness: 0.78,
        roughness: 0.32,
      }),
      darkStructural: new THREE.MeshStandardMaterial({
        color: "#181b22",
        metalness: 0.6,
        roughness: 0.45,
      }),
      niobiumNozzle: new THREE.MeshStandardMaterial({
        color: "#4e4740",
        metalness: 0.8,
        roughness: 0.35,
      }),
      solarPanels: new THREE.MeshPhysicalMaterial({
        map: solarDeep,
        metalness: 0.5,
        roughness: 0.25,
        clearcoat: 0.45,
        clearcoatRoughness: 0.2,
      }),
      solarCyanPanels: new THREE.MeshPhysicalMaterial({
        map: solarDeep,
        metalness: 0.55,
        roughness: 0.26,
        clearcoat: 0.45,
      }),
      backsheet: new THREE.MeshStandardMaterial({
        color: "#2c3038",
        metalness: 0.2,
        roughness: 0.75,
      }),
      sensorLens: new THREE.MeshPhysicalMaterial({
        color: "#121b28",
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.85,
        ior: 1.55,
      }),
    };
  }, []);
}

export type SpaceMaterials = ReturnType<typeof useSpaceMaterials>;

/** The Reviver - Cosmoserve's Active Debris Removal Servicer */
export function Reviver() {
  const mats = useSpaceMaterials();
  const root = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Group>(null);
  const rightWing = useRef<THREE.Group>(null);
  const captureArms = useRef<(THREE.Group | null)[]>([]);
  const thrusterGlow = useRef<THREE.Mesh>(null);
  const thrusterCore = useRef<THREE.Mesh>(null);
  const rcsPort = useRef<THREE.Mesh>(null);
  const rcsStarboard = useRef<THREE.Mesh>(null);
  const beaconMat = useMemo(() => hdr(2.2, 2.2, 2.5), []);

  const _q = useMemo(() => new THREE.Quaternion(), []);
  const _v = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    if (!root.current) return;

    // Follow sim physics
    root.current.position.copy(sim.pos);
    root.current.quaternion.copy(sim.quat);

    // Orient solar arrays towards the Sun
    _v.copy(SUN_DIR).applyQuaternion(_q.copy(sim.quat).invert());
    const sunAngle = Math.atan2(_v.z, _v.y);
    const lerpRate = 1 - Math.exp(-2.0 * delta);

    if (leftWing.current) leftWing.current.rotation.x += (sunAngle - leftWing.current.rotation.x) * lerpRate;
    if (rightWing.current) rightWing.current.rotation.x += (sunAngle - rightWing.current.rotation.x) * lerpRate;

    // Animate Soft Robotic Capture Arms
    // In free flight: open slightly. When grappled: close around target.
    const grip = sim.capturedDebrisId ? 1.0 : sim.canCapture ? 0.45 : 0.0;
    captureArms.current.forEach((arm) => {
      if (arm) {
        const targetRot = 0.4 - grip * 0.75;
        arm.rotation.x += (targetRot - arm.rotation.x) * (1 - Math.exp(-5.5 * delta));
      }
    });

    // Main Engine Dual Plume (Cyan Envelope + White Core)
    const isThrusting = (sim.thrustAmount > 0.05 || sim.boosting) && sim.fuel > 0;
    if (thrusterGlow.current) {
      thrusterGlow.current.visible = isThrusting;
      if (isThrusting) {
        const scale = (sim.boosting ? 1.9 : 1.0) + Math.sin(clock.elapsedTime * 45) * 0.15;
        thrusterGlow.current.scale.set(scale, scale, scale * (sim.boosting ? 2.2 : 1.4));
      }
    }
    if (thrusterCore.current) {
      thrusterCore.current.visible = isThrusting;
      if (isThrusting) {
        const coreScale = (sim.boosting ? 1.5 : 0.75) + Math.sin(clock.elapsedTime * 60) * 0.1;
        thrusterCore.current.scale.set(coreScale, coreScale, coreScale * (sim.boosting ? 1.8 : 1.1));
      }
    }

    // RCS Attitude Thruster Puffs (Cold-Gas steering reaction control)
    if (rcsPort.current) {
      const active = sim.steerAmount > 0.1;
      rcsPort.current.visible = active;
      if (active) {
        const s = 0.6 + Math.sin(clock.elapsedTime * 50) * 0.2;
        rcsPort.current.scale.set(s, s, s);
      }
    }
    if (rcsStarboard.current) {
      const active = sim.steerAmount < -0.1;
      rcsStarboard.current.visible = active;
      if (active) {
        const s = 0.6 + Math.sin(clock.elapsedTime * 50) * 0.2;
        rcsStarboard.current.scale.set(s, s, s);
      }
    }

    // Strobe navigation light
    const blink = Math.sin(clock.elapsedTime * 8) > 0.8 ? 1 : 0.05;
    beaconMat.color.setRGB(0 * blink, 3 * blink, 5 * blink);
  });

  return (
    <group ref={root}>
      {/* Central Hexagonal Avionics Bus */}
      <mesh material={mats.gold} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 2.2, 6]} />
      </mesh>

      {/* Forward Aft Deck */}
      <mesh material={mats.titanium} position={[0, 0, 1.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.08, 1.08, 0.08, 6]} />
      </mesh>
      {/* Rear Engine Bulkhead */}
      <mesh material={mats.darkStructural} position={[0, 0, -1.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.08, 1.08, 0.08, 6]} />
      </mesh>

      {/* Cosmoserve Forward Optical Sensor & Lidar Pod */}
      <group position={[0, 0.65, 1.15]}>
        <mesh material={mats.whiteChassis}>
          <boxGeometry args={[0.42, 0.32, 0.35]} />
        </mesh>
        <mesh material={mats.sensorLens} position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
        </mesh>
      </group>

      {/* Main Docking / Grapple Collar Ring */}
      <mesh material={mats.silver} position={[0, 0, NOSE_OFFSET - 0.4]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.75, 0.08, 16, 32]} />
      </mesh>

      {/* Soft Robotic Capture System - 4 Compliant Articulated Arms */}
      {[0, 1, 2, 3].map((idx) => {
        const angle = (idx / 4) * Math.PI * 2;
        return (
          <group key={idx} rotation={[0, 0, angle]}>
            <group
              position={[0, 0.76, NOSE_OFFSET - 0.4]}
              ref={(el) => (captureArms.current[idx] = el)}
            >
              {/* Joint 1 - Base Pivot */}
              <mesh material={mats.darkStructural}>
                <boxGeometry args={[0.16, 0.14, 0.28]} />
              </mesh>
              {/* Joint 2 - Upper Robotic Finger Segment */}
              <mesh material={mats.titanium} position={[0, 0.06, 0.32]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[0.12, 0.1, 0.45]} />
              </mesh>
              {/* Joint 3 - Soft Rubber Compliant Gripper Pad */}
              <mesh material={mats.darkFoil} position={[0, -0.04, 0.58]} rotation={[-0.3, 0, 0]}>
                <boxGeometry args={[0.14, 0.08, 0.3]} />
              </mesh>
              {/* Micro Magnetic Contact Plate */}
              <mesh material={mats.gold} position={[0, -0.07, 0.68]}>
                <boxGeometry args={[0.1, 0.04, 0.12]} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Solar Arrays - Port & Starboard */}
      <group position={[-1.3, 0, 0]} ref={leftWing}>
        <mesh material={mats.titanium} position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        </mesh>
        <group position={[-1.7, 0, 0]}>
          <mesh material={mats.solarPanels} castShadow>
            <boxGeometry args={[2.2, 0.04, 1.2]} />
          </mesh>
        </group>
      </group>

      <group position={[1.3, 0, 0]} ref={rightWing}>
        <mesh material={mats.titanium} position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        </mesh>
        <group position={[1.7, 0, 0]}>
          <mesh material={mats.solarPanels} castShadow>
            <boxGeometry args={[2.2, 0.04, 1.2]} />
          </mesh>
        </group>
      </group>

      {/* High-efficiency Chemical / Ion Thruster Bell */}
      <mesh material={mats.niobiumNozzle} position={[0, 0, -1.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.42, 0.5, 16]} />
      </mesh>

      {/* Dynamic Thruster Exhaust Flame - Outer Plume */}
      <mesh
        ref={thrusterGlow}
        position={[0, 0, -2.1]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <coneGeometry args={[0.34, 1.6, 16]} />
        <meshBasicMaterial
          color={new THREE.Color(0.2, 0.65, 1.0)}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Dynamic Thruster Exhaust Flame - Inner White/Cyan Hot Core */}
      <mesh
        ref={thrusterCore}
        position={[0, 0, -1.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <coneGeometry args={[0.18, 1.0, 16]} />
        <meshBasicMaterial
          color={new THREE.Color(0.85, 0.95, 1.0)}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Port Attitude RCS Quad Puffs */}
      <mesh
        ref={rcsPort}
        position={[-1.25, 0, 0.6]}
        rotation={[0, 0, Math.PI / 2]}
        visible={false}
      >
        <coneGeometry args={[0.12, 0.45, 8]} />
        <meshBasicMaterial
          color={new THREE.Color(0.7, 0.88, 1.0)}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Starboard Attitude RCS Quad Puffs */}
      <mesh
        ref={rcsStarboard}
        position={[1.25, 0, 0.6]}
        rotation={[0, 0, -Math.PI / 2]}
        visible={false}
      >
        <coneGeometry args={[0.12, 0.45, 8]} />
        <meshBasicMaterial
          color={new THREE.Color(0.7, 0.88, 1.0)}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Navigation Beacon Light */}
      <mesh material={beaconMat} position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>
    </group>
  );
}

/** The Mothercraft - Cosmoserve's Orbital Operations Base & Refueling Hub */
export function Mothercraft() {
  const mats = useSpaceMaterials();
  const ringRef = useRef<THREE.Group>(null);
  const dockLightMat = useMemo(() => hdr(1.6, 1.5, 1.2), []);

  useFrame((_, delta) => {
    // Slowly rotate the habitat module centrifuge
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.12 * delta;
    }
  });

  return (
    <group position={sim.mothercraftPos.toArray()}>
      {/* Main Central Station Hull */}
      <mesh material={mats.whiteChassis} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.5, 4.5, 28, 24]} />
      </mesh>

      {/* Forward Logistics Module */}
      <mesh material={mats.titanium} position={[0, 0, 16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.2, 4.2, 5, 16]} />
      </mesh>

      {/* Docking Collar Bay (Where Reviver docks and refuels) */}
      <group position={MOTHERCRAFT_DOCK_PORT.toArray()}>
        <mesh material={mats.silver}>
          <torusGeometry args={[2.4, 0.28, 16, 32]} />
        </mesh>
        {/* Docking Corridor Beacon Lights */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} material={dockLightMat} position={[Math.cos(a) * 2.4, Math.sin(a) * 2.4, 0.4]}>
              <sphereGeometry args={[0.12, 8, 8]} />
            </mesh>
          );
        })}
      </group>

      {/* Rotating Centrifuge Habitat Ring */}
      <group position={[0, 0, 0]} ref={ringRef}>
        <mesh material={mats.silver}>
          <torusGeometry args={[11, 0.7, 16, 48]} />
        </mesh>
        {/* Radial support spokes */}
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} material={mats.darkStructural} position={[Math.cos(a) * 5.5, Math.sin(a) * 5.5, 0]} rotation={[0, 0, a + Math.PI / 2]}>
              <boxGeometry args={[0.3, 11, 0.3]} />
            </mesh>
          );
        })}
      </group>

      {/* High-Capacity Fuel Reserves (Propellant Depot Tanks) */}
      {[-2.8, 2.8].map((x, idx) => (
        <group key={idx} position={[x, 0, -6]}>
          <mesh material={mats.gold} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[1.3, 7, 8, 16]} />
          </mesh>
        </group>
      ))}

      {/* Massive Station Solar Arrays */}
      <group position={[-16, 0, -2]}>
        <mesh material={mats.solarCyanPanels} castShadow>
          <boxGeometry args={[18, 0.1, 4.2]} />
        </mesh>
      </group>
      <group position={[16, 0, -2]}>
        <mesh material={mats.solarCyanPanels} castShadow>
          <boxGeometry args={[18, 0.1, 4.2]} />
        </mesh>
      </group>

      {/* High-Gain Communications Dish */}
      <group position={[0, 5.8, 4]} rotation={[-0.4, 0, 0]}>
        <mesh material={mats.titanium}>
          <cylinderGeometry args={[0.08, 0.08, 1.8, 8]} />
        </mesh>
        <mesh material={mats.silver} position={[0, 0.9, 0]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[1.8, 24, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
        </mesh>
      </group>
    </group>
  );
}

/** Individual Space Debris / Target */
export function DebrisItem({ target }: { target: DebrisTarget }) {
  const mats = useSpaceMaterials();
  const root = useRef<THREE.Group>(null);
  const plasmaRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!root.current) return;

    if (target.captured) {
      // Attached rigidly to Reviver's bow
      const forwardOffset = new THREE.Vector3(0, 0, NOSE_OFFSET + target.radius * 0.9);
      forwardOffset.applyQuaternion(sim.quat);
      target.pos.copy(sim.pos).add(forwardOffset);
      target.quat.copy(sim.quat);
    } else if (target.deorbited) {
      // In atmospheric re-entry burn-up sequence
      target.burnProgress = Math.min(1.0, target.burnProgress + delta * 0.35);
      target.pos.addScaledVector(target.vel, delta);

      // Expand plasma flame and shrink debris core
      if (plasmaRef.current) {
        const plasmaScale = (1.2 + target.burnProgress * 2.5) * target.radius;
        plasmaRef.current.scale.set(plasmaScale, plasmaScale, plasmaScale * 2.2);
      }
      const debrisScale = Math.max(0.001, 1.0 - target.burnProgress);
      root.current.scale.set(debrisScale, debrisScale, debrisScale);

      if (target.burnProgress >= 1.0) {
        root.current.visible = false;
      }
    } else {
      // Natural tumbling orbit
      target.pos.addScaledVector(target.vel, delta);
      const ang = target.angVel.length() * delta;
      if (ang > 1e-6) {
        const axis = target.angVel.clone().normalize();
        const dq = new THREE.Quaternion().setFromAxisAngle(axis, ang);
        target.quat.multiply(dq);
      }
    }

    root.current.position.copy(target.pos);
    root.current.quaternion.copy(target.quat);
  });

  return (
    <group ref={root} visible={target.burnProgress < 1.0}>
      {/* 3D Model Variants based on Debris Type */}
      {target.type === "rocket_stage" && (
        <group>
          {/* Main Stage Body */}
          <mesh material={mats.darkStructural} castShadow>
            <cylinderGeometry args={[1.5, 1.5, 6.2, 16]} />
          </mesh>
          {/* Engine Skirt */}
          <mesh material={mats.niobiumNozzle} position={[0, -3.4, 0]}>
            <cylinderGeometry args={[0.8, 1.4, 1.0, 16]} />
          </mesh>
          {/* Corrugated Interstage Ring */}
          <mesh material={mats.titanium} position={[0, 3.1, 0]}>
            <torusGeometry args={[1.52, 0.08, 8, 24]} />
          </mesh>
        </group>
      )}

      {target.type === "defunct_sat" && (
        <group>
          {/* Sat Bus */}
          <mesh material={mats.gold} castShadow>
            <boxGeometry args={[1.8, 1.6, 2.2]} />
          </mesh>
          {/* Camera Aperture / Sensor */}
          <mesh material={mats.sensorLens} position={[0, 0, 1.15]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
          </mesh>
          {/* Broken Asymmetric Solar Wing */}
          <mesh material={mats.solarPanels} position={[2.1, 0.3, 0]} rotation={[0.4, 0.2, 0]}>
            <boxGeometry args={[2.4, 0.06, 1.1]} />
          </mesh>
        </group>
      )}

      {target.type === "solar_wing" && (
        <group>
          <mesh material={mats.solarCyanPanels} castShadow>
            <boxGeometry args={[4.2, 0.06, 1.4]} />
          </mesh>
          <mesh material={mats.titanium} position={[-2.2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
          </mesh>
        </group>
      )}

      {target.type === "shrapnel_cluster" && (
        <group>
          <mesh material={mats.silver} castShadow>
            <dodecahedronGeometry args={[1.6, 1]} />
          </mesh>
          <mesh material={mats.darkFoil} position={[0.4, -0.3, 0.5]}>
            <tetrahedronGeometry args={[1.1, 0]} />
          </mesh>
        </group>
      )}

      {target.type === "sensor_bus" && (
        <group>
          <mesh material={mats.darkFoil} castShadow>
            <cylinderGeometry args={[1.2, 1.2, 2.4, 12]} />
          </mesh>
          {/* Antennas */}
          {[-0.6, 0.6].map((x, i) => (
            <mesh key={i} material={mats.silver} position={[x, 1.4, 0]} rotation={[0, 0, x * 0.3]}>
              <cylinderGeometry args={[0.02, 0.02, 1.6, 6]} />
            </mesh>
          ))}
        </group>
      )}

      {/* Atmospheric Reentry Fireball Envelope (Shown when deorbiting) */}
      {target.deorbited && (
        <mesh ref={plasmaRef} position={[0, 0, 0]}>
          <sphereGeometry args={[1.8, 16, 16]} />
          <meshBasicMaterial
            color={new THREE.Color(4.0, 1.4, 0.2)}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

/** Render all space debris objects */
export function DebrisField() {
  return (
    <group>
      {sim.debris.map((target) => (
        <DebrisItem key={target.id} target={target} />
      ))}
    </group>
  );
}
