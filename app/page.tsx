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
  const recognition = useSpeechRecognition();
  const effects = useConfetti();

  const [isPortrait, setIsPortrait] = useState(true);
  const [showStartText, setShowStartText] = useState(false);
  const [showSeinoText, setShowSeinoText] = useState(false);

  // 🚀 【追加】画像をキャッシュに送り込むヘルパー
  const preloadOne = useCallback((url: string) => {
    if (typeof window === "undefined") return;
    const img = new Image();
    img.src = url;
  }, []);

  // 🚀 【追加】ステップ1：タイトル表示中に Q1, Q2 をロード
  useEffect(() => {
    // 10問を確定させ、リストを取得
    const selected = engine.prepareGame();

    // 起動直後の負荷分散のため 0.5秒待ってから最初の2枚をロード
    const timer = setTimeout(() => {
      if (selected[0]) preloadOne(selected[0].image);
      if (selected[1]) preloadOne(selected[1].image);
    }, 500);

    return () => clearTimeout(timer);
  }, [engine.prepareGame, preloadOne]);

  useEffect(() => {
    const checkOrientation = () =>
      setIsPortrait(window.innerHeight > window.innerWidth);
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  const performSeinoAction = useCallback(() => {
    recognition.resetText();
    setTimeout(() => {
      setShowSeinoText(true);
      voice.speak("せーの！", () => {
        setShowSeinoText(false);
        recognition.startListening();
      });
    }, 400);
  }, [voice, recognition]);

  const handleAnswerCheck = useCallback(
    (voiceText: string) => {
      if (engine.isJudged || !voiceText || engine.gameState !== "playing")
        return;

      const result = engine.processAnswer(voiceText);
      recognition.resetText();

      if (result.type === "ignore") return;

      const delayNext = () => {
        // 🚀 【追加】ステップ3：正解した瞬間に「2問先」をロード
        // Q1正解時ならQ3を、Q2正解時ならQ4を...と先回り
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
              else recognition.startListening();
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
          else recognition.startListening();
        });
      }
    },
    [engine, voice, recognition, effects, performSeinoAction, preloadOne]
  );

  useEffect(() => {
    if (
      recognition.text &&
      engine.gameState === "playing" &&
      !engine.isJudged
    ) {
      const timer = setTimeout(() => {
        handleAnswerCheck(recognition.text);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [recognition.text, engine.gameState, engine.isJudged, handleAnswerCheck]);

  const handleGameStart = () => {
    voice.cancelSpeech();
    recognition.stopListening();
    recognition.resetText();

    // 🚀 【追加】ステップ2：「スタート！」の演出中に Q3, Q4, Q5 をロード
    // ユーザーの意識が音に向いている隙に、中盤の問題を確保
    setTimeout(() => {
      if (engine.gameQuestions[2]) preloadOne(engine.gameQuestions[2].image);
      if (engine.gameQuestions[3]) preloadOne(engine.gameQuestions[3].image);
      if (engine.gameQuestions[4]) preloadOne(engine.gameQuestions[4].image);
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
        else recognition.startListening();
      });
    });
  };

  const handleBackToTitle = () => {
    voice.cancelSpeech();
    recognition.stopListening();
    recognition.resetText();

    // 1. まずタイトルに戻る
    engine.backToTitle();

    // 🚀 2. 【重要】次回のゲームのために、新しい10問をランダムに選び直す
    const nextQuestions = engine.prepareGame();

    // 🚀 3. 【重要】新しい問題の最初の2枚を即座にプリロード開始
    // これにより、タイトル画面にいる間に次の準備が整います
    setTimeout(() => {
      if (nextQuestions[0]) preloadOne(nextQuestions[0].image);
      if (nextQuestions[1]) preloadOne(nextQuestions[1].image);
    }, 500);
  };
  
  return (
    <>
      {engine.gameState === "title" && (
        <TitleScreen
          isPortrait={isPortrait}
          isSeinoMode={engine.isSeinoMode}
          onSoundTest={() => {
            // 🚀 プロ推奨：おとテストは音声合成のみに専念（マイク事故を防止）
            voice.speak(
              "こんにちわ！おとが きこえたら じゅんび オッケーだよ！"
            );
          }}
          onToggleSeino={() => engine.setIsSeinoMode(!engine.isSeinoMode)}
          onStart={() => {
            // 🚀 プロ推奨：ここでマイクの許可（空回し）を実行
            // 1. まずマイクを起動（ここでブラウザの許可ダイアログが出る）
            recognition.startListening();

            // 2. 0.1秒後にマイクを止め、その後に本来のスタート処理を呼ぶ
            // これにより、音声合成(speak)との同時実行を回避し、フリーズを防ぐ
            setTimeout(() => {
              try {
                recognition.stopListening();
              } catch (e) {
                // 万が一の停止エラーは無視
              }
              // 本来のゲーム開始処理へ
              handleGameStart();
            }, 100);
          }}
        />
      )}
      {engine.gameState === "playing" && engine.currentQuestion && (
        <GameScreen
          question={engine.currentQuestion}
          currentIndex={engine.currentIndex}
          isListening={recognition.isListening}
          isJudged={engine.isJudged}
          isQuestionVisible={engine.isQuestionVisible}
          showSeinoText={showSeinoText}
          voiceText={recognition.text}
          onBackToTitle={handleBackToTitle}
          onStartListening={recognition.startListening}
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
