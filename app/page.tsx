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

      // 1. 判定を即座に行う
      const result = engine.processAnswer(voiceText);
      resetText();

      if (result.type === "ignore") return;

      // 🚀 次の問題への遷移を「最短」にする関数
      const triggerNext = () => {
        // 通信の仕込み：次の次の画像を今のうちにロード
        const nextNextIndex = engine.currentIndex + 2;
        if (engine.gameQuestions[nextNextIndex]) {
          preloadOne(engine.gameQuestions[nextNextIndex].image);
        }

        // テンポ調整：Androidは爆速、iOSはマイク解放のために少しだけ「ため」を作る
        const transitionWait = isIOS ? 350 : 200;

        setTimeout(() => {
          const hasNext = engine.nextQuestion();
          if (hasNext) {
            // 画面切り替えを「100ms」から「10ms」へ短縮
            setTimeout(() => {
              engine.setIsQuestionVisible(true);
              if (engine.isSeinoMode) performSeinoAction();
              else startListening();
            }, 10);
          } else {
            voice.speak("ぜんぶ おしまい！ よくがんばったね！");
          }
        }, transitionWait);
      };

      if (result.type === "correct") {
        // 🚀 視覚演出（紙吹雪）を読み上げより先に実行し、即応性を出す
        effects.fireQuizConfetti();

        const msg = result.special
          ? result.special.message
          : engine.currentQuestion?.type === "not_animal"
          ? "せいかい！ これは... どうぶつじゃ... ありませーーーん！"
          : `せいかい！ ${engine.currentQuestion?.label}だね！`;

        // 読み上げ終了と同時に triggerNext を実行
        voice.speak(msg, triggerNext);
      } else if (result.type === "giveup") {
        // 「わからない」時もテンポを崩さない
        voice.speak(
          `むずかしいかな？ せいかいは、${engine.currentQuestion?.label} でした！`,
          triggerNext
        );
      } else if (result.type === "retry") {
        // リトライは次の問題に行かないので、そのままマイク再開
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
      isIOS, // Dependencyに追加
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
    // 1. 前の状態を即座にクリーンアップ
    voice.cancelSpeech();
    stopListening();
    resetText();

    // 2. 即座にゲーム状態を切り替えてUIを「進行中」にする
    engine.startGame();
    engine.setIsJudged(true); // 演出中は誤入力を防ぐ

    // 🚀 戦略：最初の読み上げ（約1〜1.5秒）を「ロード時間」として活用する
    voice.speak("どうぶつクイズ！", () => {
      // 最初の読み上げが終わるタイミングで「スタート！」の表示へ
      setShowStartText(true);

      voice.speak("スタート！", () => {
        // 「スタート！」と言い終わったら即座に問題を表示
        setShowStartText(false);
        engine.setIsQuestionVisible(true);
        engine.setIsJudged(false);

        // マイク起動
        if (engine.isSeinoMode) performSeinoAction();
        else startListening();
      });
    });

    // 🚀 読み上げの裏で「時間差」で画像をロード（通信の衝突を避ける）
    // 2問目はTitleScreenでのプリロードで完了している想定
    const loadDelay = isIOS ? 800 : 400;

    setTimeout(() => {
      if (engine.gameQuestions[2]) preloadOne(engine.gameQuestions[2].image);

      setTimeout(() => {
        if (engine.gameQuestions[3]) preloadOne(engine.gameQuestions[3].image);
      }, loadDelay);
    }, 200); // 最初の発話開始直後に1問目のロードを開始
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
          isIOS={isIOS} // 🚀 ここに isIOS を追加して渡します！
          onSoundTest={() => {
            voice.speak(
              "こんにちわ！おとが きこえたら じゅんび オッケーだよ！"
            );
          }}
          onToggleSeino={() => engine.setIsSeinoMode(!engine.isSeinoMode)}
          onStart={() => {
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
