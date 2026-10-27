// Avtomatik yaratilgan: node scripts/build-pb-evaluator.ts — qo‘lda o‘zgartirmang.
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiktantEvaluator = void 0;
const DISSIMILARITY_LENGTH_RATIO = 0.3;
const DISSIMILARITY_MIN_USER_TOKENS = 3;
const DISSIMILARITY_MATCH_RATIO = 0.1;
const CATASTROPHIC_MIN_ORIG_TOKENS = 5;
const SIGNIFICANT_MISSING_WORDS = 5;
// Yonma-yon klaviatura tugmalari
const ADJACENT_KEYS = {
    q: ['w', 'a'],
    w: ['q', 'e', 's', 'a'],
    e: ['w', 'r', 'd', 's'],
    r: ['e', 't', 'f', 'd'],
    t: ['r', 'y', 'g', 'f'],
    y: ['t', 'u', 'h', 'g'],
    u: ['y', 'i', 'j', 'h'],
    i: ['u', 'o', 'k', 'j'],
    o: ['i', 'p', 'l', 'k'],
    p: ['o', 'l'],
    a: ['q', 'w', 's', 'z'],
    s: ['a', 'w', 'e', 'd', 'x', 'z'],
    d: ['s', 'e', 'r', 'f', 'c', 'x'],
    f: ['d', 'r', 't', 'g', 'v', 'c'],
    g: ['f', 't', 'y', 'h', 'b', 'v'],
    h: ['g', 'y', 'u', 'j', 'n', 'b'],
    j: ['h', 'u', 'i', 'k', 'm', 'n'],
    k: ['j', 'i', 'o', 'l', 'm'],
    l: ['k', 'o', 'p'],
    z: ['a', 's', 'x'],
    x: ['z', 's', 'd', 'c'],
    c: ['x', 'd', 'f', 'v'],
    v: ['c', 'f', 'g', 'b'],
    b: ['v', 'g', 'h', 'n'],
    n: ['b', 'h', 'j', 'm'],
    m: ['n', 'j', 'k'],
};
const PARONYMS = [
    ['abzal', 'afzal'],
    ['sher', 'she‘r'],
    ['hol', 'xol'],
    ['haq', 'xaq'],
];
const TOKEN_REGEX = /([a-zA-Z\u00C0-\u024F\u0400-\u04FF]+(?:['\u2018\u2019\u02BB][a-zA-Z\u00C0-\u024F\u0400-\u04FF]+)*)|([.,;:!?\-\u2013\u2014()«»"\u201C\u201D\u2026]+)/g;
const PUNCTUATION_REGEX = /^[.,;:!?\-\u2013\u2014()«»"\u201C\u201D\u2026\u2018\u2019']+$/;
const LETTER_REGEX = /[a-zA-Z\u00C0-\u024F\u0400-\u04FF]/;
const normalizeChar = (char) => {
    switch (char) {
        case '\u2019': // ’
        case '\u02BB': // ʻ
        case '\u0027': // '
            return '\u2018'; // ‘ — standart apostrof
        case '\u201C': // “
        case '\u201D': // ”
        case '\u00AB': // «
        case '\u00BB': // »
            return '"';
        case '\u045E': // ў (kirill)
            return 'o‘';
        case '\u040E': // Ў
            return 'O‘';
        case '\u0493': // ғ
            return 'g‘';
        case '\u0492': // Ғ
            return 'G‘';
        default:
            return char;
    }
};
const normalizeText = (text) => {
    let result = '';
    for (let i = 0; i < text.length; i++)
        result += normalizeChar(text[i]);
    return result;
};
const normalizeLower = (token) => normalizeText(token).toLowerCase();
const isPunctuation = (token) => !!token && PUNCTUATION_REGEX.test(token) && !LETTER_REGEX.test(token);
const tokenize = (text) => {
    var _a;
    if (text.trim() === '')
        return [];
    const normalized = normalizeText(text);
    const tokens = (_a = normalized.match(TOKEN_REGEX)) !== null && _a !== void 0 ? _a : [];
    if (tokens.length === 0 && normalized.trim() !== '') {
        return normalized.split(/\s+/).filter(Boolean);
    }
    return tokens;
};
const tokensMatch = (a, b) => a === b || normalizeLower(a) === normalizeLower(b);
/** Tokenlarni Levenshtein DP orqali tekislaydi (tokenlar soni odatda < 300). */
const alignTokens = (orig, user) => {
    const n = orig.length;
    const m = user.length;
    if (n === 0)
        return user.map(u => ({ userToken: u, type: 'insertion' }));
    if (m === 0)
        return orig.map(o => ({ originalToken: o, type: 'deletion' }));
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 0; i <= n; i++)
        dp[i][0] = i;
    for (let j = 0; j <= m; j++)
        dp[0][j] = j;
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const cost = tokensMatch(orig[i - 1], user[j - 1]) ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
    }
    // Traceback
    const aligned = [];
    let i = n;
    let j = m;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0) {
            const cost = tokensMatch(orig[i - 1], user[j - 1]) ? 0 : 1;
            if (dp[i][j] === dp[i - 1][j - 1] + cost) {
                aligned.push({
                    originalToken: orig[i - 1],
                    userToken: user[j - 1],
                    type: cost === 0 ? 'match' : 'substitution',
                });
                i--;
                j--;
                continue;
            }
        }
        if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
            aligned.push({ userToken: user[j - 1], type: 'insertion' });
            j--;
        }
        else if (i > 0) {
            aligned.push({ originalToken: orig[i - 1], type: 'deletion' });
            i--;
        }
        else {
            break;
        }
    }
    return aligned.reverse();
};
const isParonymPair = (a, b) => a !== b && PARONYMS.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
const isAdjacentKeyError = (normOrig, normUser) => {
    if (normOrig.length !== normUser.length)
        return false;
    let diffs = 0;
    for (let k = 0; k < normOrig.length; k++) {
        if (normOrig[k] !== normUser[k]) {
            diffs++;
            if (diffs > 1)
                return false;
            const neighbors = ADJACENT_KEYS[normOrig[k]];
            if (!neighbors || !neighbors.includes(normUser[k]))
                return false;
        }
    }
    return diffs === 1;
};
const isCatastrophicMismatch = (originalTokens, userTokens, matchRatio, matchCount) => {
    // Foydalanuvchi bitta so'z yozgan, original katta matn
    if (userTokens.length === 1 &&
        !isPunctuation(userTokens[0]) &&
        originalTokens.length > CATASTROPHIC_MIN_ORIG_TOKENS &&
        matchRatio < DISSIMILARITY_MATCH_RATIO) {
        return true;
    }
    // Foydalanuvchi juda kam yozgan va moslik past
    return (userTokens.length <= DISSIMILARITY_MIN_USER_TOKENS &&
        userTokens.length < originalTokens.length * DISSIMILARITY_LENGTH_RATIO &&
        matchRatio < DISSIMILARITY_MATCH_RATIO &&
        matchCount < 2);
};
/**
 * Diktantni tekshiradi: asl matn bilan foydalanuvchi matnini tokenlar bo'yicha
 * tekislab, imloviy, punktuatsion, uslubiy va grafik xatolarni aniqlaydi.
 */
class DiktantEvaluator {
    constructor(originalText, userText) {
        this.originalText = originalText;
        this.userText = userText;
        this.detectedErrors = [];
        this.uniqueErrorCodes = {
            IMLO: new Set(),
            PUNKTUATSION: new Set(),
            USLUBIY: new Set(),
            GRAFIK: new Set(),
        };
    }
    get errors() {
        return [...this.detectedErrors];
    }
    get imloErrorCount() {
        return this.uniqueErrorCodes.IMLO.size;
    }
    get punktuatsionErrorCount() {
        return this.uniqueErrorCodes.PUNKTUATSION.size;
    }
    get uslubiyErrorCount() {
        return this.uniqueErrorCodes.USLUBIY.size;
    }
    get grafikErrorCount() {
        return this.uniqueErrorCodes.GRAFIK.size;
    }
    addError(type, description, originalFragment, userFragment, specificRuleCode, penaltyMultiplier = 1) {
        this.detectedErrors.push({
            type,
            description,
            originalFragment,
            userFragment,
            specificRuleCode,
            penaltyMultiplier,
        });
        this.uniqueErrorCodes[type].add(specificRuleCode);
    }
    addMissingPunctuation(originalTokens, code) {
        for (const token of originalTokens) {
            if (isPunctuation(token)) {
                this.addError('PUNKTUATSION', 'Tiniş belgisi tuşib qolgan', token, '', code);
            }
        }
    }
    analyze() {
        this.detectedErrors.length = 0;
        Object.values(this.uniqueErrorCodes).forEach(set => set.clear());
        const originalTokens = tokenize(this.originalText);
        const userTokens = tokenize(this.userText);
        if (originalTokens.length === 0 && userTokens.length === 0)
            return;
        // Original bo'sh — foydalanuvchi ortiqcha yozgan
        if (originalTokens.length === 0) {
            for (const token of userTokens) {
                if (isPunctuation(token)) {
                    this.addError('PUNKTUATSION', 'Ortiqça tiniş belgisi', '', token, 'punkt_ortiqcha_umumiy');
                }
                else {
                    this.addError('IMLO', 'Ortiqça söz', '', token, 'imlo_ortiqcha_soz_umumiy');
                }
            }
            return;
        }
        // Foydalanuvchi hech narsa yozmagan
        if (userTokens.length === 0) {
            this.addError('IMLO', 'Barça sözlar tuşib qolgan', this.originalText, '', 'imlo_barcha_soz_tushibqolgan');
            this.addMissingPunctuation(originalTokens, 'punkt_tushibqolgan_umumiy');
            return;
        }
        const alignedList = alignTokens(originalTokens, userTokens);
        const matchCount = alignedList.filter(p => p.type === 'match').length;
        const matchRatio = matchCount / originalTokens.length;
        if (isCatastrophicMismatch(originalTokens, userTokens, matchRatio, matchCount)) {
            this.addError('IMLO', 'Matn originalga umuman mos kelmaydi', `${originalTokens.slice(0, 5).join(' ')}...`, userTokens.join(' '), 'imlo_katastrofik_nomuvofiqlik');
            this.addMissingPunctuation(originalTokens, 'punkt_tushibqolgan_katastrofik');
            this.findUslubiyErrors(alignedList);
            return;
        }
        this.analyzeAlignedPairs(alignedList);
        this.findUslubiyErrors(alignedList);
    }
    findUslubiyErrors(alignedList) {
        for (const pair of alignedList) {
            if (pair.originalToken === undefined || pair.userToken === undefined)
                continue;
            const origNorm = normalizeLower(pair.originalToken);
            const userNorm = normalizeLower(pair.userToken);
            if (!isParonymPair(origNorm, userNorm))
                continue;
            const code = `uslubiy_paronim_${origNorm}_${userNorm}`;
            if (!this.uniqueErrorCodes.USLUBIY.has(code)) {
                this.addError('USLUBIY', `Paronimik xato (${origNorm}/${userNorm})`, pair.originalToken, pair.userToken, code);
            }
        }
    }
    analyzeAlignedPairs(alignedList) {
        let deletedWords = [];
        let insertedWords = [];
        const flushDeleted = () => {
            if (deletedWords.length === 0)
                return;
            const significant = deletedWords.length >= SIGNIFICANT_MISSING_WORDS;
            this.addError('IMLO', significant ? 'Matnning katta qismi yozilmagan' : 'Söz(lar) tuşib qolgan', deletedWords.join(' '), '', significant ? 'imlo_katta_hajm_tushibqolgan' : 'imlo_tushibqolgan_guruh');
            deletedWords = [];
        };
        const flushInserted = () => {
            if (insertedWords.length === 0)
                return;
            this.addError('IMLO', 'Ortiqça söz(lar)', '', insertedWords.join(' '), 'imlo_ortiqcha_guruh');
            insertedWords = [];
        };
        const flushBuffers = () => {
            flushDeleted();
            flushInserted();
        };
        /**
         * Qo'shib yoki ajratib yozilgan so'zni aniqlash.
         * Misol: original "raqamli tarzda", foydalanuvchi "raqamlitarzda" —
         * tekislashda raqamli → deletion, tarzda ↔ raqamlitarzda (substitution).
         */
        const tryDetectMergedWords = (origToken, userToken) => {
            if (deletedWords.length === 0 && insertedWords.length === 0)
                return false;
            const userNorm = normalizeLower(userToken);
            if (deletedWords.length > 0) {
                // Buferdagi so'zlar + joriy original = foydalanuvchi so'zi
                const combined = [...deletedWords, origToken];
                if (combined.map(normalizeLower).join('') === userNorm) {
                    this.addError('IMLO', 'Sözlar qöşib yozilgan', combined.join(' '), userToken, 'imlo_sozlar_qoshib_yozilgan');
                    deletedWords = [];
                    return true;
                }
                // Faqat buferdagi so'zlar = foydalanuvchi so'zi
                if (deletedWords.length >= 2 && deletedWords.map(normalizeLower).join('') === userNorm) {
                    this.addError('IMLO', 'Sözlar qöşib yozilgan', deletedWords.join(' '), userToken, 'imlo_sozlar_qoshib_yozilgan');
                    deletedWords = [];
                    return true;
                }
            }
            if (insertedWords.length > 0) {
                const combined = [...insertedWords, userToken];
                if (combined.map(normalizeLower).join('') === normalizeLower(origToken)) {
                    this.addError('IMLO', 'Söz ajratib yozilgan', origToken, combined.join(' '), 'imlo_soz_ajratib_yozilgan');
                    insertedWords = [];
                    return true;
                }
            }
            return false;
        };
        for (const pair of alignedList) {
            const orig = pair.originalToken;
            const user = pair.userToken;
            if (pair.type === 'match')
                flushBuffers();
            if (pair.type === 'substitution') {
                if (orig !== undefined &&
                    user !== undefined &&
                    !isPunctuation(orig) &&
                    !isPunctuation(user) &&
                    tryDetectMergedWords(orig, user)) {
                    continue;
                }
                flushBuffers();
            }
            switch (pair.type) {
                case 'deletion':
                    if (orig === undefined)
                        continue;
                    if (isPunctuation(orig)) {
                        this.addError('PUNKTUATSION', 'Tiniş belgisi tuşib qolgan', orig, '', 'punkt_tushibqolgan_umumiy');
                    }
                    else {
                        deletedWords.push(orig);
                    }
                    break;
                case 'insertion':
                    if (user === undefined)
                        continue;
                    if (isPunctuation(user)) {
                        this.addError('PUNKTUATSION', 'Ortiqça tiniş belgisi', '', user, 'punkt_ortiqcha_umumiy');
                    }
                    else {
                        insertedWords.push(user);
                    }
                    break;
                case 'match':
                    if (orig === undefined || user === undefined)
                        continue;
                    this.checkMatchPairErrors(orig, user);
                    break;
                case 'substitution':
                    if (orig === undefined || user === undefined)
                        continue;
                    this.checkSubstitutionErrors(orig, user);
                    break;
            }
        }
        flushBuffers();
    }
    /** o\u2018 va g\u2018 belgilarining to'g'ri ishlatilganini tekshiradi. */
    checkGraphicError(origToken, userToken) {
        const normOrig = normalizeText(origToken);
        const normUser = normalizeText(userToken);
        for (const letter of ['o', 'O', 'g', 'G']) {
            const marked = `${letter}‘`;
            if (normOrig.includes(marked) &&
                !normUser.includes(marked) &&
                normOrig.split(marked).join(letter) === normUser) {
                this.addError('GRAFIK', `${marked} harfidagi belgi tuşib qolgan`, origToken, userToken, `grafik_${letter.toLowerCase()}_belgi_tushgan`);
                return true;
            }
        }
        return false;
    }
    /** Match juftlikda ham bosh harf va grafik xatolar bo'lishi mumkin. */
    checkMatchPairErrors(orig, user) {
        if (orig === user || isPunctuation(orig))
            return;
        if (orig.toLowerCase() === user.toLowerCase()) {
            this.addError('IMLO', 'Boş harf imlosida xato', orig, user, 'imlo_bosh_harf_umumiy');
        }
        this.checkGraphicError(orig, user);
    }
    checkHXSwap(normOrig, normUser, origToken, userToken) {
        const swaps = [
            ['h', 'x'],
            ['x', 'h'],
        ];
        for (const [from, to] of swaps) {
            if (normOrig.includes(from) && normUser.includes(to) && normOrig.split(from).join(to) === normUser) {
                this.addError('IMLO', `${from} o‘rniga ${to} yozilgan`, origToken, userToken, 'imlo_h_x_almashinuvi');
                return true;
            }
        }
        return false;
    }
    checkApostropheError(normOrig, normUser, origToken, userToken) {
        // o‘ va g‘ ni alohida ajratib, haqiqiy tutuq belgisini tekshirish
        const placeholder = '\u0000';
        const mask = (value) => value.split('o‘').join(`o${placeholder}`).split('g‘').join(`g${placeholder}`);
        const clean = (value) => value.split('‘').join('').split(placeholder).join('‘');
        const origBase = mask(normOrig);
        const userBase = mask(normUser);
        if (clean(origBase) !== clean(userBase))
            return false;
        const origHasApostrophe = origBase.includes('‘');
        const userHasApostrophe = userBase.includes('‘');
        if (origHasApostrophe && !userHasApostrophe) {
            this.addError('IMLO', 'Tutuq belgisi tuşib qolgan', origToken, userToken, 'imlo_tutuq_tushibqolgan');
            return true;
        }
        if (!origHasApostrophe && userHasApostrophe) {
            this.addError('IMLO', 'Örinsiz tutuq belgisi işlatilgan', origToken, userToken, 'imlo_tutuq_orinsiz');
            return true;
        }
        return false;
    }
    checkSubstitutionErrors(orig, user) {
        const origIsPunct = isPunctuation(orig);
        const userIsPunct = isPunctuation(user);
        if (origIsPunct && userIsPunct) {
            if (orig !== user) {
                this.addError('PUNKTUATSION', 'Tiniş belgisi notöğri qöllanilgan', orig, user, 'punkt_belgi_almashgan_umumiy');
            }
            return;
        }
        if (origIsPunct !== userIsPunct) {
            this.addError('IMLO', origIsPunct
                ? 'Tiniş belgisi örniga söz yozilgan'
                : 'Söz örniga tiniş belgisi yozilgan', orig, user, 'imlo_soz_va_punkt_almashuvi_umumiy');
            return;
        }
        const normOrigLower = normalizeLower(orig);
        const normUserLower = normalizeLower(user);
        // 1. Grafik xato (o‘/g‘ bilan bog'liq)
        if (this.checkGraphicError(orig, user))
            return;
        // 2. Bosh harf xatosi
        if (normOrigLower === normUserLower) {
            if (orig !== user) {
                this.addError('IMLO', 'Boş harf imlosida xato', orig, user, 'imlo_bosh_harf_umumiy');
            }
            return;
        }
        // 3. h/x almashinuvi
        if (this.checkHXSwap(normOrigLower, normUserLower, orig, user))
            return;
        // 4. Tutuq belgisi xatosi
        if (this.checkApostropheError(normOrigLower, normUserLower, orig, user))
            return;
        // 5. Klaviatura yaqinligi
        if (isAdjacentKeyError(normOrigLower, normUserLower)) {
            this.addError('IMLO', 'Klaviatura yaqinligi xatosi', orig, user, 'imlo_klaviatura_yaqinlik', 0.5);
            return;
        }
        // 6. Umumiy imlo xatosi
        this.addError('IMLO', 'Sözni notöğri yoziş', orig, user, `imlo_soz_almashtirish_${normOrigLower}_vs_${normUserLower}`);
    }
    get hasCriticalError() {
        const codes = this.uniqueErrorCodes.IMLO;
        return (codes.has('imlo_katastrofik_nomuvofiqlik') ||
            codes.has('imlo_katta_hajm_tushibqolgan') ||
            codes.has('imlo_barcha_soz_tushibqolgan'));
    }
    /** 5 ballik baho. */
    evaluate5PointScale() {
        if (this.hasCriticalError)
            return 1;
        const imlo = this.imloErrorCount;
        const totalErrors = imlo + this.punktuatsionErrorCount + this.uslubiyErrorCount + this.grafikErrorCount;
        if (totalErrors <= 1)
            return 5;
        if (imlo <= 2 && totalErrors <= 4)
            return 4;
        if (imlo <= 4 && totalErrors <= 8)
            return 3;
        if (imlo <= 7 && totalErrors <= 14)
            return 2;
        return 1;
    }
    /** 100 ballik baho: har bir xato turiga qarab ball ayiriladi. */
    evaluate100PointScale() {
        if (this.hasCriticalError)
            return 0;
        const penalties = { IMLO: 2.5, PUNKTUATSION: 2, USLUBIY: 1.5, GRAFIK: 1.5 };
        let score = 100;
        for (const error of this.detectedErrors) {
            score -= penalties[error.type] * error.penaltyMultiplier;
        }
        return Math.min(100, Math.max(0, score));
    }
}
exports.DiktantEvaluator = DiktantEvaluator;
