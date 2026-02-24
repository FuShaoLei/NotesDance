import { ref, onUnmounted } from 'vue'
import { AudioAnalyzer } from '@/components/AudioAnalyzer.js'

/**
 * useAudioAnalyzer - Composable for managing audio analysis
 * Provides reactive audio data and lifecycle management
 */
export function useAudioAnalyzer() {
  const analyzer = new AudioAnalyzer()
  const isRunning = ref(false)
  const bassLevel = ref(0)
  const midLevel = ref(0)
  const trebleLevel = ref(0)
  const volumeLevel = ref(0)

  let updateInterval = null

  /**
   * Start audio capture and begin updating reactive data
   * @param {string} mode - 'mic' for microphone or 'system' for system audio
   */
  const start = async (mode = 'mic') => {
    try {
      await analyzer.start(mode)
      isRunning.value = true

      // Update reactive data 60 times per second
      updateInterval = setInterval(() => {
        bassLevel.value = analyzer.getBassLevel()
        midLevel.value = analyzer.getMidLevel()
        trebleLevel.value = analyzer.getTrebleLevel()
        volumeLevel.value = analyzer.getVolumeLevel()
      }, 1000 / 60)
    } catch (error) {
      console.error('Failed to start audio analyzer:', error)
      throw error
    }
  }

  /**
   * Stop audio capture and clean up
   */
  const stop = () => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
    analyzer.stop()
    isRunning.value = false
    bassLevel.value = 0
    midLevel.value = 0
    trebleLevel.value = 0
    volumeLevel.value = 0
  }

  // Clean up on component unmount
  onUnmounted(() => {
    stop()
  })

  return {
    analyzer,
    isRunning,
    bassLevel,
    midLevel,
    trebleLevel,
    volumeLevel,
    start,
    stop
  }
}
