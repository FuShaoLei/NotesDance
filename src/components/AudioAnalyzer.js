/**
 * AudioAnalyzer - Core audio analysis logic
 * Handles Web Audio API setup and provides audio data analysis methods
 */
export class AudioAnalyzer {
  constructor() {
    this.audioContext = null
    this.analyser = null
    this.source = null
    this.dataArray = null
    this.waveformDataArray = null
    this.isInitialized = false
  }

  /**
   * Initialize audio context and get audio access
   * @param {string} mode - 'mic' for microphone or 'system' for system audio
   */
  async start(mode = 'mic') {
    if (this.isInitialized) {
      return
    }

    try {
      let stream

      if (mode === 'system') {
        // Get system audio via screen sharing (requires "Share system audio" to be checked)
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true, // Required to get the dialog
          audio: true  // Must check "Share system audio" in browser dialog
        })

        // Stop video tracks immediately (we only need audio)
        stream.getVideoTracks().forEach(track => track.stop())
      } else {
        // Get microphone access
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      // Create AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Create AnalyserNode
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.8

      // Connect audio source to analyser
      this.source = this.audioContext.createMediaStreamSource(stream)
      this.source.connect(this.analyser)

      // Store stream for cleanup
      this.stream = stream

      // Create data arrays
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)
      this.waveformDataArray = new Uint8Array(bufferLength)

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error)
      throw error
    }
  }

  /**
   * Get frequency domain data (0-255)
   * @returns {Uint8Array} Frequency data
   */
  getFrequencyData() {
    if (!this.isInitialized) {
      return new Uint8Array(0)
    }
    this.analyser.getByteFrequencyData(this.dataArray)
    return this.dataArray
  }

  /**
   * Get time domain data (waveform)
   * @returns {Uint8Array} Waveform data
   */
  getWaveformData() {
    if (!this.isInitialized) {
      return new Uint8Array(0)
    }
    this.analyser.getByteTimeDomainData(this.waveformDataArray)
    return this.waveformDataArray
  }

  /**
   * Get bass level (low frequencies)
   * @returns {number} Average bass level (0-255)
   */
  getBassLevel() {
    const data = this.getFrequencyData()
    if (data.length === 0) return 0

    // Bass frequencies are roughly in the first 10% of the spectrum
    const bassRange = Math.floor(data.length * 0.1)
    let sum = 0
    for (let i = 0; i < bassRange; i++) {
      sum += data[i]
    }
    return sum / bassRange
  }

  /**
   * Get mid level (middle frequencies)
   * @returns {number} Average mid level (0-255)
   */
  getMidLevel() {
    const data = this.getFrequencyData()
    if (data.length === 0) return 0

    // Mid frequencies are roughly in the 10%-50% range
    const start = Math.floor(data.length * 0.1)
    const end = Math.floor(data.length * 0.5)
    let sum = 0
    for (let i = start; i < end; i++) {
      sum += data[i]
    }
    return sum / (end - start)
  }

  /**
   * Get treble level (high frequencies)
   * @returns {number} Average treble level (0-255)
   */
  getTrebleLevel() {
    const data = this.getFrequencyData()
    if (data.length === 0) return 0

    // Treble frequencies are roughly in the 50%-100% range
    const start = Math.floor(data.length * 0.5)
    const end = data.length
    let sum = 0
    for (let i = start; i < end; i++) {
      sum += data[i]
    }
    return sum / (end - start)
  }

  /**
   * Get overall volume level
   * @returns {number} Average volume level (0-255)
   */
  getVolumeLevel() {
    const data = this.getFrequencyData()
    if (data.length === 0) return 0

    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i]
    }
    return sum / data.length
  }

  /**
   * Stop and clean up audio resources
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }
    if (this.source) {
      this.source.disconnect()
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
    this.isInitialized = false
  }
}
