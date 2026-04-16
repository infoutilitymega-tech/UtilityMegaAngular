#!/usr/bin/env node
/**
 * UtilityMega - IndexNow Submitter
 * Submits all URLs to Bing, Yandex via IndexNow protocol.
 *
 * Setup:
 *   1. Generate a key at https://www.bing.com/indexnow
 *   2. Place the key file at: public/{YOUR_KEY}.txt (containing just the key)
 *   3. Set INDEXNOW_KEY in .env or replace below
 *   4. Run: node scripts/indexnow.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.utilitymega.com';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'YOUR_INDEXNOW_KEY_HERE';
const DATA_FILE = path.join(__dirname, '../src/assets/data/tools.json');

// IndexNow endpoints (submit to one, they share with others)
const ENDPOINTS = [
  { host: 'api.indexnow.org', path: '/IndexNow' },
  { host: 'www.bing.com', path: '/indexnow' },
];

function buildUrls(data) {
  const urls = [BASE_URL];
  for (const cat of data.categories) {
    urls.push(`${BASE_URL}/${cat.slug}`);
  }
  for (const tool of data.tools) {
    urls.push(`${BASE_URL}/${tool.categorySlug}/${tool.slug}`);
  }
  return urls;
}

function submitToIndexNow(endpoint, urls) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: 'www.utilitymega.com',
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    });

    const options = {
      hostname: endpoint.host,
      port: 443,
      path: endpoint.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ─── Batch in chunks of 10,000 (IndexNow limit) ───────────────────────────────
async function run() {
  if (INDEXNOW_KEY === 'YOUR_INDEXNOW_KEY_HERE') {
    console.error('❌ Please set INDEXNOW_KEY before running this script.');
    console.error('   Get your key at: https://www.bing.com/indexnow\n');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const allUrls = buildUrls(data);

  console.log(`\n🚀 IndexNow Submitter - UtilityMega`);
  console.log(`   Total URLs: ${allUrls.length}`);
  console.log(`   Key: ${INDEXNOW_KEY.slice(0, 8)}...`);
  console.log('─'.repeat(40));

  const CHUNK_SIZE = 10000;
  for (let i = 0; i < allUrls.length; i += CHUNK_SIZE) {
    const chunk = allUrls.slice(i, i + CHUNK_SIZE);
    for (const endpoint of ENDPOINTS) {
      try {
        const result = await submitToIndexNow(endpoint, chunk);
        const icon = result.status === 200 || result.status === 202 ? '✅' : '⚠️';
        console.log(`${icon} ${endpoint.host}: HTTP ${result.status} (${chunk.length} URLs)`);
      } catch (err) {
        console.error(`❌ ${endpoint.host}: ${err.message}`);
      }
    }
  }

  console.log('\n✅ IndexNow submission complete!');
  console.log('   Note: 200 = already submitted, 202 = accepted for indexing\n');
}

run().catch(console.error);
