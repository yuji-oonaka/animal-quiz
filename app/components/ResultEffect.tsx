"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ResultEffectProps {
  isCorrect: boolean;
}

export const ResultEffect = ({ isCorrect }: ResultEffectProps) => {
  useEffect(() => {
    if (isCorrect) {
      // 🚀 クイズ途中の演出を「左右からの打ち上げ」に変更
      const duration = 2 * 1000; // 2秒間だけ
      const end = Date.now() + duration;

      const frame = () => {
        // 左側からの打ち上げ
        confetti({
          particleCount: 2, // 一回に出す量を激減
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 }, // 画面左下寄り
          colors: ["#ff0000", "#ffa500", "#ffff00"],
          ticks: 200, // 滞在時間を短くして早く消えるように
        });
        // 右側からの打ち上げ
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 }, // 画面右下寄り
          colors: ["#00ff00", "#0000ff", "#ff00ff"],
          ticks: 200,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isCorrect]);

  return null;
};
