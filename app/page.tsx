"use client";

import { useState, useEffect, useCallback } from "react";
import { useGameEngine } from "./hooks/useGameEngine";
import { useVoiceController } from "./hooks/useVoiceController";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useConfetti } from "./hooks/useConfetti";
import { TitleScreen } from "./components/TitleScreen";
import { GameScreen } from "./components/GameScreen";
import { ResultScreen } from "./components/ResultScreen";
import { GameOverlays } from "./components/GameOverlays";

export default function Home() {
  const engine = useGameEngine();
  const voice = useVoiceController();
  // 🚀 isIOS フラグを受け取るように変更
  const { text, isListening, startListening, stopListening, resetText, isIOS } =
    useSpeechRecognition();
  const effects = useConfetti();

  const [isPortrait, setIsPortrait] = useState(true);
  const [showStartText, setShowStartText] = useState(false);
  const [showSeinoText, setShowSeinoText] = useState(false);

  const preloadOne = useCallback((url: string) => {
    if (typeof window === "undefined") return;
    const img = new Image();
    img.src = url;
  }, []);

  useEffect(() => {
    const selected = engine.prepareGame();
    const timer = setTimeout(() => {
      if (selected[0]) preloadOne(selected[0].image);
      // 🚀 iOSの場合、起動直後の負荷を避けるため2枚目は少し遅らせる
      const secondDelay = isIOS ? 1000 : 0;
      setTimeout(() => {
        if (selected[1]) preloadOne(selected[1].image);
      }, secondDelay);
    }, 500);

    return () => clearTimeout(timer);
  }, [engine.prepareGame, preloadOne, isIOS]);

  useEffect(() => {
    const checkOrientation = () =>
      setIsPortrait(window.innerHeight > window.innerWidth);
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  const performSeinoAction = useCallback(() => {
    resetText();
    setTimeout(() => {
      setShowSeinoText(true);
      voice.speak("せーの！", () => {
        setShowSeinoText(false);
        startListening();
      });
    }, 400);
  }, [voice, startListening, resetText]);

  const handleAnswerCheck = useCallback(
    (voiceText: string) => {
      if (engine.isJudged || !voiceText || engine.gameState !== "playing")
        return;

      const result = engine.processAnswer(voiceText);
      resetText();

      if (result.type === "ignore") return;

      const delayNext = () => {
        const nextNextIndex = engine.currentIndex + 2;
        if (engine.gameQuestions[nextNextIndex]) {
          preloadOne(engine.gameQuestions[nextNextIndex].image);
        }

        setTimeout(() => {
          const hasNext = engine.nextQuestion();
          if (hasNext) {
            setTimeout(() => {
              engine.setIsQuestionVisible(true);
              if (engine.isSeinoMode) performSeinoAction();
              else startListening();
            }, 100);
          } else {
            voice.speak("ぜんぶ おしまい！ よくがんばったね！");
          }
        }, 800);
      };

      if (result.type === "correct") {
        effects.fireQuizConfetti();
        if (result.special) voice.speak(result.special.message, delayNext);
        else if (engine.currentQuestion?.type === "not_animal") {
          voice.speak(
            "せいかい！ これは... どうぶつじゃ... ありませーーーん！",
            delayNext
          );
        } else {
          voice.speak(
            `せいかい！ ${engine.currentQuestion?.label}だね！`,
            delayNext
          );
        }
      } else if (result.type === "giveup") {
        voice.speak(
          `むずかしいかな？ せいかいは、${engine.currentQuestion?.label} でした！`,
          delayNext
        );
      } else if (result.type === "retry") {
        voice.speak("あれ？ もういちど いってみてね", () => {
          if (engine.isSeinoMode) performSeinoAction();
          else startListening();
        });
      }
    },
    [
      engine,
      voice,
      startListening,
      resetText,
      effects,
      performSeinoAction,
      preloadOne,
    ]
  );

  // 🚀 【重要】判定ディレイの最適化
  useEffect(() => {
    if (text && engine.gameState === "playing" && !engine.isJudged) {
      // 🚀 iOSなら 0ms で即判定し、マイクが切れる前に処理を完了させる
      // Android/PC なら 100ms 待って安定させる
      const timer = setTimeout(
        () => {
          handleAnswerCheck(text);
        },
        isIOS ? 0 : 100
      );
      return () => clearTimeout(timer);
    }
  }, [text, engine.gameState, engine.isJudged, handleAnswerCheck, isIOS]);

  const handleGameStart = () => {
    voice.cancelSpeech();
    stopListening();
    resetText();

    // 🚀 【iOS最適化】プリロードを並列ではなく直列にする（マイクへの干渉防止）
    setTimeout(() => {
      if (engine.gameQuestions[2]) preloadOne(engine.gameQuestions[2].image);
      if (isIOS) {
        setTimeout(() => {
          if (engine.gameQuestions[3])
            preloadOne(engine.gameQuestions[3].image);
        }, 1000);
      } else {
        if (engine.gameQuestions[3]) preloadOne(engine.gameQuestions[3].image);
        if (engine.gameQuestions[4]) preloadOne(engine.gameQuestions[4].image);
      }
    }, 1000);

    engine.startGame();
    engine.setIsJudged(true);
    voice.speak("どうぶつクイズ！", () => {
      setShowStartText(true);
      voice.speak("スタート！", () => {
        setShowStartText(false);
        engine.setIsQuestionVisible(true);
        engine.setIsJudged(false);
        if (engine.isSeinoMode) performSeinoAction();
        else startListening();
      });
    });
  };

  const handleBackToTitle = () => {
    voice.cancelSpeech();
    stopListening();
    resetText();
    engine.backToTitle();
    const nextQuestions = engine.prepareGame();
    setTimeout(() => {
      if (nextQuestions[0]) preloadOne(nextQuestions[0].image);
      // 🚀 タイトル戻り時もiOSは1枚目を優先
      if (!isIOS && nextQuestions[1]) preloadOne(nextQuestions[1].image);
    }, 500);
  };

  return (
    <>
      {engine.gameState === "title" && (
        <TitleScreen
          isPortrait={isPortrait}
          isSeinoMode={engine.isSeinoMode}
          onSoundTest={() => {
            voice.speak(
              "こんにちわ！おとが きこえたら じゅんび オッケーだよ！"
            );
          }}
          onToggleSeino={() => engine.setIsSeinoMode(!engine.isSeinoMode)}
          onStart={() => {
            // 🚀 startListening は hooks 側で isIOS 対応済み
            startListening();
            setTimeout(() => {
              try {
                stopListening();
              } catch (e) {}
              handleGameStart();
            }, 100);
          }}
        />
      )}
      {engine.gameState === "playing" && engine.currentQuestion && (
        <GameScreen
          question={engine.currentQuestion}
          currentIndex={engine.currentIndex}
          isListening={isListening}
          isJudged={engine.isJudged}
          isQuestionVisible={engine.isQuestionVisible}
          showSeinoText={showSeinoText}
          voiceText={text}
          onBackToTitle={handleBackToTitle}
          onStartListening={startListening}
        />
      )}
      {engine.gameState === "result" && (
        <ResultScreen
          questions={engine.gameQuestions}
          onBackToTitle={handleBackToTitle}
          onExplain={(txt: string) => voice.speak(txt)}
        />
      )}
      <GameOverlays show={showStartText} type="start" />
      <GameOverlays show={showSeinoText} type="seino" />
    </>
  );
}
