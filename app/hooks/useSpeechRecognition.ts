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

    if (!SpeechRecognitionApi) return;

    const instance = new SpeechRecognitionApi();
    instance.continuous = false;
    instance.lang = 'ja-JP';
    instance.interimResults = false;

    instance.onstart = () => setIsListening(true);
    instance.onresult = (event: any) => {
      setText(event.results[0][0].transcript);
      setIsListening(false);
    };
    instance.onend = () => setIsListening(false);
    instance.onerror = () => setIsListening(false);

    setRecognition(instance);
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) return;
    try {
      // 🚀 iOS対策：一度abortして確実にリセット
      recognition.abort();
      setText('');
      // 少し間を置いてから開始するとiOSで安定します
      setTimeout(() => {
        recognition.start();
      }, 100);
    } catch (e: any) {
      if (e.name !== 'InvalidStateError') console.error(e);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.abort();
      setIsListening(false);
    }
  }, [recognition]);

  return { text, isListening, startListening, stopListening };
};