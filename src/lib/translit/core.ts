/**
 * O'zbek yozuvlari orasida transliteratsiya: kirill, amaldagi lotin (1995)
 * va yangi lotin alifbosi (ş, ç, ö, ğ).
 *
 * Ichki ko'rinishda lotin so'z kichik harflarda, "`" — oʻ/gʻ belgisi,
 * "'" — tutuq belgisi (ʼ) bilan yoziladi. Foydalanuvchi matnida bu ikkisi
 * farqlanmaydi, shuning uchun lug'at kalitlarida ikkalasi ham "'" bo'ladi.
 *
 * Bu fayl hech narsa import qilmaydi: lug'atni yig'uvchi skript
 * (`scripts/build-translit-lexicon.ts`) ham aynan shu qoidalardan foydalanadi.
 */

export type Alphabet = 'lotin' | 'yangi' | 'kirill';

/** Lug'at: kalit (lotincha yozilish) → kirillcha so'z. */
export type Lexicon = Map<string, string>;

export interface TranslitOptions {
    /** oʻ, gʻ va tutuq belgisi o'rniga oddiy apostrof (') ishlatiladi. */
    plainApostrophe?: boolean;
}

/** Foydalanuvchi oʻ/gʻ yoki tutuq uchun yozishi mumkin bo'lgan belgilar. */
export const APOSTROPHES = "'`‘’ʻʼ´ʹ′";
const APOSTROPHE_RE = new RegExp(`[${APOSTROPHES}]`, 'g');
const MODIFIER = 'ʻ'; // U+02BB — oʻ, gʻ
const TUTUQ = 'ʼ'; // U+02BC — tutuq belgisi

/** Prefiks bo'yicha qidirilganda lug'at kalitining eng kichik uzunligi. */
export const MIN_PREFIX = 5;

const CYR_VOWELS = 'аеёиоуэюяў';

const CYR_COMMON: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
    ф: 'f', х: 'x', э: 'e', ю: 'yu', я: 'ya', қ: 'q', ҳ: 'h', ъ: "'", ы: 'i',
};
const CYR_LOTIN: Record<string, string> = { ш: 'sh', ч: 'ch', щ: 'shch', ў: 'o`', ғ: 'g`' };
const CYR_YANGI: Record<string, string> = { ш: 'ş', ч: 'ç', щ: 'şç', ў: 'ö', ғ: 'ğ' };

/** Rasmiy yozilishi qoidadan farq qiladigan so'z boshlari. */
const CYR_OVERRIDES: [string, string][] = [
    ['сентябр', 'sentabr'],
    ['октябр', 'oktabr'],
];

/** Kirillcha so'zni (kichik harflarda) ichki lotin ko'rinishiga o'giradi. */
export const cyrWordToLatin = (word: string, target: 'lotin' | 'yangi'): string => {
    const special = target === 'yangi' ? CYR_YANGI : CYR_LOTIN;
    let out = '';
    let start = 0;
    for (const [prefix, latin] of CYR_OVERRIDES) {
        if (word.startsWith(prefix)) {
            out = latin;
            start = prefix.length;
            break;
        }
    }
    for (let i = start; i < word.length; i++) {
        const c = word[i];
        const prev = i > 0 ? word[i - 1] : '';
        if (c === 'е') {
            // So'z boshida, unli, ъ yoki ь dan keyin — "ye".
            out += !prev || CYR_VOWELS.includes(prev) || prev === 'ъ' || prev === 'ь' ? 'ye' : 'e';
        } else if (c === 'ц') {
            out += prev && CYR_VOWELS.includes(prev) ? 'ts' : 's';
        } else if (c === 'ь') {
            // батальон → batalyon; boshqa hollarda yozilmaydi.
            if (word[i + 1] === 'о') out += 'y';
        } else if (c === 'ҳ' && prev === 'с') {
            // Исҳоқ: eski lotinda "sh" (ш) bilan adashmasligi uchun tutuq qo'yiladi,
            // yangi alifboda ş alohida harf — ajratish shart emas.
            out += target === 'yangi' ? 'h' : "'h";
        } else {
            out += special[c] ?? CYR_COMMON[c] ?? c;
        }
    }
    return out;
};

/** Lug'at kaliti: barcha tutuq/oʻ belgilari bir xil "'" bo'ladi. */
export const toKey = (latin: string): string => latin.replace(APOSTROPHE_RE, "'");

const LATIN_CYR: Record<string, string> = {
    a: 'а', b: 'б', c: 'ц', d: 'д', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к',
    l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у',
    v: 'в', w: 'в', x: 'х', y: 'й', z: 'з',
};
const LATIN_DIGRAPHS: Record<string, string> = { sh: 'ш', ch: 'ч', yo: 'ё', yu: 'ю', ya: 'я', ye: 'е' };

/** Lug'at prefiksi shu nuqtada kesilsa, harf birikmasi bo'linib qoladimi. */
const splitsDigraph = (key: string, at: number): boolean =>
    key[at] === "'" || key[at] === '`' || key.slice(at - 1, at + 1) in LATIN_DIGRAPHS;

/**
 * Lotincha so'zni qoidalar bo'yicha kirillga o'giradi.
 * `strictTutuq` bo'lsa, "o'"/"g'" dagi "'" tutuq hisoblanadi (yangi alifbodan
 * kelgan matn: u yerda oʻ/gʻ "`" bilan belgilangan); aks holda — oʻ/gʻ.
 */
export const naiveLatinToCyr = (latin: string, prevCyr = '', strictTutuq = false): string => {
    let out = '';
    let prev = prevCyr;
    const push = (s: string) => {
        out += s;
        prev = s[s.length - 1];
    };
    for (let i = 0; i < latin.length; ) {
        const c = latin[i];
        const next = latin[i + 1];
        const mark = next === '`' || (next === "'" && !strictTutuq);
        if (c === 'y' && next === 'o' && (latin[i + 2] === '`' || (latin[i + 2] === "'" && !strictTutuq))) {
            push('йў'); // yoʻq, yoʻl
            i += 3;
        } else if ((c === 'o' || c === 'g') && mark) {
            push(c === 'o' ? 'ў' : 'ғ');
            i += 2;
        } else if (c === 's' && (next === "'" || next === '`') && latin[i + 2] === 'h') {
            push('сҳ');
            i += 3;
        } else if (latin.slice(i, i + 2) in LATIN_DIGRAPHS) {
            push(LATIN_DIGRAPHS[latin.slice(i, i + 2)]);
            i += 2;
        } else if (c === 'e') {
            push(!prev || CYR_VOWELS.includes(prev) ? 'э' : 'е');
            i += 1;
        } else if (c === "'" || c === '`') {
            push('ъ');
            i += 1;
        } else {
            push(LATIN_CYR[c] ?? c);
            i += 1;
        }
    }
    return out;
};

interface LexiconHit {
    cyr: string;
    /** Kalitning lug'atga mos kelgan qismi uzunligi. */
    length: number;
}

/** Avval to'liq so'z, keyin eng uzun so'z boshi (o'zak + qo'shimchalar uchun). */
export const lookupLexicon = (lexicon: Lexicon, key: string, accept?: (hit: LexiconHit) => boolean): LexiconHit | null => {
    const exact = lexicon.get(key);
    if (exact !== undefined && (!accept || accept({ cyr: exact, length: key.length }))) {
        return { cyr: exact, length: key.length };
    }
    for (let n = key.length - 1; n >= MIN_PREFIX; n--) {
        if (splitsDigraph(key, n)) continue;
        const cyr = lexicon.get(key.slice(0, n));
        if (cyr !== undefined) {
            const hit = { cyr, length: n };
            if (!accept || accept(hit)) return hit;
        }
    }
    return null;
};

/** Amaldagi lotin (ichki ko'rinish) → kirill. */
export const lotinWordToCyr = (latin: string, lexicon: Lexicon, strictTutuq = false, source?: string): string => {
    const key = toKey(latin);
    // Yangi alifbodan kelgan so'zda lug'at topgan variant asl yozuvga mos bo'lishi shart.
    const accept = source === undefined ? undefined : (hit: LexiconHit) => source.startsWith(cyrWordToLatin(hit.cyr, 'yangi'));
    const hit = lookupLexicon(lexicon, key, accept);
    if (!hit) return naiveLatinToCyr(latin, '', strictTutuq);
    return hit.cyr + naiveLatinToCyr(latin.slice(hit.length), hit.cyr[hit.cyr.length - 1], strictTutuq);
};

/** Amaldagi lotin → yangi alifbo, faqat qoidalar bo'yicha. */
const naiveLotinToYangi = (latin: string): string => {
    let out = '';
    for (let i = 0; i < latin.length; ) {
        const c = latin[i];
        const next = latin[i + 1];
        if (c === 's' && (next === "'" || next === '`') && latin[i + 2] === 'h') {
            out += 'sh'; // Is'hoq → Ishoq
            i += 3;
        } else if (c === 's' && next === 'h') {
            out += 'ş';
            i += 2;
        } else if (c === 'c' && next === 'h') {
            out += 'ç';
            i += 2;
        } else if ((c === 'o' || c === 'g') && (next === "'" || next === '`')) {
            out += c === 'o' ? 'ö' : 'ğ';
            i += 2;
        } else {
            out += c === '`' ? "'" : c;
            i += 1;
        }
    }
    return out;
};

/** Lug'atda "sh" alohida s+h, "o'"/"g'" esa tutuq bo'lgan so'zlarni ajratadi. */
const AMBIGUOUS_CYR = /сҳ|[ог]ъ/;

/** Amaldagi lotin → yangi alifbo (Ishoq, ashob kabi istisnolar lug'atdan). */
export const lotinWordToYangi = (latin: string, lexicon: Lexicon): string => {
    const hit = lookupLexicon(lexicon, toKey(latin));
    if (!hit || !AMBIGUOUS_CYR.test(hit.cyr)) return naiveLotinToYangi(latin);
    return cyrWordToLatin(hit.cyr, 'yangi') + naiveLotinToYangi(latin.slice(hit.length));
};

/** Yangi alifbo → amaldagi lotin (ichki ko'rinish). Har doim bir qiymatli. */
export const yangiWordToLotin = (word: string): string => {
    let out = '';
    for (let i = 0; i < word.length; i++) {
        const c = word[i];
        if (c === 'ş') out += 'sh';
        else if (c === 'ç') out += 'ch';
        else if (c === 'ö') out += 'o`';
        else if (c === 'ğ') out += 'g`';
        else if (c === 's' && word[i + 1] === 'h') out += "s'";
        else if (APOSTROPHES.includes(c)) out += "'";
        else out += c;
    }
    return out;
};

// --- Matn darajasi ---

const LATIN_LETTERS = 'A-Za-zÇçŞşÖöĞğ';
const LATIN_WORD_RE = new RegExp(
    `[${LATIN_LETTERS}]+(?:[${APOSTROPHES}][${LATIN_LETTERS}]+)*(?:(?<=[oOgG])[${APOSTROPHES}])?`,
    'g'
);
const CYR_WORD_RE = /[Ѐ-ӿ]+/g;
/** Havola va elektron pochta manzillari o'zgartirilmaydi. */
const SKIP_RE = /(https?:\/\/\S+|www\.\S+|\S+@\S+\.\S+)/;

/** Asl so'zning bosh/kichik harf ko'rinishini natijaga ko'chiradi. */
const applyCase = (source: string, out: string): string => {
    const letters = source.replace(APOSTROPHE_RE, '');
    if (letters.length > 1 && letters === letters.toUpperCase() && letters !== letters.toLowerCase()) {
        return out.toUpperCase();
    }
    if (letters[0] && letters[0] !== letters[0].toLowerCase()) return out.charAt(0).toUpperCase() + out.slice(1);
    return out;
};

/** Ichki ko'rinishdagi belgilarni chiqish uchun haqiqiy belgilarga almashtiradi. */
const renderLatin = (latin: string, options: TranslitOptions): string =>
    options.plainApostrophe
        ? latin.replace(/[`']/g, "'")
        : latin.replace(/`/g, MODIFIER).replace(/'/g, TUTUQ);

const convertWord = (word: string, from: Alphabet, to: Alphabet, lexicon: Lexicon, options: TranslitOptions): string => {
    const lower = word.toLowerCase();
    let out: string;
    if (from === 'kirill') {
        out = renderLatin(cyrWordToLatin(lower, to === 'yangi' ? 'yangi' : 'lotin'), options);
    } else if (from === 'lotin') {
        const latin = toKey(lower);
        out = to === 'kirill' ? lotinWordToCyr(latin, lexicon) : renderLatin(lotinWordToYangi(latin, lexicon), options);
    } else {
        const lotin = yangiWordToLotin(lower);
        out = to === 'kirill' ? lotinWordToCyr(lotin, lexicon, true, toKey(lower)) : renderLatin(lotin, options);
    }
    return applyCase(word, out);
};

/** Matnni bir yozuvdan ikkinchisiga o'giradi; so'z bo'lmagan qismlar o'zgarmaydi. */
export const transliterate = (
    text: string,
    from: Alphabet,
    to: Alphabet,
    lexicon: Lexicon,
    options: TranslitOptions = {}
): string => {
    if (from === to) return text;
    const wordRe = from === 'kirill' ? CYR_WORD_RE : LATIN_WORD_RE;
    return text
        .split(SKIP_RE)
        .map((part, i) =>
            i % 2 === 1 ? part : part.replace(wordRe, word => convertWord(word, from, to, lexicon, options))
        )
        .join('');
};

/** `lexicon.txt` mazmunini o'qiydi: har qatorda "kalit kirillcha". */
export const parseLexicon = (text: string): Lexicon => {
    const lexicon: Lexicon = new Map();
    for (const line of text.split('\n')) {
        const space = line.indexOf(' ');
        if (space > 0) lexicon.set(line.slice(0, space), line.slice(space + 1).trim());
    }
    return lexicon;
};
