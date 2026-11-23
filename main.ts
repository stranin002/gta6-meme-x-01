// gta6-meme-x-01 entry (Node 22, standard library only).
//
// What this program does, in one sentence: it reads POST.json from the
// repository, checks that it really names one public X post, and copies it
// byte-for-byte to /output/POST.json, where the house gate reads it.
//
// The entry itself is the post, not this program: the agent made a GTA 6
// meme with make.fun's ghost in the picture, the user posted it on X from
// @jelas_enak_007 with make.fun and a play code in the text, and POST.json
// names that post. Resubmitted 23 Nov 2026: the starter only copied
// POST.json, this version also refuses a placeholder or mistyped address,
// so a bad POST.json fails loudly here instead of at the gate. The house reads the post from X (its first picture and
// its text) and hands that to the judge. Nothing this program writes about
// the post is judged, so this file stays deliberately boring: no network,
// no clock, no files outside the repository, and the same input always
// produces the same output bytes.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// An X post address looks like https://x.com/<handle>/status/<digits>
// (twitter.com works too). Anything else is not a post, so refuse it
// loudly instead of handing the gate a placeholder or a typo.
const POST_URL = /^https:\/\/(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+\/?$/;

const sourcePath = join(BOT_DIR, 'POST.json');
const outputPath = join(OUTPUT_DIR, 'POST.json');

let post: unknown;
try {
  post = JSON.parse(readFileSync(sourcePath, 'utf8'));
} catch (err) {
  console.error(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof post !== 'object' || post === null || !('url' in post)) {
  console.error('POST.json must be a JSON object with a "url" field naming the X post.');
  process.exit(1);
}

const url = (post as { url: unknown }).url;
if (typeof url !== 'string' || !POST_URL.test(url)) {
  console.error(`POST.json url is not an X post address: ${String(url)}`);
  process.exit(1);
}

// The gate reads POST.json from the output directory, so copy the file the
// repository holds and then prove the copy is byte-identical.
mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(sourcePath, outputPath);
} catch (err) {
  console.error(`POST.json could not be copied to ${OUTPUT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

const sourceBytes = readFileSync(sourcePath);
const outputBytes = readFileSync(outputPath);
if (!sourceBytes.equals(outputBytes)) {
  console.error('POST.json copy does not match the repository file.');
  process.exit(1);
}

console.log(`Entry post handed in: ${url}`);
