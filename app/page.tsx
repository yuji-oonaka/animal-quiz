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
    [engine, voice, recognition, effects, performSeinoAction]
  );

  useEffect(() => {
    if (
      recognition.text &&
      engine.gameState === "playing" &&
      !engine.isJudged
    ) {
      // 🚀 100msに戻しました
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
    engine.backToTitle();
  };

  return (
    <>
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
