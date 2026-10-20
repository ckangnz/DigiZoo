import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface Source {
  title: string;
  author: string;
  license: string;
  licenseUrl?: string;
  source: string;
}

interface Credit extends Source {
  id: string;
  file: string;
  duration: number;
  changes?: string;
  sources?: Source[];
}

const root = resolve(import.meta.dirname, '..');
const dir = resolve(root, 'src/audio/samples');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const credits: Credit[] = files
  .map((f) => JSON.parse(readFileSync(resolve(dir, f), 'utf8')) as Credit)
  .sort((a, b) => a.id.localeCompare(b.id));

const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const link = (label: string, url?: string) => (url ? `[${cell(label)}](${url})` : cell(label));

const rows = credits.flatMap((c) => {
  const main = `| ${c.id} | ${link(c.title, c.source)} | ${cell(c.author)} | ${link(c.license, c.licenseUrl)} | ${cell(c.changes ?? '')} |`;
  const extra = (c.sources ?? []).map(
    (s) =>
      `| ↳ | ${link(s.title, s.source)} | ${cell(s.author)} | ${link(s.license, s.licenseUrl)} | source layer |`,
  );
  return [main, ...extra];
});

const out = `# Credits

All artwork in DigiZoo is drawn in code (no image files). Real animal sounds are recordings shared by
the people below under free licences (CC0, public domain, CC BY, CC BY-SA), mostly via
[Wikimedia Commons](https://commons.wikimedia.org/). Each clip was trimmed, loudness-normalised and
converted to mono MP3; clips derived from CC BY-SA recordings are shared under the same licence.
Sounds not listed here are synthesised in the app.

| Sticker | Recording | Author | Licence | Changes |
| --- | --- | --- | --- | --- |
${rows.join('\n')}
`;

writeFileSync(resolve(root, 'CREDITS.md'), out);
console.log(`CREDITS.md: ${credits.length} sounds`);
