import { useState, useEffect, useCallback } from 'react';

// TypeScript用の型定義（ブラウザごとの差異を吸収）
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export const useSpeechRecognition = () => {
  const [text, setText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // ブラウザが音声認識に対応しているか確認
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionApi = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {
      console.error('このブラウザは音声認識に対応していません。');
      return;
    }

    const instance = new SpeechRecognitionApi();
    instance.continuous = false; // 一言話したら終了
    instance.lang = 'ja-JP';     // 日本語
    instance.interimResults = false; // 確定した結果だけ取得

    instance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      setIsListening(false);
    };

    instance.onend = () => {
      setIsListening(false);
    };

    instance.onerror = (event: any) => {
      console.error('音声認識エラー:', event.error);
      setIsListening(false);
    };

    setRecognition(instance);
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
      setText(''); // 前回の結果をクリア
      setIsListening(true);
      try {
        recognition.start();
      } catch (e) {
        console.error('開始エラー（すでに開始されている可能性があります）', e);
      }
    }
  }, [recognition]);

  return {
    text,           // 認識された文字
    isListening,    // 聞き取っている最中かどうか
    startListening, // 聞き取り開始関数
  };
};