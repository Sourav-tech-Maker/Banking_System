import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import SecurityRings from '../objects/SecurityRings'
import ParticleField from '../effects/ParticleField'
import HolographicText from '../effects/HolographicText'

export default function SecurityVault({ progress = 0, visible = true }) {
  const groupRef = useRef()
  const scanLineRef = useRef()

  useFrame((state) => {
    if (!visible) return
    if (scanLineRef.current) {
      // Scanning line animation
      scanLineRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 2
    }
  })

  const isVerified = progress > 0.7
  const scanOpacity = isVerified ? 0 : 0.5

  return (
    <group ref={groupRef} position={[0, 0, -58]} visible={visible}>
      <SecurityRings progress={progress} position={[0, 0, 0]} />

      {/* Scanning line */}
      <mesh ref={scanLineRef} position={[0, 0, 0]}>
        <planeGeometry args={[6, 0.03]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={scanOpacity} toneMapped={false} />
      </mesh>

      {/* Auth status labels */}
      {progress > 0.1 && (
        <HolographicText position={[-3, 2.5, 0]} fontSize={0.14} color={progress > 0.2 ? '#10b981' : '#f59e0b'} opacity={0.8}>
          {progress > 0.2 ? '✓ Fingerprint Verified' : '◌ Scanning Fingerprint...'}
        </HolographicText>
      )}
      {progress > 0.3 && (
        <HolographicText position={[-3, 2, 0]} fontSize={0.14} color={progress > 0.4 ? '#10b981' : '#f59e0b'} opacity={0.8}>
          {progress > 0.4 ? '✓ Facial Recognition' : '◌ Analyzing Face...'}
        </HolographicText>
      )}
      {progress > 0.5 && (
        <HolographicText position={[-3, 1.5, 0]} fontSize={0.14} color={progress > 0.6 ? '#10b981' : '#f59e0b'} opacity={0.8}>
          {progress > 0.6 ? '✓ MFA Complete' : '◌ Verifying MFA...'}
        </HolographicText>
      )}
      {isVerified && (
        <HolographicText position={[0, -2.5, 0]} fontSize={0.25} color="#10b981" opacity={Math.min(1, (progress - 0.7) / 0.2)}>
          ACCESS GRANTED
        </HolographicText>
      )}

      {/* Green particles on verification */}
      {isVerified && (
        <ParticleField count={80} color="#10b981" size={0.02} area={10} speed={0.4} opacity={0.6} />
      )}

      <ParticleField count={80} color="#00f0ff" size={0.015} area={12} speed={0.2} opacity={0.25} />

      {/* Lighting */}
      <ambientLight intensity={0.06} />
      <pointLight position={[0, 0, 0]} intensity={2 + progress * 3} color={isVerified ? '#10b981' : '#00f0ff'} distance={15} />
      <spotLight position={[0, 5, 5]} intensity={3} angle={0.5} penumbra={0.8} color="#e2e8f0" />
    </group>
  )
}
