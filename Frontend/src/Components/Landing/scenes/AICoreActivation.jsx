import { useRef } from 'react'
import AICore from '../objects/AICore'
import EnergyBeam from '../effects/EnergyBeam'
import ParticleField from '../effects/ParticleField'

export default function AICoreActivation({ progress = 0, visible = true }) {
  const groupRef = useRef()

  // Energy beams appear as core disassembles
  const beamOpacity = Math.min(1, progress * 2)

  return (
    <group ref={groupRef} visible={visible}>
      <AICore position={[0, 0, 0]} disassembled={true} progress={progress} />

      {/* Energy beams flowing through */}
      {progress > 0.2 && (
        <>
          <EnergyBeam
            points={[[-3, 0, 0], [-1, 0.5, -1], [0, 0, -2], [1, -0.5, -4], [3, 0, -6]]}
            color="#00f0ff"
            width={0.015}
            speed={2}
            opacity={beamOpacity * 0.7}
          />
          <EnergyBeam
            points={[[2, 1, 0], [0.5, -0.3, -1], [0, 0.3, -3], [-1, 0, -5], [-2, 0.5, -7]]}
            color="#8b5cf6"
            width={0.012}
            speed={1.5}
            opacity={beamOpacity * 0.6}
          />
          <EnergyBeam
            points={[[0, 2, 1], [0, 0.8, -1], [0, -0.5, -3], [0, 0.2, -5], [0, -1, -8]]}
            color="#f59e0b"
            width={0.018}
            speed={1.8}
            opacity={beamOpacity * 0.5}
          />
        </>
      )}

      <ParticleField count={150} color="#00f0ff" size={0.02} area={10} speed={0.5} opacity={0.6 * progress} />

      {/* Intensifying light as we enter the core */}
      <ambientLight intensity={0.1 + progress * 0.2} />
      <pointLight position={[0, 0, 0]} intensity={2 + progress * 8} color="#00f0ff" distance={15} />
      <pointLight position={[0, 0, -5]} intensity={progress * 5} color="#8b5cf6" distance={10} />
    </group>
  )
}
