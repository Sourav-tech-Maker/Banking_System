import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import HolographicText from '../effects/HolographicText'
import ParticleField from '../effects/ParticleField'

function DashboardCard({ position, targetPosition, progress, title, value, color = '#00f0ff', delay = 0 }) {
  const adjustedProgress = THREE.MathUtils.clamp((progress - delay) / (1 - delay), 0, 1)
  const eased = adjustedProgress < 0.5 ? 2 * adjustedProgress * adjustedProgress : 1 - Math.pow(-2 * adjustedProgress + 2, 2) / 2

  const currentPos = [
    THREE.MathUtils.lerp(position[0], targetPosition[0], eased),
    THREE.MathUtils.lerp(position[1], targetPosition[1], eased),
    THREE.MathUtils.lerp(position[2], targetPosition[2], eased),
  ]

  return (
    <group position={currentPos}>
      <RoundedBox args={[2.2, 1.2, 0.05]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial
          color="#0f172a"
          transparent
          opacity={0.7 * eased}
          metalness={0.3}
          roughness={0.2}
          envMapIntensity={0.3}
        />
      </RoundedBox>

      {/* Card accent line */}
      <mesh position={[-0.85, 0.45, 0.03]}>
        <boxGeometry args={[0.5, 0.04, 0.01]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={eased} />
      </mesh>

      <HolographicText position={[-0.85, 0.2, 0.04]} fontSize={0.1} color="#94a3b8" opacity={eased} anchorX="left">
        {title}
      </HolographicText>
      <HolographicText position={[-0.85, -0.1, 0.04]} fontSize={0.2} color="#ffffff" opacity={eased} anchorX="left">
        {value}
      </HolographicText>
    </group>
  )
}

export default function DashboardReveal({ progress = 0, visible = true }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!visible) return
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08
    }
  })

  const cards = [
    { title: 'Total Balance', value: '₹12,45,000', color: '#00f0ff', start: [0, 8, -5], end: [-2.5, 1.5, 0], delay: 0 },
    { title: 'Monthly Spending', value: '₹1,23,450', color: '#f43f5e', start: [8, 0, -3], end: [2.5, 1.5, -0.5], delay: 0.1 },
    { title: 'Savings Goal', value: '78% Complete', color: '#10b981', start: [-8, -2, -4], end: [-2.5, -0.5, 0], delay: 0.2 },
    { title: 'AI Insights', value: '3 New Tips', color: '#8b5cf6', start: [0, -8, -6], end: [2.5, -0.5, -0.5], delay: 0.3 },
    { title: 'ONEO Bank Coins', value: '2,450 NC', color: '#f59e0b', start: [-6, 5, -3], end: [0, -2.5, -0.3], delay: 0.4 },
    { title: 'Credit Score', value: '850 / 900', color: '#00f0ff', start: [6, -5, -4], end: [0, 3.5, -0.3], delay: 0.5 },
  ]

  return (
    <group ref={groupRef} position={[0, 0, -68]} visible={visible}>
      {cards.map((card, i) => (
        <DashboardCard
          key={i}
          position={card.start}
          targetPosition={card.end}
          progress={progress}
          title={card.title}
          value={card.value}
          color={card.color}
          delay={card.delay}
        />
      ))}

      <ParticleField count={80} color="#00f0ff" size={0.015} area={12} speed={0.15} opacity={0.2} />

      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 3]} intensity={2} color="#00f0ff" distance={15} />
      <pointLight position={[-3, 3, 2]} intensity={1.5} color="#8b5cf6" distance={10} />
      <pointLight position={[3, -2, 2]} intensity={1.5} color="#f59e0b" distance={10} />
    </group>
  )
}
