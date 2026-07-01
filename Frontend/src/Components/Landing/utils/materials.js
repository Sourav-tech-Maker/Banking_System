import * as THREE from 'three'

// Brushed Titanium — premium metallic surface
export function createTitaniumMaterial(color = '#c0c0c8') {
  return {
    color,
    metalness: 0.92,
    roughness: 0.28,
    envMapIntensity: 1.5,
  }
}

// Chrome — mirror-like reflections
export function createChromeMaterial(color = '#e8e8f0') {
  return {
    color,
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 2.0,
  }
}

// Frosted Glass — translucent with blur
export function createGlassMaterial(color = '#ffffff', opacity = 0.15) {
  return {
    color,
    transparent: true,
    opacity,
    metalness: 0.1,
    roughness: 0.2,
    envMapIntensity: 0.5,
  }
}

// Neon Glow — emissive material for energy effects
export function createGlowMaterial(color = '#00f0ff', intensity = 2.0) {
  return {
    color,
    emissive: color,
    emissiveIntensity: intensity,
    transparent: true,
    opacity: 0.9,
    toneMapped: false,
  }
}

// Carbon Fiber — dark textured surface
export function createCarbonFiberMaterial() {
  return {
    color: '#1a1a2e',
    metalness: 0.7,
    roughness: 0.4,
    envMapIntensity: 0.8,
  }
}

// Holographic — iridescent shimmer
export function createHolographicMaterial(color = '#8b5cf6') {
  return {
    color,
    metalness: 0.8,
    roughness: 0.15,
    envMapIntensity: 2.5,
    emissive: color,
    emissiveIntensity: 0.3,
  }
}

// Gold — luxury metallic
export function createGoldMaterial() {
  return {
    color: '#f59e0b',
    metalness: 0.95,
    roughness: 0.2,
    envMapIntensity: 1.8,
    emissive: '#b45309',
    emissiveIntensity: 0.15,
  }
}
