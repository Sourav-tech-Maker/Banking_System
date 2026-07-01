import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import ParticleField from '../effects/ParticleField'

export default function LoadingExperience({ progress = 0, visible = true }) {
  const groupRef = useRef()
  const convergenceRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Converging particles — they start scattered and move toward center
  const particleData = useMemo(() => {
    const data = []
    for (let i = 0; i < 150; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const startRadius = 8 + Math.random() * 12
      const endRadius = 0.8 + Math.random() * 0.3

      data.push({
        startPos: [
          startRadius * Math.sin(phi) * Math.cos(theta),
          startRadius * Math.sin(phi) * Math.sin(theta),
          startRadius * Math.cos(phi),
        ],
        endPos: [
          endRadius * Math.sin(phi) * Math.cos(theta),
          endRadius * Math.sin(phi) * Math.sin(theta),
          endRadius * Math.cos(phi),
        ],
        speed: Math.random() * 0.5 + 0.5,
      })
    }
    return data
  }, [])

  useFrame((state) => {
    if (!convergenceRef.current || !visible) return
    const time = state.clock.elapsedTime

    particleData.forEach((p, i) => {
      const t = THREE.MathUtils.clamp(progress * p.speed * 1.5, 0, 1)
      // Ease in
      const eased = t * t * (3 - 2 * t)

      dummy.position.set(
        THREE.MathUtils.lerp(p.startPos[0], p.endPos[0], eased) + Math.sin(time + i) * 0.05 * (1 - eased),
        THREE.MathUtils.lerp(p.startPos[1], p.endPos[1], eased) + Math.cos(time * 1.3 + i) * 0.05 * (1 - eased),
        THREE.MathUtils.lerp(p.startPos[2], p.endPos[2], eased) + Math.sin(time * 0.7 + i * 2) * 0.05 * (1 - eased)
      )
      const scale = 0.02 + eased * 0.03
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      convergenceRef.current.setMatrixAt(i, dummy.matrix)
    })
    convergenceRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={groupRef} visible={visible}>
      {/* Background particles */}
      <ParticleField count={100} color="#00f0ff" size={0.015} area={30} speed={0.1} opacity={0.3 * (1 - progress)} />

      {/* Converging particles */}
      <instancedMesh ref={convergenceRef} args={[null, null, particleData.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} toneMapped={false} />
      </instancedMesh>

      {/* Core glow that appears as particles converge */}
      <mesh scale={progress * 1.2}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#1e40af"
          emissiveIntensity={progress * 3}
          transparent
          opacity={progress * 0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Ambient light that brightens with progress */}
      <ambientLight intensity={0.05 + progress * 0.1} />
      <pointLight position={[0, 0, 0]} intensity={progress * 5} color="#00f0ff" distance={15} />
    </group>
  )
}
