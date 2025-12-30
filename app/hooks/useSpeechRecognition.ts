"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// 🚀 【追加】iOS/iPadOS判定定数
const isIOS = typeof navigator !== "undefined" && 
  (/iPhone|iPad|iPod/.test(navigator.userAgent) || 
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

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
    
    // 🚀 iOS安定のため、単発認識(false)で運用
    instance.continuous = false; 
    instance.lang = 'ja-JP';
    instance.interimResults = false; 

    instance.onstart = () => setIsListening(true);
    
    instance.onresult = (event: any) => {
      // 確定した結果のみを取得
      const transcript = event.results[0][0].transcript;
      setText(transcript);
    };

    instance.onend = () => {
      setIsListening(false);
    };

    instance.onerror = (event: any) => {
      setIsListening(false);
      // iOSでのエラー（特に'aborted'や'not-allowed'）時に
      // 勝手に再起動ループしないよう、ここでは状態管理のみに留めます
      console.warn("Speech recognition error:", event.error);
    };

    recognitionRef.current = instance;

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    // 前の認識が残っている場合は確実に止める
    try {
      recognitionRef.current.stop();
    } catch (e) {}

    setText('');

    // 🚀 iOSは連続した呼び出しに弱いため、少しだけディレイを置いてから開始
    const startDelay = isIOS ? 50 : 10;
    setTimeout(() => {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // iOSで既に稼働中のエラーが出た場合は無視
        console.warn("Speech recognition start failed:", e);
      }
    }, startDelay);
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

  // 🚀 isIOS も一緒に返すことで、page.tsx 側で挙動を分岐できるようにします
  return { text, isListening, startListening, stopListening, resetText, isIOS };
};