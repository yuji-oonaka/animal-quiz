import Image from "next/image";

interface Props {
  src: string;
  alt: string;
}

export const QuizImage = ({ src, alt }: Props) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* 🚀 p-4を削除し、画像をさらに大きく見せる */}
      <div className="relative w-[90%] h-[90%] animate-fade-in">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain drop-shadow-md"
          sizes="(max-width: 768px) 100vw, 75vw"
          priority
          quality={75}
        />
      </div>
    </div>
  );
};
