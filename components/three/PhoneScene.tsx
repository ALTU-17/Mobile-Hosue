"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  PresentationControls,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";

type PhoneSceneProps = {
  color: string;
  onReady?: () => void;
};

function makeScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const gradient = ctx.createLinearGradient(0, 0, 512, 1024);
  gradient.addColorStop(0, "#1d1a15");
  gradient.addColorStop(0.48, "#0a0908");
  gradient.addColorStop(1, "#171009");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 1024);

  const glow = ctx.createRadialGradient(108, 160, 0, 108, 160, 360);
  glow.addColorStop(0, "rgba(240, 163, 58, 0.52)");
  glow.addColorStop(0.5, "rgba(226, 74, 51, 0.09)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 512, 1024);

  ctx.strokeStyle = "rgba(201, 162, 94, 0.12)";
  ctx.lineWidth = 1;
  for (let x = 34; x < 512; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 40; y < 1024; y += 52) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(242, 235, 221, 0.58)";
  ctx.font = "18px monospace";
  ctx.textAlign = "left";
  ctx.fillText("10:30", 44, 82);
  ctx.textAlign = "right";
  ctx.fillText("MH · 20", 468, 82);

  ctx.textAlign = "center";
  ctx.fillStyle = "#c9a25e";
  ctx.font = "160px Georgia, serif";
  ctx.fillText("MH", 256, 516);

  ctx.fillStyle = "#f2ebdd";
  ctx.font = "600 23px Arial, sans-serif";
  ctx.fillText("MOBILE HOUSE", 256, 574);

  ctx.fillStyle = "rgba(201, 162, 94, 0.9)";
  ctx.font = "13px monospace";
  ctx.fillText("Y O U R   M O B I L E   P A R T N E R", 256, 606);

  ctx.strokeStyle = "rgba(201, 162, 94, 0.38)";
  ctx.beginPath();
  ctx.moveTo(128, 650);
  ctx.lineTo(384, 650);
  ctx.stroke();

  ctx.fillStyle = "rgba(242, 235, 221, 0.56)";
  ctx.font = "12px monospace";
  ctx.fillText("SEALED / ORIGINAL / GST BILLED", 256, 690);

  ctx.fillStyle = "rgba(240, 163, 58, 0.6)";
  ctx.beginPath();
  ctx.arc(256, 818, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0b0a09";
  ctx.font = "11px monospace";
  ctx.fillText("MH", 256, 822);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function Lens({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.185, 0.185, 0.075, 32]} />
        <meshStandardMaterial color="#3b3a3b" metalness={1} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0, 0.055]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.126, 0.126, 0.022, 32]} />
        <meshPhysicalMaterial
          color="#091018"
          metalness={0.9}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      <mesh position={[-0.025, 0.028, 0.072]}>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshBasicMaterial color="#8fa8b2" opacity={0.7} transparent />
      </mesh>
    </group>
  );
}

function PhoneModel({ color, texture }: { color: string; texture: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ pointer, clock }) => {
    if (!group.current) return;
    const targetY = -0.24 + pointer.x * 0.12;
    const targetX = 0.06 + pointer.y * 0.06;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.035);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.035);
    group.current.position.y = Math.sin(clock.elapsedTime * 0.55) * 0.045;
  });

  return (
    <group ref={group} rotation={[0.06, -0.24, -0.015]}>
      <mesh position={[0, 0, -1.1]}>
        <torusGeometry args={[3.25, 0.012, 12, 160]} />
        <meshStandardMaterial color="#c9a25e" metalness={1} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, -1.2]}>
        <torusGeometry args={[3.6, 0.006, 8, 160]} />
        <meshBasicMaterial color="#c9a25e" transparent opacity={0.3} />
      </mesh>

      <RoundedBox
        args={[2.5, 5.08, 0.24]}
        radius={0.3}
        smoothness={10}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={color}
          metalness={0.88}
          roughness={0.24}
          clearcoat={1}
          clearcoatRoughness={0.15}
          envMapIntensity={1.35}
        />
      </RoundedBox>

      <RoundedBox
        args={[2.26, 4.8, 0.035]}
        radius={0.22}
        smoothness={8}
        position={[0, 0, 0.121]}
      >
        <meshStandardMaterial color="#050505" metalness={0.4} roughness={0.5} />
      </RoundedBox>

      <mesh position={[0, 0, 0.143]}>
        <planeGeometry args={[2.17, 4.7]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      <RoundedBox
        args={[0.98, 1.2, 0.12]}
        radius={0.17}
        smoothness={8}
        position={[-0.68, 1.72, 0.18]}
      >
        <meshStandardMaterial color="#09090a" metalness={0.55} roughness={0.4} />
      </RoundedBox>

      <Lens position={[-0.87, 1.99, 0.26]} />
      <Lens position={[-0.48, 1.99, 0.26]} />
      <Lens position={[-0.68, 1.55, 0.26]} />
      <mesh position={[-0.42, 1.49, 0.26]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial color="#f1e3c5" emissive="#f1e3c5" emissiveIntensity={0.35} />
      </mesh>

      <mesh position={[1.26, 0.6, 0]}>
        <boxGeometry args={[0.045, 1.0, 0.12]} />
        <meshStandardMaterial color="#252525" metalness={0.8} roughness={0.32} />
      </mesh>
      <mesh position={[-1.26, 0.5, 0]}>
        <boxGeometry args={[0.045, 0.62, 0.12]} />
        <meshStandardMaterial color="#252525" metalness={0.8} roughness={0.32} />
      </mesh>
    </group>
  );
}

export default function PhoneScene({ color, onReady }: PhoneSceneProps) {
  const texture = useMemo(() => makeScreenTexture(), []);

  return (
    <Canvas
      dpr={[1, 1.7]}
      camera={{ position: [0, 0, 12], fov: 32 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
      style={{ width: "100%", height: "100%" }}
      aria-label="Interactive 3D phone. Drag to rotate."
    >
      <ambientLight intensity={0.62} />
      <directionalLight position={[5, 7, 6]} intensity={1.7} color="#ffe2b0" />
      <directionalLight position={[-6, -2, 4]} intensity={0.7} color="#7b8e9c" />
      <spotLight position={[0, 6, 5]} angle={0.35} penumbra={0.8} intensity={1.4} color="#ffffff" />

      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#f0a33a"
          position={[-4, 3, 3]}
          scale={[4, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#ffffff"
          position={[5, 1, 4]}
          scale={[3, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          color="#6e7c86"
          position={[0, -5, 3]}
          scale={[6, 2, 1]}
        />
      </Environment>

      <PresentationControls
        global
        snap={false}
        rotation={[0, 0, 0]}
        polar={[-0.3, 0.3]}
        azimuth={[-0.8, 0.8]}
      >
        <Float speed={1.15} rotationIntensity={0.08} floatIntensity={0.1}>
          <PhoneModel color={color} texture={texture} />
        </Float>
      </PresentationControls>

      <ContactShadows
        position={[0, -2.85, 0]}
        opacity={0.48}
        scale={8}
        blur={2.6}
        far={4}
        color="#000000"
      />
    </Canvas>
  );
}
