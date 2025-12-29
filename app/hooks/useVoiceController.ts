"use client";

import { useEffect, useCallback, useRef } from "react";

export const useVoiceController = () => {
  // 発話インスタンスを保持し、不必要なGC（ガベージコレクション）を防ぐ
  const uttrRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // アンマウント時に音声を強制停止
    return () => window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback((message: string, onEnd?: () => void) => {
    if (typeof window === "undefined") return;

    // 進行中の音声をキャンセル [cite: 8]
    window.speechSynthesis.cancel();

    // 空文字の場合は何もしない（iOSなどの無音再生ハック用を除く）
    if (!message) {
      if (onEnd) onEnd();
      return;
    }

    const uttr = new SpeechSynthesisUtterance(message);
    uttr.lang = "ja-JP";

    const voices = window.speechSynthesis.getVoices();
    // 優先度の高い声の選定ロジックを維持 [cite: 8]
    const bestVoice =
      voices.find((v) => v.name.includes("Kyoko") || v.name.includes("Apple")) ||
      voices.find((v) => v.name.includes("ja-jp-x-gjs-network")) || 
      voices.find((v) => v.lang.includes("ja") && v.name.includes("Google")) ||
      voices.find((v) => v.lang.includes("ja"));

    if (bestVoice) {
      uttr.voice = bestVoice;
      const isGoogle = bestVoice.name.includes("Google") || bestVoice.name.includes("network");
      uttr.rate = isGoogle ? 1.25 : 1.0; 
      uttr.pitch = isGoogle ? 1.2 : 1.3; 
    }

    uttr.onend = () => {
      // 発話終了後、ハードウェアの解放を待つためにわずかな遅延を入れる 
      if (onEnd) setTimeout(onEnd, 100);
    };

    uttr.onerror = (e) => {
      console.error("SpeechSynthesis Error:", e);
      if (onEnd) onEnd();
    };

    uttrRef.current = uttr;
    window.speechSynthesis.speak(uttr);
  }, []);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, cancelSpeech };
};