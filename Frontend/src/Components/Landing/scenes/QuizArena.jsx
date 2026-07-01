import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import HolographicText from '../effects/HolographicText'
import ParticleField from '../effects/ParticleField'
import NexoraCoin from '../objects/NexoraCoin'

export default function QuizArena({ progress = 0, visible = true }) {
  const platformRef = useRef()
  const spotRef = useRef()

  useFrame((state) => {
    if (!visible) return
    if (platformRef.current) {
      platformRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
    if (spotRef.current) {
      spotRef.current.intensity = 3 + Math.sin(state.clock.elapsedTime * 2) * 1
    }
  })

  const quizActive = progress > 0.3
  const rewardPhase = progress > 0.7

  return (
    <group position={[0, 0, -78]} visible={visible}>
      {/* Circular platform */}
      <group ref={platformRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
          <cylinderGeometry args={[4, 4.5, 0.3, 64]} />
          <meshPhysicalMaterial
            color="#1a1a2e"
            metalness={0.9}
            roughness={0.2}
            emissive="#0a0a1a"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Platform edge glow ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.84, 0]}>
          <torusGeometry args={[4.25, 0.06, 8, 64]} />
          <meshBasicMaterial color="#00f0ff" toneMapped={false} />
        </mesh>

        {/* Inner rings */}
        {[1, 2, 3].map(r => (
          <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.83, 0]}>
            <torusGeometry args={[r, 0.02, 8, 64]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Spotlight */}
      <spotLight ref={spotRef} position={[0, 8, 0]} angle={0.4} penumbra={0.6} intensity={3} color="#e2e8f0" target-position={[0, 0, 0]} />

      {/* Quiz question display */}
      {quizActive && (
        <>
          <HolographicText position={[0, 2, 0]} fontSize={0.18} color="#ffffff" opacity={Math.min(1, (progress - 0.3) / 0.2)}>
            Weekly Tech Quiz
          </HolographicText>
          <HolographicText position={[0, 1.4, 0]} fontSize={0.12} color="#94a3b8" opacity={Math.min(1, (progress - 0.35) / 0.2)}>
            Test your knowledge. Earn NEXORA Coins.
          </HolographicText>

          {/* Timer circle */}
          <mesh position={[0, 0.5, 0]}>
            <torusGeometry args={[0.6, 0.04, 8, 64, Math.PI * 2 * (1 - Math.max(0, (progress - 0.3) / 0.4))]} />
            <meshBasicMaterial color="#f59e0b" toneMapped={false} />
          </mesh>

          {/* Score */}
          <HolographicText position={[3, 1, 0]} fontSize={0.15} color="#10b981" opacity={Math.min(1, (progress - 0.4) / 0.2)}>
            Score: 850
          </HolographicText>
        </>
      )}

      {/* Reward coins burst */}
      {rewardPhase && (
        <>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const radius = 2 + (progress - 0.7) * 5
            return (
              <NexoraCoin
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle * 2) * 0.5 + 1,
                  Math.sin(angle) * radius * 0.5
                ]}
                scale={0.4}
                spinning={true}
              />
            )
          })}

          <ParticleField count={100} color="#f59e0b" size={0.03} area={8} speed={0.5} opacity={0.7} />
        </>
      )}

      <ParticleField count={50} color="#8b5cf6" size={0.015} area={12} speed={0.15} opacity={0.2} />

      {/* Lighting */}
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#8b5cf6" distance={12} />
    </group>
  )
}
