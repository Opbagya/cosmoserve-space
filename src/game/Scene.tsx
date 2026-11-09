import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { SUN_DIR } from "./sim";
import { Earth, ReentryCorridorMarker } from "./Earth";
import { DebrisField, Mothercraft, Reviver } from "./Models";
import { FlightEffects } from "./FlightEffects";
import { SimLoop } from "./SimLoop";

export function SpaceScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 4, -14], fov: 60, near: 0.2, far: 50000 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          powerPreference: "high-performance",
        }}
        shadows
      >
        {/* Deep Cosmic Starfield */}
        <Stars
          radius={1200}
          depth={80}
          count={7000}
          factor={4}
          saturation={0.4}
          fade
          speed={0.5}
        />

        {/* Directional Sun Light (High-Contrast Hard Space Illumination) */}
        <directionalLight
          position={[SUN_DIR.x * 200, SUN_DIR.y * 200, SUN_DIR.z * 200]}
          intensity={3.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={10}
          shadow-camera-far={600}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
        />

        {/* Subtle Cosmic Ambient Rim Fill */}
        <ambientLight intensity={0.16} color="#455577" />

        {/* Earth & Atmospheric Scatter Shell */}
        <Earth />

        {/* Holographic Atmospheric Reentry Disposal Gate */}
        <ReentryCorridorMarker />

        {/* Cosmoserve Mothercraft Base */}
        <Mothercraft />

        {/* Reviver Servicer Module */}
        <Reviver />

        {/* Active Space Debris Targets */}
        <DebrisField />

        {/* Thruster Plumes, Reentry Plasma, and Particles */}
        <FlightEffects />

        {/* High-Precision Physics & Camera Loop */}
        <SimLoop />
      </Canvas>
    </div>
  );
}
