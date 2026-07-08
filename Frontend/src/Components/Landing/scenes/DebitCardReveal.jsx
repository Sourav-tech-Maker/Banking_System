import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import DebitCard from '../objects/DebitCard'
import ParticleField from '../effects/ParticleField'
import HolographicText from '../effects/HolographicText'

export default function DebitCardReveal({ progress = 0, visible = true }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!visible) return
    if (groupRef.current) {
      // Slow rotation to show card from different angles
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <group position={[0, 0, -27]} visible={visible}>
      <group ref={groupRef}>
        <DebitCard
          progress={progress}
          position={[0, 0, 0]}
          rotation={[0.1, 0, 0]}
        />
      </group>

      {/* Premium particle effects around card */}
      <ParticleField count={80} color="#f59e0b" size={0.015} area={8} speed={0.15} opacity={0.4 * progress} />
      <ParticleField count={50} color="#e2e8f0" size={0.01} area={6} speed={0.1} opacity={0.3 * progress} />

      {/* Card label */}
      {progress > 0.6 && (
        <HolographicText
          position={[0, -2, 0]}
          fontSize={0.18}
          color="#94a3b8"
          opacity={Math.min(1, (progress - 0.6) / 0.3)}
        >
          ONEO Bank Titanium Debit Card
        </HolographicText>
      )}

      {/* Dramatic lighting */}
      <ambientLight intensity={0.05} />
      <spotLight position={[3, 5, 5]} intensity={4} angle={0.4} penumbra={0.8} color="#e2e8f0" />
      <spotLight position={[-3, 3, 3]} intensity={2} angle={0.5} penumbra={0.9} color="#00f0ff" />
      <pointLight position={[0, 0, 2]} intensity={1.5} color="#f59e0b" distance={8} />
    </group>
  )
}
