import type { Metadata, Viewport } from "next"; // 👈 Viewportを追加
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 📱 1. ビューポート設定（スマホでの表示倍率や色など）
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316", // Androidのバーの色
};

// 📝 2. メタデータ設定（アイコンやマニフェストの読み込み）
export const metadata: Metadata = {
  title: "みんなでどうぶつクイズ！",
  description: "声で答える！子供向け参加型クイズアプリ",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" }, // 標準
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }, // 🆕 追加
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "どうぶつクイズ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
