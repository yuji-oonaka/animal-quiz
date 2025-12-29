import Image from "next/image";

interface Props {
  src: string;
  alt: string;
}

export const QuizImage = ({ src, alt }: Props) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-4">
      {/* priority を付与してLCP（最大視覚コンテンツ）の読み込みを最速化。
        framer-motionなどの重いライブラリを使わず、標準のCSSでフェードインを実装して
        視覚的なレスポンスの「硬さ」を和らげます。
      */}
      <div className="relative w-full h-full animate-fade-in">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain drop-shadow-xl"
          sizes="(max-width: 768px) 100vw, 66vw"
          priority
          quality={85}
        />
      </div>
    </div>
  );
};
