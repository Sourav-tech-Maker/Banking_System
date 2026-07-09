import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import AICore from '../objects/AICore'
import ONEOBankCoin from '../objects/NexoraCoin'
import ParticleField from '../effects/ParticleField'
import HolographicText from '../effects/HolographicText'
import EnergyBeam from '../effects/EnergyBeam'

export default function FinalReveal({ progress = 0, visible = true }) {
  const orbitRef = useRef()

  useFrame((state) => {
    if (!visible) return
    if (orbitRef.current) {
      orbitRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  const convergeProgress = Math.min(1, progress * 1.5)
  const textProgress = Math.max(0, (progress - 0.4) / 0.6)

  return (
    <group position={[0, 0, -97]} visible={visible}>
      <Stars radius={60} depth={40} count={2000} factor={4} saturation={0.3} />

      {/* Central AI Core */}
      <AICore position={[0, 0, 0]} />

      {/* Orbiting elements */}
      <group ref={orbitRef}>
        {/* Orbiting coins */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          const radius = 3 + Math.sin(i) * 0.5
          return (
            <ONEOBankCoin
              key={`coin-${i}`}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle * 2) * 0.8,
                Math.sin(angle) * radius,
              ]}
              scale={0.25}
              spinning={true}
            />
          )
        })}

        {/* Orbiting mini elements */}
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
          const radius = 5
          return (
            <mesh key={`orb-${i}`} position={[
              Math.cos(angle) * radius,
              (i - 1.5) * 0.5,
              Math.sin(angle) * radius,
            ]}>
              <octahedronGeometry args={[0.3, 1]} />
              <meshStandardMaterial
                color={['#00f0ff', '#8b5cf6', '#f59e0b', '#10b981'][i]}
                emissive={['#00f0ff', '#8b5cf6', '#f59e0b', '#10b981'][i]}
                emissiveIntensity={1.5}
                transparent
                opacity={0.7}
                toneMapped={false}
              />
            </mesh>
          )
        })}
      </group>

      {/* Energy beams */}
      {[0, 1, 2].map(i => (
        <EnergyBeam
          key={i}
          points={[
            [(i - 1) * 5, 3, 3],
            [(i - 1) * 2, 1, 1],
            [0, 0, 0],
          ]}
          color={['#00f0ff', '#8b5cf6', '#f59e0b'][i]}
          width={0.01}
          speed={1.5}
          opacity={0.3 * convergeProgress}
        />
      ))}

      {/* Final text */}
      <HolographicText position={[0, 4, 0]} fontSize={0.8} color="#ffffff" opacity={textProgress}>
        YONO App
      </HolographicText>
      <HolographicText position={[0, 3, 0]} fontSize={0.2} color="#94a3b8" opacity={textProgress * 0.9}>
        One Platform. Infinite Intelligence.
      </HolographicText>

      {/* Particles */}
      <ParticleField count={150} color="#00f0ff" size={0.02} area={20} speed={0.2} opacity={0.3 * convergeProgress} />
      <ParticleField count={50} color="#8b5cf6" size={0.02} area={15} speed={0.15} opacity={0.25 * convergeProgress} />
      <ParticleField count={50} color="#f59e0b" size={0.02} area={15} speed={0.15} opacity={0.25 * convergeProgress} />

      {/* Lighting */}
      <ambientLight intensity={0.1 + textProgress * 0.1} />
      <pointLight position={[0, 0, 0]} intensity={5} color="#60a5fa" distance={20} />
      <pointLight position={[5, 5, 5]} intensity={3} color="#00f0ff" distance={15} />
      <pointLight position={[-5, -3, 5]} intensity={2} color="#8b5cf6" distance={12} />
      <pointLight position={[0, 5, -5]} intensity={2} color="#f59e0b" distance={12} />
    </group>
  )
}
