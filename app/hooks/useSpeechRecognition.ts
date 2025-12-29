"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export const useSpeechRecognition = () => {
  const [text, setText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionApi = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRecognitionApi) return;

    const instance = new SpeechRecognitionApi();
    instance.continuous = false;
    instance.lang = 'ja-JP';
    instance.interimResults = false; // 安定のため false に戻す

    instance.onstart = () => setIsListening(true);
    instance.onresult = (event: any) => {
      // 確定した結果のみを取得
      const transcript = event.results[0][0].transcript;
      setText(transcript);
    };
    instance.onend = () => setIsListening(false);
    instance.onerror = (event: any) => {
      setIsListening(false);
    };

    recognitionRef.current = instance;

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {}

    setText('');
    setTimeout(() => {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Speech recognition start failed:", e);
      }
    }, 10);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  }, []);

  const resetText = useCallback(() => {
    setText('');
  }, []);

  return { text, isListening, startListening, stopListening, resetText };
};