import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, createWriteStream, writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const children = [];
let mongo;
let stopping = false;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGINT');
  await Promise.all(children.map(child => child.exitCode !== null ? Promise.resolve() : new Promise(resolve => {
    child.once('exit', resolve);
    setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 15000).unref();
  })));
  if (mongo) await mongo.stop({ doCleanup: false });
  try {
    if (Number(readFileSync('.local-data/stack.pid', 'utf8')) === process.pid) unlinkSync('.local-data/stack.pid');
  } catch {}
  process.exit(code);
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
function start(name, args, cwd = root) {
  const log = createWriteStream(`${root}.local-data/logs/${name}.log`, { flags: 'a' });
  const child = spawn(process.execPath, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, CI: 'true' } });
  child.stdout.pipe(log); child.stderr.pipe(log);
  children.push(child);
  child.on('error', error => { console.error(error); stop(1); });
  child.on('exit', code => { if (!stopping) { console.error(`${name} exited (${code}). See .local-data/logs/${name}.log`); stop(1); } });
  return child;
}
async function ready(url) {
  for (let i = 0; i < 120; i++) {
    try { const res = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (res.ok) return; } catch {}
    await delay(500);
  }
  throw new Error(`Service did not become ready: ${url}. Check .local-data/logs.`);
}
async function freePort(port) {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', () => reject(new Error(`Port ${port} is already in use. Stop the other local stack before starting this one.`)));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}
try {
  for (const port of [27017, 9099, 4400, 4500, 3000, 5173]) await freePort(port);
  mkdirSync('.local-data/mongodb', { recursive: true });
  mkdirSync('.local-data/logs', { recursive: true });
  writeFileSync('.local-data/stack.pid', String(process.pid));
  console.log('Starting persistent local MongoDB...');
  mongo = await MongoMemoryServer.create({ instance: {
    ip: '127.0.0.1', port: 27017, dbPath: `${root}.local-data/mongodb`, storageEngine: 'wiredTiger',
  } });
  const authArgs = ['node_modules/firebase-tools/lib/bin/firebase.js', 'emulators:start', '--only', 'auth', '--project', 'demo-comunity-bazar', '--export-on-exit=.local-data/auth'];
  if (existsSync('.local-data/auth/firebase-export-metadata.json')) authArgs.push('--import=.local-data/auth');
  start('auth', authArgs);
  await ready('http://127.0.0.1:9099/');
  start('backend', ['index.js'], `${root}backend`);
  await ready('http://127.0.0.1:3000/listings');
  const { seed } = await import('./seed-local.mjs');
  await seed();
  start('frontend', ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], `${root}frontend`);
  await ready('http://127.0.0.1:5173/');
  console.log('\nComunityBazar is ready: http://localhost:5173');
  console.log('Student: student@comunitybazar.test / Campus123!');
  console.log('Admin: admin@comunitybazar.test / Campus123!');
  console.log('Local-only test accounts. Press Ctrl+C to stop and save authentication data.');
} catch (error) { console.error(error); await stop(1); }
