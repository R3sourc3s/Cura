"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

// Minimal ambient typings for the Web Speech API (not in the default TS DOM lib).
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

interface Props {
  /** Called with the finalised transcript chunk each time the recogniser confirms one. */
  onTranscript: (text: string) => void;
  className?: string;
  title?: string;
}

/**
 * Voice-assisted dictation button — browser-native Web Speech API, no server round-trip.
 * Drop into any notes/comments field to let staff dictate eMAR entries, PRN notes,
 * incident reports, etc. hands-free. Falls back to a disabled state on unsupported browsers.
 */
export default function VoiceInputButton({ onTranscript, className = "", title = "Dictate" }: Props) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-GB";

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          onTranscript(result[0].transcript.trim());
        }
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      try { recognition.stop(); } catch { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop dictation" : title}
      title={listening ? "Stop dictation" : title}
      className={`flex items-center justify-center rounded-lg transition-colors ${className}`}
      style={{
        width: 30, height: 30,
        background: listening ? "rgba(239,68,68,0.15)" : "rgba(13,148,136,0.12)",
        color: listening ? "var(--c-red)" : "var(--c-teal2)",
        border: listening ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(13,148,136,0.25)",
      }}
    >
      {listening ? <MicOff size={13} className="animate-pulse" /> : <Mic size={13} />}
    </button>
  );
}
