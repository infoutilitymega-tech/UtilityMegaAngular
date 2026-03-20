#!/usr/bin/env node
/**
 * UtilityMega - SEO Auto-Generator
 * Reads tools.json and auto-optimizes:
 *   - seoTitle (max 60 chars)
 *   - metaDescription (max 160 chars)
 *   - slug (kebab-case, SEO-friendly)
 *   - keywords (min 8 keywords)
 * Run: node scripts/seo-generator.js
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../src/assets/data/tools.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + '…';
}

function generateSeoTitle(tool) {
  // Pattern: "{Tool Name} - {Action} Online Free"
  const patterns = [
    `${tool.name} - Free Online Tool`,
    `Free ${tool.name} Online`,
    `${tool.name} | Free & Fast Online Tool`,
    `${tool.name} - No Login Required`,
  ];
  const base = `${tool.name} - Free Online ${tool.categoryName} Tool`;
  return truncate(base, 60);
}

function generateMetaDescription(tool) {
  const base = `Use our free online ${tool.name.toLowerCase()} tool. ${tool.shortDescription} No signup, no login. Works instantly in your browser.`;
  return truncate(base, 160);
}

function generateKeywords(tool) {
  const existing = tool.keywords || [];
  const auto = [
    tool.name.toLowerCase(),
    `free ${tool.name.toLowerCase()}`,
    `online ${tool.name.toLowerCase()}`,
    `${tool.name.toLowerCase()} tool`,
    `${tool.categoryName.toLowerCase()} tools`,
    `free online ${tool.categoryName.toLowerCase()}`,
    `${tool.name.toLowerCase()} no login`,
    `best ${tool.name.toLowerCase()} online`,
  ];
  // Merge, deduplicate
  const merged = [...new Set([...existing, ...auto])];
  return merged.slice(0, 12);
}

function validateAndFix(tool) {
  const issues = [];

  // Slug
  const expectedSlug = toSlug(tool.name);
  if (tool.slug !== expectedSlug) {
    issues.push(`  slug: "${tool.slug}" → "${expectedSlug}"`);
    // Don't auto-change slugs as it breaks URLs, just warn
  }

  // SEO Title length
  if (!tool.seoTitle || tool.seoTitle.length > 60) {
    const fixed = generateSeoTitle(tool);
    issues.push(`  seoTitle: too long (${tool.seoTitle?.length || 0} chars) → fixed to "${fixed}"`);
    tool.seoTitle = fixed;
  }

  // Meta description length
  if (!tool.metaDescription || tool.metaDescription.length > 160) {
    const fixed = generateMetaDescription(tool);
    issues.push(`  metaDescription: too long (${tool.metaDescription?.length || 0} chars) → fixed`);
    tool.metaDescription = fixed;
  }

  // Keywords count
  if (!tool.keywords || tool.keywords.length < 8) {
    tool.keywords = generateKeywords(tool);
    issues.push(`  keywords: expanded to ${tool.keywords.length} keywords`);
  }

  return { tool, issues };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
let totalIssues = 0;

console.log('\n🔍 UtilityMega SEO Analyzer & Auto-Fixer\n');
console.log('═'.repeat(50));

for (let i = 0; i < data.tools.length; i++) {
  const { tool, issues } = validateAndFix(data.tools[i]);
  data.tools[i] = tool;

  if (issues.length > 0) {
    console.log(`\n⚠️  Tool: "${tool.name}" [${tool.slug}]`);
    issues.forEach(issue => console.log(issue));
    totalIssues += issues.length;
  }
}

// Category SEO check
for (const cat of data.categories) {
  if (!cat.seoTitle || cat.seoTitle.length > 60) {
    cat.seoTitle = truncate(`Free ${cat.name} Tools - Online & Free`, 60);
    console.log(`\n⚠️  Category "${cat.name}" seoTitle fixed`);
    totalIssues++;
  }
  if (!cat.metaDescription || cat.metaDescription.length > 160) {
    cat.metaDescription = truncate(
      `Free online ${cat.name.toLowerCase()} tools. No login required. ${cat.shortDescription}`,
      160
    );
    totalIssues++;
  }
}

// Write updated JSON
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

console.log('\n' + '═'.repeat(50));
console.log(`\n✅ SEO analysis complete!`);
console.log(`   Tools analyzed: ${data.tools.length}`);
console.log(`   Issues fixed: ${totalIssues}`);
console.log(`   Updated file: ${DATA_FILE}\n`);

// Summary report
console.log('📊 SEO Summary Report:');
console.log(`   Total tools: ${data.tools.length}`);
console.log(`   Total categories: ${data.categories.length}`);
const avgKeywords = data.tools.reduce((sum, t) => sum + (t.keywords?.length || 0), 0) / data.tools.length;
console.log(`   Avg keywords per tool: ${avgKeywords.toFixed(1)}`);
const longTitles = data.tools.filter(t => (t.seoTitle?.length || 0) > 60).length;
console.log(`   Tools with long titles: ${longTitles}`);
const longDescs = data.tools.filter(t => (t.metaDescription?.length || 0) > 160).length;
console.log(`   Tools with long descriptions: ${longDescs}`);
