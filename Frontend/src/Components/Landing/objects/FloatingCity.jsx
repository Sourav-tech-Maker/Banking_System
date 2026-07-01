import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function FloatingCity({ position = [0, 0, 0] }) {
  const buildingsRef = useRef()
  const platformsRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const buildings = useMemo(() => {
    const list = []
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 20
      const z = (Math.random() - 0.5) * 15
      const height = Math.random() * 6 + 2
      const width = Math.random() * 0.8 + 0.4
      const depth = Math.random() * 0.8 + 0.4
      list.push({ x, z, height, width, depth, y: height / 2 - 1 })
    }
    return list
  }, [])

  const platforms = useMemo(() => {
    const list = []
    for (let i = 0; i < 10; i++) {
      list.push({
        x: (Math.random() - 0.5) * 16,
        y: Math.random() * 3 + 1,
        z: (Math.random() - 0.5) * 12,
        width: Math.random() * 2 + 1,
        depth: Math.random() * 2 + 1,
      })
    }
    return list
  }, [])

  useFrame((state) => {
    if (!buildingsRef.current) return
    const time = state.clock.elapsedTime

    buildings.forEach((b, i) => {
      dummy.position.set(b.x, b.y + Math.sin(time * 0.3 + i) * 0.1, b.z)
      dummy.scale.set(b.width, b.height, b.depth)
      dummy.updateMatrix()
      buildingsRef.current.setMatrixAt(i, dummy.matrix)
    })
    buildingsRef.current.instanceMatrix.needsUpdate = true

    if (!platformsRef.current) return
    platforms.forEach((p, i) => {
      dummy.position.set(p.x, p.y + Math.sin(time * 0.5 + i * 2) * 0.15, p.z)
      dummy.scale.set(p.width, 0.05, p.depth)
      dummy.updateMatrix()
      platformsRef.current.setMatrixAt(i, dummy.matrix)
    })
    platformsRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={position}>
      {/* Buildings */}
      <instancedMesh ref={buildingsRef} args={[null, null, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0.85}
          roughness={0.3}
          emissive="#0a0a1a"
          emissiveIntensity={0.5}
          envMapIntensity={1.2}
        />
      </instancedMesh>

      {/* Glass platforms */}
      <instancedMesh ref={platformsRef} args={[null, null, platforms.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          metalness={0.1}
          roughness={0.15}
          envMapIntensity={0.3}
        />
      </instancedMesh>

      {/* Glowing window lights on buildings */}
      {buildings.slice(0, 15).map((b, i) => {
        const windowCount = Math.floor(b.height / 0.8)
        return Array.from({ length: Math.min(windowCount, 5) }).map((_, j) => (
          <mesh key={`w-${i}-${j}`} position={[
            b.x + (i % 2 === 0 ? b.width * 0.51 : -b.width * 0.51),
            j * 0.8 + 0.5,
            b.z
          ]}>
            <planeGeometry args={[0.15, 0.1]} />
            <meshBasicMaterial
              color={j % 3 === 0 ? '#00f0ff' : j % 3 === 1 ? '#8b5cf6' : '#f59e0b'}
              toneMapped={false}
            />
          </mesh>
        ))
      })}
    </group>
  )
}
