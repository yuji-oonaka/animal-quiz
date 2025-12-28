"use client";

import { useCallback } from "react";
import confetti from "canvas-confetti";

export const useConfetti = () => {
  const fireQuizConfetti = useCallback(() => {
    // page.tsx の既存仕様: 1.5秒間、左右から打ち上げ 
    const duration = 1.2 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      // 左側
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ["#ff0000", "#ffa500", "#ffff00"],
      });
      // 右側
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

  const resetConfetti = useCallback(() => {
    confetti.reset();
  }, []);

  return { fireQuizConfetti, resetConfetti };
};