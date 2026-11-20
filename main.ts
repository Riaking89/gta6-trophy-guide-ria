// Vice City Trophy Tracker — hands the guide in for gta6-trophy-guide-01.
// Run: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program copies app/ and screenshots/ beside this file into the output
// directory and writes dossier.json there with the vendored make.fun library.
// vendor/makefun-frontend.ts stays exactly as the kit shipped it: the scorer
// rebuilds the dossier with its own copy and compares the two byte for byte.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps mirror the gate in the competition rules: at most 4 screenshots of
// 256 KiB each, app/ under 993 files and 48 MiB, dossier text at 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
