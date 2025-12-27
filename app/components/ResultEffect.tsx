"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface Props {
  isCorrect: boolean; // 正解かどうか
}

export const ResultEffect = ({ isCorrect }: Props) => {
  // マウント時に花火を打ち上げる
  useEffect(() => {
    if (isCorrect) {
      // 派手に紙吹雪を飛ばす設定
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00"], // 原色系で子供向けに
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isCorrect]);

  if (!isCorrect) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* 🔴 バン！と出る赤丸 */}
      <div className="animate-bounce-in">
        <svg width="300" height="300" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#ff3333"
            strokeWidth="8"
            strokeLinecap="round"
            className="drop-shadow-2xl"
          />
        </svg>
      </div>
    </div>
  );
};
