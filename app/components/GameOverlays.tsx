"use client";

interface OverlayProps {
  show: boolean;
  type: "start" | "seino";
}

export const GameOverlays = ({ show, type }: OverlayProps) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 text-center">
      {/* 🚀 改善ポイント:
        1. whitespace-nowrap で絶対に改行させない
        2. text-5xl (最小) から段階的に大きくし、小さなスマホでもはみ出さないサイズに調整
        3. tracking-tighter で文字間隔をわずかに詰め、横幅を節約
      */}
      <h1 className="text-5xl sm:text-7xl md:text-9xl font-black italic animate-pop-in leading-none select-none whitespace-nowrap tracking-tighter">
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
