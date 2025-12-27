"use client";

import { useState, useEffect, useCallback } from "react";
import { questions, Question } from "./data/questions";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { QuizImage } from "./components/QuizImage";
import { ResultEffect } from "./components/ResultEffect";
import Image from "next/image";

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
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isJudged, setIsJudged] = useState(false);
  const [isCorrectLast, setIsCorrectLast] = useState(false);

  const { text, isListening, startListening } = useSpeechRecognition();

  const currentQuestion = gameQuestions[currentIndex];

  // 🗣️ 喋る機能（ブラウザ標準のみのシンプル版に戻しました）
  const speak = useCallback((message: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const uttr = new SpeechSynthesisUtterance(message);
    uttr.lang = "ja-JP";

    // ブラウザ標準声のチューニング
    const voices = window.speechSynthesis.getVoices();
    const bestVoice =
      voices.find((v) => v.lang.includes("ja") && v.name.includes("Google")) ||
      voices.find((v) => v.lang.includes("ja"));
    if (bestVoice) uttr.voice = bestVoice;

    uttr.rate = 1.1;
    uttr.pitch = 1.3;
    uttr.onend = () => {
      if (onEnd) setTimeout(onEnd, 500);
    };

    window.speechSynthesis.speak(uttr);
  }, []);

  const handleGameStart = () => {
    const shuffled = shuffleArray(questions);
    const selected = shuffled.slice(0, 10);
    setGameQuestions(selected);
    setCurrentIndex(0);
    setGameState("playing");
    speak("どうぶつクイズ！ 10もん しょうぶ！ スタート！", () => {
      startListening();
    });
  };

  const handleNext = useCallback(() => {
    setIsJudged(false);
    setIsCorrectLast(false);

    if (currentIndex < gameQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        startListening();
      }, 800);
    } else {
      setGameState("result");
      speak("ぜんぶ おしまい！ よくがんばったね！");
    }
  }, [currentIndex, gameQuestions.length, startListening, speak]);

  const checkAnswer = (userVoice: string) => {
    if (isJudged) return;

    let isCorrect = currentQuestion.aliases.some((alias) =>
      userVoice.includes(alias)
    );

    if (currentQuestion.type === "not_animal") {
      const notAnimalKeywords = [
        "どうぶつじゃない",
        "動物じゃない",
        "動物じゃありません",
        "どうぶつじゃありません",
        "動物じゃありませーん",
        "ちがう",
      ];
      if (notAnimalKeywords.some((word) => userVoice.includes(word))) {
        isCorrect = true;
      }
    }

    setIsJudged(true);
    setIsCorrectLast(isCorrect);

    if (isCorrect) {
      if (currentQuestion.type === "animal") {
        speak(`せいかい！${currentQuestion.label}だね！`, handleNext);
      } else {
        speak(`せいかい！これは、どうぶつじゃ、ありませーーーん！`, handleNext);
      }
    } else {
      speak("あれ？ もういちど いってみてね", () => {
        setIsJudged(false);
        setIsCorrectLast(false);
        startListening();
      });
    }
  };

  useEffect(() => {
    if (text && !isJudged && gameState === "playing") {
      checkAnswer(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, gameState]);

  // 📺 1. タイトル画面
  if (gameState === "title") {
    return (
      <main className="fixed inset-0 bg-orange-50 flex flex-col items-center justify-center p-4">
        {/* タイトル画像を表示 */}
        <div className="w-full max-w-lg mb-8 drop-shadow-xl animate-bounce-slow">
          <Image
            src="/images/title.png"
            alt="どうぶつクイズ！"
            width={800}
            height={400}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        <div className="bg-white p-4 rounded-full shadow-md mb-10">
          <p className="text-orange-600 font-bold text-lg">
            10もん チャレンジ！
          </p>
        </div>

        <button
          onClick={handleGameStart}
          className="bg-red-500 hover:bg-red-600 text-white text-3xl font-bold py-6 px-12 rounded-full shadow-xl transition transform hover:scale-105 active:scale-95 animate-bounce"
        >
          スタート！
        </button>
      </main>
    );
  }

  if (gameState === "result") {
    return (
      <main className="fixed inset-0 bg-yellow-50 overflow-y-auto py-10 px-4">
        <ResultEffect isCorrect={true} />
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-orange-600 mb-2">
            クリア おめでとう！
          </h2>
          <p className="text-gray-600 mb-8">きょう であった なかまたちだよ</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {gameQuestions.map((q, i) => (
              <div
                key={q.id}
                className="bg-white p-2 rounded-xl shadow-md transform hover:scale-105 transition-transform"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-square relative mb-2">
                  <Image
                    src={q.image}
                    alt={q.label}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-center font-bold text-gray-700 text-sm">
                  {q.label}
                </div>
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow">
                  OK
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setGameState("title")}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg transition transform hover:scale-105"
          >
            タイトルにもどる
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-orange-50 flex flex-col">
      {isJudged && <ResultEffect isCorrect={isCorrectLast} />}
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 z-20">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / gameQuestions.length) * 100}%`,
          }}
        />
      </div>
      <div className="flex-1 relative">
        <QuizImage src={currentQuestion.image} alt={currentQuestion.label} />
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-4 py-2 rounded-full font-bold text-orange-600 shadow-md z-10">
          {currentIndex + 1} / {gameQuestions.length}
        </div>
      </div>
      <div className="h-32 bg-orange-100/90 backdrop-blur-sm flex flex-col items-center justify-center pb-safe z-10">
        <div
          className={`
          w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-inner transition-all
          ${
            isListening
              ? "bg-white border-4 border-red-400 animate-pulse text-red-500"
              : isJudged
              ? "bg-green-100 text-green-500"
              : "bg-gray-200 text-gray-400"
          }
        `}
        >
          {isListening ? "👂" : isJudged ? (isCorrectLast ? "🎉" : "🤔") : "⏳"}
        </div>
        <p className="mt-2 text-sm font-bold text-gray-500">
          {isListening
            ? "きいてるよ！"
            : isJudged
            ? isCorrectLast
              ? "せいかい！"
              : "ちがうかな？"
            : "ちょっとまってね"}
        </p>
      </div>
    </main>
  );
}
