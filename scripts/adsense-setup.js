/**
 * UtilityMega — Google AdSense Integration Guide
 * ================================================
 *
 * STEP 1: Get approved by Google AdSense
 *   → Visit: https://www.google.com/adsense
 *   → Apply with your domain (utilitymega.com)
 *   → Wait for approval (1–14 days)
 *
 * STEP 2: Add AdSense script to index.html
 *   Add inside <head> of src/index.html:
 *
 *   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
 *
 *   Replace XXXXXXXXXXXXXXXX with your Publisher ID.
 *
 * STEP 3: Create Ad Units in AdSense Dashboard
 *   → Ads > By ad unit > Display ads
 *   Create units for each slot:
 *
 *   Slot Name          | Format        | Size          | AdSlot ID
 *   ─────────────────────────────────────────────────────────────
 *   leaderboard        | Display       | 728×90        | 1234567890
 *   sidebar-rectangle  | Display       | 300×250       | 2345678901
 *   in-article         | In-article    | Responsive    | 3456789012
 *   footer-banner      | Display       | 728×90        | 4567890123
 *
 * STEP 4: Update adsense.component.ts
 *   Uncomment the <ins> tag and replace:
 *     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
 *     data-ad-slot="{{ adSlotId }}"
 *
 * STEP 5: Update each ad slot usage
 *   In tool.component.ts, category.component.ts, home.component.ts:
 *
 *   <app-adsense slot="leaderboard" adSlotId="1234567890" />
 *   <app-adsense slot="sidebar"     adSlotId="2345678901" />
 *   <app-adsense slot="in-article"  adSlotId="3456789012" />
 *   <app-adsense slot="footer"      adSlotId="4567890123" />
 *
 * STEP 6: Add ads.txt to public/ folder
 *   File: public/ads.txt
 *   Content: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
 *   (Replace with your Publisher ID)
 *
 * RECOMMENDED AD PLACEMENTS:
 * ─────────────────────────────────────────────────────────────────
 *
 * HOME PAGE:
 *   - Leaderboard (728×90) → below hero section
 *   - Rectangle (300×250)  → below popular tools
 *
 * CATEGORY PAGE:
 *   - Leaderboard (728×90) → top of page below header
 *   - In-article           → between tool grid and description
 *
 * TOOL PAGE:
 *   - Leaderboard (728×90) → top strip (below navigation)
 *   - Sidebar (300×250)    → right sidebar (sticky)
 *   - In-article           → between tool UI and content
 *   - Footer (728×90)      → below FAQ section
 *
 * SEO + ADSENSE BEST PRACTICES:
 * ─────────────────────────────────────────────────────────────────
 * ✓ Don't place ads above the fold on tool pages (hurts Core Web Vitals)
 * ✓ Maximum 3 display ad units per page
 * ✓ Always use responsive ad units
 * ✓ Never click your own ads (account ban)
 * ✓ Minimum 100 words of content per page
 * ✓ Use Auto Ads cautiously — they can hurt page speed
 *
 * REVENUE ESTIMATION (CPM rates India):
 * ─────────────────────────────────────────────────────────────────
 * Developer tools:    $1.50–$4.00 CPM
 * Finance calculators: $2.00–$6.00 CPM
 * General utility:    $0.80–$2.00 CPM
 * At 100K pageviews/month, est. revenue: $150–$400/month
 */

// ads.txt content (place as public/ads.txt)
const adsTxtContent = `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`;

// Auto-generate ads.txt
const fs = require('fs');
const path = require('path');

const PUBLISHER_ID = process.env.ADSENSE_PUBLISHER_ID || 'pub-XXXXXXXXXXXXXXXX';
const content = `google.com, ${PUBLISHER_ID}, DIRECT, f08c47fec0942fa0\n`;

fs.writeFileSync(path.join(__dirname, '../public/ads.txt'), content);
console.log('✅ ads.txt generated for publisher:', PUBLISHER_ID);
