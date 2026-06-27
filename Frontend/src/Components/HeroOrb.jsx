import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial, Stars } from "@react-three/drei";

const CoinCore = () => {
  return (
    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.8}>
      {/* Outer Torus ring (gold tech styling) */}
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshStandardMaterial
          color="#fbbf24"
          roughness={0.1}
          metalness={0.9}
          emissive="#d97706"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Inner Torus ring (opposing rotation) */}
      <mesh rotation={[-Math.PI / 4, -Math.PI / 4, 0]}>
        <torusGeometry args={[1.2, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#3b82f6"
          roughness={0.1}
          metalness={0.9}
          emissive="#1d4ed8"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Core Glowing Orb */}
      <mesh>
        <sphereGeometry args={[0.7, 64, 64]} />
        <MeshDistortMaterial
          color="#60a5fa"
          roughness={0.2}
          metalness={0.8}
          distort={0.4}
          speed={3}
          emissive="#1e40af"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
};

export default function HeroOrb() {
  return (
    <div className="w-full h-full min-h-[250px] relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
        <spotLight position={[0, 5, 0]} intensity={1} color="#60a5fa" />
        <CoinCore />
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0.5} fade speed={1.5} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
