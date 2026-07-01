// Color palette
export const COLORS = {
  BG_PRIMARY: '#050505',
  BG_DEEP: '#020208',
  NEON_CYAN: '#00f0ff',
  NEON_CYAN_DIM: '#007a82',
  ELECTRIC_PURPLE: '#8b5cf6',
  ELECTRIC_PURPLE_DIM: '#5b21b6',
  LUXURY_GOLD: '#f59e0b',
  LUXURY_GOLD_DIM: '#b45309',
  GLASS_WHITE: 'rgba(255, 255, 255, 0.08)',
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#94a3b8',
  ROSE: '#f43f5e',
  EMERALD: '#10b981',
}

// Scene scroll ranges — each scene gets ~8.33% of total scroll
// [startProgress, endProgress]
export const SCENE_RANGES = {
  loading:     [0.000, 0.083],
  hero:        [0.083, 0.166],
  activation:  [0.166, 0.250],
  universe:    [0.250, 0.333],
  debitCard:   [0.333, 0.416],
  moneyFlow:   [0.416, 0.500],
  aiEngine:    [0.500, 0.583],
  security:    [0.583, 0.666],
  dashboard:   [0.666, 0.750],
  quiz:        [0.750, 0.833],
  coins:       [0.833, 0.916],
  finalReveal: [0.916, 1.000],
}

// Calculate local progress within a scene
export function getSceneProgress(globalProgress, sceneKey) {
  const [start, end] = SCENE_RANGES[sceneKey]
  if (globalProgress < start) return 0
  if (globalProgress > end) return 1
  return (globalProgress - start) / (end - start)
}

// Check if a scene is active (with buffer for preloading)
export function isSceneActive(globalProgress, sceneKey, buffer = 0.05) {
  const [start, end] = SCENE_RANGES[sceneKey]
  return globalProgress >= start - buffer && globalProgress <= end + buffer
}

// Total scroll height multiplier (12 scenes × 100vh)
export const TOTAL_SCROLL_SECTIONS = 12

// Animation easing constants
export const EASE = {
  smooth: 'power2.inOut',
  snap: 'power3.out',
  elastic: 'elastic.out(1, 0.5)',
  bounce: 'bounce.out',
}
