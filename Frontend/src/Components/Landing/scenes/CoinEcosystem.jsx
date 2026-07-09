import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import ONEOBankCoin from '../objects/NexoraCoin'
import EnergyBeam from '../effects/EnergyBeam'
import ParticleField from '../effects/ParticleField'
import HolographicText from '../effects/HolographicText'

export default function CoinEcosystem({ progress = 0, visible = true }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!visible) return
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  // Coins spiral inward based on progress
  const coinCount = 12
  const coins = useMemo(() => {
    return Array.from({ length: coinCount }, (_, i) => {
      const angle = (i / coinCount) * Math.PI * 2
      return {
        startRadius: 6,
        angle,
        height: (Math.random() - 0.5) * 4,
      }
    })
  }, [])

  return (
    <group ref={groupRef} position={[0, 0, -88]} visible={visible}>
      {/* Central collection point (miniature AI core) */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={1 + progress * 3}
          transparent
          opacity={0.6 + progress * 0.4}
          toneMapped={false}
        />
      </mesh>

      {/* Orbiting coins that spiral inward */}
      {coins.map((coin, i) => {
        const currentRadius = coin.startRadius * (1 - progress * 0.8)
        const currentAngle = coin.angle + progress * Math.PI * 4
        return (
          <ONEOBankCoin
            key={i}
            position={[
              Math.cos(currentAngle) * currentRadius,
              coin.height * (1 - progress * 0.5),
              Math.sin(currentAngle) * currentRadius,
            ]}
            scale={0.3 + (1 - (currentRadius / 6)) * 0.2}
            spinning={true}
          />
        )
      })}

      {/* Energy streams flowing to center */}
      {[0, 1, 2, 3].map(i => {
        const angle = (i / 4) * Math.PI * 2
        return (
          <EnergyBeam
            key={i}
            points={[
              [Math.cos(angle) * 7, (i - 1.5) * 1.5, Math.sin(angle) * 7],
              [Math.cos(angle + 0.5) * 4, (i - 1.5) * 0.8, Math.sin(angle + 0.5) * 4],
              [Math.cos(angle + 1) * 1.5, 0, Math.sin(angle + 1) * 1.5],
              [0, 0, 0],
            ]}
            color="#f59e0b"
            width={0.015}
            speed={2}
            opacity={0.5 * progress}
          />
        )
      })}

      <HolographicText position={[0, 3.5, 0]} fontSize={0.25} color="#f59e0b" opacity={progress}>
        YONO App Coin Ecosystem
      </HolographicText>
      <HolographicText position={[0, 2.8, 0]} fontSize={0.12} color="#94a3b8" opacity={progress * 0.8}>
        Rewards flow into the YONO App ecosystem
      </HolographicText>

      <ParticleField count={100} color="#f59e0b" size={0.02} area={15} speed={0.3} opacity={0.4} />
      <ParticleField count={50} color="#00f0ff" size={0.015} area={12} speed={0.2} opacity={0.2} />

      {/* Lighting */}
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 0, 0]} intensity={5 * progress} color="#f59e0b" distance={20} />
      <pointLight position={[5, 3, 5]} intensity={2} color="#00f0ff" distance={12} />
    </group>
  )
}
