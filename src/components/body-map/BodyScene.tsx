"use client";

import React, { Suspense, useRef, useMemo, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

// ── Types ─────────────────────────────────────────────────────────────────────
interface WoundRecord {
  id: number;
  wound_type: string;
  grade: string;
  body_side: "front" | "back" | "left" | "right";
  location_x: number;
  location_y: number;
  is_active: boolean;
}

export interface BodySceneProps {
  side: "front" | "back" | "left" | "right";
  wounds: WoundRecord[];
  selectedWoundId: number | null;
  canPlace: boolean;
  gender?: "male" | "female";
  onBodyClick: (x: number, y: number) => void;
  onWoundClick: (w: WoundRecord) => void;
}

// ── Coordinate extent ─────────────────────────────────────────────────────────
interface Extent {
  yTop: number;
  ySpan: number;
  xHalf: number;
  zHalf: number;
}

const Y_TOP  =  0.92;
const Y_SPAN =  1.91;
const X_HALF =  0.46;
const Z_HALF =  0.12;
const MK_OFF =  0.034;

const DEFAULT_EXTENT: Extent = { yTop: Y_TOP, ySpan: Y_SPAN, xHalf: X_HALF, zHalf: Z_HALF };

const CAM_POS: Record<string, [number, number, number]> = {
  front: [ 0, 0, 2.8],
  back:  [ 0, 0,-2.8],
  left:  [-2.8, 0, 0],
  right: [ 2.8, 0, 0],
};

// ── Coordinate helpers ────────────────────────────────────────────────────────
function hitTo2D(p: THREE.Vector3, side: string, ext: Extent) {
  const y = Math.max(0, Math.min(100, +((ext.yTop - p.y) / ext.ySpan * 100).toFixed(1)));
  let x: number;
  if (side === "back")       x = (ext.xHalf - p.x) / (2 * ext.xHalf) * 100;
  else if (side === "left")  x = (p.z + ext.zHalf) / (2 * ext.zHalf) * 100;
  else if (side === "right") x = (ext.zHalf - p.z) / (2 * ext.zHalf) * 100;
  else                       x = (p.x + ext.xHalf) / (2 * ext.xHalf) * 100;
  return { x: Math.max(0, Math.min(100, +x.toFixed(1))), y };
}

function pctTo3D(lx: number, ly: number, side: string, ext: Extent): [number, number, number] {
  const wy = ext.yTop - (ly / 100) * ext.ySpan;
  const wx = (lx / 100 - 0.5) * 2 * ext.xHalf;
  if (side === "back")  return [-wx, wy, -(ext.zHalf + MK_OFF)];
  if (side === "left")  return [-(ext.xHalf + MK_OFF), wy, -ext.zHalf + (lx / 100) * 2 * ext.zHalf];
  if (side === "right") return [ ext.xHalf + MK_OFF,   wy,  ext.zHalf - (lx / 100) * 2 * ext.zHalf];
  return [wx, wy, ext.zHalf + MK_OFF];
}

function gradeColor(grade: string): string {
  if (grade === "1") return "#34d399";
  if (grade === "2") return "#fbbf24";
  if (grade === "3") return "#fb923c";
  if (grade === "4" || grade === "unstageable") return "#f87171";
  return "#a78bfa";
}

// ── Suspense-compatible GLTF loader (no drei dependency) ──────────────────────
const _promises: Record<string, Promise<GLTF>> = {};
const _results:  Record<string, GLTF>          = {};
const _errors:   Record<string, unknown>       = {};

function _load(url: string): Promise<GLTF> {
  if (!_promises[url]) {
    _promises[url] = new Promise<GLTF>((resolve, reject) =>
      new GLTFLoader().load(url, resolve, undefined, reject)
    );
    _promises[url].then(
      (g) => { _results[url] = g; },
      (e) => { _errors[url]  = e; }
    );
  }
  return _promises[url];
}

function useGLTFModel(url: string): GLTF {
  if (_errors[url])  throw _errors[url];
  if (_results[url]) return _results[url];
  throw _load(url); // Suspense: throw the in-flight promise
}

function preloadGLTF(url: string) { _load(url); }

// ── Model paths ───────────────────────────────────────────────────────────────
const MODEL_PATHS = {
  female: "/models/female/Superhero_Female_FullBody.gltf",
  male:   "/models/male/Superhero_Male_FullBody.gltf",
};

function getModelPath(gender?: "male" | "female") {
  return gender === "female" ? MODEL_PATHS.female : MODEL_PATHS.male;
}

if (typeof window !== "undefined") {
  preloadGLTF(MODEL_PATHS.female);
  preloadGLTF(MODEL_PATHS.male);
}

// ── Camera rig ────────────────────────────────────────────────────────────────
function CameraRig({ side }: { side: string }) {
  const { camera } = useThree();
  const target   = useRef(new THREE.Vector3(...CAM_POS[side]));
  const prevSide = useRef(side);
  const lookAt   = useRef(new THREE.Vector3(0, 0.05, 0));

  useFrame(() => {
    target.current.set(...(CAM_POS[side] as [number, number, number]));
    if (prevSide.current !== side) {
      prevSide.current = side;
      if (camera.position.distanceTo(target.current) > 5)
        camera.position.copy(target.current);
    }
    camera.position.lerp(target.current, 0.07);
    camera.lookAt(lookAt.current);
  });

  return null;
}

// ── Room environment (offline IBL, no CDN) ────────────────────────────────────
function RoomEnv() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    import("three/examples/jsm/environments/RoomEnvironment.js").then(({ RoomEnvironment }) => {
      scene.environment = pmrem.fromScene(new RoomEnvironment()).texture;
      pmrem.dispose();
    });
    return () => { scene.environment = null; };
  }, [gl, scene]);

  return null;
}

// ── GLB model body ────────────────────────────────────────────────────────────
function GLBBody({ side, gender, onBodyClick, onExtentReady }: {
  side: string;
  gender?: "male" | "female";
  onBodyClick: (x: number, y: number) => void;
  onExtentReady: (ext: Extent) => void;
}) {
  const gltf = useGLTFModel(getModelPath(gender));

  const { group, ext } = useMemo(() => {
    const group = gltf.scene.clone(true);

    const box  = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    group.scale.setScalar(Y_SPAN / size.y);

    box.setFromObject(group);
    const c = box.getCenter(new THREE.Vector3());
    group.position.set(-c.x, Y_TOP - box.max.y, -c.z);

    box.setFromObject(group);
    const fs = box.getSize(new THREE.Vector3());
    const ext: Extent = {
      yTop:  box.max.y,
      ySpan: fs.y,
      xHalf: Math.max(Math.abs(box.min.x), Math.abs(box.max.x)),
      zHalf: Math.max(Math.abs(box.min.z), Math.abs(box.max.z)),
    };

    group.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      node.castShadow    = true;
      node.receiveShadow = true;
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((m) => {
        if (!(m instanceof THREE.MeshStandardMaterial)) return;
        m.roughness       = Math.max(m.roughness, 0.62);
        m.metalness       = 0;
        m.envMapIntensity = 0.85;
        m.needsUpdate     = true;
      });
    });

    return { group, ext };
  }, [gltf]);

  useEffect(() => { onExtentReady(ext); }, [ext, onExtentReady]);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    const { x, y } = hitTo2D(e.point as THREE.Vector3, side, ext);
    onBodyClick(x, y);
  }, [side, ext, onBodyClick]);

  return <primitive object={group} onClick={handleClick} dispose={null} />;
}

// ── Procedural body (fallback while loading / if file missing) ────────────────
const TORSO_PTS: [number, number][] = [
  [0.020, -0.345], [0.065, -0.325], [0.138, -0.278],
  [0.162, -0.202], [0.155, -0.118], [0.112,  0.035],
  [0.118,  0.108], [0.155,  0.198], [0.178,  0.318],
  [0.188,  0.402], [0.175,  0.470], [0.148,  0.532],
  [0.040,  0.642],
];

function ProceduralBody({ material, side, onBodyClick }: {
  material: THREE.MeshStandardMaterial;
  side: string;
  onBodyClick: (x: number, y: number) => void;
}) {
  const headGeo  = useMemo(() => new THREE.SphereGeometry(0.112, 28, 20), []);
  const neckGeo  = useMemo(() => new THREE.CylinderGeometry(0.038, 0.048, 0.085, 12), []);
  const torsoGeo = useMemo(() => {
    const pts = TORSO_PTS.map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 32);
  }, []);
  const uArmGeo  = useMemo(() => new THREE.CapsuleGeometry(0.048, 0.210, 6, 14), []);
  const fArmGeo  = useMemo(() => new THREE.CapsuleGeometry(0.035, 0.200, 6, 12), []);
  const handGeo  = useMemo(() => new THREE.SphereGeometry(0.045, 14, 10), []);
  const uLegGeo  = useMemo(() => new THREE.CapsuleGeometry(0.072, 0.265, 6, 16), []);
  const lLegGeo  = useMemo(() => new THREE.CapsuleGeometry(0.050, 0.275, 6, 14), []);
  const footGeo  = useMemo(() => new THREE.BoxGeometry(0.092, 0.050, 0.172), []);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    const { x, y } = hitTo2D(e.point as THREE.Vector3, side, DEFAULT_EXTENT);
    onBodyClick(x, y);
  }, [side, onBodyClick]);

  const mp = { material, castShadow: true, receiveShadow: true, onClick: handleClick };

  return (
    <group>
      <mesh {...mp} geometry={headGeo}  position={[0, 0.798, 0]} scale={[1, 1.10, 0.88]} />
      <mesh {...mp} geometry={neckGeo}  position={[0, 0.672, 0]} />
      <mesh {...mp} geometry={torsoGeo} scale={[1, 1, 0.60]} />
      <mesh {...mp} geometry={uArmGeo}  position={[-0.265, 0.305, 0]} rotation={[0, 0,  0.524]} />
      <mesh {...mp} geometry={fArmGeo}  position={[-0.370, 0.055, 0]} rotation={[0, 0,  0.262]} />
      <mesh {...mp} geometry={handGeo}  position={[-0.408,-0.095, 0]} scale={[1, 0.80, 0.65]} />
      <mesh {...mp} geometry={uArmGeo}  position={[ 0.265, 0.305, 0]} rotation={[0, 0, -0.524]} />
      <mesh {...mp} geometry={fArmGeo}  position={[ 0.370, 0.055, 0]} rotation={[0, 0, -0.262]} />
      <mesh {...mp} geometry={handGeo}  position={[ 0.408,-0.095, 0]} scale={[1, 0.80, 0.65]} />
      <mesh {...mp} geometry={uLegGeo}  position={[-0.092,-0.490, 0]} />
      <mesh {...mp} geometry={lLegGeo}  position={[-0.086,-0.798, 0]} />
      <mesh {...mp} geometry={footGeo}  position={[-0.086,-0.962, 0.040]} />
      <mesh {...mp} geometry={uLegGeo}  position={[ 0.092,-0.490, 0]} />
      <mesh {...mp} geometry={lLegGeo}  position={[ 0.086,-0.798, 0]} />
      <mesh {...mp} geometry={footGeo}  position={[ 0.086,-0.962, 0.040]} />
    </group>
  );
}

// ── Ground shadow (replaces ContactShadows from drei) ─────────────────────────
function GroundShadow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.01, 0]} receiveShadow>
      <planeGeometry args={[5, 5]} />
      <shadowMaterial transparent opacity={0.45} />
    </mesh>
  );
}

// ── Wound marker ──────────────────────────────────────────────────────────────
function WoundMarker({ wound, isSelected, onClick, ext }: {
  wound: WoundRecord;
  isSelected: boolean;
  onClick: (e: any) => void;
  ext: Extent;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = pctTo3D(wound.location_x, wound.location_y, wound.body_side, ext);
  const hex = gradeColor(wound.grade);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.scale.setScalar(
      isSelected ? 1 + 0.20 * Math.sin(clock.getElapsedTime() * 3.0) : 1
    );
  });

  return (
    <group position={pos} onClick={onClick}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.028, 14, 10]} />
        <meshStandardMaterial
          color={hex} roughness={0.35} metalness={0.12}
          emissive={hex} emissiveIntensity={isSelected ? 0.70 : 0.25}
          transparent opacity={wound.is_active ? 0.94 : 0.40}
        />
      </mesh>
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.052, 14, 10]} />
          <meshStandardMaterial color={hex} transparent opacity={0.16} roughness={1} />
        </mesh>
      )}
    </group>
  );
}

// ── Error boundary — catches GLTF load failures ───────────────────────────────
class ModelBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { err: boolean }
> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

// ── Scene contents ────────────────────────────────────────────────────────────
function SceneContents({ side, wounds, selectedWoundId, canPlace, gender, onBodyClick, onWoundClick }: BodySceneProps) {
  const [ext, setExt] = useState<Extent>(DEFAULT_EXTENT);

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#c8956c"),
    roughness: 0.78,
    metalness: 0.02,
    envMapIntensity: 0.85,
  }), []);

  const handleBodyClick = useCallback((x: number, y: number) => {
    if (canPlace) onBodyClick(x, y);
  }, [canPlace, onBodyClick]);

  const onExtentReady = useCallback((e: Extent) => setExt(e), []);

  const fallback = (
    <ProceduralBody material={skinMat} side={side} onBodyClick={handleBodyClick} />
  );

  return (
    <>
      <CameraRig side={side} />
      <RoomEnv />

      <ambientLight intensity={0.18} />
      <hemisphereLight args={["#ffe8d0", "#2a1408", 0.55]} />
      <directionalLight
        position={[2.5, 5, 4]} intensity={1.75} color="#fff6ec" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-near={0.5} shadow-camera-far={18}
        shadow-camera-left={-2.5} shadow-camera-right={2.5}
        shadow-camera-top={2.5}   shadow-camera-bottom={-2.5}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-3, 3, -4]} intensity={0.85} color="#6080b0" />
      <pointLight position={[0.5, -0.5, 3]} intensity={0.38} color="#ffd0a0" />

      <ModelBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <GLBBody key={gender} side={side} gender={gender} onBodyClick={handleBodyClick} onExtentReady={onExtentReady} />
        </Suspense>
      </ModelBoundary>

      <GroundShadow />

      {wounds.map(w => (
        <WoundMarker
          key={w.id} wound={w} isSelected={selectedWoundId === w.id} ext={ext}
          onClick={(e: any) => { e.stopPropagation(); onWoundClick(w); }}
        />
      ))}
    </>
  );
}

// ── Default export ────────────────────────────────────────────────────────────
export default function BodyScene(props: BodySceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.4], fov: 44, near: 0.1, far: 50 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      shadows="soft"
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#080e1c"]} />
      <SceneContents {...props} />
    </Canvas>
  );
}
