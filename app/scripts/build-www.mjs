// Copies the Studio (admin/) and what it imports into app/www, adds the native bridge.
import { cpSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(APP, '..');
const WWW = join(APP, 'www');
const version = JSON.parse(readFileSync(join(APP, 'package.json'), 'utf8')).version;
rmSync(WWW, { recursive: true, force: true });
mkdirSync(WWW, { recursive: true });
for (const p of ['admin', 'lib', 'assets/fonts', 'assets/favicon.svg', 'worlds.js', 'content.js']) cpSync(join(SITE, p), join(WWW, p), { recursive: true });
await build({ entryPoints: [join(APP, 'native.js')], bundle: true, format: 'iife', target: 'es2020', minify: true, external: ['firebase/auth', 'firebase/app'], outfile: join(WWW, 'admin/native.js'), define: { __APP_VERSION__: JSON.stringify(version) } });
// the native bridge loads before the Studio
const page = join(WWW, 'admin/index.html');
writeFileSync(page, readFileSync(page, 'utf8').replace('<script type="module"', '<script src="native.js"></script>\n  <script type="module"'));
writeFileSync(join(WWW, 'index.html'), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=admin/index.html"><script>location.replace("admin/index.html")</script>');
console.log(`www ready (v${version})`);
