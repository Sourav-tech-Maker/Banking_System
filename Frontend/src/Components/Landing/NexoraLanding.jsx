import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { Volume2, VolumeX, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import SceneManager from './SceneManager'
import SmoothScroll from './SmoothScroll'
import { SCENE_RANGES } from './utils/constants'
import './NexoraLanding.css'

gsap.registerPlugin(ScrollTrigger)

export default function ONEOBankLanding() {
  const triggerRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeScene, setActiveScene] = useState('loading')
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const audioContextRef = useRef(null)

  // Simulation of loading progress
  useEffect(() => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setTimeout(() => setLoadingComplete(true), 500)
      }
      setLoadProgress(progress)
    }, 150)
    return () => clearInterval(interval)
  }, [])

  // Sync scroll position using GSAP ScrollTrigger
  useEffect(() => {
    if (!loadingComplete) return

    const element = triggerRef.current
    if (!element) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress
          setScrollProgress(progress)

          // Determine current active scene based on progress
          let current = 'loading'
          Object.entries(SCENE_RANGES).forEach(([key, [start, end]]) => {
            if (progress >= start && progress <= end) {
              current = key
            }
          })
          setActiveScene(current)
        },
      },
    })

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill()
      tl.kill()
    }
  }, [loadingComplete])

  // Play procedural UI sound using Web Audio API
  const playBeep = useCallback((freq, duration, type = 'sine') => {
    if (!audioEnabled) return
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioContextRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch (e) {
      console.warn('Audio play failed:', e)
    }
  }, [audioEnabled])

  // Play sound when active scene changes
  useEffect(() => {
    if (activeScene === 'loading') playBeep(220, 0.4, 'triangle')
    if (activeScene === 'hero') playBeep(293.66, 0.5, 'sine')
    if (activeScene === 'activation') playBeep(329.63, 0.3, 'sawtooth')
    if (activeScene === 'universe') playBeep(392.00, 0.6, 'sine')
    if (activeScene === 'debitCard') playBeep(440.00, 0.4, 'sine')
    if (activeScene === 'moneyFlow') playBeep(523.25, 0.3, 'sine')
    if (activeScene === 'aiEngine') playBeep(587.33, 0.6, 'triangle')
    if (activeScene === 'security') playBeep(659.25, 0.5, 'sawtooth')
    if (activeScene === 'dashboard') playBeep(698.46, 0.4, 'sine')
    if (activeScene === 'quiz') playBeep(783.99, 0.3, 'sine')
    if (activeScene === 'coins') playBeep(880.00, 0.5, 'sine')
    if (activeScene === 'finalReveal') playBeep(987.77, 0.8, 'sine')
  }, [activeScene, audioEnabled, playBeep])

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
    if (!audioEnabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  return (
    <SmoothScroll>
      {/* Loading Overlay */}
      {!loadingComplete && (
        <div className="loading-overlay">
          <div className="loading-logo font-bold uppercase tracking-widest">YONO App</div>
          <div className="loading-progress-container">
            <div className="loading-progress-bar" style={{ width: `${loadProgress}%` }} />
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Booting Core OS...</p>
        </div>
      )}

      {/* Main Container */}
      <div className="oneo-bank-landing-container" ref={triggerRef}>
        {/* Fixed WebGL Canvas */}
        <div className="canvas-container">
          <Canvas
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            camera={{ fov: 45, near: 0.1, far: 200 }}
          >
            <SceneManager scrollProgress={scrollProgress} />
          </Canvas>
        </div>

        {/* Vignette Overlay */}
        <div className="vignette-overlay" />

        {/* Global Progress Indicator */}
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress * 100}%` }} />

        {/* Audio Controller */}
        <button className="audio-controller" onClick={toggleAudio} aria-label="Toggle Audio">
          {audioEnabled ? <Volume2 className="audio-icon" /> : <VolumeX className="audio-icon" />}
        </button>

        {/* Skip Navigation to Registration */}
        <Link to="/register" className="skip-nav">
          Skip Intro
        </Link>

        {/* Scrollable Overlay Sections */}
        <div className="scroll-container">
          {/* Section 1: Loading */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'loading' ? 'active' : ''}`}>
              <h1 className="overlay-title">Initializing YONO App AI</h1>
              <p className="overlay-subtitle">Activating biometric protocols and neural core links.</p>
            </div>
          </section>

          {/* Section 2: Hero */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'hero' ? 'active' : ''}`}>
              <h1 className="overlay-title">Intelligent Banking</h1>
              <p className="overlay-subtitle">Experience the absolute future of financial freedom powered by quantum secure automation.</p>
            </div>
          </section>

          {/* Section 3: Activation */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'activation' ? 'active' : ''}`}>
              <h1 className="overlay-title">Core Activation</h1>
              <p className="overlay-subtitle">Deconstructing traditional ledger limitations to link with active data nodes.</p>
            </div>
          </section>

          {/* Section 4: Universe */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'universe' ? 'active' : ''}`}>
              <h1 className="overlay-title">Ecosystem Towers</h1>
              <p className="overlay-subtitle">A fully connected financial universe built on high-performance floating consensus systems.</p>
            </div>
          </section>

          {/* Section 5: Debit Card */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'debitCard' ? 'active' : ''}`}>
              <h1 className="overlay-title">Titanium Debit</h1>
              <p className="overlay-subtitle">Premium physical interface matching state-of-the-art cryptographic hardware.</p>
            </div>
          </section>

          {/* Section 6: Money Flow */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'moneyFlow' ? 'active' : ''}`}>
              <h1 className="overlay-title">Quantum Flow</h1>
              <p className="overlay-subtitle">Interactive particle highways mapping salary streams, investments, and instant automated savings.</p>
            </div>
          </section>

          {/* Section 7: AI Engine */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'aiEngine' ? 'active' : ''}`}>
              <h1 className="overlay-title">Neural Engine</h1>
              <p className="overlay-subtitle">Real-time spending pattern recognition optimizing asset growth automatically.</p>
            </div>
          </section>

          {/* Section 8: Security */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'security' ? 'active' : ''}`}>
              <h1 className="overlay-title">Biometric Vault</h1>
              <p className="overlay-subtitle">Concentric multi-factor authorization and encryption shields guaranteeing absolute security.</p>
            </div>
          </section>

          {/* Section 9: Dashboard */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'dashboard' ? 'active' : ''}`}>
              <h1 className="overlay-title">Command Center</h1>
              <p className="overlay-subtitle">Glassmorphic dashboard panels presenting complete liquidity metrics and real-time ledger statuses.</p>
            </div>
          </section>

          {/* Section 10: Quiz */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'quiz' ? 'active' : ''}`}>
              <h1 className="overlay-title">Arena Rewards</h1>
              <p className="overlay-subtitle">Answer weekly tech challenges to earn currency rewards distributed straight to your wallet.</p>
            </div>
          </section>

          {/* Section 11: Coins */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'coins' ? 'active' : ''}`}>
              <h1 className="overlay-title">Reward Conversion</h1>
              <p className="overlay-subtitle">Golden coins flow into your portfolio, converting immediately to system liquidity.</p>
            </div>
          </section>

          {/* Section 12: Final Reveal */}
          <section className="scroll-section">
            <div className={`overlay-content ${activeScene === 'finalReveal' ? 'active' : ''}`}>
              <h1 className="overlay-title">YONO App</h1>
              <p className="overlay-subtitle">One Platform. Infinite Intelligence.</p>
              <Link to="/register" className="overlay-cta-btn gap-2 font-bold">
                Get Started <ArrowRight className="size-5" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </SmoothScroll>
  )
}
