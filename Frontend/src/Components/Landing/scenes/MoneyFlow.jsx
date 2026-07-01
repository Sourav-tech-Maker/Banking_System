import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import EnergyBeam from '../effects/EnergyBeam'
import HolographicText from '../effects/HolographicText'
import ParticleField from '../effects/ParticleField'

// Flowing particles along a path
function FlowParticles({ path, count = 50, color = '#00f0ff', speed = 1 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(path.map(p => new THREE.Vector3(...p)))
  }, [path])

  const offsets = useMemo(() => {
    return Array.from({ length: count }, () => Math.random())
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime

    offsets.forEach((offset, i) => {
      const t = ((time * speed * 0.1 + offset) % 1)
      const pos = curve.getPoint(t)
      dummy.position.copy(pos)
      dummy.scale.setScalar(0.04)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.9} />
    </instancedMesh>
  )
}

export default function MoneyFlow({ progress = 0, visible = true }) {
  const flowOpacity = Math.min(1, progress * 2)

  // Define flow paths for different financial streams
  const salaryPath = [[-6, 2, 0], [-3, 1, -1], [0, 0, 0], [3, -1, 1], [6, 0, 0]]
  const savingsPath = [[-5, -1, 1], [-2, 0, 0], [0, 1, -1], [2, 2, 0], [5, 3, 1]]
  const investPath = [[0, 3, -2], [1, 1, -1], [3, 0, 0], [5, -1, 1], [7, -2, 2]]
  const expensePath = [[-4, 0, 2], [-1, -1, 1], [1, -2, 0], [4, -1, -1], [6, 0, -2]]

  return (
    <group position={[0, 0, -38]} visible={visible}>
      {/* Financial flow pipelines */}
      <EnergyBeam points={salaryPath} color="#10b981" width={0.025} speed={1} opacity={flowOpacity * 0.6} />
      <EnergyBeam points={savingsPath} color="#00f0ff" width={0.02} speed={0.8} opacity={flowOpacity * 0.5} />
      <EnergyBeam points={investPath} color="#f59e0b" width={0.02} speed={1.2} opacity={flowOpacity * 0.5} />
      <EnergyBeam points={expensePath} color="#f43f5e" width={0.015} speed={0.9} opacity={flowOpacity * 0.4} />

      {/* Flowing particles along paths */}
      <FlowParticles path={salaryPath} count={40} color="#10b981" speed={1.5} />
      <FlowParticles path={savingsPath} count={30} color="#00f0ff" speed={1.2} />
      <FlowParticles path={investPath} count={35} color="#f59e0b" speed={1.8} />
      <FlowParticles path={expensePath} count={25} color="#f43f5e" speed={1.0} />

      {/* Labels for each flow */}
      <HolographicText position={[-6, 2.5, 0]} fontSize={0.2} color="#10b981" opacity={flowOpacity * 0.8}>
        Salary Flow
      </HolographicText>
      <HolographicText position={[-5, -1.5, 1]} fontSize={0.2} color="#00f0ff" opacity={flowOpacity * 0.8}>
        Savings
      </HolographicText>
      <HolographicText position={[0, 3.5, -2]} fontSize={0.2} color="#f59e0b" opacity={flowOpacity * 0.8}>
        Investments
      </HolographicText>
      <HolographicText position={[-4, 0.5, 2]} fontSize={0.2} color="#f43f5e" opacity={flowOpacity * 0.8}>
        Expenses
      </HolographicText>

      {/* Central hub */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
          toneMapped={false}
          wireframe
        />
      </mesh>

      <ParticleField count={100} color="#00f0ff" size={0.015} area={18} speed={0.2} opacity={0.25} />

      {/* Lighting */}
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#00f0ff" distance={15} />
      <pointLight position={[-5, 2, 0]} intensity={2} color="#10b981" distance={10} />
      <pointLight position={[5, -1, 1]} intensity={2} color="#f59e0b" distance={10} />
    </group>
  )
}
