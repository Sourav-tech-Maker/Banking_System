import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const RING_CONFIG = [
  { radius: 1.5, tube: 0.04, color: '#00f0ff', speed: 0.8, axis: [1, 0.3, 0] },
  { radius: 2.0, tube: 0.03, color: '#8b5cf6', speed: -0.6, axis: [0.3, 1, 0.2] },
  { radius: 2.5, tube: 0.05, color: '#00f0ff', speed: 0.5, axis: [0, 0.5, 1] },
  { radius: 3.0, tube: 0.03, color: '#f59e0b', speed: -0.4, axis: [0.7, 0, 0.7] },
  { radius: 3.5, tube: 0.04, color: '#8b5cf6', speed: 0.3, axis: [0.2, 0.8, 0.3] },
]

export default function SecurityRings({ progress = 0, position = [0, 0, 0] }) {
  const ringsRef = useRef([])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const vaultOpen = Math.max(0, (progress - 0.6) / 0.4) // Opens after 60%

    ringsRef.current.forEach((ring, i) => {
      if (!ring) return
      const config = RING_CONFIG[i]
      ring.rotation.x = time * config.speed * config.axis[0]
      ring.rotation.y = time * config.speed * config.axis[1]
      ring.rotation.z = time * config.speed * config.axis[2]

      // Spread apart when vault opens
      const spread = vaultOpen * (i - 2) * 1.5
      ring.position.z = spread
    })
  })

  return (
    <group position={position}>
      {RING_CONFIG.map((config, i) => (
        <mesh key={i} ref={el => ringsRef.current[i] = el}>
          <torusGeometry args={[config.radius, config.tube, 16, 100]} />
          <meshStandardMaterial
            color={config.color}
            emissive={config.color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
            toneMapped={false}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Laser grid inside */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const r = 1.2
        return (
          <mesh key={`laser-${i}`} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 4, 4]} />
            <meshBasicMaterial color="#f43f5e" transparent opacity={0.4 * (1 - Math.max(0, (progress - 0.6) / 0.4))} toneMapped={false} />
          </mesh>
        )
      })}

      {/* Central shield glow */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={2 * progress}
          transparent
          opacity={0.3 + progress * 0.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
