// Leonida Platinum — hand-in program for the gta6-trophy-guide-01 entry.
//
// What this does, and all it does: it takes the finished guide that lives in
// this repository — the static web app under app/ and the maker's screenshots
// under screenshots/ — and delivers it to the output directory, together with
// the dossier.json summary the judges read. The dossier is produced by the
// vendored make.fun library in vendor/makefun-frontend.ts, which must stay
// byte-identical to the kit's copy, so this file only feeds it the output
// folder and the scorer's caps.
//
// Run it the way the grader does (output defaults to /output), or locally:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Node 22, standard library only — nothing is installed before it runs.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The app goes in whole: index.html, its script and stylesheet, and
// app/data/trophies.json carrying all 55 trophies with their guides.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });

// Screenshots travel beside the app; the first by name becomes the cover.
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoDir, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// Caps below are the scorer's own numbers for this bounty: the dossier text
// budget, at most 4 screenshots of at most 256 KiB each, and an app of at
// most 993 files totalling at most 48 MiB.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierText);
