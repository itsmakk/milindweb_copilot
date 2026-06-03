/**
 * storage-bootstrap.mjs
 *
 * Creates the InsForge storage buckets the API and FE need. Idempotent:
 * if a bucket already exists, the call is a no-op.
 *
 * Usage:
 *   node scripts/storage-bootstrap.mjs
 *
 * Reads INSFORGE_BASE_URL and INSFORGE_API_KEY (service role) from .env.
 */

import { createClient } from '@insforge/sdk';
import { pathToFileURL } from 'node:url';
import { loadDotenv } from './_load-dotenv.mjs';

loadDotenv();

const BUCKETS = [
  { name: 'avatars',   public: true,  purpose: 'User profile photos (public CDN).' },
  { name: 'uploads',   public: true,  purpose: 'Public form/file uploads from the static site.' },
  { name: 'portfolio', public: true,  purpose: 'Project covers and gallery images.' },
  { name: 'blog',      public: true,  purpose: 'Blog post cover images.' },
  { name: 'documents', public: false, purpose: 'Private PDFs (prescriptions, reports, bills).' },
  { name: 'exports',   public: false, purpose: 'Generated Excel/PDF exports for download.' },
];

const insforge = null; // lazy-initialized in runStorageBootstrap()

export async function runStorageBootstrap() {
  const BASE_URL = (process.env.INSFORGE_BASE_URL ?? '').replace(/\/$/, '');
  const API_KEY  = process.env.INSFORGE_API_KEY ?? '';
  if (!BASE_URL || !API_KEY) {
    throw new Error('INSFORGE_BASE_URL and INSFORGE_API_KEY must be set in .env');
  }
  const client = createClient({ baseUrl: BASE_URL, anonKey: API_KEY });

  console.log(`storage-bootstrap: creating ${BUCKETS.length} buckets on ${BASE_URL}`);

  for (const b of BUCKETS) {
    process.stdout.write(`  - ${b.name.padEnd(12)} `);
    try {
      const res = await fetch(`${BASE_URL}/api/storage/buckets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ name: b.name, public: b.public }),
      });
      if (res.ok || res.status === 201) {
        console.log('OK');
      } else if (res.status === 409 || res.status === 400) {
        const body = await res.text().catch(() => '');
        if (/exists|already/i.test(body)) {
          console.log('SKIP (exists)');
        } else {
          console.log(`? ${res.status} ${body.slice(0, 100)}`);
        }
      } else {
        const body = await res.text().catch(() => '');
        console.log(`FAIL ${res.status} ${body.slice(0, 100)}`);
      }
    } catch (err) {
      console.log(`NETWORK ${(err && err.message) || err}`);
    }
  }

  console.log('\nVerifying…');
  for (const b of BUCKETS) {
    const ref = client.storage.from(b.name);
    try {
      const res = await fetch(`${BASE_URL}/api/storage/buckets/${b.name}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      console.log(`  - ${b.name.padEnd(12)} ${res.ok ? 'present' : `missing (${res.status})`}`);
    } catch (err) {
      console.log(`  - ${b.name.padEnd(12)} ERROR ${(err && err.message) || err}`);
    }
  }

  console.log('\nDone. (Re-run is safe.)');
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isMain) {
  runStorageBootstrap().catch((err) => {
    console.error('FATAL:', err);
    process.exit(1);
  });
}
