// Shared Speech Recognition Service
// This prevents conflicts when multiple components try to use speech recognition

interface SpeechRecognitionCallbacks {
  onStart?: () => void
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
  onEnd?: () => void
}

class SpeechRecognitionService {
  private static instance: SpeechRecognitionService
  private recognition: any = null
  private isActive = false
  private currentCallbacks: SpeechRecognitionCallbacks | null = null
  private currentComponent: string = ''
  private currentLang: 'en-IN' | 'hi-IN' | 'pa-IN' = 'en-IN'

  private constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.lang = this.currentLang
        this.recognition.maxAlternatives = 1
        this.recognition.serviceURI = ''

        this.recognition.onstart = () => {
          this.isActive = true
          console.log('SpeechRecognitionService: Recognition started')
          this.currentCallbacks?.onStart?.()
        }

        this.recognition.onresult = (event: any) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          // Always send interim results for real-time display
          if (interimTranscript) {
            this.currentCallbacks?.onResult?.(interimTranscript, false)
          }
          
          // Send final results when complete
          if (finalTranscript) {
            this.currentCallbacks?.onResult?.(finalTranscript, true)
          }
        }

        this.recognition.onerror = (event: any) => {
          console.error('SpeechRecognitionService: Error:', event.error)
          this.isActive = false
          this.currentCallbacks?.onError?.(event.error)
        }

        this.recognition.onend = () => {
          this.isActive = false
          console.log('SpeechRecognitionService: Recognition ended')
          this.currentCallbacks?.onEnd?.()
        }
      }
    }
  }

  public static getInstance(): SpeechRecognitionService {
    if (!SpeechRecognitionService.instance) {
      SpeechRecognitionService.instance = new SpeechRecognitionService()
    }
    return SpeechRecognitionService.instance
  }

  public startRecognition(callbacks: SpeechRecognitionCallbacks, componentName: string = 'unknown'): boolean {
    if (!this.recognition) {
      console.error('SpeechRecognitionService: Speech recognition not supported')
      return false
    }

    // If already active, stop current recognition and take control
    if (this.isActive) {
      console.log(`SpeechRecognitionService: Stopping ${this.currentComponent} for ${componentName}`)
      this.stopRecognition()
    }

    this.currentCallbacks = callbacks
    this.currentComponent = componentName
    this.isActive = true

    try {
      // Ensure recognition uses latest language
      if (this.recognition) {
        this.recognition.lang = this.currentLang
      }
      this.recognition.start()
      console.log(`SpeechRecognitionService: Started recognition for ${componentName}`)
      return true
    } catch (error) {
      console.error('SpeechRecognitionService: Failed to start recognition:', error)
      this.isActive = false
      this.currentCallbacks = null
      this.currentComponent = ''
      return false
    }
  }

  public setLanguage(lang: 'en' | 'hi' | 'pa') {
    const mapped: 'en-IN' | 'hi-IN' | 'pa-IN' = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : 'en-IN'
    this.currentLang = mapped
    if (this.recognition) {
      this.recognition.lang = mapped
      console.log('SpeechRecognitionService: Language set to', mapped)
    }
  }

  public stopRecognition(): void {
    if (this.recognition && this.isActive) {
      try {
        this.recognition.stop()
        console.log(`SpeechRecognitionService: Stopped recognition for ${this.currentComponent}`)
      } catch (error) {
        console.error('SpeechRecognitionService: Failed to stop recognition:', error)
      }
    }
    this.isActive = false
    this.currentCallbacks = null
    this.currentComponent = ''
  }

  public isRecognitionActive(): boolean {
    return this.isActive
  }

  public getCurrentComponent(): string {
    return this.currentComponent
  }
}

export default SpeechRecognitionService
