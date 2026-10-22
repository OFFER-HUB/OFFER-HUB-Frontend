import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
mkdirSync(distDir, { recursive: true });

const cjsFile = path.join(distDir, 'index.cjs');
if (!existsSync(cjsFile)) {
  writeFileSync(cjsFile, "module.exports = require('./index.js');\n");
}
