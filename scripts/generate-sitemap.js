#!/usr/bin/env node
/**
 * UtilityMega - Sitemap Generator
 * Run: node scripts/generate-sitemap.js
 * Output: public/sitemap.xml
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.utilitymega.com';
const DATA_FILE = path.join(__dirname, '../src/assets/data/tools.json');
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');
const OUTPUT_ASSET_FILE = path.join(__dirname, '../src/assets/sitemap.xml');

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const today = new Date().toISOString().split('T')[0];

const urls = [];

// Home page
urls.push({ loc: BASE_URL, priority: '1.0', changefreq: 'daily', lastmod: today });

// Static pages
const staticPages = ['/about', '/contact', '/privacy-policy', '/terms-of-use', '/sitemap'];
for (const page of staticPages) {
  urls.push({ loc: `${BASE_URL}${page}`, priority: '0.5', changefreq: 'monthly', lastmod: today });
}

// Category pages
for (const cat of data.categories) {
  urls.push({
    loc: `${BASE_URL}/${cat.slug}`,
    priority: '0.9',
    changefreq: 'weekly',
    lastmod: today,
  });
}

// Tool pages
for (const tool of data.tools) {
  urls.push({
    loc: `${BASE_URL}/${tool.categorySlug}/${tool.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: today,
  });
}

// Build XML
const urlElements = urls
  .map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`)
  .join('');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">${urlElements}
</urlset>`;

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, xml, 'utf-8');
fs.writeFileSync(OUTPUT_ASSET_FILE, xml, 'utf-8');

console.log(`✅ Sitemap generated: ${OUTPUT_FILE}`);
console.log(`✅ Asset sitemap synced: ${OUTPUT_ASSET_FILE}`);
console.log(`   Total URLs: ${urls.length}`);
console.log(`   Categories: ${data.categories.length}`);
console.log(`   Tools: ${data.tools.length}`);
