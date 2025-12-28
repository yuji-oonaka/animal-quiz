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
    <main className="fixed inset-0 bg-yellow-50 overflow-y-auto py-10 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-orange-600 mb-6">
          クリア おめでとう！
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setSelectedInResult(q);
                onExplain(q.explain);
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
          onClick={onBackToTitle}
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
};
