import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sim } from "./sim";
import { getGlow, getPlasmaFlame } from "./textures";

const COUNT = 160;

export function FlightEffects() {
  const glowTex = useMemo(() => getGlow(), []);
  const plasmaTex = useMemo(() => getPlasmaFlame(), []);

  // Boost speed lines
  const starGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 180;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 180;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 180;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  const starPoints = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (!starPoints.current) return;
    const posAttr = starGeo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const speed = sim.boosting ? 280 : sim.vel.length() * 12;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(sim.quat);

    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 0] -= forward.x * speed * delta;
      arr[i * 3 + 1] -= forward.y * speed * delta;
      arr[i * 3 + 2] -= forward.z * speed * delta;

      // Wrap around vehicle position
      const relX = arr[i * 3 + 0] - sim.pos.x;
      const relY = arr[i * 3 + 1] - sim.pos.y;
      const relZ = arr[i * 3 + 2] - sim.pos.z;

      if (Math.abs(relX) > 90) arr[i * 3 + 0] = sim.pos.x - Math.sign(relX) * 90;
      if (Math.abs(relY) > 90) arr[i * 3 + 1] = sim.pos.y - Math.sign(relY) * 90;
      if (Math.abs(relZ) > 90) arr[i * 3 + 2] = sim.pos.z - Math.sign(relZ) * 90;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group>
      {/* Dynamic Hyperspeed Motion Particles */}
      <points ref={starPoints} geometry={starGeo}>
        <pointsMaterial
          size={1.6}
          map={glowTex}
          transparent
          opacity={sim.boosting ? 0.85 : 0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          color={new THREE.Color(0.4, 0.8, 1.0)}
        />
      </points>

      {/* Atmospheric Entry Disintegration Particles for De-orbiting Targets */}
      {sim.debris
        .filter((d) => d.deorbited && d.burnProgress < 1.0)
        .map((deb) => (
          <mesh key={deb.id} position={deb.pos.toArray()}>
            <sphereGeometry args={[deb.radius * (1.5 + deb.burnProgress * 3), 12, 12]} />
            <meshBasicMaterial
              map={plasmaTex}
              transparent
              opacity={0.85 * (1.0 - deb.burnProgress)}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
    </group>
  );
}
