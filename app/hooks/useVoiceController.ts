"use client";

import { useEffect, useCallback } from "react";

export const useVoiceController = () => {
  // 1. 音声リストの準備を待つ (初期化) 
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    if (
      typeof window !== "undefined" &&
      window.speechSynthesis.onvoiceschanged !== undefined
    ) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 2. 全機種対応・かわいい声のspeak関数 [cite: 14, 15]
  const speak = useCallback((message: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const uttr = new SpeechSynthesisUtterance(message);
    uttr.lang = "ja-JP";

    const voices = window.speechSynthesis.getVoices();
    // 優先度の高い声を探す [cite: 14]
    const bestVoice =
      voices.find((v) => v.name.includes("Kyoko") || v.name.includes("Apple")) ||
      voices.find((v) => v.name.includes("ja-jp-x-gjs-network")) || 
      voices.find((v) => v.lang.includes("ja") && v.name.includes("Google")) ||
      voices.find((v) => v.lang.includes("ja"));

    if (bestVoice) {
      uttr.voice = bestVoice;
      const isGoogle =
        bestVoice.name.includes("Google") || bestVoice.name.includes("network");
      // OS/エンジンごとの速度・高さ調整 
      uttr.rate = isGoogle ? 1.25 : 1.0;
      uttr.pitch = isGoogle ? 1.2 : 1.3;
    }

    uttr.onend = () => {
      // 発話終了後の競合回避タイマー 
      if (onEnd) setTimeout(onEnd, 50);
    };
    window.speechSynthesis.speak(uttr);
  }, []);

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { speak, cancelSpeech };
};