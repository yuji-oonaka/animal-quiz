import Image from "next/image";

interface Props {
  src: string;
  alt: string;
}

export const QuizImage = ({ src, alt }: Props) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* 🚀 animate-fade-in から animate-pop-in に変更し、勢いよく表示 */}
      <div className="relative w-[90%] h-[90%] animate-pop-in">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain drop-shadow-2xl" // 影を強くして立体感を出す
          sizes="(max-width: 768px) 100vw, 75vw"
          priority
          quality={75}
        />
      </div>
    </div>
  );
};
