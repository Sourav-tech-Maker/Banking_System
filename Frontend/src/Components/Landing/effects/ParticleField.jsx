import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ParticleField({ count = 500, color = '#00f0ff', size = 0.03, area = 20, speed = 0.3, opacity = 0.7 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * area,
          (Math.random() - 0.5) * area,
          (Math.random() - 0.5) * area,
        ],
        speed: Math.random() * speed + 0.1,
        offset: Math.random() * Math.PI * 2,
        scale: Math.random() * 0.5 + 0.5,
      })
    }
    return temp
  }, [count, area, speed])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime

    particles.forEach((particle, i) => {
      const { position, speed: pSpeed, offset, scale } = particle
      dummy.position.set(
        position[0] + Math.sin(time * pSpeed + offset) * 0.5,
        position[1] + Math.cos(time * pSpeed * 0.8 + offset) * 0.5,
        position[2] + Math.sin(time * pSpeed * 0.6 + offset * 2) * 0.3
      )
      dummy.scale.setScalar(size * scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
    </instancedMesh>
  )
}
