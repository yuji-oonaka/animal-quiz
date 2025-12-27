// 型定義
export type QuestionType = 'animal' | 'not_animal';

export interface Question {
  id: string;
  label: string;      // 表示名（ひらがな推奨）
  type: QuestionType; // カテゴリ判定用
  image: string;      // 画像パス
  aliases: string[];  // 正解判定用キーワード
  explain: string;    // 解説文（やさしい日本語）
}

// 出題データ
export const questions: Question[] = [
  {
    id: 'dog',
    label: 'いぬ',
    type: 'animal',
    image: '/images/inu.png',
    aliases: ['いぬ', 'イヌ', '犬', 'わんわん', 'ワンワン', 'ドッグ'],
    explain: 'わんわんと なく かわいい どうぶつだよ'
  },
  {
    id: 'mushroom',
    label: 'きのこ',
    type: 'not_animal',
    image: '/images/kinoko.png',
    aliases: ['きのこ', 'キノコ', '茸', 'マッシュルーム'],
    explain: 'たべられるのも あるけど どうぶつじゃないよ'
  }
];