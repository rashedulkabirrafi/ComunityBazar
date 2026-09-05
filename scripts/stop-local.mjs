import { readFileSync, readlinkSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url)).replace(/\/$/, '');
const pidFile = `${root}/.local-data/stack.pid`;
if (!existsSync(pidFile)) {
  console.log('No managed local stack is running.');
  process.exit(0);
}
const pid = Number(readFileSync(pidFile, 'utf8'));
if (!Number.isInteger(pid) || pid < 2) throw new Error('Invalid local stack PID.');
try {
  const args = readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0');
  if (readlinkSync(`/proc/${pid}/cwd`) !== root || !args.some(arg => arg.endsWith('scripts/start-local.mjs'))) {
    throw new Error('PID belongs to another process; refusing to stop it.');
  }
} catch (error) {
  if (error.code === 'ENOENT') { console.log('Local stack has already stopped.'); process.exit(0); }
  throw error;
}
process.kill(pid, 'SIGTERM');
for (let attempt = 0; attempt < 60; attempt++) {
  await new Promise(resolve => setTimeout(resolve, 500));
  try { process.kill(pid, 0); } catch {
    console.log('Local stack stopped.'); process.exit(0);
  }
}
throw new Error('Shutdown is taking longer than expected; inspect .local-data/logs.');
