/**
 * Transliteratsiya testlari:  node scripts/test-translit.ts
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseLexicon, transliterate, type Alphabet } from '../src/lib/translit/core.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lexicon = parseLexicon(readFileSync(join(root, 'public', 'translit', 'lexicon.txt'), 'utf8'));

const cases: [Alphabet, Alphabet, string, string][] = [
    // Amaldagi lotin → yangi
    ['lotin', 'yangi', "O'zbekiston g'alaba qozondi", 'Özbekiston ğalaba qozondi'],
    ['lotin', 'yangi', 'Shahar choyxonasi', 'Şahar çoyxonasi'],
    ['lotin', 'yangi', 'SHAHAR', 'ŞAHAR'],
    ['lotin', 'yangi', "Ishoq va ashob, Is'hoq", 'Ishoq va ashob, Ishoq'],
    ['lotin', 'yangi', 'Ishoqning ashoblari mushafni', 'Ishoqning ashoblari mushafni'],
    ['lotin', 'yangi', 'singil, tong, mashq', 'singil, tong, maşq'],
    ['lotin', 'yangi', 'mashhur', 'maşhur'],
    ['lotin', 'yangi', "san'at, ma'no", 'sanʼat, maʼno'],
    ['lotin', 'yangi', 'yo‘q, to‘g‘ri, bog`', 'yöq, töğri, boğ'],
    ['lotin', 'yangi', "'salom' dedi", "'salom' dedi"],
    ['lotin', 'yangi', 'https://imlogo.uz/shahar', 'https://imlogo.uz/shahar'],
    // Yangi → amaldagi lotin
    ['yangi', 'lotin', 'Özbekiston ğalaba', 'Oʻzbekiston gʻalaba'],
    ['yangi', 'lotin', 'Şahar, çoy, Ishoq', 'Shahar, choy, Isʼhoq'],
    // Kirill → lotin / yangi
    ['kirill', 'lotin', 'Ўзбекистон Республикаси', 'Oʻzbekiston Respublikasi'],
    ['kirill', 'lotin', 'Исҳоқ асҳоби', 'Isʼhoq asʼhobi'],
    ['kirill', 'yangi', 'Исҳоқ ва шаҳар', 'Ishoq va şahar'],
    ['kirill', 'lotin', 'Ер, поезд, цирк, милиция', 'Yer, poyezd, sirk, militsiya'],
    ['kirill', 'lotin', 'маъно, таъсир', 'maʼno, taʼsir'],
    ['kirill', 'yangi', 'ЧЎҚҚИ', 'ÇÖQQI'],
    ['kirill', 'lotin', 'сентябрь ойи', 'sentabr oyi'],
    // Lotin / yangi → kirill
    ['lotin', 'kirill', "O'zbekiston, yo'q, Ishoq", 'Ўзбекистон, йўқ, Исҳоқ'],
    ['lotin', 'kirill', 'Shahar, ekran, oila, poeziya', 'Шаҳар, экран, оила, поэзия'],
    ['lotin', 'kirill', 'kompyuter, sirk, militsiya, rayon', 'компьютер, цирк, милиция, район'],
    ['lotin', 'kirill', "san'at", 'санъат'],
    ['yangi', 'kirill', 'Özbekiston, Ishoq, şahar, yöq', 'Ўзбекистон, Исҳоқ, шаҳар, йўқ'],
    ['yangi', 'kirill', 'maşhur, sanʼat', 'машҳур, санъат'],
];

let failed = 0;
for (const [from, to, input, expected] of cases) {
    const actual = transliterate(input, from, to, lexicon);
    if (actual !== expected) {
        failed++;
        console.log(`✗ ${from} → ${to}: ${input}\n    kutilgan: ${expected}\n    natija:   ${actual}`);
    }
}
console.log(failed === 0 ? `✓ ${cases.length} ta test o'tdi` : `${failed}/${cases.length} ta test o'tmadi`);
process.exit(failed === 0 ? 0 : 1);
