import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getCameraPosition, getCameraLookAt } from './utils/cameraPath'
import { isSceneActive, getSceneProgress } from './utils/constants'

// Scenes
import LoadingExperience from './scenes/LoadingExperience'
import HeroSection from './scenes/HeroSection'
import AICoreActivation from './scenes/AICoreActivation'
import FinancialUniverse from './scenes/FinancialUniverse'
import DebitCardReveal from './scenes/DebitCardReveal'
import MoneyFlow from './scenes/MoneyFlow'
import AIEngine from './scenes/AIEngine'
import SecurityVault from './scenes/SecurityVault'
import DashboardReveal from './scenes/DashboardReveal'
import QuizArena from './scenes/QuizArena'
import CoinEcosystem from './scenes/CoinEcosystem'
import FinalReveal from './scenes/FinalReveal'

// Postprocessing
import PostProcessingEffects from './effects/PostProcessing'

export default function SceneManager({ scrollProgress }) {
  const { camera } = useThree()
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    // Initial camera position setup
    camera.position.copy(getCameraPosition(0))
    camera.lookAt(getCameraLookAt(0))
  }, [camera])

  useFrame((state, delta) => {
    // 1. Smoothly interpolate camera position along path
    const targetPos = getCameraPosition(scrollProgress)
    camera.position.lerp(targetPos, 0.1)

    // 2. Smoothly interpolate camera look-at target
    const targetLook = getCameraLookAt(scrollProgress)
    targetLookAt.current.copy(targetLook)
    currentLookAt.current.lerp(targetLookAt.current, 0.1)
    camera.lookAt(currentLookAt.current)
  })

  // Determine visibility and progress for each scene
  const s1Visible = isSceneActive(scrollProgress, 'loading')
  const s1Progress = getSceneProgress(scrollProgress, 'loading')

  const s2Visible = isSceneActive(scrollProgress, 'hero')
  const s2Progress = getSceneProgress(scrollProgress, 'hero')

  const s3Visible = isSceneActive(scrollProgress, 'activation')
  const s3Progress = getSceneProgress(scrollProgress, 'activation')

  const s4Visible = isSceneActive(scrollProgress, 'universe')
  const s4Progress = getSceneProgress(scrollProgress, 'universe')

  const s5Visible = isSceneActive(scrollProgress, 'debitCard')
  const s5Progress = getSceneProgress(scrollProgress, 'debitCard')

  const s6Visible = isSceneActive(scrollProgress, 'moneyFlow')
  const s6Progress = getSceneProgress(scrollProgress, 'moneyFlow')

  const s7Visible = isSceneActive(scrollProgress, 'aiEngine')
  const s7Progress = getSceneProgress(scrollProgress, 'aiEngine')

  const s8Visible = isSceneActive(scrollProgress, 'security')
  const s8Progress = getSceneProgress(scrollProgress, 'security')

  const s9Visible = isSceneActive(scrollProgress, 'dashboard')
  const s9Progress = getSceneProgress(scrollProgress, 'dashboard')

  const s10Visible = isSceneActive(scrollProgress, 'quiz')
  const s10Progress = getSceneProgress(scrollProgress, 'quiz')

  const s11Visible = isSceneActive(scrollProgress, 'coins')
  const s11Progress = getSceneProgress(scrollProgress, 'coins')

  const s12Visible = isSceneActive(scrollProgress, 'finalReveal')
  const s12Progress = getSceneProgress(scrollProgress, 'finalReveal')

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 5, 25]} />

      {/* Lighting environment */}
      <ambientLight intensity={0.1} />

      {/* Render active scenes */}
      <LoadingExperience progress={s1Progress} visible={s1Visible} />
      <HeroSection progress={s2Progress} visible={s2Visible} />
      <AICoreActivation progress={s3Progress} visible={s3Visible} />
      <FinancialUniverse progress={s4Progress} visible={s4Visible} />
      <DebitCardReveal progress={s5Progress} visible={s5Visible} />
      <MoneyFlow progress={s6Progress} visible={s6Visible} />
      <AIEngine progress={s7Progress} visible={s7Visible} />
      <SecurityVault progress={s8Progress} visible={s8Visible} />
      <DashboardReveal progress={s9Progress} visible={s9Visible} />
      <QuizArena progress={s10Progress} visible={s10Visible} />
      <CoinEcosystem progress={s11Progress} visible={s11Visible} />
      <FinalReveal progress={s12Progress} visible={s12Visible} />
    </>
  )
}
