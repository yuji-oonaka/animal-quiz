"use client";

import { useState, useCallback, useMemo } from "react";
import { questions, Question } from "../data/questions";

// 配列のシャッフル（純粋関数として維持）
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
  const [isJudged, setIsJudged] = useState(false); // 判定中・判定済みのロック
  const [mistakeCount, setMistakeCount] = useState(0);
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);
  const [isSeinoMode, setIsSeinoMode] = useState(false);

  // 現在の問題をメモ化して取得
  const currentQuestion = useMemo(() => gameQuestions[currentIndex], [gameQuestions, currentIndex]);

  // ゲーム開始
  const startGame = useCallback(() => {
    const shuffled = shuffleArray(questions);
    setGameQuestions(shuffled.slice(0, 10)); // 10問ピックアップ
    setCurrentIndex(0);
    setMistakeCount(0);
    setIsJudged(false);
    setIsQuestionVisible(false);
    setGameState("playing");
  }, []);

  // 次の問題へ
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

  // 判定ロジック
  const processAnswer = useCallback((userVoice: string) => {
    // すでに判定済み、または問題が表示される前なら無視
    if (isJudged || !isQuestionVisible || !userVoice) {
      return { type: "ignore" };
    }

    // 「～じゃない」系（not_animalタイプ）の判定
    if (currentQuestion.type === "not_animal") {
      const notKeywords = ["じゃない", "ちがう", "ありませ", "違い", "×", "バツ"];
      if (notKeywords.some((word) => userVoice.includes(word))) {
        setIsJudged(true); // 即座にロック
        return { type: "correct" };
      }
    }

    // 通常の正解判定
    const isCorrect = currentQuestion.aliases.some((alias) => userVoice.includes(alias));

    if (isCorrect) {
      setIsJudged(true); // 正解時は即座にロック
      const special = currentQuestion.specialReactions?.find((r) =>
        r.keywords.some((k) => userVoice.includes(k))
      );
      return { type: "correct", special };
    } else {
      // 不正解時の処理
      const nextCount = mistakeCount + 1;
      setMistakeCount(nextCount);
      
      if (nextCount >= 2) {
        setIsJudged(true); // 2回失敗でその問題は終了
        return { type: "giveup" };
      }
      
      return { type: "retry" }; // 1回目ならもう一度
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