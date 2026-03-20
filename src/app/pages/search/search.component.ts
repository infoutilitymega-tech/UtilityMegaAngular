import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CmsService } from '../../core/services/cms.service';
import { SeoService } from '../../core/services/seo.service';
import { ToolCardComponent } from '../../shared/components/tool-card/tool-card.component';
import { AdsenseComponent } from '../../shared/components/adsense/adsense.component';
import { Tool, Category } from '../../core/models/tool.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ToolCardComponent, AdsenseComponent],
  template: `
    <div class="search-page">
      <div class="container">
        <!-- Header -->
        <div class="search-header">
          <h1>Search Tools</h1>
          <p>Find the right tool from 100+ free utilities</p>
        </div>

        <!-- Search bar -->
        <div class="big-search-box">
          <span class="bsi">🔍</span>
          <input
            type="search"
            class="big-search-input"
            placeholder="Search tools by name, category, or keyword..."
            [(ngModel)]="query"
            (input)="doSearch()"
            autofocus
          />
          <span class="count-badge" *ngIf="results().length">{{ results().length }} results</span>
        </div>

        <!-- Filters -->
        <div class="filter-row">
          <div class="filter-group">
            <span class="filter-label">Category:</span>
            <button class="f-btn" [class.active]="!activeCategory" (click)="setCategory('')">All</button>
            <button *ngFor="let cat of categories()" class="f-btn" [class.active]="activeCategory===cat.slug"
                    (click)="setCategory(cat.slug)">{{ cat.name }}</button>
          </div>
          <div class="filter-group">
            <span class="filter-label">Filter:</span>
            <button class="f-btn" [class.active]="filter==='all'" (click)="setFilter('all')">All Tools</button>
            <button class="f-btn" [class.active]="filter==='popular'" (click)="setFilter('popular')">🔥 Popular</button>
            <button class="f-btn" [class.active]="filter==='featured'" (click)="setFilter('featured')">⭐ Featured</button>
          </div>
        </div>

        <!-- Ad top -->
        <app-adsense slot="leaderboard" />

        <!-- Results -->
        <div class="results-area">
          <!-- No query state -->
          <div *ngIf="!query" class="no-query">
            <div class="nq-icon">🔍</div>
            <h2>Explore 100+ Free Tools</h2>
            <p>Type above to search, or browse by category:</p>
            <div class="cat-chips">
              <a *ngFor="let cat of categories()" [routerLink]="['/'+cat.slug]" class="cat-chip">
                {{ cat.name }}
              </a>
            </div>
          </div>

          <!-- No results -->
          <div *ngIf="query && !results().length" class="no-results">
            <div class="nr-icon">😔</div>
            <h2>No results for "{{ query }}"</h2>
            <p>Try a different keyword, or <button (click)="query='';doSearch()">clear search</button></p>
            <div class="suggestions">
              <span>Try: </span>
              <button *ngFor="let s of suggestions" (click)="query=s;doSearch()" class="sug-btn">{{ s }}</button>
            </div>
          </div>

          <!-- Results grid -->
          <div *ngIf="query && results().length">
            <div class="result-meta">
              Showing {{ results().length }} tool{{ results().length>1?'s':'' }} for
              <strong>"{{ query }}"</strong>
              <span *ngIf="activeCategory"> in <strong>{{ categoryName }}</strong></span>
            </div>
            <div class="tools-grid">
              <app-tool-card *ngFor="let tool of results()" [tool]="tool" />
            </div>
          </div>
        </div>

        <!-- Ad footer -->
        <app-adsense slot="in-article" />
      </div>
    </div>
  `,
  styles: [`
    .search-page { padding: 2rem 0 4rem; min-height: 70vh; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.25rem; }
    .search-header { text-align: center; margin-bottom: 1.5rem; }
    .search-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: .4rem; }
    .search-header p { color: var(--text-muted); }
    .big-search-box {
      display: flex; align-items: center; gap: .75rem;
      background: var(--card-bg); border: 2px solid var(--border);
      border-radius: 14px; padding: .85rem 1.2rem;
      margin-bottom: 1.25rem;
      transition: border-color .15s, box-shadow .15s;
    }
    .big-search-box:focus-within { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(37,99,235,.1); }
    .bsi { font-size: 1.2rem; }
    .big-search-input { flex: 1; border: none; outline: none; background: transparent; font-size: 1rem; color: var(--text); font-family: inherit; }
    .count-badge { background: var(--primary); color: #fff; font-size: .75rem; font-weight: 700; padding: .2rem .65rem; border-radius: 99px; }
    .filter-row { display: flex; flex-wrap: wrap; gap: .75rem; margin-bottom: 1.5rem; }
    .filter-group { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; }
    .filter-label { font-size: .8rem; font-weight: 600; color: var(--text-muted); margin-right: .2rem; }
    .f-btn { padding: .35rem .8rem; border-radius: 99px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text-muted); font-size: .78rem; font-weight: 500; cursor: pointer; transition: all .15s; font-family: inherit; }
    .f-btn:hover { border-color: var(--primary); color: var(--primary); }
    .f-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }
    .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 1rem; }
    .result-meta { margin-bottom: 1rem; font-size: .875rem; color: var(--text-muted); }
    .no-query, .no-results { text-align: center; padding: 3rem 1rem; }
    .nq-icon, .nr-icon { font-size: 3rem; margin-bottom: 1rem; }
    .no-query h2, .no-results h2 { font-size: 1.4rem; margin-bottom: .5rem; }
    .no-query p, .no-results p { color: var(--text-muted); }
    .no-results button { background: none; border: none; cursor: pointer; color: var(--primary); text-decoration: underline; font-family: inherit; }
    .cat-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; margin-top: 1.5rem; }
    .cat-chip { padding: .45rem 1rem; background: var(--primary-light); color: var(--primary); border-radius: 99px; text-decoration: none; font-size: .85rem; font-weight: 600; transition: all .15s; }
    .cat-chip:hover { background: var(--primary); color: #fff; }
    .suggestions { margin-top: 1rem; display: flex; flex-wrap: wrap; justify-content: center; gap: .4rem; align-items: center; }
    .sug-btn { background: var(--bg-alt); border: 1px solid var(--border); padding: .3rem .7rem; border-radius: 99px; font-size: .8rem; cursor: pointer; color: var(--text); font-family: inherit; }
    .sug-btn:hover { border-color: var(--primary); color: var(--primary); }
  `]
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cms = inject(CmsService);
  private seo = inject(SeoService);

  query = '';
  activeCategory = '';
  filter = 'all';
  results = signal<Tool[]>([]);
  categories = signal<Category[]>([]);
  allTools: Tool[] = [];
  suggestions = ['SIP Calculator', 'JSON Formatter', 'QR Code', 'Password Generator', 'BMI Calculator'];

  get categoryName() {
    return this.categories().find(c => c.slug === this.activeCategory)?.name ?? '';
  }

  ngOnInit() {
    this.seo.setSearchMeta();
    this.cms.getCategories().subscribe(c => this.categories.set(c));
    this.cms.getAllTools().subscribe(t => {
      this.allTools = t;
      // Read query param
      this.route.queryParams.subscribe(p => {
        if (p['q']) { this.query = p['q']; this.doSearch(); }
      });
    });
  }

  setCategory(slug: string) { this.activeCategory = slug; this.applyFilters(this.allTools); }
  setFilter(f: string) { this.filter = f; this.applyFilters(this.allTools); }

  doSearch() {
    if (!this.query.trim()) { this.results.set([]); return; }
    this.cms.searchTools(this.query).subscribe(r => this.applyFilters(r));
  }

  applyFilters(tools: Tool[]) {
    let r = tools;
    if (this.activeCategory) r = r.filter(t => t.categorySlug === this.activeCategory);
    if (this.filter === 'popular') r = r.filter(t => t.isPopular);
    if (this.filter === 'featured') r = r.filter(t => t.isFeatured);
    this.results.set(r);
  }
}
