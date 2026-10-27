/**
 * Transliteratsiya istisnolari lug'atini yig'adi: `public/translit/lexicon.txt`.
 *
 *   node scripts/build-translit-lexicon.ts [manba-papka]
 *
 * Manba — kirillcha so'zlar ro'yxatlari (standart: ../sources). Kirill yozuvi
 * bir qiymatli bo'lgani uchun har bir so'z lotinga o'girilib, qaytadan qoidalar
 * bo'yicha kirillga o'giriladi; natija farq qilgan so'zlar (Исҳоқ, асҳоб,
 * компьютер, цирк, ижтимоъий...) lug'atga yoziladi. Bir xil lotincha yozilishli
 * so'zlardan eng ko'p ishlatiladigani tanlanadi.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { cyrWordToLatin, naiveLatinToCyr, toKey } from '../src/lib/translit/core.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sources = process.argv[2] ?? join(root, '..', 'sources');
const output = join(root, 'public', 'translit', 'lexicon.txt');

/** Chastotali ro'yxatdagi shu o'rindan keyingi so'zlarda xatolar ko'p uchraydi. */
const MAX_RANK = 150_000;
// ъ/ь so'z boshida yoki ь unlidan keyin kelmaydi (bunday yozuvlar — ro'yxatdagi xatolar).
const WORD_RE = /^[а-ыэ-яёўқғҳ](?:[а-ыэ-яёўқғҳъ-]|(?<![аеёиоуэюяў])ь)*$/;
/** Chastotali ro'yxatda kam uchraydigan, lekin muhim istisnolar. */
const EXTRA_WORDS = ['исҳоқ', 'асҳоб', 'мусҳаф', 'масҳара'];

const readWords = (file: string): string[] =>
    readFileSync(join(sources, file), 'utf8')
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(word => WORD_RE.test(word));

// Kichikroq o'rin — ko'proq ishlatiladigan so'z. Lug'at so'zlari (lemmalar) doim qabul qilinadi.
const rank = new Map<string, number>();
readWords('frequent_words_list.txt').forEach((word, i) => {
    if (!rank.has(word)) rank.set(word, i);
});
const candidates = new Set<string>([...rank].filter(([, r]) => r < MAX_RANK).map(([word]) => word));
const lemmaRank = rank.size;
for (const word of [...readWords('words_list.txt'), ...EXTRA_WORDS]) {
    candidates.add(word);
    if (!rank.has(word)) rank.set(word, lemmaRank);
}

const best = new Map<string, { word: string; rank: number }>();
const offer = (key: string, word: string) => {
    const r = rank.get(word) ?? Infinity;
    const current = best.get(key);
    if (!current || r < current.rank) best.set(key, { word, rank: r });
};

for (const word of candidates) {
    const latin = cyrWordToLatin(word, 'lotin');
    offer(toKey(latin), word);
    // Ko'pchilik "Is'hoq" emas, "Ishoq" deb yozadi — tutuqsiz yozilishi ham qo'shiladi,
    // agar u "ш" bilan yoziladigan boshqa so'z bo'lmasa (масҳ ↔ маш: "mash" — маш).
    if (word.includes('сҳ')) {
        const plain = latin.replace(/s'h/g, 'sh');
        if (!candidates.has(naiveLatinToCyr(plain))) offer(toKey(plain), word);
    }
}

const lines = [...best]
    .filter(([key, { word }]) => naiveLatinToCyr(key) !== word)
    .map(([key, { word }]) => `${key} ${word}`)
    .sort();

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, lines.join('\n') + '\n');
console.log(`${lines.length} ta istisno → ${output}`);
