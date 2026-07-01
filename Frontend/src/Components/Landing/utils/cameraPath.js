import * as THREE from 'three'

// Camera position keyframes — one per scene transition point
const POSITION_POINTS = [
  new THREE.Vector3(0, 0, 15),      // Scene 1: Loading — far away, centered
  new THREE.Vector3(0, 0, 8),       // Scene 2: Hero — orbit distance
  new THREE.Vector3(0, 0, 3),       // Scene 3: Activation — close to core
  new THREE.Vector3(0, 0, -2),      // Scene 3→4: Inside core, traveling through
  new THREE.Vector3(5, 3, -15),     // Scene 4: Universe — elevated view
  new THREE.Vector3(-3, 1, -25),    // Scene 5: Debit Card — side angle
  new THREE.Vector3(0, 0, -35),     // Scene 6: Money Flow — centered
  new THREE.Vector3(0, 2, -45),     // Scene 7: AI Engine — slightly above
  new THREE.Vector3(0, 0, -55),     // Scene 8: Security — straight ahead
  new THREE.Vector3(0, 1, -65),     // Scene 9: Dashboard — slightly elevated
  new THREE.Vector3(3, 0, -75),     // Scene 10: Quiz — offset right
  new THREE.Vector3(0, 0, -85),     // Scene 11: Coins — centered
  new THREE.Vector3(0, 5, -100),    // Scene 12: Final — zoom out elevated
]

// Camera look-at targets — where the camera points at each keyframe
const LOOKAT_POINTS = [
  new THREE.Vector3(0, 0, 0),       // Scene 1: Center
  new THREE.Vector3(0, 0, 0),       // Scene 2: Core center
  new THREE.Vector3(0, 0, -5),      // Scene 3: Into the core
  new THREE.Vector3(0, 0, -10),     // Scene 3→4: Forward
  new THREE.Vector3(0, 0, -20),     // Scene 4: City center
  new THREE.Vector3(0, 0, -28),     // Scene 5: Card position
  new THREE.Vector3(0, 0, -40),     // Scene 6: Flow center
  new THREE.Vector3(0, 0, -50),     // Scene 7: Network center
  new THREE.Vector3(0, 0, -60),     // Scene 8: Vault center
  new THREE.Vector3(0, 0, -70),     // Scene 9: Dashboard center
  new THREE.Vector3(0, 0, -80),     // Scene 10: Arena center
  new THREE.Vector3(0, 0, -90),     // Scene 11: Coin center
  new THREE.Vector3(0, 0, -95),     // Scene 12: Everything
]

// Create smooth curves from keyframes
const positionCurve = new THREE.CatmullRomCurve3(POSITION_POINTS, false, 'catmullrom', 0.5)
const lookAtCurve = new THREE.CatmullRomCurve3(LOOKAT_POINTS, false, 'catmullrom', 0.5)

// Get interpolated camera position at a given progress (0 to 1)
export function getCameraPosition(progress) {
  const t = THREE.MathUtils.clamp(progress, 0, 1)
  return positionCurve.getPoint(t)
}

// Get interpolated look-at target at a given progress (0 to 1)
export function getCameraLookAt(progress) {
  const t = THREE.MathUtils.clamp(progress, 0, 1)
  return lookAtCurve.getPoint(t)
}

// Get both position and lookAt for a given progress
export function getCameraState(progress) {
  return {
    position: getCameraPosition(progress),
    lookAt: getCameraLookAt(progress),
  }
}

export { positionCurve, lookAtCurve }
