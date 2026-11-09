import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  EARTH_CENTER,
  EARTH_RADIUS,
  REENTRY_CORRIDOR_POS,
  REENTRY_CORRIDOR_RADIUS,
  SUN_DIR,
  sim,
} from "./sim";
import earthAtmos from "@/assets/earth_atmos_2048.jpg";
import earthLights from "@/assets/earth_lights_2048.png";
import earthClouds from "@/assets/earth_clouds_1024.png";
import earthSpecular from "@/assets/earth_specular_2048.jpg";

const earthVert = /* glsl */ `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vW;

void main() {
  vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const earthFrag = /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uClouds;
uniform sampler2D uSpec;
uniform vec3 uSun;
uniform float uCloudOff;

varying vec2 vUv;
varying vec3 vN;
varying vec3 vW;

void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float ndl = dot(N, uSun);

  vec3 day = texture2D(uDay, vUv).rgb;
  vec3 night = texture2D(uNight, vUv).rgb;
  vec4 ct = texture2D(uClouds, vUv + vec2(uCloudOff, 0.0));
  float cl = clamp(ct.r * ct.a, 0.0, 1.0);
  float spec = texture2D(uSpec, vUv).r;

  float dl = clamp(ndl * 1.15 + 0.04, 0.0, 1.0);
  vec3 col = mix(day * 1.25, vec3(0.92), cl * 0.8) * dl * 1.7;

  // Specular sun reflection on water
  vec3 H = normalize(uSun + V);
  float sp = pow(max(dot(N, H), 0.0), 70.0) * spec * (1.0 - cl);
  col += vec3(1.0, 0.92, 0.8) * sp * dl * 6.0;

  // City lights on night side
  float nightMix = 1.0 - smoothstep(-0.18, 0.04, ndl);
  col += night * vec3(1.0, 0.75, 0.45) * nightMix * (1.0 - cl * 0.85) * 2.4;

  // Rayleigh atmospheric scattering rim
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  float tw = smoothstep(-0.25, 0.45, ndl);
  vec3 atm = mix(vec3(1.0, 0.45, 0.2), vec3(0.28, 0.62, 1.0), smoothstep(0.0, 0.4, ndl)) * fres * tw * 3.2;

  col = col * (1.0 - fres * 0.5) + atm + vec3(0.04, 0.09, 0.2) * dl * 0.6;
  gl_FragColor = vec4(col, 1.0);
}
`;

const atmoVert = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const atmoFrag = /* glsl */ `
uniform vec3 uC;
uniform float uR;
uniform float uRa;
uniform vec3 uSun;

varying vec3 vW;

void main() {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vW - ro);
  float t = dot(uC - ro, rd);
  vec3 p = ro + rd * t;
  float b = length(p - uC);
  float h = clamp((b - uR) / (uRa - uR), 0.0, 1.0);
  float g = pow(1.0 - h, 3.0);
  vec3 n = normalize(p - uC);
  float s = dot(n, uSun);
  float lit = smoothstep(-0.3, 0.25, s);
  vec3 c = mix(vec3(1.0, 0.38, 0.12), vec3(0.25, 0.6, 1.0), smoothstep(-0.05, 0.35, s));
  gl_FragColor = vec4(c * g * lit * 4.2, 1.0);
}
`;

export function Earth() {
  const [day, night, clouds, spec] = useTexture([
    earthAtmos,
    earthLights,
    earthClouds,
    earthSpecular,
  ]) as [THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture];

  const meshRef = useRef<THREE.Mesh>(null);
  const cloudOffset = useRef(0);

  const mat = useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace;
    night.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = night.anisotropy = 8;
    clouds.wrapS = THREE.RepeatWrapping;

    return new THREE.ShaderMaterial({
      uniforms: {
        uDay: { value: day },
        uNight: { value: night },
        uClouds: { value: clouds },
        uSpec: { value: spec },
        uSun: { value: SUN_DIR },
        uCloudOff: { value: 0 },
      },
      vertexShader: earthVert,
      fragmentShader: earthFrag,
    });
  }, [day, night, clouds, spec]);

  const atmoMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uC: { value: EARTH_CENTER },
          uR: { value: EARTH_RADIUS },
          uRa: { value: EARTH_RADIUS * 1.022 },
          uSun: { value: SUN_DIR },
        },
        vertexShader: atmoVert,
        fragmentShader: atmoFrag,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame((_, dt) => {
    cloudOffset.current += dt * 0.0003;
    mat.uniforms.uCloudOff.value = cloudOffset.current;
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * 0.0004;
    }
  });

  return (
    <group position={EARTH_CENTER.toArray()}>
      {/* Earth Surface Sphere */}
      <mesh ref={meshRef} material={mat} rotation={[0.4, 0, 0]}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 48]} />
      </mesh>
      {/* Atmospheric Rayleigh Scattering Shell */}
      <mesh material={atmoMat}>
        <sphereGeometry args={[EARTH_RADIUS * 1.022, 48, 36]} />
      </mesh>
    </group>
  );
}

/** Holographic Atmospheric Re-entry Corridor Gate */
export function ReentryCorridorMarker() {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ringRef1.current) ringRef1.current.rotation.z = t * 0.2;
    if (ringRef2.current) ringRef2.current.rotation.z = -t * 0.3;

    if (beamRef.current) {
      const active = sim.capturedDebrisId !== null;
      const inZone = sim.inReentryCorridor;
      // Pulse faster when player is carrying debris
      const pulse = Math.sin(t * (inZone ? 8 : 2)) * 0.2 + 0.8;
      beamRef.current.scale.set(pulse, 1, pulse);
    }
  });

  const inZone = sim.inReentryCorridor;
  const color = inZone ? new THREE.Color(0.2, 1.0, 0.4) : new THREE.Color(1.0, 0.45, 0.1);

  return (
    <group position={REENTRY_CORRIDOR_POS.toArray()} rotation={[Math.PI / 2, 0, 0]}>
      {/* Outer Entry Funnel Ring */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[REENTRY_CORRIDOR_RADIUS * 0.8, 4.0, 16, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={inZone ? 0.85 : 0.45}
          wireframe
        />
      </mesh>

      {/* Inner Concentric Target Ring */}
      <mesh ref={ringRef2} position={[0, 0, -30]}>
        <torusGeometry args={[REENTRY_CORRIDOR_RADIUS * 0.5, 3.0, 16, 36]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={inZone ? 0.9 : 0.4}
        />
      </mesh>

      {/* Downward Aerothermal Entry Cone */}
      <mesh ref={beamRef} position={[0, 0, -120]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[REENTRY_CORRIDOR_RADIUS * 0.8, 240, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={inZone ? 0.35 : 0.12}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
