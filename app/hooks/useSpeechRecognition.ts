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
    // 🚀 改善：もし既に動いていたら一旦止めるが、エラーは無視する
    recognition.stop(); 
    setText('');
    
    // 🚀 改善：iOSでも反応を速くするため待機時間を最小に（100ms -> 10ms）
    setTimeout(() => {
      recognition.start();
    }, 10);
  } catch (e: any) {
    // すでに開始されている場合などのエラーをスルーして続行
    if (e.name !== 'InvalidStateError') console.error(e);
  }
}, [recognition]);

  const resetText = useCallback(() => {
    setText(''); // 🚀 判定後にテキストをクリアするための関数
  }, []);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.abort();
      setIsListening(false);
    }
  }, [recognition]);

  return { text, isListening, startListening, stopListening, resetText }; // resetTextを追加
};