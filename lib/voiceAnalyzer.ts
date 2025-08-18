// Voice Analyzer using Web Audio API
// Provides real-time voice activity detection and frequency analysis

export class VoiceAnalyzer {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private stream: MediaStream | null = null
  private isActive = false
  private animationFrame: number | null = null
  private onVoiceActivity?: (activity: number, frequencies: number[]) => void

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  async start(onVoiceActivity: (activity: number, frequencies: number[]) => void) {
    if (!this.audioContext || this.isActive) return false

    try {
      this.onVoiceActivity = onVoiceActivity
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      })

      this.microphone = this.audioContext.createMediaStreamSource(this.stream)
      this.analyser = this.audioContext.createAnalyser()
      
      this.analyser.fftSize = 256
      this.analyser.smoothingTimeConstant = 0.8
      this.analyser.minDecibels = -90
      this.analyser.maxDecibels = -10

      this.microphone.connect(this.analyser)
      this.isActive = true

      this.analyze()
      return true
    } catch (error) {
      console.error('Failed to start voice analyzer:', error)
      return false
    }
  }

  private analyze() {
    if (!this.analyser || !this.isActive) return

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const frequencies = new Array(bufferLength)

    this.analyser.getByteFrequencyData(dataArray)

    // Convert to frequency data
    for (let i = 0; i < bufferLength; i++) {
      frequencies[i] = dataArray[i] / 255
    }

    // Calculate voice activity (focus on human speech frequencies: 85-255 Hz)
    const speechFrequencies = frequencies.slice(2, 8) // Roughly 85-255 Hz range
    const activity = speechFrequencies.reduce((sum, freq) => sum + freq, 0) / speechFrequencies.length

    this.onVoiceActivity?.(activity, frequencies)

    this.animationFrame = requestAnimationFrame(() => this.analyze())
  }

  stop() {
    this.isActive = false
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }

    if (this.microphone) {
      this.microphone.disconnect()
      this.microphone = null
    }

    this.analyser = null
  }

  isAnalyzing() {
    return this.isActive
  }
}

export default VoiceAnalyzer
