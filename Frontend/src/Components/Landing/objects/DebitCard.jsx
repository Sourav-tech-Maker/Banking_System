import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

export default function DebitCard({ progress = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const groupRef = useRef()

  const lerp = (start, end, t) => start + (end - start) * THREE.MathUtils.clamp(t, 0, 1)

  // Assembly offsets — each piece starts far away
  const bodyOffset = useMemo(() => [0, -8, -5], [])
  const chipOffset = useMemo(() => [-6, 3, -3], [])
  const nfcOffset = useMemo(() => [7, 2, -4], [])
  const textOffset = useMemo(() => [0, -6, -2], [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  const p = THREE.MathUtils.clamp(progress, 0, 1)
  // Ease the progress for smoother assembly
  const easedP = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Card body */}
      <group position={[
        lerp(bodyOffset[0], 0, easedP),
        lerp(bodyOffset[1], 0, easedP),
        lerp(bodyOffset[2], 0, easedP)
      ]}>
        <RoundedBox args={[3.4, 2.1, 0.08]} radius={0.12} smoothness={4}>
          <meshPhysicalMaterial
            color="#2a2a3e"
            metalness={0.92}
            roughness={0.28}
            envMapIntensity={1.5}
            clearcoat={0.5}
            clearcoatRoughness={0.2}
          />
        </RoundedBox>
      </group>

      {/* EMV Chip */}
      <group position={[
        lerp(chipOffset[0], -0.9, easedP),
        lerp(chipOffset[1], 0.3, easedP),
        lerp(chipOffset[2], 0.06, easedP)
      ]}>
        <RoundedBox args={[0.45, 0.35, 0.02]} radius={0.04} smoothness={2}>
          <meshPhysicalMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
        </RoundedBox>
        {/* Chip lines */}
        {[0, 1, 2].map(i => (
          <mesh key={i} position={[0, (i - 1) * 0.08, 0.02]}>
            <boxGeometry args={[0.35, 0.01, 0.005]} />
            <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* NFC Symbol - 3 arcs */}
      <group position={[
        lerp(nfcOffset[0], 1.1, easedP),
        lerp(nfcOffset[1], 0.3, easedP),
        lerp(nfcOffset[2], 0.06, easedP)
      ]} rotation={[0, 0, Math.PI / 4]}>
        {[0.12, 0.2, 0.28].map((radius, i) => (
          <mesh key={i}>
            <torusGeometry args={[radius, 0.012, 8, 16, Math.PI * 0.7]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* NEXORA Text */}
      <group position={[
        lerp(textOffset[0], -0.5, easedP),
        lerp(textOffset[1], -0.65, easedP),
        lerp(textOffset[2], 0.06, easedP)
      ]}>
        <Text
          fontSize={0.18}
          color="#e2e8f0"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.15}
        >
          NEXORA
        </Text>
      </group>

      {/* Card number dots (4 groups of 4) */}
      {[0, 1, 2, 3].map(group => (
        <group key={group} position={[
          lerp((Math.random() - 0.5) * 10, -1.0 + group * 0.7, easedP),
          lerp((Math.random() - 0.5) * 8, -0.2, easedP),
          lerp(-3, 0.06, easedP)
        ]}>
          {[0, 1, 2, 3].map(dot => (
            <mesh key={dot} position={[dot * 0.1, 0, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
