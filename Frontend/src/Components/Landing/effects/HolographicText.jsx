import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function HolographicText({ 
  children, 
  position = [0, 0, 0], 
  fontSize = 0.5, 
  color = '#00f0ff', 
  opacity = 1,
  anchorX = 'center',
  anchorY = 'middle',
  ...props 
}) {
  const materialRef = useRef()

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.opacity = opacity * (0.85 + Math.sin(state.clock.elapsedTime * 2) * 0.15)
    }
  })

  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      anchorX={anchorX}
      anchorY={anchorY}
      {...props}
    >
      {children}
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={opacity}
        toneMapped={false}
      />
    </Text>
  )
}
