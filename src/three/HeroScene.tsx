import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Procedural label texture for the fictional strip. No image files. */
function useLabelTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 452;
    const g = c.getContext('2d')!;
    const grd = g.createLinearGradient(0, 0, 1024, 452);
    grd.addColorStop(0, '#f2f5f6'); grd.addColorStop(0.5, '#cfd6da'); grd.addColorStop(0.55, '#eef2f3'); grd.addColorStop(1, '#bfc7cb');
    g.fillStyle = grd; g.fillRect(0, 0, 1024, 452);
    g.fillStyle = '#0f7b6c'; g.fillRect(0, 0, 1024, 64);
    g.fillStyle = '#fff'; g.font = '700 30px sans-serif'; g.fillText('FICTIONAL SAMPLE · DEMO ONLY', 36, 44);
    g.fillStyle = '#0b3d36'; g.font = '800 84px sans-serif'; g.fillText('ZENTROVA', 36, 170);
    g.fillText('500', 36, 255);
    g.fillStyle = '#222'; g.font = '600 34px sans-serif'; g.fillText('Zentrofen 500 mg', 36, 318);
    g.fillStyle = '#8a1020'; g.font = '700 26px sans-serif'; g.fillText('Keep out of reach of children', 36, 372);
    g.strokeStyle = '#d6283a'; g.lineWidth = 6; g.save(); g.translate(250, 420); g.rotate(-0.06);
    g.strokeRect(-120, -32, 240, 50); g.fillStyle = '#d6283a'; g.font = '800 34px sans-serif'; g.fillText('DEMO ONLY', -100, 6); g.restore();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);
}

type Tilt = { x: number; y: number; active: boolean };

function Strip({ tilt, scrollRef }: { tilt: React.RefObject<Tilt>; scrollRef: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const { viewport, pointer } = useThree();
  const label = useLabelTexture();
  const pos = useRef(new THREE.Vector2(0.3, -0.8));
  const vel = useRef(new THREE.Vector2(0, 0));
  const squash = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0, t: -10 });

  const base = useMemo(() => new RoundedBoxGeometry(3.4, 1.5, 0.06, 4, 0.12), []);
  const dome = useMemo(() => new THREE.SphereGeometry(0.26, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), []);
  const pill = useMemo(() => new THREE.CapsuleGeometry(0.13, 0.16, 6, 12), []);
  const blisters = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) out.push([0.45 + i * 0.52, 0.32 - j * 0.64]);
    return out;
  }, []);

  useFrame((state, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 1 / 30);
    const t = state.clock.elapsedTime;
    const narrow = viewport.width < 4;
    const scale = narrow ? 0.48 : viewport.width < 6 ? 0.7 : 0.95;
    const halfW = viewport.width / 2 - 1.7 * scale;
    const halfH = viewport.height / 2 - 0.8 * scale;

    if (pointer.x !== lastPointer.current.x || pointer.y !== lastPointer.current.y) lastPointer.current = { x: pointer.x, y: pointer.y, t };
    const usePointer = t - lastPointer.current.t < 2.5;
    const tl = tilt.current;
    const target = new THREE.Vector2();
    if (tl?.active) target.set(tl.x * viewport.width * 0.7, -tl.y * viewport.height * 0.6);
    else if (usePointer) target.set(pointer.x * viewport.width * 0.55, pointer.y * viewport.height * 0.5);
    else target.set(Math.sin(t * 0.55) * viewport.width * 0.6, Math.cos(t * 0.43) * viewport.height * 0.3 + (narrow ? -viewport.height * 0.18 : 0.4));

    // Spring toward target.
    vel.current.addScaledVector(target.sub(pos.current), 4.2 * dt);
    vel.current.multiplyScalar(Math.pow(0.18, dt));
    pos.current.addScaledVector(vel.current, dt * 3);

    // Bump against the screen edges.
    if (Math.abs(pos.current.x) > halfW) {
      pos.current.x = Math.sign(pos.current.x) * halfW;
      if (Math.abs(vel.current.x) > 0.4) squash.current = Math.min(1, Math.abs(vel.current.x) * 0.25);
      vel.current.x *= -0.55;
    }
    if (Math.abs(pos.current.y) > halfH) {
      pos.current.y = Math.sign(pos.current.y) * halfH;
      if (Math.abs(vel.current.y) > 0.4) squash.current = Math.min(1, Math.abs(vel.current.y) * 0.25);
      vel.current.y *= -0.55;
    }
    squash.current *= Math.pow(0.02, dt);

    const sp = scrollRef.current ?? 0;
    g.position.set(pos.current.x, pos.current.y + sp * 2.2, 0.6 + sp * 2.5);
    const s = scale * (1 + sp * 0.5);
    g.scale.set(s * (1 - squash.current * 0.12), s * (1 + squash.current * 0.08), s);
    g.rotation.x = -0.55 + vel.current.y * 0.08 + Math.sin(t * 0.8) * 0.08;
    g.rotation.y = -0.35 + vel.current.x * 0.1 + Math.sin(t * 0.5) * 0.25;
    g.rotation.z = 0.18 + Math.sin(t * 0.6) * 0.08 - vel.current.x * 0.03;
  });

  return (
    <group ref={group}>
      <mesh geometry={base} castShadow>
        <meshStandardMaterial color="#d7dde0" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[-0.68, 0, 0.032]}>
        <planeGeometry args={[1.95, 1.95 * (452 / 1024)]} />
        <meshStandardMaterial map={label} metalness={0.3} roughness={0.45} />
      </mesh>
      {blisters.map(([x, y], i) => (
        <group key={i} position={[x, y, 0.03]}>
          <mesh geometry={dome} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.55, 1]}>
            <meshStandardMaterial color="#e9f7f3" transparent opacity={0.42} roughness={0.05} metalness={0.1} />
          </mesh>
          <mesh geometry={pill} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.05]} scale={0.85}>
            <meshStandardMaterial color={i % 2 ? '#ff7a66' : '#ffffff'} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Shards() {
  const ref = useRef<THREE.Group>(null);
  const geo = useMemo(() => new THREE.TetrahedronGeometry(0.12), []);
  const seeds = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ a: i * 0.7, r: 1.2 + (i % 3) * 0.5, z: 0.4 + (i % 4) * 0.3 })), []);
  useFrame((s) => {
    ref.current?.children.forEach((c, i) => {
      const k = seeds[i];
      const t = s.clock.elapsedTime * 0.35 + k.a;
      c.position.set(1.1 + Math.cos(t) * k.r, 1.4 + Math.sin(t * 1.3) * k.r * 0.6, k.z);
      c.rotation.set(t * 2, t * 1.5, 0);
    });
  });
  return (
    <group ref={ref}>
      {seeds.map((_, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color="#bfffe9" emissive="#5effc8" emissiveIntensity={0.5} transparent opacity={0.55} metalness={0.2} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroScene({ active }: { active: boolean }) {
  const tilt = useRef<Tilt>({ x: 0, y: 0, active: false });
  const scroll = useRef(0);
  useEffect(() => {
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tilt.current = { x: THREE.MathUtils.clamp(e.gamma / 35, -1, 1), y: THREE.MathUtils.clamp((e.beta - 40) / 35, -1, 1), active: true };
    };
    const onScroll = () => (scroll.current = Math.min(1.2, window.scrollY / window.innerHeight));
    window.addEventListener('deviceorientation', onTilt);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('deviceorientation', onTilt);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 6]} intensity={2.2} />
      <pointLight position={[-3, -1, 3]} color="#5effc8" intensity={14} distance={12} />
      <pointLight position={[3, -2, 2]} color="#ff5a46" intensity={8} distance={10} />
      <Strip tilt={tilt} scrollRef={scroll} />
      <Shards />
    </Canvas>
  );
}
