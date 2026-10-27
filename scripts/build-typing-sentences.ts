/**
 * Tez yozish mashqining "gaplar" rejimi uchun gaplar to'plamini yig'adi:
 * `public/words/uz-sentences.txt`.
 *
 *   node scripts/build-typing-sentences.ts [manba-fayl]
 *
 * Manba — har qatorda bitta o'zbekcha gap (standart: ../sources/uzbek_corpus.txt).
 * Oddiy klaviaturada qulay teriladigan, o'rtacha uzunlikdagi gaplar saralanadi
 * va ulardan tasodifiy (lekin har safar bir xil) qism olinadi.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeTypingText } from '../src/lib/app/typing/text.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2] ?? join(root, '..', 'sources', 'uzbek_corpus.txt');
const output = join(root, 'public', 'words', 'uz-sentences.txt');

const MIN_LENGTH = 25;
const MAX_LENGTH = 90;
const MIN_WORDS = 4;
const LIMIT = 5_000;

// Faqat o'zbek lotin harflari, raqamlar va oddiy tinish belgilari; bosh harf bilan
// boshlanib, nuqta, so'roq yoki undov bilan tugaydi. Qo'shtirnoq, qavs va tire yo'q.
const SENTENCE_RE = /^[A-Z][A-Za-z0-9 ',.?!:;-]*[.?!]$/;
// O'zbek yozuvida w yo'q, c faqat "ch" da keladi — bunday so'zlar asosan chet nomlar.
const FOREIGN_RE = /[wW]|[cC](?!h)|[qQ]u/;

const isTypeable = (sentence: string) =>
    sentence.length >= MIN_LENGTH &&
    sentence.length <= MAX_LENGTH &&
    SENTENCE_RE.test(sentence) &&
    !FOREIGN_RE.test(sentence) &&
    !/\s{2}|\s[-,.?!:;]|-\s|''/.test(sentence) &&
    sentence.split(' ').length >= MIN_WORDS;

const seen = new Set<string>();
const sentences: string[] = [];
for (const line of readFileSync(source, 'utf8').split('\n')) {
    const sentence = normalizeTypingText(line.trim());
    const key = sentence.toLowerCase();
    if (!isTypeable(sentence) || seen.has(key)) continue;
    seen.add(key);
    sentences.push(sentence);
}

// Mulberry32: qayta yig'ilganda to'plam o'zgarmasligi uchun doimiy urug'li tasodif.
let seed = 20261027;
const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
for (let i = sentences.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [sentences[i], sentences[j]] = [sentences[j], sentences[i]];
}

const picked = sentences.slice(0, LIMIT);
const header = [
    "# Imlo Go — tez yozish mashqining 'gaplar' rejimi uchun o'zbekcha gaplar.",
    '# Har bir qatorda bitta gap. Fayl avtomatik yig\'iladi: npm run typing:sentences',
];
writeFileSync(output, [...header, ...picked].join('\n') + '\n');
console.log(`${sentences.length} ta mos gapdan ${picked.length} tasi yozildi: ${output}`);
