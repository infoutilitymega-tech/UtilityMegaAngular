import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { switchMap, tap } from 'rxjs/operators';
import { CmsService } from '../../core/services/cms.service';
import { SeoService } from '../../core/services/seo.service';
import { ToolCardComponent } from '../../shared/components/tool-card/tool-card.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { Category, Tool, BreadcrumbItem } from '../../core/models/tool.model';

const CAT_ICONS: Record<string, string> = {
  calculators: '🧮', 'image-tools': '🖼️', 'video-tools': '🎬',
  'developer-tools': '💻', 'text-tools': '📝', 'security-tools': '🔒',
  'seo-tools': '📈', 'unit-converters': '⚖️', 'utility-tools': '🔧', 'farmers-tools': '🌾'
};

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [RouterLink, CommonModule, ToolCardComponent, BreadcrumbComponent],
  template: `
    <div class="page-wrapper" *ngIf="category(); else notFound">

      <!-- Category Hero -->
      <section class="cat-hero">
        <div class="container">
          <app-breadcrumb [items]="breadcrumbs()" />
          <div class="cat-hero-inner">
            <div class="cat-hero-icon">{{ getIcon(category()!.slug) }}</div>
            <div>
              <h1 class="cat-hero-title">{{ category()!.name }}</h1>
              <p class="cat-hero-desc">{{ category()!.shortDescription }}</p>
              <div class="cat-hero-meta">
                <span class="badge">{{ tools().length }} Tools Available</span>
                <span class="badge badge-free">🆓 100% Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tools Grid -->
      <section class="section">
        <div class="container">
          <!-- Filter Bar -->
          <div class="filter-bar">
            <button class="filter-btn" [class.active]="activeFilter() === 'all'" (click)="setFilter('all')">All Tools</button>
            <button class="filter-btn" [class.active]="activeFilter() === 'popular'" (click)="setFilter('popular')">🔥 Popular</button>
            <button class="filter-btn" [class.active]="activeFilter() === 'featured'" (click)="setFilter('featured')">⭐ Featured</button>
          </div>

          <div class="tools-grid">
            <app-tool-card *ngFor="let tool of filteredTools()" [tool]="tool" />
          </div>

          <div class="empty-state" *ngIf="filteredTools().length === 0">
            <p>No tools found for this filter. <button (click)="setFilter('all')">Show all tools</button></p>
          </div>
        </div>
      </section>

      <!-- Category Description (SEO) -->
      <section class="section section-alt">
        <div class="container">
          <div class="seo-content">
            <h2>About {{ category()!.name }} Tools</h2>
            <p>{{ category()!.description }}</p>

            <div class="quick-links">
              <h3>Quick Navigation</h3>
              <div class="quick-links-grid">
                <a *ngFor="let tool of tools()" [routerLink]="['/', tool.categorySlug, tool.slug]" class="quick-link">
                  {{ tool.name }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>

    <ng-template #notFound>
      <div class="not-found-state container">
        <h1>Category not found</h1>
        <a routerLink="/">← Back to Home</a>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-wrapper { min-height: 60vh; }
    .cat-hero { background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border-bottom: 1px solid var(--border-color, #e5e7eb); padding: 2rem 1rem 2.5rem; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .cat-hero-inner { display: flex; align-items: flex-start; gap: 1.5rem; margin-top: 1rem; }
    .cat-hero-icon { font-size: 3.5rem; line-height: 1; flex-shrink: 0; }
    .cat-hero-title { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; color: var(--text, #111827); margin-bottom: 0.4rem; }
    .cat-hero-desc { color: var(--text-muted, #6b7280); font-size: 1rem; margin-bottom: 0.75rem; max-width: 600px; }
    .cat-hero-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .badge { font-size: 0.8rem; padding: 0.25rem 0.75rem; border-radius: 99px; background: var(--primary-light, #eff6ff); color: var(--primary, #2563eb); font-weight: 600; }
    .badge-free { background: #f0fdf4; color: #16a34a; }
    .section { padding: 2.5rem 1rem; }
    .section-alt { background: var(--bg-alt, #f8fafc); }
    .filter-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .filter-btn { padding: 0.5rem 1rem; border-radius: 99px; border: 1px solid var(--border-color, #e5e7eb); background: var(--card-bg, #fff); color: var(--text-muted, #6b7280); font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
    .filter-btn:hover { border-color: var(--primary, #2563eb); color: var(--primary, #2563eb); }
    .filter-btn.active { background: var(--primary, #2563eb); border-color: var(--primary, #2563eb); color: white; }
    .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .empty-state { text-align: center; padding: 3rem; color: var(--text-muted, #6b7280); }
    .empty-state button { color: var(--primary, #2563eb); background: none; border: none; cursor: pointer; text-decoration: underline; }
    .seo-content { max-width: 900px; }
    .seo-content h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
    .seo-content > p { color: var(--text-muted, #4b5563); line-height: 1.8; margin-bottom: 2rem; }
    .quick-links h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; }
    .quick-links-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .quick-link { color: var(--primary, #2563eb); text-decoration: none; font-size: 0.875rem; background: var(--primary-light, #eff6ff); padding: 0.3rem 0.75rem; border-radius: 99px; transition: all 0.15s; }
    .quick-link:hover { background: var(--primary, #2563eb); color: white; }
    .not-found-state { padding: 4rem 1rem; text-align: center; }
    .not-found-state a { color: var(--primary, #2563eb); }
  `]
})
export class CategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cms = inject(CmsService);
  private seo = inject(SeoService);

  category = signal<Category | undefined>(undefined);
  tools = signal<Tool[]>([]);
  filteredTools = signal<Tool[]>([]);
  breadcrumbs = signal<BreadcrumbItem[]>([]);
  activeFilter = signal<string>('all');

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const slug = params.get('category')!;
        this.cms.getCategory(slug).subscribe(cat => {
          if (cat) {
            this.category.set(cat);
            this.seo.setCategoryMeta(cat);
            this.breadcrumbs.set([
              { label: 'Home', url: '/' },
              { label: cat.name, url: `/${cat.slug}` }
            ]);
          }
        });
        return this.cms.getToolsByCategory(slug);
      })
    ).subscribe(tools => {
      this.tools.set(tools);
      this.filteredTools.set(tools);
    });
  }

  getIcon(slug: string): string { return CAT_ICONS[slug] ?? '🔧'; }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
    const all = this.tools();
    if (filter === 'popular') this.filteredTools.set(all.filter(t => t.isPopular));
    else if (filter === 'featured') this.filteredTools.set(all.filter(t => t.isFeatured));
    else this.filteredTools.set(all);
  }
}
