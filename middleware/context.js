import { fileURLToPath } from 'url';
import path              from 'path';
import { readFile }      from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const metaPath   = path.join(__dirname, `../package.json`);

export default async function loadContext(ctx) {
  const json = await readFile(metaPath, `utf8`);
  ctx.meta = JSON.parse(json);
}
