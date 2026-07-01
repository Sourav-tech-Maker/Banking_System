import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function NeuralNetwork({ progress = 0, position = [0, 0, 0] }) {
  const groupRef = useRef()
  const nodesRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const { nodes, connections } = useMemo(() => {
    const layerSizes = [6, 10, 12, 10, 6]
    const layerSpacing = 2.5
    const nodeList = []
    const connList = []

    layerSizes.forEach((count, layerIndex) => {
      const xOffset = (layerIndex - (layerSizes.length - 1) / 2) * layerSpacing
      for (let i = 0; i < count; i++) {
        const yOffset = (i - (count - 1) / 2) * 0.8
        const zJitter = (Math.random() - 0.5) * 0.5
        nodeList.push({
          position: [xOffset, yOffset, zJitter],
          layer: layerIndex,
          index: nodeList.length,
          activationThreshold: (layerIndex / (layerSizes.length - 1)) * 0.8 + Math.random() * 0.2,
        })
      }
    })

    // Create connections between adjacent layers
    let startIdx = 0
    for (let l = 0; l < layerSizes.length - 1; l++) {
      const nextStart = startIdx + layerSizes[l]
      for (let i = startIdx; i < startIdx + layerSizes[l]; i++) {
        // Connect to 2-3 random nodes in next layer
        const connectCount = Math.min(3, layerSizes[l + 1])
        const shuffled = Array.from({ length: layerSizes[l + 1] }, (_, k) => nextStart + k)
          .sort(() => Math.random() - 0.5)
          .slice(0, connectCount)

        shuffled.forEach(j => {
          connList.push({
            from: nodeList[i].position,
            to: nodeList[j].position,
            threshold: Math.max(nodeList[i].activationThreshold, nodeList[j].activationThreshold),
          })
        })
      }
      startIdx = nextStart
    }

    return { nodes: nodeList, connections: connList }
  }, [])

  useFrame(() => {
    if (!nodesRef.current) return

    nodes.forEach((node, i) => {
      const isActive = progress >= node.activationThreshold
      dummy.position.set(...node.position)
      dummy.scale.setScalar(isActive ? 0.12 : 0.06)
      dummy.updateMatrix()
      nodesRef.current.setMatrixAt(i, dummy.matrix)
    })
    nodesRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Nodes */}
      <instancedMesh ref={nodesRef} args={[null, null, nodes.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Connections */}
      {connections.map((conn, i) => {
        const isActive = progress >= conn.threshold
        const points = [new THREE.Vector3(...conn.from), new THREE.Vector3(...conn.to)]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color={isActive ? '#00f0ff' : '#1a1a3e'}
              transparent
              opacity={isActive ? 0.6 : 0.1}
              toneMapped={false}
            />
          </line>
        )
      })}
    </group>
  )
}
