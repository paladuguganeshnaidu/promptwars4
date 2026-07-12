import { readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIRECTORIES_TO_REMOVE = ['node_modules', 'dist', 'build', 'client/dist', 'server/dist'];
const FILE_PATTERNS = [/\.log$/i, /\.tmp$/i, /\.pyc$/i, /\.DS_Store$/i];

function removeDirectory(relativePath) {
  rmSync(path.join(ROOT, relativePath), { recursive: true, force: true });
}

function walk(relativeDir) {
  const absoluteDir = path.join(ROOT, relativeDir);
  for (const entry of readdirSync(absoluteDir)) {
    const absolutePath = path.join(absoluteDir, entry);
    const relativePath = path.join(relativeDir, entry);
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === 'build' || entry === '__pycache__') {
        removeDirectory(relativePath);
        continue;
      }
      walk(relativePath);
      continue;
    }
    if (FILE_PATTERNS.some((pattern) => pattern.test(entry))) {
      rmSync(absolutePath, { force: true });
    }
  }
}

for (const directory of DIRECTORIES_TO_REMOVE) {
  removeDirectory(directory);
}

walk('.');