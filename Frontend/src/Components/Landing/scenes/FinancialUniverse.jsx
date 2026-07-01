import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FloatingCity from '../objects/FloatingCity'
import ParticleField from '../effects/ParticleField'
import EnergyBeam from '../effects/EnergyBeam'
import HolographicText from '../effects/HolographicText'

export default function FinancialUniverse({ progress = 0, visible = true }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!visible) return
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  const revealProgress = Math.min(1, progress * 1.5)

  return (
    <group ref={groupRef} position={[0, 0, -18]} visible={visible}>
      <FloatingCity position={[0, -2, 0]} />

      {/* Data streams between buildings */}
      <EnergyBeam
        points={[[-8, 2, -3], [-4, 3, 0], [0, 2.5, -2], [4, 3.5, 1], [8, 2, -1]]}
        color="#00f0ff"
        width={0.01}
        speed={1}
        opacity={0.4}
      />
      <EnergyBeam
        points={[[-6, 4, 2], [-2, 5, -1], [2, 4.5, 1], [6, 5, -2]]}
        color="#8b5cf6"
        width={0.008}
        speed={0.8}
        opacity={0.3}
      />

      {/* Floating labels */}
      <HolographicText position={[-4, 4, 0]} fontSize={0.2} color="#00f0ff" opacity={revealProgress * 0.7}>
        AI Towers
      </HolographicText>
      <HolographicText position={[3, 5, -2]} fontSize={0.2} color="#8b5cf6" opacity={revealProgress * 0.7}>
        Banking Hub
      </HolographicText>
      <HolographicText position={[0, 6, 1]} fontSize={0.2} color="#f59e0b" opacity={revealProgress * 0.7}>
        Digital Bridge
      </HolographicText>

      {/* Ambient particles */}
      <ParticleField count={100} color="#00f0ff" size={0.02} area={25} speed={0.15} opacity={0.3} />
      <ParticleField count={50} color="#f59e0b" size={0.015} area={20} speed={0.1} opacity={0.2} />

      {/* Scene lighting */}
      <ambientLight intensity={0.12} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#e2e8f0" />
      <pointLight position={[0, 5, 0]} intensity={3} color="#00f0ff" distance={20} />
      <pointLight position={[-5, 3, -5]} intensity={2} color="#8b5cf6" distance={15} />
      <pointLight position={[5, 2, 3]} intensity={1.5} color="#f59e0b" distance={12} />

      {/* Ground fog */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshBasicMaterial color="#050510" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}
