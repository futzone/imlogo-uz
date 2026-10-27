/**
 * Saytdagi TypeScript kodini PocketBase hooklari uchun oddiy JS ga o'giradi:
 *   npm run pb:lib
 *
 * - `pocketbase/pb_hooks/lib/evaluator.js` — diktant baholovchisi (`src/lib/app/evaluator.ts`);
 * - `pocketbase/pb_hooks/lib/typing.js` — tez yozish dvigateli, bosishlar logini
 *   qayta o'ynash, evristikalar va so'z generatori (`src/lib/app/typing/*`, translit);
 * - `pocketbase/pb_hooks/lib/data/` — so'zlar, gaplar va translit lug'ati.
 *
 * Shu fayllardan biri o'zgarsa, qayta ishga tushiring va `pb_hooks/lib/` ni
 * serverga nusxalang — sayt va server natijani bir xil hisoblashi kerak.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const out = join(root, 'pocketbase', 'pb_hooks', 'lib');
const header = '// Avtomatik yaratilgan: npm run pb:lib — qo‘lda o‘zgartirmang.\n';

const transpile = (file: string): string =>
    ts.transpileModule(readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
    }).outputText;

// Diktant baholovchisi: faqat tiplarni import qiladi.
const evaluator = transpile(join(src, 'lib', 'app', 'evaluator.ts'));
if (/require\(/.test(evaluator)) throw new Error("evaluator.ts faqat tiplarni import qilishi kerak — hookda boshqa modul yo'q.");
writeFileSync(join(out, 'evaluator.js'), header + evaluator);

/**
 * Tez yozish modullari bitta faylga yig'iladi (oddiy CommonJS bundler):
 * PocketBase'ning `require()` i ichki nisbiy yo'llarga tayanmasligi uchun.
 */
const resolve = (from: string, specifier: string): string => {
    const base = specifier.startsWith('@/') ? join(src, specifier.slice(2)) : join(dirname(from), specifier);
    return base.endsWith('.ts') ? base : `${base}.ts`;
};
const modules = new Map<string, string>();
const collect = (file: string) => {
    if (modules.has(file)) return;
    modules.set(file, '');
    let code = transpile(file);
    code = code.replace(/require\("([^"]+)"\)/g, (_, specifier: string) => {
        const target = resolve(file, specifier);
        collect(target);
        return `__require(${JSON.stringify(relative(src, target))})`;
    });
    modules.set(file, code);
};
const entries = ['replay', 'guard', 'words', 'result', 'config', 'text', 'engine', 'input'].map(name => join(src, 'lib', 'app', 'typing', `${name}.ts`));
entries.push(join(src, 'lib', 'translit', 'core.ts'));
entries.forEach(collect);

const bundle = [
    header,
    'const __modules = {',
    ...[...modules].map(([file, code]) => `${JSON.stringify(relative(src, file))}: function (exports) {\n${code}\n},`),
    '};',
    'const __cache = {};',
    'function __require(id) {',
    '    if (!__cache[id]) {',
    '        __cache[id] = {};',
    '        __modules[id](__cache[id]);',
    '    }',
    '    return __cache[id];',
    '}',
    `module.exports = Object.assign({}, ${entries.map(file => `__require(${JSON.stringify(relative(src, file))})`).join(', ')});`,
    '',
].join('\n');
writeFileSync(join(out, 'typing.js'), bundle);

mkdirSync(join(out, 'data'), { recursive: true });
copyFileSync(join(root, 'public', 'words', 'uz.txt'), join(out, 'data', 'uz.txt'));
copyFileSync(join(root, 'public', 'words', 'uz-sentences.txt'), join(out, 'data', 'uz-sentences.txt'));
copyFileSync(join(root, 'public', 'translit', 'lexicon.txt'), join(out, 'data', 'lexicon.txt'));

console.log(`pocketbase/pb_hooks/lib yangilandi: evaluator.js, typing.js (${modules.size} modul), data/`);
