"use client";

interface OverlayProps {
  show: boolean;
  type: "start" | "seino";
}

export const GameOverlays = ({ show, type }: OverlayProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 text-center">
      <h1 className="text-7xl sm:text-8xl md:text-9xl font-black italic animate-pop-in leading-tight select-none">
        {type === "start" ? (
          <span className="text-red-500 [text-shadow:4px_4px_0_#fff,-4px_-4px_0_#fff,4px_-4px_0_#fff,-4px_4px_0_#fff,0_8px_15px_rgba(0,0,0,0.3)]">
            スタート！
          </span>
        ) : (
          <span className="text-green-500 [text-shadow:4px_4px_0_#fff,-4px_-4px_0_#fff,4px_-4px_0_#fff,-4px_4px_0_#fff,0_8px_15px_rgba(0,0,0,0.3)]">
            せーの！
          </span>
        )}
      </h1>
    </div>
  );
};

export const VoiceIndicator = ({ text }: { text: string }) => (
  <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none z-30 landscape:bottom-8 landscape:right-[16.6%] landscape:w-1/3">
    <div className="bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-bold border border-white/20 shadow-xl animate-fade-in min-w-40 text-center">
      きこえたよ：
      <span className="text-yellow-400">{text || "・・・"}</span>
    </div>
  </div>
);
