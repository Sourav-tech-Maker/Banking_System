import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import NeuralNetwork from '../objects/NeuralNetwork'
import ParticleField from '../effects/ParticleField'
import HolographicText from '../effects/HolographicText'

export default function AIEngine({ progress = 0, visible = true }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!visible) return
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.15
    }
  })

  const analysisVisible = progress > 0.4
  const analysisOpacity = analysisVisible ? Math.min(1, (progress - 0.4) / 0.3) : 0

  return (
    <group ref={groupRef} position={[0, 0, -48]} visible={visible}>
      <NeuralNetwork progress={progress} position={[0, 0, 0]} />

      {/* AI Analysis Labels */}
      {analysisVisible && (
        <>
          <HolographicText position={[-4, 3, 2]} fontSize={0.15} color="#00f0ff" opacity={analysisOpacity}>
            Income Analysis
          </HolographicText>
          <HolographicText position={[4, 2.5, -1]} fontSize={0.15} color="#8b5cf6" opacity={analysisOpacity}>
            Spending Patterns
          </HolographicText>
          <HolographicText position={[-3, -2, 1]} fontSize={0.15} color="#10b981" opacity={analysisOpacity}>
            Savings Optimization
          </HolographicText>
          <HolographicText position={[3, -2.5, -2]} fontSize={0.15} color="#f59e0b" opacity={analysisOpacity}>
            Investment Strategy
          </HolographicText>
          <HolographicText position={[0, 3.5, 0]} fontSize={0.15} color="#f43f5e" opacity={analysisOpacity}>
            Credit Score: 850
          </HolographicText>
          <HolographicText position={[0, -3.5, 0]} fontSize={0.15} color="#00f0ff" opacity={analysisOpacity}>
            Financial Goals: On Track
          </HolographicText>
        </>
      )}

      {/* Holographic data rings */}
      {[1.5, 2.5, 3.5].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius + progress * 2, 0.008, 8, 100]} />
          <meshBasicMaterial
            color={['#00f0ff', '#8b5cf6', '#f59e0b'][i]}
            transparent
            opacity={0.2 + progress * 0.3}
            toneMapped={false}
          />
        </mesh>
      ))}

      <ParticleField count={100} color="#00f0ff" size={0.015} area={15} speed={0.3} opacity={0.3} />

      {/* Lighting */}
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 0, 0]} intensity={3 + progress * 5} color="#00f0ff" distance={20} />
      <pointLight position={[5, 3, 3]} intensity={2} color="#8b5cf6" distance={15} />
      <pointLight position={[-5, -2, -3]} intensity={2} color="#f59e0b" distance={12} />
    </group>
  )
}
