"use client";

import { useState, useEffect } from "react";
import { QuizImage } from "./QuizImage";
import { Question } from "../data/questions";

interface GameScreenProps {
  question: Question;
  currentIndex: number;
  isListening: boolean;
  isJudged: boolean;
  isQuestionVisible: boolean;
  showSeinoText: boolean;
  voiceText: string;
  onBackToTitle: () => void;
  onStartListening: () => void;
}

export const GameScreen = ({
  question,
  currentIndex,
  isListening,
  isJudged,
  isQuestionVisible,
  showSeinoText,
  voiceText,
  onBackToTitle,
  onStartListening,
}: GameScreenProps) => {
  const [showSuccessVisual, setShowSuccessVisual] = useState(false);

  useEffect(() => {
    if (voiceText.length > 0 && !isJudged) {
      setShowSuccessVisual(true);
    } else {
      setShowSuccessVisual(false);
    }
  }, [voiceText, isJudged]);

  return (
    <main className="fixed inset-0 bg-white flex flex-col landscape:flex-row overflow-hidden">
      {/* 1. ヘッダー：背景を消して画像の上に浮かせる */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-40 pointer-events-none">
        <button
          onClick={onBackToTitle}
          className="pointer-events-auto bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-gray-500 font-bold text-xs active:scale-95 transition-transform border border-gray-100"
        >
          🏠 やめる
        </button>
        <div className="bg-orange-500/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-white shadow-sm text-xs">
          {currentIndex + 1} / 10
        </div>
      </div>

      {/* 2. 画像エリア：余白をなくして最大化 */}
      <div className="flex-1 relative w-full h-full flex items-center justify-center">
        {isQuestionVisible ? (
          <QuizImage src={question.image} alt={question.label} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50/30">
            <span className="text-9xl text-orange-100 animate-pulse">？</span>
          </div>
        )}
      </div>

      {/* 3. 操作エリア：スリム化して画像の下に配置 */}
      <div className="h-36 landscape:h-full landscape:w-1/4 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center z-20 border-t border-gray-100 px-6 pb-safe">
        <div className="relative mb-2">
          {showSuccessVisual && (
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30" />
          )}

          <button
            onClick={() => {
              if (!isListening && !isJudged) onStartListening();
            }}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-md transition-all duration-300 active:scale-90 ${
              showSuccessVisual
                ? "bg-green-500 scale-105"
                : isListening
                ? "bg-red-500 animate-pulse text-white"
                : "bg-orange-400 text-white"
            }`}
          >
            {showSuccessVisual ? "✨" : isListening ? "👂" : "🎙️"}
          </button>
        </div>

        <p
          className={`text-center font-bold transition-all duration-200 ${
            showSuccessVisual ? "text-green-600 scale-105" : "text-gray-600"
          }`}
        >
          <span className="text-lg">
            {showSuccessVisual
              ? "きこえたよ！"
              : showSeinoText
              ? "せーの！"
              : isListening
              ? "おなまえは？"
              : "ボタンを おしてね"}
          </span>
        </p>
      </div>
    </main>
  );
};
