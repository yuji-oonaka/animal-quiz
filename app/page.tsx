"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { questions, Question } from "./data/questions";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { QuizImage } from "./components/QuizImage";
import Image from "next/image";
import confetti from "canvas-confetti";

const shuffleArray = (array: Question[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function Home() {
  const [gameState, setGameState] = useState<"title" | "playing" | "result">(
    "title"
  );
  const [isPortrait, setIsPortrait] = useState(true);
  const [isSeinoMode, setIsSeinoMode] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isJudged, setIsJudged] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [selectedInResult, setSelectedInResult] = useState<Question | null>(
    null
  );

  const [isQuestionVisible, setIsQuestionVisible] = useState(false);
  const [showStartText, setShowStartText] = useState(false);
  const [showSeinoText, setShowSeinoText] = useState(false);

  const { text, isListening, startListening, stopListening } =
    useSpeechRecognition();
  const currentQuestion = gameQuestions[currentIndex];

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (
      typeof window !== "undefined" &&
      window.speechSynthesis.onvoiceschanged !== undefined
    ) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 音声合成の共通関数
  const speak = useCallback((message: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const uttr = new SpeechSynthesisUtterance(message);
    uttr.lang = "ja-JP";

    // その瞬間の最新の音声リストを取得
    const voices = window.speechSynthesis.getVoices();

    const bestVoice =
      voices.find(
        (v) => v.name.includes("Kyoko") || v.name.includes("Apple")
      ) ||
      voices.find((v) => v.lang.includes("ja") && v.name.includes("Google")) ||
      voices.find((v) => v.lang.includes("ja"));

    if (bestVoice) {
      uttr.voice = bestVoice;
      // Googleは遅いので速く、それ以外（iPhone等）は標準
      uttr.rate = bestVoice.name.includes("Google") ? 1.3 : 1.0;
    } else {
      uttr.rate = 1.1; // リストが空の場合の予備設定
    }

    uttr.pitch = 1.3; // かわいさの高さ

    uttr.onend = () => {
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(uttr);
  }, []);

  const fireConfetti = useCallback(() => {
    const duration = 1.5 * 1000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ["#ff0000", "#ffa500", "#ffff00"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ["#00ff00", "#0000ff", "#ff00ff"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const performSeinoAction = useCallback(() => {
    setTimeout(() => {
      setShowSeinoText(true);
      speak("せーの！", () => {
        setShowSeinoText(false);
        startListening();
      });
    }, 400);
  }, [speak, startListening]);

  const handleGameStart = () => {
    // iOS対策：空の音を鳴らしてアンロック
    const silentUttr = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(silentUttr);

    // 💡 ここで一度強制的に声を再取得させる
    window.speechSynthesis.getVoices();

    const shuffled = shuffleArray(questions);
    setGameQuestions(shuffled.slice(0, 10));
    setCurrentIndex(0);
    setMistakeCount(0);
    setIsJudged(false);
    setIsQuestionVisible(false);
    setGameState("playing");

    // 最初の挨拶（speak関数内で最適な声が選ばれるようになる）
    speak("どうぶつクイズ！", () => {
      setShowStartText(true);
      speak("スタート！", () => {
        setShowStartText(false);
        setIsQuestionVisible(true);
        if (isSeinoMode) performSeinoAction();
        else startListening();
      });
    });
  };

  const handleBackToTitle = () => {
    window.speechSynthesis.cancel();
    stopListening();
    setGameState("title");
  };

  const handleNext = useCallback(() => {
    confetti.reset();
    setIsJudged(false);
    setIsQuestionVisible(false);
    setMistakeCount(0);
    if (currentIndex < gameQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        setIsQuestionVisible(true);
        if (isSeinoMode) performSeinoAction();
        else startListening();
      }, 600);
    } else {
      setGameState("result");
      speak("ぜんぶ おしまい！ よくがんばったね！");
    }
  }, [
    currentIndex,
    gameQuestions.length,
    startListening,
    speak,
    isSeinoMode,
    performSeinoAction,
  ]);

  const checkAnswer = useCallback(
    (userVoice: string) => {
      if (isJudged || !isQuestionVisible || !userVoice || showSeinoText) return;

      // 通常の正解判定
      let isCorrect = currentQuestion.aliases.some((alias) =>
        userVoice.includes(alias)
      );

      // 「どうぶつじゃない」時の判定
      if (currentQuestion.type === "not_animal") {
        const notAnimalKeywords = ["じゃない", "ちがう", "ありませ", "違い"];
        if (notAnimalKeywords.some((word) => userVoice.includes(word)))
          isCorrect = true;
      }

      if (isCorrect) {
        setIsJudged(true);
        fireConfetti();
        const delayNext = () => setTimeout(handleNext, 1200);

        // 🚀 隠し要素（ゴマちゃん、ダンボなど）のチェック
        const special = currentQuestion.specialReactions?.find((r) =>
          r.keywords.some((k) => userVoice.includes(k))
        );

        if (special) {
          // 💡 「よく知ってるね！」などの特別な反応
          speak(special.message, delayNext);
        } else if (currentQuestion.type === "not_animal") {
          // 🚀 ドラムロール風の「溜め」演出
          speak("せいかい！", () => {
            setTimeout(() => {
              speak("これは... どうぶつじゃ... ありませーーーん！", delayNext);
            }, 400); // 0.4秒だけ溜める
          });
        } else {
          // 通常の正解
          speak(`せいかい！${currentQuestion.label}だね！`, delayNext);
        }
      } else {
        // 判定ロジック：mistakeCountを更新
        const nextCount = mistakeCount + 1;
        setMistakeCount(nextCount);

        if (nextCount >= 2) {
          // 2回間違えたら正解発表
          setIsJudged(true);
          speak(
            `むずかしいかな？ せいかいは、${currentQuestion.label} でした！`,
            () => setTimeout(handleNext, 1200)
          );
        } else {
          // 1回目なら「もういちど」
          speak("あれ？ もういちど いってみてね", () => {
            if (isSeinoMode) performSeinoAction();
            else startListening();
          });
        }
      }
    },
    [
      isJudged,
      isQuestionVisible,
      showSeinoText,
      currentQuestion,
      mistakeCount,
      isSeinoMode,
      performSeinoAction,
      fireConfetti,
      speak,
      handleNext,
    ]
  );

  // 🚀 音声入力の監視（デバウンス）
  useEffect(() => {
    if (text && gameState === "playing") {
      const timer = setTimeout(() => {
        checkAnswer(text);
      }, 800);
      return () => clearTimeout(timer);
    }
    // ⚠️ 修正：checkAnswerを依存関係から外すことで、mistakeCount更新による再発火を防ぐ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, gameState]);

  if (gameState === "title") {
    return (
      <main className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
        {/* 🖼️ 背景画像レイヤー */}
        <div className="absolute inset-0 -z-10">
          {isPortrait ? (
            /* 📱 縦画面の時だけこれを出す */
            <Image
              src="/images/title-vertical.jpg"
              alt="背景 縦"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            /* 💻 横画面の時だけこれを出す */
            <Image
              src="/images/title-beside.png"
              alt="背景 横"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 p-6 w-full max-w-sm">
          <div className="flex flex-col items-center gap-6 w-full bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-white/40">
            <button
              onClick={() => setIsSeinoMode(!isSeinoMode)}
              className={`flex items-center gap-3 px-6 py-2 rounded-full border-2 transition-all shadow-sm ${
                isSeinoMode
                  ? "bg-green-100 border-green-500 text-green-700"
                  : "bg-white border-gray-300 text-gray-500"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full ${
                  isSeinoMode ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="font-bold text-sm">
                {isSeinoMode ? "せーの！モード ON" : "せーの！モード OFF"}
              </span>
            </button>
            <button
              onClick={handleGameStart}
              className="w-full bg-red-500 hover:bg-red-600 text-white text-4xl font-extrabold py-6 px-10 rounded-full shadow-[0_10px_0_rgb(185,28,28)] active:shadow-none active:translate-y-2 transition-all animate-bounce-slow"
            >
              スタート！
            </button>
            <p className="text-[10px] text-gray-400 font-bold">
              ※iPhoneはマナーモードを解除してね
            </p>
          </div>
        </div>
      </main>
    );
  }

  // 結果画面、プレイ画面のレンダリング（以下略 - 前回の構造を維持）
  if (gameState === "result") {
    return (
      <main className="fixed inset-0 bg-yellow-50 overflow-y-auto py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-orange-600 mb-6">
            クリア おめでとう！
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
            {gameQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedInResult(q);
                  speak(q.explain);
                }}
                className="bg-white p-2 rounded-xl shadow-md transform active:scale-95 transition-transform"
              >
                <div className="aspect-square relative mb-2">
                  <Image
                    src={q.image}
                    alt={q.label}
                    fill
                    className="object-contain p-1"
                    sizes="20vw"
                  />
                </div>
                <div className="text-center font-bold text-gray-700 text-sm">
                  {q.label}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={handleBackToTitle}
            className="bg-blue-500 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            タイトルにもどる
          </button>
        </div>
        {selectedInResult && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedInResult(null)}
          >
            <div
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-pop-in text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full aspect-square relative mb-6">
                <Image
                  src={selectedInResult.image}
                  alt={selectedInResult.label}
                  fill
                  className="object-contain"
                  sizes="400px"
                />
              </div>
              <h3 className="text-3xl font-bold text-orange-500 mb-4">
                {selectedInResult.label}
              </h3>
              <p className="text-lg text-gray-700 font-medium bg-orange-50 p-4 rounded-2xl">
                {selectedInResult.explain}
              </p>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-orange-50 flex flex-col landscape:flex-row overflow-hidden">
      {(showStartText || showSeinoText) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 text-center">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black italic animate-pop-in leading-tight select-none">
            {showStartText ? (
              <span className="text-red-500 [text-shadow:4px_4px_0_#fff,-4px_-4px_0_#fff,4px_-4px_0_#fff,-4px_4px_0_#fff,0_8px_15px_rgba(0,0,0,0.3)]">
                スタート！
              </span>
            ) : (
              <span className="text-green-500 [text-shadow:4px_4px_0_#fff,-4px_-4px_0_#fff,4px_-4px_0_#fff,-4px_4px_0_#fff,0_8px_15px_rgba(0,0,0,0.3)]">
                せーの！
              </span>
            )}
          </h1>
        </div>
      )}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none z-30 landscape:bottom-8 landscape:right-[16.6%] landscape:w-1/3">
        <div className="bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-bold border border-white/20 shadow-xl animate-fade-in min-w-40 text-center">
          きこえたよ：
          <span className="text-yellow-400">{text || "・・・"}</span>
        </div>
      </div>
      <button
        onClick={handleBackToTitle}
        className="absolute top-4 left-4 z-40 bg-white/90 p-2 px-4 rounded-full shadow text-gray-500 font-bold text-sm active:bg-gray-100 transition-colors"
      >
        🏠 やめる
      </button>
      <div className="flex-1 relative landscape:w-2/3 landscape:h-full flex items-center justify-center">
        {isQuestionVisible ? (
          <QuizImage src={currentQuestion.image} alt={currentQuestion.label} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-100/30">
            <span className="text-9xl text-orange-200 animate-pulse">？</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/80 px-4 py-2 rounded-full font-bold text-orange-600 shadow-md z-10">
          {currentIndex + 1} / 10
        </div>
      </div>
      <div className="h-32 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center z-20 landscape:h-full landscape:w-1/3 border-t landscape:border-t-0 landscape:border-l border-orange-200">
        <button
          onClick={() => {
            if (!isListening && !isJudged) startListening();
          }}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all active:scale-90 ${
            isListening
              ? "bg-red-500 animate-pulse text-white"
              : "bg-orange-400 text-white"
          }`}
        >
          {isListening ? "👂" : "🎙️"}
        </button>
        <p className="mt-3 text-sm font-bold text-gray-600">
          {isListening
            ? "きいてるよ！"
            : showSeinoText
            ? "せーの！"
            : "ボタンを おしてね"}
        </p>
      </div>
    </main>
  );
}
