import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'vercel-demo', 'site');
const preview = (process.env.GE_PREVIEW_URL || 'http://127.0.0.1:8765/global-english/tests/preview.php').replace(/[?&]+$/, '');
const routes = [
    { name: 'home', url: preview, output: join(site, 'index.html') },
    { name: 'privacy-policy', url: `${preview}?page=privacy-policy`, output: join(site, 'privacy-policy', 'index.html') },
    { name: 'data-consent', url: `${preview}?page=data-consent`, output: join(site, 'data-consent', 'index.html') },
];

function transform(html) {
    const replacements = [
        ['/global-english/tests/preview.php?page=privacy-policy', '/privacy-policy/'],
        ['/global-english/tests/preview.php?page=data-consent', '/data-consent/'],
        ['/global-english/tests/preview.php', '/'],
    ];
    let output = html;
    for (const [from, to] of replacements) output = output.replaceAll(from, to);
    output = output.replace(/\?v=\d+(?=["'])/gi, '');
    output = output.replace(/<form\b([^>]*\bdata-trial-form\b[^>]*)>([\s\S]*?)<\/form>/gi, (_match, attributes, contents) => {
        const safeAttributes = attributes
            .replace(/\saction=["'][^"']*["']/gi, '')
            .replace(/\smethod=["'][^"']*["']/gi, '');
        const safeContents = contents
            .replace(/\sname=["'](name|phone)["']/gi, ' data-demo-name="$1"')
            .replace(/<button\b([^>]*\btype=["']submit["'][^>]*)>/gi, (button, buttonAttributes) => {
                if (/\sdisabled(?:\s|=|>)/i.test(button)) return button;
                return `<button${buttonAttributes} disabled data-static-demo-submit>`;
            });
        return `<form${safeAttributes} action="#" data-static-demo-form>${safeContents}</form>`;
    });
    output = output.replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>\s*/gi, '');
    output = output.replace(/<html\b(?![^>]*data-static-demo)/i, '<html data-static-demo="true"');
    output = output.replace('</head>', '    <meta name="robots" content="noindex, nofollow">\n</head>');
    output = output.replace('</body>', '    <script src="/demo-form.js"></script>\n</body>');
    return output;
}

for (const route of routes) {
    const response = await fetch(route.url, { headers: { Accept: 'text/html' } });
    if (!response.ok) throw new Error(`${route.name}: preview returned ${response.status}`);
    const html = transform(await response.text());
    if (/localhost|<\?php|(?:href|src|action)=["'][^"']*\.php(?:[?/#"']|$)/i.test(html)) throw new Error(`${route.name}: unsafe dynamic reference remains`);
    if ((html.match(/<h1\b/gi) || []).length !== 1) throw new Error(`${route.name}: expected exactly one h1`);
    await mkdir(dirname(route.output), { recursive: true });
    await writeFile(route.output, html, 'utf8');
    console.log(`Exported ${route.name}`);
}
