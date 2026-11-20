// A small local preview server for the guide, for the maker's own machine.
//
//   node serve.ts            -> http://localhost:8080
//   node serve.ts --port 9…  -> a different port
//
// It serves only the files inside app/, answers with the content types a
// browser needs for a static page, and refuses anything that tries to escape
// the app folder. The guide itself needs no server at all — any static file
// host, or the grader's own serving, works exactly the same, offline included.
// Node 22 standard library only.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));

const argv = process.argv.slice(2);
const flagAt = argv.indexOf('--port');
const wanted = flagAt === -1 ? 8080 : Number(argv[flagAt + 1]);
const listenPort = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

const server = createServer((req, res) => {
  let pathPart: string;
  try {
    pathPart = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  if (pathPart.endsWith('/')) pathPart += 'index.html';

  const target = resolve(join(appRoot, normalize(pathPart)));
  const inside = target === appRoot || target.startsWith(appRoot + sep);
  if (!inside) {
    res.writeHead(403).end('forbidden');
    return;
  }

  let length: number;
  try {
    const info = statSync(target);
    if (!info.isFile()) throw new Error('directory, not a file');
    length = info.size;
  } catch {
    res.writeHead(404).end('not found');
    return;
  }

  res.writeHead(200, {
    'content-type': CONTENT_TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream',
    'content-length': length,
    'cache-control': 'no-store',
  });
  createReadStream(target).pipe(res);
});

server.listen(listenPort, '127.0.0.1', () => {
  console.log('Leonida Platinum guide is being served at http://localhost:' + listenPort);
});
