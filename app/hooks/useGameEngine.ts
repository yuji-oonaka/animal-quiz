"use client";

import { useState, useCallback, useMemo } from "react";
import { questions, Question } from "../data/questions";

// シャッフル関数
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
    setIsJudged(false);
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
    if (isJudged || !isQuestionVisible || !userVoice) return { type: "ignore" };

    // 否定判定
    if (currentQuestion.type === "not_animal") {
      const notKeywords = ["じゃない", "ちがう", "ありませ", "違い", "×", "バツ"];
      if (notKeywords.some((word) => userVoice.includes(word))) {
        setIsJudged(true);
        return { type: "correct" };
      }
    }

    // 正解判定ロジック
    const isCorrect = currentQuestion.aliases.some((alias) => {
      // 🚀 2文字以下の短い言葉（イヌ、ネコ等）は完全一致か前方一致のみ
      // これで会話のノイズ（「あー」「そう」等）による誤爆をガード
      if (alias.length <= 2) {
        return userVoice === alias || userVoice.startsWith(alias);
      }
      // 3文字以上の言葉は部分一致で寛容に受け止める
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
    gameState, currentQuestion, currentIndex, isJudged, setIsJudged,
    mistakeCount, isQuestionVisible, setIsQuestionVisible,
    isSeinoMode, setIsSeinoMode, gameQuestions,
    startGame, nextQuestion, processAnswer, backToTitle,
  };
};