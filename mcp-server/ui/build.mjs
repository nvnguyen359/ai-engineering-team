import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');
const outDir = path.join(__dirname, '..', 'dist');
fs.mkdirSync(outDir, { recursive: true });

const result = await build({
  entryPoints: [path.join(srcDir, 'app.ts')],
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2022'],
  write: false,
});

const jsCode = result.outputFiles[0].text;
const cssCode = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf-8');
const template = fs.readFileSync(path.join(srcDir, 'template.html'), 'utf-8');

const finalHtml = template
  .replace('/*__INLINE_CSS__*/', cssCode)
  .replace('/*__INLINE_JS__*/', jsCode);

const outFile = path.join(outDir, 'dashboard.html');
fs.writeFileSync(outFile, finalHtml, 'utf-8');
console.log(`Built ${outFile} (${(Buffer.byteLength(finalHtml, 'utf-8') / 1024).toFixed(1)} KB)`);
