"use client";

import { useState } from "react";
import Image from "next/image";
import { Question } from "../data/questions";

interface ResultScreenProps {
  questions: Question[];
  onBackToTitle: () => void;
  onExplain: (text: string) => void;
}

export const ResultScreen = ({
  questions,
  onBackToTitle,
  onExplain,
}: ResultScreenProps) => {
  const [selectedInResult, setSelectedInResult] = useState<Question | null>(
    null
  );

  return (
    <main className="fixed inset-0 bg-yellow-50 overflow-y-auto py-10 px-4 scroll-smooth">
      <div className="max-w-4xl mx-auto text-center">
        {/* 🚀 速度重視：bounce-in より速い pop-in に変更 */}
        <h2 className="text-3xl font-bold text-orange-600 mb-6 animate-pop-in">
          クリア おめでとう！
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => {
                setSelectedInResult(q);
                onExplain(q.explain);
              }}
              // 🚀 テンポの工夫：indexを使って0.05秒ずつ表示をずらす（スタッガード演出）
              style={{ animationDelay: `${index * 50}ms` }}
              className="group bg-white p-2 rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 border-2 border-transparent hover:border-orange-200 animate-pop-in fill-mode-both"
            >
              <div className="aspect-square relative mb-2 overflow-hidden rounded-xl bg-orange-50/50">
                <Image
                  src={q.image}
                  alt={q.label}
                  fill
                  className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 640px) 40vw, 15vw"
                />
              </div>
              <div className="text-center font-bold text-gray-700 text-sm truncate">
                {q.label}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onBackToTitle}
          className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg active:scale-95 transition-all mb-10"
        >
          タイトルにもどる
        </button>
      </div>

      {/* 詳細モーダル：背景のボカシも一瞬で表示 */}
      {selectedInResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedInResult(null)}
        >
          <div
            className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-pop-in text-center relative border-4 border-orange-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full aspect-square relative mb-6">
              <Image
                src={selectedInResult.image}
                alt={selectedInResult.label}
                fill
                className="object-contain"
                sizes="320px"
                priority
              />
            </div>
            <h3 className="text-3xl font-bold text-orange-500 mb-4">
              {selectedInResult.label}
            </h3>
            <p className="text-lg text-gray-700 font-medium bg-orange-50 p-5 rounded-2xl leading-relaxed">
              {selectedInResult.explain}
            </p>
          </div>
        </div>
      )}
    </main>
  );
};
