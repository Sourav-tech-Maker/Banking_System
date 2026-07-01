import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'

export default function AICore({ progress = 0, disassembled = false, position = [0, 0, 0] }) {
  const groupRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const ring3Ref = useRef()
  const coreRef = useRef()

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.5
      ring1Ref.current.rotation.y = time * 0.3
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -time * 0.4
      ring2Ref.current.rotation.z = time * 0.6
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = time * 0.7
      ring3Ref.current.rotation.z = -time * 0.3
    }

    if (disassembled && groupRef.current) {
      // Spread rings outward based on progress
      const spread = progress * 5
      if (ring1Ref.current) ring1Ref.current.position.x = spread
      if (ring2Ref.current) ring2Ref.current.position.y = spread
      if (ring3Ref.current) ring3Ref.current.position.z = -spread

      // Shrink core
      if (coreRef.current) {
        const scale = Math.max(0.1, 1 - progress * 0.8)
        coreRef.current.scale.setScalar(scale)
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <Float speed={2} rotationIntensity={disassembled ? 0 : 1.2} floatIntensity={disassembled ? 0 : 1.5}>
        {/* Core sphere */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <MeshDistortMaterial
            color="#60a5fa"
            emissive="#1e40af"
            emissiveIntensity={1.5}
            distort={disassembled ? 0.1 : 0.4}
            speed={3}
            roughness={0.2}
            metalness={0.8}
            toneMapped={false}
          />
        </mesh>

        {/* Gold ring */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[1.8, 0.06, 16, 100]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} emissive="#b45309" emissiveIntensity={0.3} />
        </mesh>

        {/* Cyan ring */}
        <mesh ref={ring2Ref}>
          <torusGeometry args={[1.4, 0.04, 16, 100]} />
          <meshStandardMaterial color="#00f0ff" metalness={0.9} roughness={0.1} emissive="#00f0ff" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>

        {/* Purple ring */}
        <mesh ref={ring3Ref}>
          <torusGeometry args={[2.2, 0.05, 16, 100]} />
          <meshStandardMaterial color="#8b5cf6" metalness={0.9} roughness={0.15} emissive="#5b21b6" emissiveIntensity={0.3} />
        </mesh>
      </Float>
    </group>
  )
}
