import { useState, useEffect, useCallback } from 'react';

interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export const useSpeechRecognition = () => {
  const [text, setText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionApi = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {
      console.error('このブラウザは音声認識に対応していません。');
      return;
    }

    const instance = new SpeechRecognitionApi();
    instance.continuous = false;
    instance.lang = 'ja-JP';
    instance.interimResults = false;

    instance.onstart = () => {
      setIsListening(true);
    };

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
    if (!recognition) return;

    try {
      // 前回の結果をクリア
      setText('');
      
      // 🚀 修正ポイント: start() を呼んでみる
      recognition.start();
    } catch (e: any) {
      // 🚀 修正ポイント: 
      // 'InvalidStateError' は「すでに開始してるよ」という意味なので
      // エラー画面を出さずに無視してOKです。
      if (e.name === 'InvalidStateError') {
        console.log('すでに音声認識は開始されています（無視してOK）');
      } else {
        // それ以外の本当のエラーだけ表示
        console.error('開始エラー:', e);
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.abort(); // 強制停止
      setIsListening(false);
    }
  }, [recognition]);

  return {
    text,
    isListening,
    startListening,
    stopListening, // 必要なら使えるようにエクスポートしておきます
  };
};