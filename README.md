# ⚡ UtilityMega — Free Online Tools Platform

A production-ready Angular 19 application with SSR (Server-Side Rendering) for 100+ free online tools, optimized for SEO, performance, and scalability.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Development server
npm start
# → http://localhost:4200

# 3. Production build (with SSR)
npm run build:prod

# 4. Serve SSR
npm run serve:ssr
# → http://localhost:4000
```

---

## 📂 Project Structure

```
utilitymega/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   └── tool.model.ts          # TypeScript interfaces
│   │   │   └── services/
│   │   │       ├── cms.service.ts         # JSON CMS service
│   │   │       └── seo.service.ts         # SEO meta + JSON-LD
│   │   ├── pages/
│   │   │   ├── home/                      # Homepage
│   │   │   ├── category/                  # /:category route
│   │   │   ├── tool/                      # /:category/:tool route
│   │   │   └── not-found/                 # 404 page
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── header/                # Sticky header + search
│   │   │       ├── footer/                # Footer with links
│   │   │       ├── tool-card/             # Reusable tool card
│   │   │       └── breadcrumb/            # SEO breadcrumbs
│   │   ├── app.component.ts               # Root component
│   │   ├── app.config.ts                  # Client providers
│   │   ├── app.config.server.ts           # SSR providers
│   │   └── app.routes.ts                  # Lazy routes
│   ├── assets/
│   │   └── data/
│   │       └── tools.json                 # 📦 JSON CMS (all data)
│   ├── environments/
│   ├── styles.scss                         # Global styles
│   ├── index.html
│   ├── main.ts
│   └── main.server.ts
├── public/
│   ├── robots.txt
│   └── manifest.webmanifest
├── scripts/
│   ├── generate-sitemap.js               # Sitemap generator
│   ├── seo-generator.js                  # SEO auto-fixer
│   └── indexnow.js                       # IndexNow submitter
├── server.ts                              # Express SSR server
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🗺️ Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomeComponent | Homepage with search + categories |
| `/:category` | CategoryComponent | Category page with tool list |
| `/:category/:tool` | ToolComponent | Individual tool page |
| `**` | NotFoundComponent | 404 page |

---

## 📦 JSON CMS

All content lives in `src/assets/data/tools.json`.

### Tool Schema
```json
{
  "id": "tool-001",
  "name": "SIP Calculator",
  "slug": "sip-calculator",
  "categorySlug": "calculators",
  "categoryName": "Calculators",
  "shortDescription": "Calculate your SIP returns...",
  "seoTitle": "SIP Calculator - Calculate Returns Free",
  "metaDescription": "Use our free SIP calculator...",
  "keywords": ["SIP calculator", ...],
  "content": "Long-form SEO content (400-600 words)...",
  "faq": [{ "question": "...", "answer": "..." }],
  "relatedTools": ["emi-calculator"],
  "isPopular": true,
  "isFeatured": true
}
```

---

## ⚙️ CMS Service API

```typescript
import { CmsService } from './core/services/cms.service';

// In your component:
cms.getCategories()                       // All categories
cms.getCategory(slug)                     // Single category
cms.getAllTools()                          // All tools
cms.getToolsByCategory(categorySlug)      // Tools in category
cms.getTool(categorySlug, toolSlug)       // Single tool
cms.getPopularTools()                     // isPopular: true tools
cms.getFeaturedTools()                    // isFeatured: true tools
cms.getRelatedTools(tool)                 // Related tool objects
cms.searchTools(keyword)                  // Full-text search
```

---

## 🔍 SEO Features

Each page dynamically generates:
- ✅ `<title>` tag
- ✅ `<meta name="description">`
- ✅ `<meta name="keywords">`
- ✅ `<link rel="canonical">`
- ✅ Open Graph tags (og:title, og:description, og:url, og:image)
- ✅ Twitter Card tags
- ✅ JSON-LD: WebSite schema (homepage)
- ✅ JSON-LD: WebApplication schema (tool pages)
- ✅ JSON-LD: BreadcrumbList schema
- ✅ JSON-LD: FAQPage schema (tool pages)
- ✅ Microdata breadcrumbs in HTML

---

## 📈 SEO Scripts

```bash
# Generate sitemap.xml
node scripts/generate-sitemap.js
# → public/sitemap.xml (auto-includes all pages)

# Auto-fix SEO metadata
node scripts/seo-generator.js
# → Fixes titles >60 chars, descriptions >160 chars
# → Expands keywords to 12 per tool

# Submit to IndexNow (Bing + search engines)
INDEXNOW_KEY=your-key node scripts/indexnow.js
```

---

## 🏗️ Adding a New Tool

1. Open `src/assets/data/tools.json`
2. Add a new object to the `tools` array following the schema above
3. Run `node scripts/seo-generator.js` to validate and fix SEO fields
4. Run `node scripts/generate-sitemap.js` to update sitemap
5. The tool is live — no code changes needed!

---

## 🔧 Adding a New Category

1. Add to the `categories` array in `tools.json`
2. Add tools with the new `categorySlug`
3. Add a route link in `header.component.ts`
4. Category page renders automatically

---

## ⚡ Performance

- **SSR**: Angular Universal renders HTML on server for instant SEO
- **Lazy loading**: All routes lazy-loaded for minimal initial bundle
- **Preloading**: PreloadAllModules for background prefetching
- **Image-free**: Pure CSS/emoji icons = zero image requests
- **JSON CMS**: Single HTTP request caches all tool data
- **shareReplay(1)**: CMS data cached in memory after first load

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Node.js VPS
```bash
npm run build:prod
node dist/utilitymega/server/server.mjs
```

### Static Export (No SSR)
```bash
# In angular.json, set: "prerender": true, "ssr": false
ng build --configuration production
# Deploy dist/utilitymega/browser/ to any CDN
```

---

## 📝 License

MIT — Free to use, modify, and deploy.
