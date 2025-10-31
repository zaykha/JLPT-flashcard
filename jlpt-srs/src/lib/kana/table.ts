// src/lib/kana/table.ts
export const HIRA_TABLE: Array<{ char: string; romaji: string }> = [
  { "char": "あ", "romaji": "a" }, { "char": "い", "romaji": "i" }, { "char": "う", "romaji": "u" }, { "char": "え", "romaji": "e" }, { "char": "お", "romaji": "o" },
  { "char": "か", "romaji": "ka" }, { "char": "き", "romaji": "ki" }, { "char": "く", "romaji": "ku" }, { "char": "け", "romaji": "ke" }, { "char": "こ", "romaji": "ko" },
  { "char": "さ", "romaji": "sa" }, { "char": "し", "romaji": "shi" }, { "char": "す", "romaji": "su" }, { "char": "せ", "romaji": "se" }, { "char": "そ", "romaji": "so" },
  { "char": "た", "romaji": "ta" }, { "char": "ち", "romaji": "chi" }, { "char": "つ", "romaji": "tsu" }, { "char": "て", "romaji": "te" }, { "char": "と", "romaji": "to" },
  { "char": "な", "romaji": "na" }, { "char": "に", "romaji": "ni" }, { "char": "ぬ", "romaji": "nu" }, { "char": "ね", "romaji": "ne" }, { "char": "の", "romaji": "no" },
  { "char": "は", "romaji": "ha" }, { "char": "ひ", "romaji": "hi" }, { "char": "ふ", "romaji": "fu" }, { "char": "へ", "romaji": "he" }, { "char": "ほ", "romaji": "ho" },
  { "char": "ま", "romaji": "ma" }, { "char": "み", "romaji": "mi" }, { "char": "む", "romaji": "mu" }, { "char": "め", "romaji": "me" }, { "char": "も", "romaji": "mo" },
  { "char": "や", "romaji": "ya" }, { "char": "ゆ", "romaji": "yu" }, { "char": "よ", "romaji": "yo" },
  { "char": "ら", "romaji": "ra" }, { "char": "り", "romaji": "ri" }, { "char": "る", "romaji": "ru" }, { "char": "れ", "romaji": "re" }, { "char": "ろ", "romaji": "ro" },
  { "char": "わ", "romaji": "wa" }, { "char": "を", "romaji": "wo" }, { "char": "ん", "romaji": "n" },
  { "char": "が", "romaji": "ga" }, { "char": "ぎ", "romaji": "gi" }, { "char": "ぐ", "romaji": "gu" }, { "char": "げ", "romaji": "ge" }, { "char": "ご", "romaji": "go" },
  { "char": "ざ", "romaji": "za" }, { "char": "じ", "romaji": "ji" }, { "char": "ず", "romaji": "zu" }, { "char": "ぜ", "romaji": "ze" }, { "char": "ぞ", "romaji": "zo" },
  { "char": "だ", "romaji": "da" }, { "char": "ぢ", "romaji": "ji" }, { "char": "づ", "romaji": "zu" }, { "char": "で", "romaji": "de" }, { "char": "ど", "romaji": "do" },
  { "char": "ば", "romaji": "ba" }, { "char": "び", "romaji": "bi" }, { "char": "ぶ", "romaji": "bu" }, { "char": "べ", "romaji": "be" }, { "char": "ぼ", "romaji": "bo" },
  { "char": "ぱ", "romaji": "pa" }, { "char": "ぴ", "romaji": "pi" }, { "char": "ぷ", "romaji": "pu" }, { "char": "ぺ", "romaji": "pe" }, { "char": "ぽ", "romaji": "po" },
  // Katakana rows (used rarely here but harmless to include)
];
export const KATA_TABLE: Array<{ char: string; romaji: string }> = [
    { "char": "ア", "romaji": "a" }, { "char": "イ", "romaji": "i" }, { "char": "ウ", "romaji": "u" }, { "char": "エ", "romaji": "e" }, { "char": "オ", "romaji": "o" },
  { "char": "カ", "romaji": "ka" }, { "char": "キ", "romaji": "ki" }, { "char": "ク", "romaji": "ku" }, { "char": "ケ", "romaji": "ke" }, { "char": "コ", "romaji": "ko" },
  { "char": "サ", "romaji": "sa" }, { "char": "シ", "romaji": "shi" }, { "char": "ス", "romaji": "su" }, { "char": "セ", "romaji": "se" }, { "char": "ソ", "romaji": "so" },
  { "char": "タ", "romaji": "ta" }, { "char": "チ", "romaji": "chi" }, { "char": "ツ", "romaji": "tsu" }, { "char": "テ", "romaji": "te" }, { "char": "ト", "romaji": "to" },
  { "char": "ナ", "romaji": "na" }, { "char": "ニ", "romaji": "ni" }, { "char": "ヌ", "romaji": "nu" }, { "char": "ネ", "romaji": "ne" }, { "char": "ノ", "romaji": "no" },
  { "char": "ハ", "romaji": "ha" }, { "char": "ヒ", "romaji": "hi" }, { "char": "フ", "romaji": "fu" }, { "char": "ヘ", "romaji": "he" }, { "char": "ホ", "romaji": "ho" },
  { "char": "マ", "romaji": "ma" }, { "char": "ミ", "romaji": "mi" }, { "char": "ム", "romaji": "mu" }, { "char": "メ", "romaji": "me" }, { "char": "モ", "romaji": "mo" },
  { "char": "ヤ", "romaji": "ya" }, { "char": "ユ", "romaji": "yu" }, { "char": "ヨ", "romaji": "yo" },
  { "char": "ラ", "romaji": "ra" }, { "char": "リ", "romaji": "ri" }, { "char": "ル", "romaji": "ru" }, { "char": "レ", "romaji": "re" }, { "char": "ロ", "romaji": "ro" },
  { "char": "ワ", "romaji": "wa" }, { "char": "ヲ", "romaji": "wo" }, { "char": "ン", "romaji": "n" },
  { "char": "ガ", "romaji": "ga" }, { "char": "ギ", "romaji": "gi" }, { "char": "グ", "romaji": "gu" }, { "char": "ゲ", "romaji": "ge" }, { "char": "ゴ", "romaji": "go" },
  { "char": "ザ", "romaji": "za" }, { "char": "ジ", "romaji": "ji" }, { "char": "ズ", "romaji": "zu" }, { "char": "ゼ", "romaji": "ze" }, { "char": "ゾ", "romaji": "zo" },
  { "char": "ダ", "romaji": "da" }, { "char": "ヂ", "romaji": "ji" }, { "char": "ヅ", "romaji": "zu" }, { "char": "デ", "romaji": "de" }, { "char": "ド", "romaji": "do" },
  { "char": "バ", "romaji": "ba" }, { "char": "ビ", "romaji": "bi" }, { "char": "ブ", "romaji": "bu" }, { "char": "ベ", "romaji": "be" }, { "char": "ボ", "romaji": "bo" },
  { "char": "パ", "romaji": "pa" }, { "char": "ピ", "romaji": "pi" }, { "char": "プ", "romaji": "pu" }, { "char": "ペ", "romaji": "pe" }, { "char": "ポ", "romaji": "po" }
];