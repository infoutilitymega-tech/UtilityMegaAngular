import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CmsService } from '../../core/services/cms.service';
import { SeoService } from '../../core/services/seo.service';
import { Category, Tool } from '../../core/models/tool.model';

const CATEGORY_ICONS: Record<string, string> = {
  calculators: '🧮', 'image-tools': '🖼️', 'video-tools': '🎬',
  'developer-tools': '💻', 'text-tools': '📝', 'security-tools': '🔒',
  'seo-tools': '📈', 'unit-converters': '⚖️', 'utility-tools': '🔧', 'farmers-tools': '🌾'
};

interface CategoryWithTools {
  category: Category;
  tools: Tool[];
}

@Component({
  selector: 'app-sitemap',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="page-wrap">

      <section class="sitemap-hero">
        <div class="container">
          <div class="hero-label">Navigation</div>
          <h1>Sitemap</h1>
          <p>Browse all pages and tools on UtilityMega in one place.</p>
        </div>
      </section>

      <section class="section">
        <div class="container">

          <!-- Main pages -->
          <div class="sitemap-group">
            <div class="group-header">
              <span class="group-icon">🏠</span>
              <h2>Main Pages</h2>
            </div>
            <div class="pages-list">
              <a routerLink="/" class="page-link">
                <span class="page-name">Home</span>
                <span class="page-url">utilitymega.com</span>
              </a>
              <a routerLink="/about" class="page-link">
                <span class="page-name">About Us</span>
                <span class="page-url">utilitymega.com/about</span>
              </a>
              <a routerLink="/contact" class="page-link">
                <span class="page-name">Contact</span>
                <span class="page-url">utilitymega.com/contact</span>
              </a>
              <a routerLink="/privacy-policy" class="page-link">
                <span class="page-name">Privacy Policy</span>
                <span class="page-url">utilitymega.com/privacy-policy</span>
              </a>
              <a routerLink="/terms-of-use" class="page-link">
                <span class="page-name">Terms of Use</span>
                <span class="page-url">utilitymega.com/terms-of-use</span>
              </a>
              <a routerLink="/sitemap" class="page-link active">
                <span class="page-name">Sitemap</span>
                <span class="page-url">utilitymega.com/sitemap</span>
              </a>
            </div>
          </div>

          <!-- Tool categories -->
          <div class="sitemap-tools" *ngIf="data().length > 0">
            <div class="tools-header">
              <h2>All Tool Categories & Tools</h2>
              <div class="tools-count">{{ totalTools() }} tools across {{ data().length }} categories</div>
            </div>

            <div class="categories-sitemap">
              <div class="cat-section" *ngFor="let item of data()">
                <div class="cat-header">
                  <a [routerLink]="['/', item.category.slug]" class="cat-link">
                    <span class="cat-icon-sm">{{ getIcon(item.category.slug) }}</span>
                    <div>
                      <div class="cat-name">{{ item.category.name }}</div>
                      <div class="cat-path">utilitymega.com/{{ item.category.slug }}</div>
                    </div>
                    <span class="cat-count">{{ item.tools.length }} tools</span>
                  </a>
                </div>
                <div class="cat-tools-list">
                  <a *ngFor="let tool of item.tools"
                     [routerLink]="['/', tool.categorySlug, tool.slug]"
                     class="tool-link">
                    <span class="tool-name">{{ tool.name }}</span>
                    <span class="tool-badges">
                      <span class="badge-hot" *ngIf="tool.isPopular">🔥</span>
                      <span class="badge-feat" *ngIf="tool.isFeatured">⭐</span>
                    </span>
                    <span class="tool-url">{{ tool.slug }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div class="loading" *ngIf="data().length === 0">
            <div class="loading-spinner">⏳</div>
            <p>Loading sitemap...</p>
          </div>

        </div>
      </section>
    </div>
  `,
  styles: [`
    .page-wrap { min-height: 60vh; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.25rem; }

    .sitemap-hero { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%); color: white; padding: 4rem 1.25rem 3rem; }
    .hero-label { display: inline-block; font-size: .75rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #93c5fd; background: rgba(147,197,253,.1); border: 1px solid rgba(147,197,253,.2); border-radius: 99px; padding: .3rem .9rem; margin-bottom: 1.25rem; }
    .sitemap-hero h1 { font-size: clamp(1.75rem, 3.5vw, 2.75rem); font-weight: 900; margin-bottom: .5rem; }
    .sitemap-hero p { opacity: .8; font-size: 1rem; }

    .section { padding: 3rem 1.25rem 4rem; }

    /* Main pages group */
    .sitemap-group { margin-bottom: 3rem; }
    .group-header { display: flex; align-items: center; gap: .75rem; margin-bottom: 1.25rem; }
    .group-icon { font-size: 1.5rem; }
    .group-header h2 { font-size: 1.25rem; font-weight: 800; margin: 0; }
    .pages-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: .5rem; }
    .page-link { display: flex; justify-content: space-between; align-items: center; padding: .75rem 1rem; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; transition: all .15s; gap: 1rem; }
    .page-link:hover, .page-link.active { background: #eff6ff; border-color: #2563eb; }
    .page-name { font-size: .875rem; font-weight: 600; color: #111827; }
    .page-url { font-size: .75rem; color: #9ca3af; font-family: monospace; }

    /* Tools section */
    .sitemap-tools { }
    .tools-header { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .tools-header h2 { font-size: 1.25rem; font-weight: 800; margin: 0; }
    .tools-count { font-size: .8rem; color: #6b7280; background: #f3f4f6; padding: .25rem .65rem; border-radius: 99px; font-weight: 600; }

    .categories-sitemap { display: flex; flex-direction: column; gap: 1.25rem; }

    /* Category section */
    .cat-section { border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
    .cat-header { background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
    .cat-link { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; text-decoration: none; color: inherit; transition: background .15s; }
    .cat-link:hover { background: #eff6ff; }
    .cat-icon-sm { font-size: 1.5rem; flex-shrink: 0; }
    .cat-name { font-size: .95rem; font-weight: 700; color: #111827; }
    .cat-path { font-size: .73rem; color: #9ca3af; font-family: monospace; margin-top: .1rem; }
    .cat-count { margin-left: auto; font-size: .75rem; font-weight: 700; color: #2563eb; background: #eff6ff; padding: .2rem .6rem; border-radius: 99px; white-space: nowrap; }

    /* Tool links */
    .cat-tools-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
    .tool-link { display: flex; align-items: center; gap: .5rem; padding: .7rem 1.25rem; text-decoration: none; border-bottom: 1px solid #f3f4f6; border-right: 1px solid #f3f4f6; transition: background .12s; }
    .tool-link:hover { background: #f8fafc; }
    .tool-name { font-size: .82rem; font-weight: 600; color: #374151; flex: 1; }
    .tool-badges { display: flex; gap: .2rem; font-size: .75rem; }
    .tool-url { font-size: .68rem; color: #d1d5db; font-family: monospace; margin-left: auto; }

    /* Loading */
    .loading { text-align: center; padding: 3rem; color: #6b7280; }
    .loading-spinner { font-size: 2rem; margin-bottom: .75rem; }
  `]
})
export class SitemapComponent implements OnInit {
  private cms = inject(CmsService);
  private seo = inject(SeoService);

  data = signal<CategoryWithTools[]>([]);
  totalTools = signal(0);

  ngOnInit() {
    this.seo.updateMeta({
      title: 'Sitemap — UtilityMega',
      description: 'Full sitemap of UtilityMega — browse all 100+ free online tools across 10 categories.',
      url: 'https://utilitymega.com/sitemap'
    });

    this.cms.getCategories().subscribe(categories => {
      const result: CategoryWithTools[] = [];
      let remaining = categories.length;
      let total = 0;

      categories.forEach(category => {
        this.cms.getToolsByCategory(category.slug).subscribe(tools => {
          result.push({ category, tools });
          total += tools.length;
          remaining--;
          if (remaining === 0) {
            // Sort by category order
            result.sort((a, b) => a.category.name.localeCompare(b.category.name));
            this.data.set(result);
            this.totalTools.set(total);
          }
        });
      });
    });
  }

  getIcon(slug: string): string {
    return CATEGORY_ICONS[slug] ?? '🔧';
  }
}
