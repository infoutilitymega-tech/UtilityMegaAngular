import { Component, signal, inject, HostListener, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CmsService } from '../../../core/services/cms.service';
import { Tool } from '../../../core/models/tool.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <header class="site-header" [class.scrolled]="scrolled()">
      <div class="header-inner">

        <!-- Logo with custom favicon image -->
        <a routerLink="/" class="logo" aria-label="UtilityMega Home">
          <img src="favicon.ico" alt="UtilityMega" class="logo-img" />
          <span class="logo-text">Utility<strong>Mega</strong></span>
        </a>

        <!-- Search bar with suggestions -->
        <div class="header-search-wrap" #searchWrap>
          <div class="header-search-box" [class.focused]="searchFocused">
            <span class="s-icon">🔍</span>
            <input
              type="search"
              class="header-search-input"
              placeholder="Search 100+ free tools..."
              [(ngModel)]="query"
              (input)="onInput()"
              (focus)="onFocus()"
              (blur)="onBlur()"
              (keyup.enter)="goSearch()"
              (keyup.arrowdown)="moveSugg(1)"
              (keyup.arrowup)="moveSugg(-1)"
              (keyup.escape)="closeSugg()"
              autocomplete="off"
              aria-label="Search tools"
              aria-autocomplete="list"
              aria-haspopup="listbox"
            />
            <button *ngIf="query" class="clear-btn" (click)="clearSearch()" tabindex="-1">✕</button>
          </div>

          <!-- Suggestions Dropdown -->
          <div class="suggestions-dropdown" *ngIf="showSugg() && (suggestions().length || recentSearches.length)" role="listbox">

            <!-- Recent searches -->
            <div class="sugg-section" *ngIf="!query && recentSearches.length">
              <div class="sugg-label">Recent Searches</div>
              <button *ngFor="let r of recentSearches.slice(0,3)" class="sugg-item recent-item"
                (mousedown)="selectSugg(r)" role="option">
                <span class="sugg-icon">🕐</span>
                <span class="sugg-name">{{ r }}</span>
                <span class="sugg-type">Recent</span>
              </button>
            </div>

            <!-- Popular tools (when no query) -->
            <div class="sugg-section" *ngIf="!query">
              <div class="sugg-label">Popular Tools</div>
              <button *ngFor="let t of popularSuggs()" class="sugg-item"
                (mousedown)="selectTool(t)" [class.selected]="suggIdx===getSuggIdx(t)" role="option">
                <span class="sugg-icon">{{ getCatIcon(t.categorySlug) }}</span>
                <div class="sugg-body">
                  <span class="sugg-name">{{ t.name }}</span>
                  <span class="sugg-cat">{{ t.categoryName }}</span>
                </div>
                <span class="sugg-hot" *ngIf="t.isPopular">🔥</span>
              </button>
            </div>

            <!-- Live results -->
            <div class="sugg-section" *ngIf="query && suggestions().length">
              <div class="sugg-label">Results ({{ suggestions().length }})</div>
              <button *ngFor="let t of suggestions().slice(0,6); let i = index" class="sugg-item"
                (mousedown)="selectTool(t)" [class.selected]="suggIdx===i" role="option">
                <span class="sugg-icon">{{ getCatIcon(t.categorySlug) }}</span>
                <div class="sugg-body">
                  <span class="sugg-name" [innerHTML]="highlight(t.name)"></span>
                  <span class="sugg-cat">{{ t.categoryName }}</span>
                </div>
                <span class="sugg-hot" *ngIf="t.isPopular">🔥</span>
              </button>
              <button class="sugg-see-all" (mousedown)="goSearch()">
                See all results for "<strong>{{ query }}</strong>" →
              </button>
            </div>

            <!-- No results -->
            <div class="sugg-no-result" *ngIf="query && !suggestions().length">
              <span>😔 No tools found for "{{ query }}"</span>
              <button (mousedown)="goSearch()">Search anyway →</button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="header-actions">
          <button class="icon-btn theme-btn" (click)="toggleTheme()" [title]="dark() ? 'Switch to Light' : 'Switch to Dark'">
            <span class="theme-icon">{{ dark() ? '☀️' : '🌙' }}</span>
          </button>
          <button class="icon-btn ham-btn" (click)="sidebarToggle.emit()" aria-label="Open Menu">
            <span class="ham-bar"></span>
            <span class="ham-bar"></span>
            <span class="ham-bar"></span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .site-header {
      position: sticky; top: 0; z-index: 900;
      background: var(--header-bg);
      border-bottom: 1px solid rgba(255,255,255,.06);
      transition: box-shadow .2s;
    }
    .site-header.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,.3); }

    .header-inner {
      max-width: 1400px; margin: 0 auto;
      display: flex; align-items: center; gap: 1rem;
      height: 60px; padding: 0 1.25rem;
    }

    /* Logo */
    .logo { display: flex; align-items: center; gap: .5rem; text-decoration: none; flex-shrink: 0; }
    .logo-img { width: 28px; height: 28px; object-fit: contain; border-radius: 6px; }
    .logo-text { font-size: 1.1rem; font-weight: 800; color: var(--header-text); white-space: nowrap; letter-spacing: -.02em; }
    .logo-text strong { color: var(--accent); }

    /* Search */
    .header-search-wrap { flex: 1; max-width: 540px; margin: 0 auto; position: relative; }
    .header-search-box {
      display: flex; align-items: center; gap: .5rem;
      background: rgba(255,255,255,.08); border: 1.5px solid rgba(255,255,255,.12);
      border-radius: 10px; padding: .45rem .85rem;
      transition: all .2s;
    }
    .header-search-box.focused {
      background: rgba(255,255,255,.12); border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(96,165,250,.2);
    }
    .s-icon { font-size: .9rem; color: rgba(255,255,255,.5); flex-shrink: 0; }
    .header-search-input {
      flex: 1; border: none; outline: none; background: transparent;
      font-size: .88rem; color: var(--header-text); caret-color: var(--primary);
    }
    .header-search-input::placeholder { color: rgba(255,255,255,.35); }
    .clear-btn {
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,.4); font-size: .8rem; padding: .1rem .25rem;
      border-radius: 4px; transition: color .15s;
    }
    .clear-btn:hover { color: var(--header-text); }

    /* Dropdown */
    .suggestions-dropdown {
      position: absolute; top: calc(100% + 8px); left: 0; right: 0;
      background: var(--card-bg); border: 1px solid var(--border);
      border-radius: 14px; box-shadow: var(--shadow-lg);
      overflow: hidden; z-index: 999;
      animation: fadeUp .15s ease;
    }
    .sugg-section { padding: .4rem 0; border-bottom: 1px solid var(--border); }
    .sugg-section:last-child { border-bottom: none; }
    .sugg-label {
      padding: .4rem .9rem .25rem; font-size: .68rem; font-weight: 700;
      color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em;
    }
    .sugg-item {
      display: flex; align-items: center; gap: .65rem;
      width: 100%; padding: .55rem .9rem; background: none; border: none;
      cursor: pointer; text-align: left; transition: background .12s;
      color: var(--text);
    }
    .sugg-item:hover, .sugg-item.selected { background: var(--primary-light); }
    .sugg-icon { font-size: 1rem; flex-shrink: 0; width: 22px; }
    .sugg-body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .sugg-name { font-size: .85rem; font-weight: 600; color: var(--text); }
    .sugg-name mark { background: none; color: var(--primary); font-weight: 800; }
    .sugg-cat { font-size: .72rem; color: var(--text-muted); }
    .sugg-hot { font-size: .75rem; }
    .sugg-type { font-size: .7rem; color: var(--text-muted); }
    .recent-item .sugg-name { color: var(--text-muted); font-weight: 500; }
    .sugg-see-all {
      display: block; width: 100%; padding: .6rem .9rem; background: none; border: none;
      cursor: pointer; text-align: left; font-size: .82rem; color: var(--primary);
      font-family: var(--font); transition: background .12s; border-top: 1px solid var(--border);
    }
    .sugg-see-all:hover { background: var(--primary-light); }
    .sugg-no-result {
      padding: .75rem .9rem; display: flex; align-items: center;
      justify-content: space-between; color: var(--text-muted); font-size: .83rem;
    }
    .sugg-no-result button {
      background: none; border: none; cursor: pointer; color: var(--primary);
      font-family: var(--font); font-size: .82rem;
    }

    /* Actions */
    .header-actions { display: flex; align-items: center; gap: .25rem; flex-shrink: 0; }
    .icon-btn {
      display: flex; align-items: center; justify-content: center;
      width: 38px; height: 38px; border-radius: 9px;
      background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1);
      cursor: pointer; color: var(--header-text); transition: all .15s;
    }
    .icon-btn:hover { background: rgba(255,255,255,.15); }
    .theme-icon { font-size: 1rem; }
    .ham-btn { flex-direction: column; gap: 4.5px; padding: 8px; }
    .ham-bar { width: 17px; height: 1.5px; background: var(--header-text); border-radius: 2px; display: block; }

    @media(max-width: 600px) {
      .logo-text { display: none; }
      .header-search-wrap { max-width: 210px; }
    }
    
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private cms = inject(CmsService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  @Output() sidebarToggle = new EventEmitter<void>();

  scrolled = signal(false);
  dark = signal(false);
  showSugg = signal(false);
  suggestions = signal<Tool[]>([]);
  popularSuggs = signal<Tool[]>([]);

  query = '';
  searchFocused = false;
  suggIdx = -1;
  recentSearches: string[] = [];

  private readonly CAT_ICONS: Record<string, string> = {
    calculators: '🧮', 'image-tools': '🖼️', 'video-tools': '🎬',
    'developer-tools': '💻', 'text-tools': '📝', 'security-tools': '🔒',
    'seo-tools': '📈', 'unit-converters': '⚖️', 'utility-tools': '🔧', 'farmers-tools': '🌾'
  };

  ngOnInit() {
    // Theme
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia?.('(prefers-color-scheme:dark)').matches;
      const isDark = saved === 'dark' || (!saved && prefersDark);
      if (isDark) { this.dark.set(true); document.documentElement.setAttribute('data-theme', 'dark'); }
      this.recentSearches = JSON.parse(localStorage.getItem('um-recent') || '[]');
    }
    // Popular tools
    this.cms.getPopularTools().subscribe(t => this.popularSuggs.set(t.slice(0, 5)));
    // Debounced search
    this.searchSubject.pipe(
      debounceTime(200), distinctUntilChanged(), takeUntil(this.destroy$)
    ).subscribe(q => {
      if (!q.trim()) { this.suggestions.set([]); return; }
      this.cms.searchTools(q).subscribe(r => { this.suggestions.set(r.slice(0, 8)); this.suggIdx = -1; });
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 8); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (!el.closest('.header-search-wrap')) this.closeSugg();
  }

  onInput() { this.searchSubject.next(this.query); this.showSugg.set(true); }
  onFocus() { this.searchFocused = true; this.showSugg.set(true); }
  onBlur() { this.searchFocused = false; }

  closeSugg() { this.showSugg.set(false); this.suggIdx = -1; }

  clearSearch() { this.query = ''; this.suggestions.set([]); this.showSugg.set(false); }

  moveSugg(dir: number) {
    const len = this.suggestions().length;
    if (!len) return;
    this.suggIdx = Math.max(-1, Math.min(len - 1, this.suggIdx + dir));
  }

  getSuggIdx(t: Tool) { return this.suggestions().indexOf(t); }

  getCatIcon(slug: string) { return this.CAT_ICONS[slug] ?? '🔧'; }

  highlight(name: string): string {
    if (!this.query) return name;
    const re = new RegExp(`(${this.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return name.replace(re, '<mark>$1</mark>');
  }

  selectTool(t: Tool) {
    this.saveRecent(t.name);
    this.query = '';
    this.closeSugg();
    this.router.navigate(['/', t.categorySlug, t.slug]);
  }

  selectSugg(name: string) {
    this.query = name;
    this.goSearch();
  }

  goSearch() {
    const q = this.query.trim();
    if (!q) return;
    this.saveRecent(q);
    this.closeSugg();
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  saveRecent(q: string) {
    if (!q) return;
    this.recentSearches = [q, ...this.recentSearches.filter(r => r !== q)].slice(0, 5);
    localStorage.setItem('um-recent', JSON.stringify(this.recentSearches));
  }

  toggleTheme() {
    const d = !this.dark();
    this.dark.set(d);
    document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light');
    localStorage.setItem('theme', d ? 'dark' : 'light');
  }
}
