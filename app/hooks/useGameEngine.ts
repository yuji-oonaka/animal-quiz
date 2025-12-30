"use client";

import { useState, useCallback, useMemo } from "react";
import { questions, Question } from "../data/questions";

// 配列のシャッフル（純粋関数）
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

  // 🚀 【追加】ゲーム開始前に問題を準備する関数
  // タイトル画面でこれを呼ぶことで、裏側での画像ロードを可能にします
  const prepareGame = useCallback(() => {
    const shuffled = shuffleArray(questions);
    const selected = shuffled.slice(0, 10);
    setGameQuestions(selected);
    return selected; // プリロード処理に渡すために返す
  }, []);

  const startGame = useCallback(() => {
    // 🚀 修正：ここでは問題を選び直さず、
    // タイトル画面などで「準備済み」の10問を使って即開始する
    setGameState("playing");
    setCurrentIndex(0);
    setMistakeCount(0);
    setIsJudged(false);
    setIsQuestionVisible(false);
  }, []); // 依存配列を空にして、ステートに左右されないようにします

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
    if (isJudged || !isQuestionVisible || !userVoice) return { type: "ignore" };

    if (currentQuestion.type === "not_animal") {
      const notKeywords = ["じゃない", "ちがう", "ありませ", "違い", "×", "バツ"];
      if (notKeywords.some((word) => userVoice.includes(word))) {
        setIsJudged(true);
        return { type: "correct" };
      }
    }

    const isCorrect = currentQuestion.aliases.some((alias) => {
      if (alias.length <= 2) return userVoice === alias || userVoice.startsWith(alias);
      return userVoice.includes(alias);
    });

    if (isCorrect) {
      setIsJudged(true);
      const special = currentQuestion.specialReactions?.find((r) =>
        r.keywords.some((k) => userVoice.includes(k))
      );
      return { type: "correct", special };
    } else {
      const nextCount = mistakeCount + 1;
      setMistakeCount(nextCount);
      if (nextCount >= 2) {
        setIsJudged(true);
        return { type: "giveup" };
      }
      return { type: "retry" };
    }
  }, [currentQuestion, mistakeCount, isJudged, isQuestionVisible]);

  const backToTitle = useCallback(() => setGameState("title"), []);

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
    prepareGame, // 🚀 外部から準備を指示できるように追加
    startGame,
    nextQuestion,
    processAnswer,
    backToTitle,
  };
};