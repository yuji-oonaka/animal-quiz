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
  // 各種カスタムフックの呼び出し
  const engine = useGameEngine();
  const voice = useVoiceController();
  const recognition = useSpeechRecognition();
  const effects = useConfetti();

  const [isPortrait, setIsPortrait] = useState(true);
  const [showStartText, setShowStartText] = useState(false);
  const [showSeinoText, setShowSeinoText] = useState(false);

  // 1. 画面の向きを監視（モバイル最適化）
  useEffect(() => {
    const checkOrientation = () =>
      setIsPortrait(window.innerHeight > window.innerWidth);
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  // 2. 「せーの！」アクションの定義
  const performSeinoAction = useCallback(() => {
    // 判定用テキストをリセットしてから開始
    recognition.resetText();
    setTimeout(() => {
      setShowSeinoText(true);
      voice.speak("せーの！", () => {
        setShowSeinoText(false);
        recognition.startListening();
      });
    }, 400);
  }, [voice, recognition]);

  // 3. クイズの判定ロジック
  const handleAnswerCheck = useCallback(
    (voiceText: string) => {
      // ガード条件：判定済み、テキストなし、またはプレイ中以外は無視
      if (engine.isJudged || !voiceText || engine.gameState !== "playing")
        return;

      // 判定処理の開始
      const result = engine.processAnswer(voiceText);

      // 🚀 重要：二重判定を防ぐため、即座にテキストをクリアする
      recognition.resetText();

      if (result.type === "ignore") return;

      // 次の問題へ進むための共通処理
      const delayNext = () => {
        setTimeout(() => {
          const hasNext = engine.nextQuestion();
          if (hasNext) {
            // 次の問題の表示準備
            setTimeout(() => {
              engine.setIsQuestionVisible(true);
              if (engine.isSeinoMode) {
                performSeinoAction();
              } else {
                recognition.startListening();
              }
            }, 100);
          } else {
            // 全問終了時
            voice.speak("ぜんぶ おしまい！ よくがんばったね！");
          }
        }, 800); // 演出のための余韻
      };

      // 判定結果に基づくフィードバック
      if (result.type === "correct") {
        effects.fireQuizConfetti();
        if (result.special) {
          voice.speak(result.special.message, delayNext);
        } else if (engine.currentQuestion?.type === "not_animal") {
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
          // リトライ時は再度マイクを起動
          if (engine.isSeinoMode) performSeinoAction();
          else recognition.startListening();
        });
      }
    },
    [engine, voice, recognition, effects, performSeinoAction]
  );

  // 4. 音声認識の監視（テキストが確定したら判定へ）
  useEffect(() => {
    if (
      recognition.text &&
      engine.gameState === "playing" &&
      !engine.isJudged
    ) {
      // 認識漏れを防ぐための微小なタイマー
      const timer = setTimeout(() => {
        handleAnswerCheck(recognition.text);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [recognition.text, engine.gameState, engine.isJudged, handleAnswerCheck]);

  // 5. ゲーム開始時の処理
  const handleGameStart = () => {
    // ブラウザの音声再生制限を解除
    voice.cancelSpeech();
    recognition.stopListening();
    recognition.resetText();

    engine.startGame();
    engine.setIsJudged(true); // 演出中の誤判定を防止

    voice.speak("どうぶつクイズ！", () => {
      setShowStartText(true);
      voice.speak("スタート！", () => {
        setShowStartText(false);
        engine.setIsQuestionVisible(true);
        engine.setIsJudged(false); // 回答受付開始
        if (engine.isSeinoMode) performSeinoAction();
        else recognition.startListening();
      });
    });
  };

  // 6. タイトルへ戻る処理
  const handleBackToTitle = () => {
    voice.cancelSpeech();
    recognition.stopListening();
    recognition.resetText();
    engine.backToTitle();
  };

  return (
    <>
      {/* タイトル画面 */}
      {engine.gameState === "title" && (
        <TitleScreen
          isPortrait={isPortrait}
          isSeinoMode={engine.isSeinoMode}
          onSoundTest={() =>
            voice.speak("こんにちわ！おとが きこえたら じゅんび オッケーだよ！")
          }
          onToggleSeino={() => engine.setIsSeinoMode(!engine.isSeinoMode)}
          onStart={handleGameStart}
        />
      )}

      {/* クイズ実行画面 */}
      {engine.gameState === "playing" && engine.currentQuestion && (
        <GameScreen
          question={engine.currentQuestion}
          currentIndex={engine.currentIndex}
          isListening={recognition.isListening}
          isJudged={engine.isJudged}
          isQuestionVisible={engine.isQuestionVisible}
          showSeinoText={showSeinoText}
          onBackToTitle={handleBackToTitle}
          onStartListening={recognition.startListening}
        />
      )}

      {/* 結果発表画面 */}
      {engine.gameState === "result" && (
        <ResultScreen
          questions={engine.gameQuestions}
          onBackToTitle={handleBackToTitle}
          onExplain={(txt: string) => voice.speak(txt)}
        />
      )}

      {/* 画面上の演出レイヤー */}
      <GameOverlays show={showStartText} type="start" />
      <GameOverlays show={showSeinoText} type="seino" />
    </>
  );
}
