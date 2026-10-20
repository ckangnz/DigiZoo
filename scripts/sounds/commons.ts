import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cacheDir, remember } from './lib/cache';
import {
  type Candidate,
  categoryFiles,
  fileInfo,
  searchFiles,
  subcategories,
} from './lib/commons-api';

const USAGE = `Usage:
  commons.ts search "<query>" [--limit 100]           full-text search (filetype:audio added)
  commons.ts category "<Category:…>" [--depth 1]      files in a category tree
  commons.ts subcats "<Category:…>"                   list subcategories
  commons.ts info "<File:…>" ["<File:…>" …]           metadata for specific files
Options:
  --all            also list disallowed files (with reasons)
  --video          also list videos (their audio track is used via a decodable transcode)
  --min <s>        minimum duration (default 0.3)
  --max <s>        maximum duration (default 1200)
  --limit <n>      maximum files to inspect (default 200)
  --depth <n>      category depth (default 1)
  --brief          one line per file
  --out <name>     candidates file name (default: slug of the query)
Writes .sound-cache/candidates/<name>.json`;

interface Options {
  all: boolean;
  video: boolean;
  min: number;
  max: number;
  limit: number;
  depth: number;
  brief: boolean;
  out?: string;
  rest: string[];
}

function parse(argv: string[]): Options {
  const options: Options = {
    all: false,
    video: false,
    min: 0.3,
    max: 1200,
    limit: 200,
    depth: 1,
    brief: false,
    rest: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) throw new Error(`Missing value for ${arg}`);
      return value;
    };
    if (arg === '--all') options.all = true;
    else if (arg === '--video') options.video = true;
    else if (arg === '--brief') options.brief = true;
    else if (arg === '--min') options.min = Number(next());
    else if (arg === '--max') options.max = Number(next());
    else if (arg === '--limit') options.limit = Number(next());
    else if (arg === '--depth') options.depth = Number(next());
    else if (arg === '--out') options.out = next();
    else options.rest.push(arg);
  }
  return options;
}

function slug(value: string): string {
  return (
    value
      .replace(/^(Category|File):/i, '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'candidates'
  );
}

function pad(value: string, size: number): string {
  return value.length >= size ? value : value + ' '.repeat(size - value.length);
}

function format(candidate: Candidate): string {
  const rate = candidate.sampleRate ? `${Math.round(candidate.sampleRate / 1000)}k` : '?';
  const audio = `${candidate.codec.toLowerCase()} ${rate}/${candidate.channels || '?'}`;
  const flags = candidate.flags.length ? `  [${candidate.flags.join(', ')}]` : '';
  const reasons = candidate.reasons.length ? `  !! ${candidate.reasons.join('; ')}` : '';
  return `${candidate.allowed ? 'ok' : '--'} ${pad(`${candidate.duration.toFixed(1)}s`, 7)} ${pad(candidate.license || '?', 16)} ${pad(audio, 16)} ${candidate.title}${flags}${reasons}`;
}

function show(candidates: Candidate[], options: Options, name: string): void {
  const inRange = candidates.filter(
    (c) =>
      (c.duration === 0 || (c.duration >= options.min && c.duration <= options.max)) &&
      (options.video || options.all || c.mediatype !== 'VIDEO'),
  );
  const listed = options.all ? inRange : inRange.filter((c) => c.allowed);
  listed.sort((a, b) => Number(b.allowed) - Number(a.allowed));
  listed.forEach((candidate, index) => {
    console.log(`${pad(String(index + 1), 4)}${format(candidate)}`);
    if (!options.brief) {
      const author = candidate.author ? `by ${candidate.author.slice(0, 60)}` : 'no author';
      const description = candidate.description.slice(0, 150);
      console.log(`      ${author} | ${description}`);
      const categories = candidate.categories
        .filter(
          (c) => !/^(CC-|PD-|Self-published|Audio files of 20|Files with|Media missing)/.test(c),
        )
        .slice(0, 6)
        .join(' · ');
      if (categories) console.log(`      cats: ${categories}`);
    }
  });
  const out = resolve(cacheDir('candidates'), `${name}.json`);
  writeFileSync(out, `${JSON.stringify(listed, null, 2)}\n`);
  const hidden = candidates.length - listed.length;
  console.log(
    `\n${listed.length} listed (${candidates.length} inspected${hidden ? `, ${hidden} hidden by licence/type/duration filters` : ''}) → ${out}`,
  );
}

async function main(): Promise<void> {
  process.stdout.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EPIPE') process.exit(0);
  });
  const [command, ...argv] = process.argv.slice(2);
  const options = parse(argv);
  if (!command || options.rest.length === 0) {
    console.log(USAGE);
    process.exitCode = command ? 1 : 0;
    return;
  }
  if (command === 'subcats') {
    for (const category of options.rest) {
      const list = await subcategories(category);
      console.log(`${category}: ${list.length} subcategories`);
      for (const sub of list) console.log(`  ${sub}`);
    }
    return;
  }
  let titles: string[] = [];
  if (command === 'search') {
    titles = await searchFiles(options.rest.join(' '), options.limit, options.video);
  } else if (command === 'category') {
    for (const category of options.rest) {
      const found = await categoryFiles(category, options.depth, options.limit);
      console.log(
        `${category}: ${found.files.length} files in ${found.categories.length} categories`,
      );
      titles.push(...found.files);
    }
  } else if (command === 'info') {
    titles = options.rest;
  } else {
    console.log(USAGE);
    process.exitCode = 1;
    return;
  }
  const candidates = await fileInfo(titles);
  remember(candidates);
  show(candidates, options, options.out ?? slug(`${command}-${options.rest.join('-')}`));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
