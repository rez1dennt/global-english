import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const demo = join(root, 'vercel-demo');
const site = join(demo, 'site');
const staticFiles = join(demo, 'static');
const dist = join(demo, 'dist');

await rm(dist, { recursive: true, force: true });
await cp(site, dist, { recursive: true });
await mkdir(join(dist, 'global-english'), { recursive: true });
await cp(join(root, 'global-english', 'assets'), join(dist, 'global-english', 'assets'), { recursive: true });
for (const entry of await readdir(staticFiles, { withFileTypes: true })) {
    await cp(join(staticFiles, entry.name), join(dist, entry.name), { recursive: entry.isDirectory() });
}

const required = [
    'index.html', 'privacy-policy/index.html', 'data-consent/index.html',
    'demo-form.js', 'robots.txt', 'global-english/assets/css/main.css',
];
for (const relative of required) await stat(join(dist, relative));
for (const relative of required.filter(file => file.endsWith('.html'))) {
    const html = await readFile(join(dist, relative), 'utf8');
    if (/localhost|preview\.php|<\?php/i.test(html)) throw new Error(`${relative}: forbidden dynamic reference`);
}
console.log(`Vercel demo build: PASS (${required.length} required outputs)`);
