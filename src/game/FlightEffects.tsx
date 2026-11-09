import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sim } from "./sim";
import { getGlow, getPlasmaFlame } from "./textures";

const STREAK_COUNT = 180;
const DUST_COUNT = 120;

export function FlightEffects() {
  const glowTex = useMemo(() => getGlow(), []);
  const plasmaTex = useMemo(() => getPlasmaFlame(), []);

  // 1. Dynamic Velocity Streaks (Line Segments that elongate along velocity vector)
  const streakGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(STREAK_COUNT * 6); // 2 vertices per line
    const colors = new Float32Array(STREAK_COUNT * 6);

    for (let i = 0; i < STREAK_COUNT; i++) {
      const x = (Math.random() - 0.5) * 160;
      const y = (Math.random() - 0.5) * 160;
      const z = (Math.random() - 0.5) * 160;

      // Head
      positions[i * 6 + 0] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;
      // Tail (initially at same spot)
      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z - 0.5;

      // Color (White/Cyan soft gradient)
      colors[i * 6 + 0] = 0.8;
      colors[i * 6 + 1] = 0.9;
      colors[i * 6 + 2] = 1.0;
      colors[i * 6 + 3] = 0.3;
      colors[i * 6 + 4] = 0.5;
      colors[i * 6 + 5] = 0.8;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  // 2. Ambient Space Dust Bokeh
  const dustGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  const streakLines = useRef<THREE.LineSegments>(null);
  const dustPoints = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (!streakLines.current) return;

    const posAttr = streakGeo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    const speed = sim.vel.length();
    const isFast = speed > 2.0 || sim.boosting;
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(sim.quat);
    const trailLen = Math.min(18.0, Math.max(0.6, speed * (sim.boosting ? 0.35 : 0.18)));

    for (let i = 0; i < STREAK_COUNT; i++) {
      const idx = i * 6;
      // Move head against vehicle flight direction
      arr[idx + 0] -= forward.x * (speed + (sim.boosting ? 35 : 10)) * delta;
      arr[idx + 1] -= forward.y * (speed + (sim.boosting ? 35 : 10)) * delta;
      arr[idx + 2] -= forward.z * (speed + (sim.boosting ? 35 : 10)) * delta;

      // Wrap around vehicle position
      const relX = arr[idx + 0] - sim.pos.x;
      const relY = arr[idx + 1] - sim.pos.y;
      const relZ = arr[idx + 2] - sim.pos.z;

      if (Math.abs(relX) > 80) arr[idx + 0] = sim.pos.x - Math.sign(relX) * 80;
      if (Math.abs(relY) > 80) arr[idx + 1] = sim.pos.y - Math.sign(relY) * 80;
      if (Math.abs(relZ) > 80) arr[idx + 2] = sim.pos.z - Math.sign(relZ) * 80;

      // Tail follows head stretched along velocity vector
      arr[idx + 3] = arr[idx + 0] - forward.x * trailLen;
      arr[idx + 4] = arr[idx + 1] - forward.y * trailLen;
      arr[idx + 5] = arr[idx + 2] - forward.z * trailLen;
    }
    posAttr.needsUpdate = true;

    // Dust particles drift slowly
    if (dustPoints.current) {
      const dAttr = dustGeo.attributes.position as THREE.BufferAttribute;
      const dArr = dAttr.array as Float32Array;
      for (let i = 0; i < DUST_COUNT; i++) {
        const idx = i * 3;
        dArr[idx + 0] -= sim.vel.x * delta * 0.4;
        dArr[idx + 1] -= sim.vel.y * delta * 0.4;
        dArr[idx + 2] -= sim.vel.z * delta * 0.4;

        const dx = dArr[idx + 0] - sim.pos.x;
        const dy = dArr[idx + 1] - sim.pos.y;
        const dz = dArr[idx + 2] - sim.pos.z;

        if (Math.abs(dx) > 40) dArr[idx + 0] = sim.pos.x - Math.sign(dx) * 40;
        if (Math.abs(dy) > 40) dArr[idx + 1] = sim.pos.y - Math.sign(dy) * 40;
        if (Math.abs(dz) > 40) dArr[idx + 2] = sim.pos.z - Math.sign(dz) * 40;
      }
      dAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 3D Velocity Motion Streaks */}
      <lineSegments ref={streakLines} geometry={streakGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={sim.boosting ? 0.65 : sim.vel.length() > 5 ? 0.35 : 0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Micro-Meteoroid Space Dust */}
      <points ref={dustPoints} geometry={dustGeo}>
        <pointsMaterial
          size={0.65}
          map={glowTex}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          color={new THREE.Color(0.7, 0.85, 1.0)}
        />
      </points>

      {/* Atmospheric Entry Plasma Glow & Embers for De-orbiting Targets */}
      {sim.debris
        .filter((d) => d.deorbited && d.burnProgress < 1.0)
        .map((deb) => (
          <group key={deb.id} position={deb.pos.toArray()}>
            <mesh>
              <sphereGeometry args={[deb.radius * (1.6 + deb.burnProgress * 3.5), 16, 16]} />
              <meshBasicMaterial
                map={plasmaTex}
                transparent
                opacity={0.9 * (1.0 - deb.burnProgress)}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            {/* Soft Re-entry Fire Halo */}
            <mesh>
              <sphereGeometry args={[deb.radius * (2.8 + deb.burnProgress * 4.5), 12, 12]} />
              <meshBasicMaterial
                color="#f97316"
                transparent
                opacity={0.35 * (1.0 - deb.burnProgress)}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
    </group>
  );
}
