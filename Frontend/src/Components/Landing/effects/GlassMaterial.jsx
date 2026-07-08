// Helper component for inline use in JSX
export default function GlassPanel({ children, width = 2, height = 1, position = [0, 0, 0], rotation = [0, 0, 0], opacity = 0.12, color = '#ffffff', ...props }) {
  return (
    <mesh position={position} rotation={rotation} {...props}>
      <planeGeometry args={[width, height]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={opacity}
        roughness={0.15}
        metalness={0.1}
        side={2}
        envMapIntensity={0.3}
      />
      {children}
    </mesh>
  )
}
