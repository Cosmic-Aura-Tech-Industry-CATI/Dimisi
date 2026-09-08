/**
 * DIMISI AI — Voice Assistant Service
 * Provides Speech-to-Text (Web Speech API) and Text-to-Speech (SpeechSynthesis).
 * Fully graceful fallback on unsupported browsers.
 */

// Declare browser SpeechRecognition types safely
type SpeechRecognitionInstance = any;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition,
  );
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.speechSynthesis);
}

export interface VoiceListenerOptions {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  language?: string;
}

export class VoiceAssistant {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Starts Speech-to-Text listening with explicit user gesture
   */
  public startListening(options: VoiceListenerOptions): boolean {
    if (!isSpeechRecognitionSupported()) {
      options.onError("Voice input is not supported in this browser. You can type your question instead.");
      return false;
    }

    try {
      this.stopListening();

      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = options.language || "en-US";

      recognition.onstart = () => {
        this.isListening = true;
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          options.onResult(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        this.isListening = false;
        let msg = "Microphone error. Please try typing instead.";
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          msg = "Microphone access was denied. Please allow microphone permissions to speak.";
        } else if (event.error === "no-speech") {
          msg = "No speech detected. Please try again.";
        }
        options.onError(msg);
      };

      recognition.onend = () => {
        this.isListening = false;
        options.onEnd();
      };

      recognition.start();
      this.recognition = recognition;
      return true;
    } catch (err) {
      this.isListening = false;
      options.onError("Could not initialize microphone.");
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Safe ignore
      }
    }
    this.recognition = null;
    this.isListening = false;
  }

  /**
   * Reads text aloud using native SpeechSynthesis
   */
  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
  ): boolean {
    if (!isSpeechSynthesisSupported()) return false;

    this.stopSpeaking();

    try {
      // Clean markdown/bullet formatting for natural speech
      const cleanText = text
        .replace(/·/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[\*\_\#]/g, "")
        .trim();

      if (!cleanText) return false;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }

  public stopSpeaking(): void {
    if (isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe ignore
      }
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    if (!isSpeechSynthesisSupported()) return false;
    return window.speechSynthesis.speaking;
  }
}

export const voiceAssistant = new VoiceAssistant();
