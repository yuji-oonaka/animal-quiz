export type QuestionType = 'animal' | 'not_animal';

export interface SpecialReaction {
  keywords: string[];
  message: string;
}

export interface Question {
  id: string;
  label: string;      // 表示名
  type: QuestionType; // カテゴリ
  image: string;      // 画像パス
  aliases: string[];  // 正解判定用キーワード
  explain: string;    // 解説文
  specialReactions?: SpecialReaction[];
}

export const questions: Question[] = [
  // --- 🐶 どうぶつ枠 ---
  {
    id: 'dog',
    label: 'いぬ',
    type: 'animal',
    image: '/images/inu.png',
    aliases: ['いぬ', 'イヌ', '犬', 'ワンワン', 'わんわん', 'ドッグ'],
    explain: 'ワンワンと なく かわいい どうぶつだよ'
  },
  {
    id: 'cat',
    label: 'ねこ',
    type: 'animal',
    image: '/images/neko.png',
    aliases: ['ねこ', 'ネコ', '猫', 'ニャー', 'ニャン', 'キャット'],
    explain: 'ニャーニャーと なく かわいい どうぶつだよ'
  },
  {
    id: 'rabbit',
    label: 'うさぎ',
    type: 'animal',
    image: '/images/usagi.png',
    aliases: ['うさぎ', 'ウサギ', '兎', 'ラビット', 'ピョン'],
    explain: 'みみが ながくて ぴょんぴょん はねるよ'
  },
  // ゾウを削除し、認識率抜群のカンガルーを投入
  {
    id: 'kangaroo',
    label: 'かんがるー',
    type: 'animal',
    image: '/images/kangaroo.png', // カンガルーの画像を用意
    aliases: ['かんがるー', 'カンガルー', 'ぴょんぴょん', 'ぽけっと'],
    explain: 'おなかの ポケットに あかちゃんが いるよ！ ぴょんぴょん はねるのが とくいなんだ'
  },
  {
    id: 'giraffe',
    label: 'きりん',
    type: 'animal',
    image: '/images/kirin.png',
    aliases: ['きりん', 'キリン', '麒麟', 'ジラフ'],
    explain: 'くびが とっても ながい どうぶつだよ'
  },
  {
    id: 'lion',
    label: 'らいおん',
    type: 'animal',
    image: '/images/lion.png',
    aliases: ['らいおん', 'ライオン', '獅子', 'ガオー'],
    explain: 'かっこいい たてがみが あるね。ガオー！'
  },
  {
    id: 'tiger',
    label: 'とら',
    type: 'animal',
    image: '/images/tora.png',
    // 🆕 「寅さん」「トラさん」などを追加
    aliases: ['とら', 'トラ', '虎', 'とらさん','たら', '寅さん'], 
    explain: 'しましま もようが かっこいい！ ガオーって なくよ'
  },
  {
    id: 'bear',
    label: 'くま',
    type: 'animal',
    image: '/images/kuma.png',
    aliases: ['くま', 'クマ', '熊', 'ベア'],
    explain: 'おおきくて ちからもちな もりのおうさまだよ'
  },
  {
    id: 'cow',
    label: 'うし',
    type: 'animal',
    image: '/images/usi.png',
    aliases: ['うし', 'ウシ', '牛', 'カウ', 'モー'],
    explain: 'モーモーと なくよ。ミルクを くれるね'
  },
  {
    id: 'pig',
    label: 'ぶた',
    type: 'animal',
    image: '/images/buta.png',
    aliases: ['ぶた', 'ブタ', '豚', 'ピッグ', 'ブー'],
    explain: 'ブーブーと なくよ。おはなが まるいね'
  },
  {
    id: 'chicken',
    label: 'にわとり',
    type: 'animal',
    image: '/images/niwatori.png',
    aliases: ['にわとり', 'ニワトリ', '鶏', 'チキン', 'コケコッコー'],
    explain: 'コケコッコーと あさを しらせてくれるよ'
  },
  {
    id: 'sheep',
    label: 'ひつじ',
    type: 'animal',
    image: '/images/hituji.png',
    aliases: ['ひつじ', 'ヒツジ', '羊', 'シープ', 'メェ'],
    explain: 'ふわふわの けが あたたかいね'
  },
  {
    id: 'monkey',
    label: 'さる',
    type: 'animal',
    image: '/images/saru.png',
    aliases: ['さる', 'サル', '猿', 'モンキー', 'ウッキー'],
    explain: 'きのぼりが じょうずで バナナが すきだよ'
  },
  {
    id: 'gorilla',
    label: 'ごりら',
    type: 'animal',
    image: '/images/golira.png',
    aliases: ['ごりら', 'ゴリラ', 'ウホ'],
    explain: 'むきむきで とっても つよいんだよ'
  },
  {
    id: 'panda',
    label: 'ぱんだ',
    type: 'animal',
    image: '/images/panda.png',
    aliases: ['ぱんだ', 'パンダ'],
    explain: 'しろと くろの もようが かわいいね'
  },
  {
    id: 'penguin',
    label: 'ぺんぎん',
    type: 'animal',
    image: '/images/pengin.png',
    aliases: ['ぺんぎん', 'ペンギン'],
    explain: 'とべないけど およぐのが じょうずだよ'
  },
  {
    id: 'azarashi',
    label: 'あざらし',
    type: 'animal',
    image: '/images/azarashi.png',
    aliases: ['あざらし', 'アザラシ', 'ゴマちゃん', 'ごまちゃん', 'ゴマアザラシ'],
    explain: 'こおりの うえで おひるね するのが だいすきだよ',
    specialReactions: [
      { keywords: ['ゴマちゃん', 'ごまちゃん'], message: 'せいかい！わぁ！よくしってるね、アニメのキャラクターで いるね！' }
    ]
  },
  {
    id: 'frog',
    label: 'かえる',
    type: 'animal',
    image: '/images/kaeru.png',
    aliases: ['かえる','帰る','カエル', '蛙', 'フロッグ', 'ケロ'],
    explain: 'ケロケロと なくよ。あめが すきかな？'
  },
  {
    id: 'turtle',
    label: 'かめ',
    type: 'animal',
    image: '/images/kame.png',
    aliases: ['かめ', 'カメ', '亀', 'タートル'],
    explain: 'かたい こうらを もっているよ。ゆっくり あるくよ'
  },
  {
    id: 'owl',
    label: 'ふくろう',
    type: 'animal',
    image: '/images/hukurou.png',
    aliases: ['ふくろう', 'フクロウ', '梟', 'ミミズク', 'ホーホー', 'ふくろ','袋'],
    explain: 'よるに なると おきてくる とりさんだよ'
  },
  // --- 🆕 追加された動物たち ---
  {
    id: 'dolphin',
    label: 'いるか',
    type: 'animal',
    image: '/images/iruka.png',
    aliases: ['いるか', 'イルカ', 'ドルフィン'],
    explain: 'うみを ジャンプして およぐ かしこい どうぶつだよ'
  },
  {
    id: 'hippo',
    label: 'かば',
    type: 'animal',
    image: '/images/kaba.png',
    aliases: ['かば', 'カバ', 'ヒポポタマス'],
    explain: 'おくちが とっても おおきいね。みずあそびが すきだよ'
  },
  {
    id: 'koala',
    label: 'こあら',
    type: 'animal',
    image: '/images/koara.png',
    aliases: ['こあら', 'コアラ'],
    explain: 'ユーカリの きのうえで いつも ねているね'
  },
  {
    id: 'camel',
    label: 'らくだ',
    type: 'animal',
    image: '/images/rakuda.png',
    aliases: ['らくだ', 'ラクダ', 'キャメル'],
    explain: 'せなかに コブが あるよ。さばくを あるくのが とくいだよ'
  },
  {
    id: 'deer',
    label: 'しか',
    type: 'animal',
    image: '/images/sika.png',
    aliases: ['しか', 'シカ', '鹿', 'バンビ', '歯科', '四肢'], 
    explain: 'かっこいい ツノが あるね。もりに すんでいるよ',
    // 🚀 バンビへの反応を追加
    specialReactions: [
      { keywords: ['バンビ', 'ばんび'], message: 'せいかい！わぁ！えいがの キャラクターの なまえだね！' }
    ]
  },
  {
    id: 'horse',
    label: 'うま',
    type: 'animal',
    image: '/images/uma.png',
    aliases: ['うま', 'ウマ', '馬', 'ホース', 'ヒヒーン'],
    explain: 'はしるのが とっても はやいよ。ヒヒーン！'
  },

  // --- ❌ 動物じゃありませーん枠 ---
  {
    id: 'mushroom',
    label: 'きのこ',
    type: 'not_animal',
    image: '/images/kinoko.png',
    aliases: ['きのこ', 'キノコ', '茸', 'マッシュルーム'],
    explain: 'もりに はえているけど どうぶつじゃないよ'
  },
  {
    id: 'robot',
    label: 'ろぼっと',
    type: 'not_animal',
    image: '/images/robot.png',
    aliases: ['ろぼっと', 'ロボット', 'ロボ', 'マシーン'],
    explain: 'うごくけど きかいだよ。ガシャンガシャン！'
  },
  {
    id: 'plush',
    label: 'ぬいぐるみ',
    type: 'not_animal',
    image: '/images/nuigurumi.png',
    aliases: ['ぬいぐるみ', 'ヌイグルミ', '人形', 'ドール'],
    explain: 'ふわふわ しているけど いきていないよ'
    },
  {
    id: 'seaweed',
    label: 'わかめ',
    type: 'not_animal',
    image: '/images/wakame.png',
    aliases: ['わかめ', 'ワカメ', '海藻', 'かいそう'],
    explain: 'うみの なかに あるけど たべものだよ'
  },
  {
    id: 'car',
    label: 'くるま',
    type: 'not_animal',
    image: '/images/kuruma.png',
    aliases: ['くるま', 'クルマ', '車', '自動車', 'ブーブー'],
    explain: 'タイヤが あって ひとを のせて はしるよ'
  },
];