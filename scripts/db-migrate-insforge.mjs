/**
 * db-migrate-insforge.mjs
 *
 * Idempotent migration of the MilindWeb schema set into InsForge Postgres
 * (PostgREST-compatible).
 *
 * Usage:
 *   1. Set INSFORGE_BASE_URL, INSFORGE_API_KEY in .env
 *      (the API key is the SERVICE ROLE / admin key, not the anon key).
 *   2. node scripts/db-migrate-insforge.mjs
 *
 * The script tries to apply DDL via the InsForge admin SQL endpoint:
 *   POST {INSFORGE_BASE_URL}/api/database/execute
 *   Authorization: Bearer {INSFORGE_API_KEY}
 *   Content-Type:  application/json
 *   { "sql": "..." }
 *
 * If that endpoint is not available in your plan, the script falls back
 * to printing the SQL so you can paste it into the InsForge dashboard's
 * SQL editor.
 *
 * All statements are idempotent (CREATE … IF NOT EXISTS, INSERT … ON
 * CONFLICT DO NOTHING), so re-running is safe.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadDotenv } from './_load-dotenv.mjs';

loadDotenv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL_FILE = resolve(__dirname, 'schema-insforge.sql');

/**
 * Split a SQL string into individual statements. Respects:
 *   - `--` line comments
 *   - single-quoted strings  ('…')
 *   - double-quoted identifiers  ("…")
 *   - `$$ … $$` dollar-quoted blocks (DO blocks, function bodies)
 *
 * Skips statements that are only whitespace and/or comments.
 */
export function splitSqlStatements(sql) {
  const out = [];
  let buf = '';
  let i = 0;
  let inSingle = false, inDouble = false, inLineComment = false, inDollar = false;
  while (i < sql.length) {
    const c = sql[i];
    const next = sql[i + 1];
    if (inLineComment) {
      if (c === '\n') inLineComment = false;
      buf += c;
      i++;
      continue;
    }
    if (inDollar) {
      buf += c;
      if (c === '$' && next === '$') { buf += next; i += 2; inDollar = false; continue; }
      i++;
      continue;
    }
    if (!inSingle && !inDouble && c === '-' && next === '-') {
      inLineComment = true;
      buf += c;
      i++;
      continue;
    }
    if (!inDouble && c === "'") {
      inSingle = !inSingle;
      buf += c;
      i++;
      continue;
    }
    if (!inSingle && c === '"') {
      inDouble = !inDouble;
      buf += c;
      i++;
      continue;
    }
    if (!inSingle && !inDouble && c === '$' && next === '$') {
      inDollar = true;
      buf += '$$';
      i += 2;
      continue;
    }
    if (!inSingle && !inDouble && !inDollar && c === ';') {
      const trimmed = buf.trim();
      const real = isMeaningful(trimmed);
      if (real) out.push(trimmed);
      buf = '';
      i++;
      continue;
    }
    buf += c;
    i++;
  }
  const tail = buf.trim();
  if (tail && isMeaningful(tail)) out.push(tail);
  return out;
}

function isMeaningful(trimmed) {
  for (const line of trimmed.split(/\r?\n/)) {
    if (/^\s*(--|$)/.test(line)) continue; // pure comment or blank
    return true;
  }
  return false;
}

export async function runMigrate() {
  const BASE_URL = (process.env.INSFORGE_BASE_URL ?? '').replace(/\/$/, '');
  const API_KEY  = process.env.INSFORGE_API_KEY ?? '';

  if (!BASE_URL) {
    console.error('ERROR: INSFORGE_BASE_URL is not set. See .env.example.');
    process.exit(1);
  }
  if (!API_KEY) {
    console.error('ERROR: INSFORGE_API_KEY (service role) is not set.');
    process.exit(1);
  }

  const fullSql = readFileSync(SQL_FILE, 'utf8');
  const statements = splitSqlStatements(fullSql);
  console.log(`db-migrate-insforge: ${statements.length} statements parsed`);

  let ok = 0, fail = 0, skipped = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 80);
    process.stdout.write(`[${String(i + 1).padStart(2, '0')}/${statements.length}] ${preview}… `);
    try {
      const res = await fetch(`${BASE_URL}/api/database/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ sql: stmt }),
      });
      if (res.ok) {
        console.log('OK');
        ok++;
      } else {
        const body = await res.text().catch(() => '');
        if (res.status === 409 || /already exists/i.test(body)) {
          console.log('SKIP (exists)');
          skipped++;
        } else {
          console.log(`FAIL (${res.status}): ${body.slice(0, 120)}`);
          fail++;
        }
      }
    } catch (err) {
      console.log(`NETWORK: ${(err && err.message) || err}`);
      console.log('--- paste the following into the InsForge SQL editor ---');
      console.log(stmt);
      console.log('--- end ---');
      fail++;
    }
  }

  console.log(`\nDone. ok=${ok} skipped=${skipped} failed=${fail}`);
  if (fail > 0) process.exitCode = 1;
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isMain) {
  runMigrate().catch((err) => {
    console.error('FATAL:', err);
    process.exit(1);
  });
}
