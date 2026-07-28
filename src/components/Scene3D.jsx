// The heavy renderer. `three` + `@react-three/fiber` + the GLTF/meshopt
// loaders live ONLY in this file's module graph, so it must never be
// imported eagerly — always via `React.lazy` (see ModelViewport.jsx). Do not
// add drei or any other r3f ecosystem package here without re-checking the
// gzip delta; the budget is "own lazy chunk", not "free".
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { NEON_HEX, IDLE_ROTATION_SECONDS } from "../lib/modelTheme";

const NEON = new THREE.Color(NEON_HEX);

function configureLoader(loader) {
  loader.setMeshoptDecoder(MeshoptDecoder);
}

// Recenters the model at the origin and frames the camera to its bounding
// sphere, so every model — regardless of its native scale/pivot from the
// source .obj — reads at a consistent size without per-model magic numbers.
function useAutoFrame(scene, onReady) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z, 0.001) * 0.5;

    scene.position.sub(center);

    const fovRad = (camera.fov * Math.PI) / 180;
    const distance = (radius / Math.sin(fovRad / 2)) * 1.5;
    camera.position.set(distance * 0.18, radius * 0.35, distance);
    camera.near = Math.max(distance / 100, 0.01);
    camera.far = distance * 12;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);

    // Imperative camera/position mutations bypass r3f's prop-diffing, so in
    // `frameloop="demand"` (off-screen/reduced-motion) they'd otherwise never
    // reach the screen — force the one frame that shows the framed model.
    invalidate();
    onReady?.();
    // Scene/camera identity is stable for the lifetime of this mount; the
    // source model never changes without a remount (keyed by modelUrl).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function Model({ url, accentMaterials, spin, rotationSeconds, onReady }) {
  const gltf = useLoader(GLTFLoader, url, configureLoader);
  const groupRef = useRef(null);

  // One clone per load: materials are mutated in place below (emissive
  // boost), and useLoader's cache is keyed by URL — mutating the cached
  // original would corrupt any second consumer of the same model.
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      child.castShadow = false;
      child.receiveShadow = false;
      const mat = child.material;
      mat.toneMapped = false;
      if (accentMaterials.includes(mat.name)) {
        mat.emissive = NEON.clone();
        mat.emissiveIntensity = 0.85;
      }
      if (typeof mat.roughness === "number") {
        mat.roughness = Math.min(mat.roughness, 0.55);
      }
    });
    return cloned;
  }, [gltf, accentMaterials]);

  useAutoFrame(scene, onReady);

  // In frameloop="demand" this callback simply never fires (no render step
  // to attach to), which is exactly the pause behaviour we want off-screen,
  // off-tab, and under reduced motion — no separate cancel logic needed.
  useFrame((_, delta) => {
    if (!spin || !groupRef.current) return;
    groupRef.current.rotation.y += (delta * Math.PI * 2) / rotationSeconds;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export default function Scene3D({
  modelUrl,
  accentMaterials = [],
  active = true,
  reducedMotion = false,
  rotationSeconds = IDLE_ROTATION_SECONDS,
  onReady,
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ fov: 32, position: [0, 0.6, 3.4] }}
      frameloop={active && !reducedMotion ? "always" : "demand"}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* Matte void base lit by a cool key + a neon-tinted rim from behind —
          the cheap stand-in for a real fresnel pass (see report: a true
          view-dependent fresnel would need a custom shader, which costs a
          compile step we're not spending on a decorative set piece). */}
      <ambientLight intensity={0.55} color="#a9c9bd" />
      <directionalLight position={[3, 4, 2]} intensity={1.15} color="#eafff6" />
      <directionalLight position={[-2.5, -1.5, -3]} intensity={0.6} color={NEON_HEX} />
      <Suspense fallback={null}>
        <Model
          url={modelUrl}
          accentMaterials={accentMaterials}
          spin={!reducedMotion}
          rotationSeconds={rotationSeconds}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  );
}
