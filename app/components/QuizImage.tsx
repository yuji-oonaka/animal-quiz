import Image from "next/image";

interface Props {
  src: string;
  alt: string;
}

export const QuizImage = ({ src, alt }: Props) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* 画面いっぱいに広げるが、はみ出さないようにcontainを使う */}
      <Image src={src} alt={alt} fill className="object-contain p-4" priority />
    </div>
  );
};
