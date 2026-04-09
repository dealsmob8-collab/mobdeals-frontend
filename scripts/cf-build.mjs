import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const nextCacheFetchDir = path.join(rootDir, '.next', 'cache', 'fetch-cache');
const openNextDir = path.join(rootDir, '.open-next');
const opennextBin = path.join(rootDir, 'node_modules', '.bin', 'opennextjs-cloudflare');

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function cleanFetchCache() {
  if (!fs.existsSync(nextCacheFetchDir)) {
    return;
  }

  let removed = 0;
  for (const entry of fs.readdirSync(nextCacheFetchDir)) {
    const filePath = path.join(nextCacheFetchDir, entry);
    const stat = fs.statSync(filePath);

    if (!stat.isFile()) {
      continue;
    }

    const contents = fs.readFileSync(filePath, 'utf8');
    if (contents.trim().length === 0) {
      fs.unlinkSync(filePath);
      removed += 1;
      continue;
    }

    try {
      JSON.parse(contents);
    } catch {
      fs.unlinkSync(filePath);
      removed += 1;
    }
  }

  if (removed > 0) {
    console.log(`Removed ${removed} invalid fetch-cache entr${removed === 1 ? 'y' : 'ies'}.`);
  }
}

fs.rmSync(openNextDir, { recursive: true, force: true });
fs.rmSync(nextCacheFetchDir, { recursive: true, force: true });

run('npm', ['run', 'build']);
cleanFetchCache();
run(opennextBin, ['--skipBuild']);
