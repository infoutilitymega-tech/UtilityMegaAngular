import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CmsService } from '../../core/services/cms.service';
import { SeoService } from '../../core/services/seo.service';
import { ToolCardComponent } from '../../shared/components/tool-card/tool-card.component';
import { Category, Tool } from '../../core/models/tool.model';

const CATEGORY_ICONS: Record<string, string> = {
  calculators: '🧮', 'image-tools': '🖼️', 'video-tools': '🎬',
  'developer-tools': '💻', 'text-tools': '📝', 'security-tools': '🔒',
  'seo-tools': '📈', 'unit-converters': '⚖️', 'utility-tools': '🔧', 'farmers-tools': '🌾'
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ToolCardComponent],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <div class="hero-badge">100+ Free Tools · No Login Required</div>
        <h1 class="hero-title">Your All-in-One<br><span class="gradient-text">Online Toolkit</span></h1>
        <p class="hero-subtitle">Calculators, Image Tools, Developer Utilities, SEO Tools, and more — all free, all instant, all private.</p>

        <div class="hero-search">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="search"
              placeholder="Search tools... e.g. 'SIP Calculator', 'JSON Formatter'"
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              (keyup.enter)="onSearch()"
              class="search-input"
              aria-label="Search tools"
            />
            <button class="search-btn" (click)="onSearch()">Search</button>
          </div>

          <div class="search-results" *ngIf="searchResults().length > 0">
            <div class="search-result-item" *ngFor="let tool of searchResults()" [routerLink]="['/', tool.categorySlug, tool.slug]">
              <span>{{ tool.name }}</span>
              <span class="cat-badge">{{ tool.categoryName }}</span>
            </div>
          </div>
        </div>

        <div class="hero-stats">
          <div class="stat"><strong>100+</strong><span>Free Tools</span></div>
          <div class="stat-sep">|</div>
          <div class="stat"><strong>10</strong><span>Categories</span></div>
          <div class="stat-sep">|</div>
          <div class="stat"><strong>0</strong><span>Login Required</span></div>
        </div>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>Browse by Category</h2>
          <p>Choose from 10 categories with specialized tools for every task</p>
        </div>
        <div class="categories-grid">
          <a class="category-card" *ngFor="let cat of categories()" [routerLink]="['/', cat.slug]">
            <div class="cat-icon">{{ getIcon(cat.slug) }}</div>
            <h3 class="cat-name">{{ cat.name }}</h3>
            <p class="cat-desc">{{ cat.shortDescription }}</p>
            <span class="cat-tools">{{ cat.toolCount }}+ tools →</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Popular Tools -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-header">
          <h2>🔥 Popular Tools</h2>
          <p>Most used tools by our visitors</p>
        </div>
        <div class="tools-grid">
          <app-tool-card *ngFor="let tool of popularTools()" [tool]="tool" />
        </div>
      </div>
    </section>

    <!-- SEO Content Block -->
    <section class="section">
      <div class="container">
        <div class="content-block">
          <h2>Why Choose UtilityMega?</h2>
          <div class="feature-grid">
            <div class="feature">
              <div class="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>All tools run directly in your browser. No server round-trips, no waiting for uploads. Results are instant.</p>
            </div>
            <div class="feature">
              <div class="feature-icon">🔒</div>
              <h3>100% Private</h3>
              <p>Your data never leaves your device. No accounts, no tracking, no data collection. What you process is yours.</p>
            </div>
            <div class="feature">
              <div class="feature-icon">🆓</div>
              <h3>Always Free</h3>
              <p>Every tool on UtilityMega is completely free to use with no usage limits, no watermarks, and no subscriptions.</p>
            </div>
            <div class="feature">
              <div class="feature-icon">📱</div>
              <h3>Mobile Ready</h3>
              <p>Every tool works perfectly on smartphones and tablets. Full functionality on any screen size, any device.</p>
            </div>
          </div>

          <div class="about-text">
            <p>UtilityMega is your go-to destination for free online tools across 10 professional categories. Whether you are a developer looking for a quick JSON formatter, a farmer calculating crop yield, a student converting units, or a marketer optimizing meta tags — we have the right tool for you.</p>
            <p>Our collection includes over 100 tools spanning financial calculators (SIP, EMI, compound interest), image optimization tools (compressor, resizer, converter), developer utilities (JSON formatter, Base64 encoder, regex tester), SEO analysis tools (meta tag generator, keyword density checker), and specialized farming calculators for crop yield, fertilizer needs, and irrigation planning.</p>
            <p>All tools are built with performance-first design, mobile responsiveness, and SEO optimization in mind. We believe utility tools should be universally accessible — fast, free, and private.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E")
      
      color: white; padding: 5rem 1rem 4rem; text-align: center; position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E");
    }
    .hero .container { position: relative; max-width: 800px; margin: 0 auto; }
    .hero-badge { display: inline-block; background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); border-radius: 99px; padding: 0.4rem 1rem; font-size: 0.85rem; font-weight: 600; margin-bottom: 1.5rem; }
    .hero-title { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; line-height: 1.1; margin-bottom: 1rem; }
    .gradient-text { background: linear-gradient(135deg, #fbbf24, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-subtitle { font-size: 1.15rem; opacity: 0.85; max-width: 560px; margin: 0 auto 2.5rem; line-height: 1.6; }
    .hero-search { max-width: 580px; margin: 0 auto 2rem; position: relative; }
    .search-box { display: flex; align-items: center; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    .search-icon { padding: 0 0.75rem; font-size: 1.1rem; }
    .search-input { flex: 1; border: none; outline: none; padding: 1rem 0.5rem; font-size: 0.95rem; color: #111; }
    .search-btn { background: #1d4ed8; color: white; border: none; padding: 0.85rem 1.5rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
    .search-btn:hover { background: #1e40af; }
    .search-results { position: absolute; top: 100%; left: 0; right: 0; background: white; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; z-index: 100; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
    .search-result-item { display: flex; justify-content: space-between; padding: 0.75rem 1rem; color: #111; cursor: pointer; transition: background 0.1s; font-size: 0.9rem; }
    .search-result-item:hover { background: #eff6ff; }
    .cat-badge { font-size: 0.75rem; color: #6b7280; background: #f3f4f6; padding: 0.15rem 0.4rem; border-radius: 4px; }
    .hero-stats { display: flex; align-items: center; justify-content: center; gap: 1.5rem; opacity: 0.9; }
    .stat { display: flex; flex-direction: column; align-items: center; }
    .stat strong { font-size: 1.5rem; font-weight: 800; }
    .stat span { font-size: 0.8rem; opacity: 0.75; }
    .stat-sep { color: rgba(255,255,255,0.3); font-size: 1.5rem; }
    .section { padding: 4rem 1rem; }
    .section-alt { background: var(--bg-alt, #f8fafc); }
    .container { max-width: 1200px; margin: 0 auto; }
    .section-header { text-align: center; margin-bottom: 2.5rem; }
    .section-header h2 { font-size: 1.75rem; font-weight: 700; color: var(--text, #111827); margin-bottom: 0.5rem; }
    .section-header p { color: var(--text-muted, #6b7280); }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .category-card { display: flex; flex-direction: column; gap: 0.4rem; background: var(--card-bg, #fff); border: 1px solid var(--border-color, #e5e7eb); border-radius: 12px; padding: 1.5rem 1.25rem; text-decoration: none; color: inherit; transition: all 0.2s; }
    .category-card:hover { border-color: var(--primary, #2563eb); box-shadow: 0 4px 20px rgba(37,99,235,0.1); transform: translateY(-2px); }
    .cat-icon { font-size: 2.25rem; }
    .cat-name { font-size: 1rem; font-weight: 600; color: var(--text, #111827); margin: 0; }
    .cat-desc { font-size: 0.8rem; color: var(--text-muted, #6b7280); line-height: 1.4; margin: 0; }
    .cat-tools { font-size: 0.8rem; color: var(--primary, #2563eb); font-weight: 600; margin-top: auto; }
    .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .content-block { max-width: 900px; margin: 0 auto; }
    .content-block h2 { font-size: 1.75rem; font-weight: 700; text-align: center; margin-bottom: 2rem; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
    .feature { text-align: center; padding: 1.5rem; background: var(--card-bg, #fff); border-radius: 12px; border: 1px solid var(--border-color, #e5e7eb); }
    .feature-icon { font-size: 2rem; margin-bottom: 0.75rem; }
    .feature h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; }
    .feature p { font-size: 0.875rem; color: var(--text-muted, #6b7280); line-height: 1.5; }
    .about-text p { color: var(--text-muted, #4b5563); line-height: 1.8; margin-bottom: 1rem; }
  `]
})
export class HomeComponent implements OnInit {
  private cms = inject(CmsService);
  private seo = inject(SeoService);

  categories = signal<Category[]>([]);
  popularTools = signal<Tool[]>([]);
  searchResults = signal<Tool[]>([]);
  searchQuery = '';

  ngOnInit(): void {
    this.seo.setHomeMeta();
    this.cms.getCategories().subscribe(c => this.categories.set(c));
    this.cms.getPopularTools().subscribe(t => this.popularTools.set(t));
  }

  getIcon(slug: string): string {
    const map: Record<string, string> = {
      calculators: '🧮', 'image-tools': '🖼️', 'video-tools': '🎬',
      'developer-tools': '💻', 'text-tools': '📝', 'security-tools': '🔒',
      'seo-tools': '📈', 'unit-converters': '⚖️', 'utility-tools': '🔧', 'farmers-tools': '🌾'
    };
    return map[slug] ?? '🔧';
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) { this.searchResults.set([]); return; }
    this.cms.searchTools(this.searchQuery).subscribe(results => this.searchResults.set(results.slice(0, 6)));
  }
}
