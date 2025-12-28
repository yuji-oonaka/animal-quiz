"use client";

import { useState, useCallback, useMemo } from "react";
import { questions, Question } from "../data/questions";

const shuffleArray = (array: Question[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<"title" | "playing" | "result">("title");
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isJudged, setIsJudged] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);
  const [isSeinoMode, setIsSeinoMode] = useState(false);

  const currentQuestion = useMemo(() => gameQuestions[currentIndex], [gameQuestions, currentIndex]);

  const startGame = useCallback(() => {
    const shuffled = shuffleArray(questions);
    setGameQuestions(shuffled.slice(0, 10));
    setCurrentIndex(0);
    setMistakeCount(0);
    setIsJudged(false); // 🚀 修正：開始時は false にする（page.tsx側で制御するため）
    setIsQuestionVisible(false);
    setGameState("playing");
  }, []);

  const nextQuestion = useCallback(() => {
    setIsJudged(false);
    setIsQuestionVisible(false);
    setMistakeCount(0);
    
    if (currentIndex < gameQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return true;
    } else {
      setGameState("result");
      return false;
    }
  }, [currentIndex, gameQuestions.length]);

  const processAnswer = useCallback((userVoice: string) => {
    // 🚀 ガード条件を整理：既に判定済みなら無視
    if (isJudged || !isQuestionVisible || !userVoice) return { type: "ignore" };

    let isCorrect = currentQuestion.aliases.some((alias) => userVoice.includes(alias));
    if (currentQuestion.type === "not_animal") {
      const notKeywords = ["じゃない", "ちがう", "ありませ", "違い"];
      if (notKeywords.some((word) => userVoice.includes(word))) isCorrect = true;
    }

    if (isCorrect) {
      setIsJudged(true); // 正解時はロック
      const special = currentQuestion.specialReactions?.find((r) =>
        r.keywords.some((k) => userVoice.includes(k))
      );
      return { type: "correct", special };
    } else {
      const nextCount = mistakeCount + 1;
      setMistakeCount(nextCount);
      
      if (nextCount >= 2) {
        setIsJudged(true); // 2回失敗でロック
        return { type: "giveup" };
      }
      // 🚀 1回目は isJudged = false のままリトライへ
      return { type: "retry" };
    }
  }, [currentQuestion, mistakeCount, isJudged, isQuestionVisible]);

  const backToTitle = useCallback(() => {
    setGameState("title");
  }, []);

  return {
    gameState,
    currentQuestion,
    currentIndex,
    isJudged,
    setIsJudged,
    mistakeCount,
    isQuestionVisible,
    setIsQuestionVisible,
    isSeinoMode,
    setIsSeinoMode,
    gameQuestions,
    startGame,
    nextQuestion,
    processAnswer,
    backToTitle,
  };
};