#!/usr/bin/env node
/**
 * UtilityMega - Prerender routes generator
 * Run: node scripts/generate-prerender-routes.js
 * Output: prerender-routes.txt
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../src/assets/data/tools.json');
const OUTPUT_FILE = path.join(__dirname, '../prerender-routes.txt');

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-use',
  '/sitemap',
];

const categoryRoutes = data.categories.map((c) => `/${c.slug}`);
const toolRoutes = data.tools.map((t) => `/${t.categorySlug}/${t.slug}`);

const routes = Array.from(new Set([...staticRoutes, ...categoryRoutes, ...toolRoutes])).sort();

fs.writeFileSync(OUTPUT_FILE, routes.join('\n') + '\n', 'utf-8');

console.log(`✅ Prerender routes generated: ${OUTPUT_FILE}`);
console.log(`   Total routes: ${routes.length}`);
console.log(`   Static: ${staticRoutes.length}`);
console.log(`   Categories: ${categoryRoutes.length}`);
console.log(`   Tools: ${toolRoutes.length}`);
