"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface TitleScreenProps {
  isPortrait: boolean;
  isSeinoMode: boolean;
  onSoundTest: () => void;
  onToggleSeino: () => void;
  onStart: () => void;
}

export const TitleScreen = ({
  isPortrait,
  isSeinoMode,
  onSoundTest,
  onToggleSeino,
  onStart,
}: TitleScreenProps) => {
  // 🚀 ロジック：表示制御用のステート
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 🚀 0.6秒待ってからUIを表示（この間にQ1/Q2の画像をロード）
    const timer = setTimeout(() => setIsVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* 背景画像エリア（ここは即座に表示） */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={
            isPortrait
              ? "/images/title-vertical.jpg"
              : "/images/title-beside.png"
          }
          alt="背景"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      </div>

      {/* 操作エリア：isVisible が true になったらふわっと浮かび上がる */}
      <div
        className={`relative z-10 flex flex-col items-center gap-6 p-6 w-full max-w-sm transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex flex-col items-center gap-4 w-full bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border border-white/40">
          <button
            onClick={onSoundTest}
            className="px-4 py-2 bg-orange-100 border border-orange-300 rounded-full text-orange-600 text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            🔊 おとのテスト
          </button>

          <button
            onClick={onToggleSeino}
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
            onClick={onStart}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-4xl font-extrabold py-6 px-10 rounded-full shadow-[0_10px_0_rgb(185,28,28)] active:shadow-none active:translate-y-2 transition-all animate-bounce-slow"
          >
            スタート！
          </button>

          <p className="text-[10px] text-gray-400 font-bold leading-tight text-center">
            ※iPhoneは マナーモードを かいじょしてね
            <br />
            おとが きこえたら じゅんび オッケー！
          </p>
        </div>
      </div>
    </main>
  );
};
