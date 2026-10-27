/**
 * Diktant baholovchisini PocketBase hooklari uchun oddiy JS ga o'giradi:
 *   node scripts/build-pb-evaluator.ts
 * `src/lib/app/evaluator.ts` o'zgarsa, qayta ishga tushiring va
 * `pocketbase/pb_hooks/lib/evaluator.js` ni serverga nusxalang — sayt va server
 * diktantni bir xil baholashi kerak.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'src', 'lib', 'app', 'evaluator.ts'), 'utf8');

const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, removeComments: false },
});

if (/require\(/.test(outputText)) {
    throw new Error("evaluator.ts faqat tiplarni import qilishi kerak — hookda boshqa modul yo'q.");
}

const header = '// Avtomatik yaratilgan: node scripts/build-pb-evaluator.ts — qo‘lda o‘zgartirmang.\n';
writeFileSync(join(root, 'pocketbase', 'pb_hooks', 'lib', 'evaluator.js'), header + outputText);
console.log('pocketbase/pb_hooks/lib/evaluator.js yangilandi');
