import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export default function PostProcessingEffects({ 
  bloomIntensity = 1.2, 
  bloomThreshold = 0.3,
  bloomRadius = 0.8,
  vignetteOffset = 0.3,
  vignetteDarkness = 0.7,
}) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom 
        intensity={bloomIntensity} 
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.9}
        radius={bloomRadius}
        mipmapBlur
      />
      <Vignette 
        offset={vignetteOffset} 
        darkness={vignetteDarkness} 
      />
    </EffectComposer>
  )
}
