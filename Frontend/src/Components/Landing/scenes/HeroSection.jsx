import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import AICore from '../objects/AICore'
import ParticleField from '../effects/ParticleField'
import HolographicText from '../effects/HolographicText'

export default function HeroSection({ progress = 0, visible = true }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!visible) return
    if (groupRef.current) {
      // Subtle rotation of the entire scene
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  const textOpacity = Math.min(1, progress * 3)
  const textFade = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1

  return (
    <group ref={groupRef} visible={visible}>
      <Stars radius={80} depth={50} count={1500} factor={3} saturation={0.2} />

      <AICore position={[0, 0, 0]} />

      <ParticleField count={150} color="#00f0ff" size={0.02} area={15} speed={0.2} opacity={0.5} />
      <ParticleField count={50} color="#8b5cf6" size={0.025} area={12} speed={0.15} opacity={0.4} />

      {/* NEXORA title */}
      <HolographicText
        position={[0, 2.5, 0]}
        fontSize={1.2}
        color="#ffffff"
        opacity={textOpacity * textFade}
      >
        NEXORA
      </HolographicText>

      {/* Tagline */}
      <HolographicText
        position={[0, 1.6, 0]}
        fontSize={0.25}
        color="#94a3b8"
        opacity={textOpacity * textFade * 0.8}
      >
        The Future of Intelligent Banking
      </HolographicText>

      {/* Scene lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#00f0ff" distance={20} />
      <pointLight position={[-5, -3, 3]} intensity={1.5} color="#8b5cf6" distance={15} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#60a5fa" distance={10} />
    </group>
  )
}
