"use client";

import { QuizImage } from "./QuizImage";
import { VoiceIndicator } from "./GameOverlays";
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
  return (
    <main className="fixed inset-0 bg-orange-50 flex flex-col landscape:flex-row overflow-hidden">
      <VoiceIndicator text={voiceText} />

      <button
        onClick={onBackToTitle}
        className="absolute top-4 left-4 z-40 bg-white/90 p-2 px-4 rounded-full shadow text-gray-500 font-bold text-sm active:bg-gray-100 transition-colors"
      >
        🏠 やめる
      </button>

      <div className="flex-1 relative landscape:w-2/3 landscape:h-full flex items-center justify-center">
        {isQuestionVisible ? (
          <QuizImage src={question.image} alt={question.label} />
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
            if (!isListening && !isJudged) onStartListening();
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
};
