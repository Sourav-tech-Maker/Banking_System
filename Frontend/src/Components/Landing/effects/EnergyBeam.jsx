import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function EnergyBeam({ 
  points = [[0,0,0], [1,1,0], [2,0,0]], 
  color = '#00f0ff', 
  width = 0.02, 
  speed = 1, 
  opacity = 0.8 
}) {
  const materialRef = useRef()

  const curve = useMemo(() => {
    const vectors = points.map(p => new THREE.Vector3(...p))
    return new THREE.CatmullRomCurve3(vectors)
  }, [points])

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, width, 8, false)
  }, [curve, width])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 1.5 + Math.sin(state.clock.elapsedTime * speed * 3) * 0.5
      materialRef.current.opacity = opacity * (0.8 + Math.sin(state.clock.elapsedTime * speed * 2) * 0.2)
    }
  })

  return (
    <mesh geometry={tubeGeometry}>
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
        transparent
        opacity={opacity}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
