import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function NexoraCoin({ position = [0, 0, 0], scale = 1, spinning = true }) {
  const coinRef = useRef()

  useFrame((state) => {
    if (coinRef.current && spinning) {
      coinRef.current.rotation.y = state.clock.elapsedTime * 2
    }
  })

  return (
    <group ref={coinRef} position={position} scale={scale}>
      {/* Main coin body */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.06, 48]} />
        <meshPhysicalMaterial
          color="#f59e0b"
          metalness={0.95}
          roughness={0.15}
          emissive="#b45309"
          emissiveIntensity={0.2}
          envMapIntensity={2.0}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Edge ridge */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.035, 8, 48]} />
        <meshPhysicalMaterial
          color="#d97706"
          metalness={0.95}
          roughness={0.2}
        />
      </mesh>

      {/* N emblem - front */}
      <Text
        position={[0, 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.35}
        color="#92400e"
        anchorX="center"
        anchorY="middle"
      >
        N
      </Text>

      {/* N emblem - back */}
      <Text
        position={[0, -0.04, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        fontSize={0.35}
        color="#92400e"
        anchorX="center"
        anchorY="middle"
      >
        N
      </Text>
    </group>
  )
}
