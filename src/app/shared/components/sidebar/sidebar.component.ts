import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CmsService } from '../../../core/services/cms.service';
import { Category, Tool } from '../../../core/models/tool.model';
import { filter } from 'rxjs/operators';

const CAT_ICONS: Record<string, string> = {
  calculators: '🧮', 'image-tools': '🖼️', 'video-tools': '🎬',
  'developer-tools': '💻', 'text-tools': '📝', 'security-tools': '🔒',
  'seo-tools': '📈', 'unit-converters': '⚖️', 'utility-tools': '🔧', 'farmers-tools': '🌾'
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <div class="sidebar-overlay" [class.active]="open" (click)="close.emit()"></div>
    <aside class="sidebar-drawer" [class.open]="open">
      <div class="sidebar-header">
        <a routerLink="/" class="sidebar-logo" (click)="close.emit()">⚡ Utility<strong>Mega</strong></a>
        <button class="close-btn" (click)="close.emit()">✕</button>
      </div>

      <div class="sidebar-search">
        <span>🔍</span>
        <input type="search" placeholder="Search tools..." [(ngModel)]="q" (input)="filterTools()" class="sidebar-search-input" />
      </div>

      <div class="sidebar-results" *ngIf="q">
        <a *ngFor="let t of filtered().slice(0,8)" [routerLink]="['/',t.categorySlug,t.slug]" (click)="close.emit()" class="result-item">
          <span>{{ icon(t.categorySlug) }}</span><span>{{ t.name }}</span>
        </a>
        <div class="no-res" *ngIf="!filtered().length">No tools found for "{{ q }}"</div>
      </div>

      <nav class="sidebar-nav" *ngIf="!q">
        <div class="cat-group" *ngFor="let cat of categories()">
          <button class="cat-btn" (click)="toggle(cat.slug)" [class.open]="expanded()===cat.slug">
            <span class="cat-btn-l"><span class="cat-ic">{{ icon(cat.slug) }}</span>{{ cat.name }}</span>
            <span class="arr" [class.rot]="expanded()===cat.slug">›</span>
          </button>
          <div class="sub-tools" [class.open]="expanded()===cat.slug">
            <a *ngFor="let t of toolsMap()[cat.slug]||[]" [routerLink]="['/',t.categorySlug,t.slug]"
               routerLinkActive="active" (click)="close.emit()" class="sub-link">
              {{ t.name }}<span *ngIf="t.isPopular" class="fire">🔥</span>
            </a>
            <a [routerLink]="['/'+cat.slug]" (click)="close.emit()" class="view-all">All {{ cat.name }} →</a>
          </div>
        </div>
      </nav>

      <div class="sidebar-foot">
        <a routerLink="/" (click)="close.emit()">🏠 Home</a>
        <a routerLink="/search" (click)="close.emit()">🔍 Search</a>
        <span class="copy">© 2025 UtilityMega</span>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:998;opacity:0;pointer-events:none;transition:opacity .25s}
    .sidebar-overlay.active{opacity:1;pointer-events:all}
    .sidebar-drawer{position:fixed;top:0;right:0;height:100dvh;width:300px;max-width:88vw;background:var(--card-bg);border-left:1px solid var(--border);z-index:999;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .28s cubic-bezier(.4,0,.2,1);overflow:hidden}
    .sidebar-drawer.open{transform:translateX(0)}
    .sidebar-header{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1rem;border-bottom:1px solid var(--border);flex-shrink:0}
    .sidebar-logo{text-decoration:none;color:var(--text);font-weight:700;font-size:1rem}
    .sidebar-logo strong{color:var(--primary)}
    .close-btn{background:none;border:none;cursor:pointer;font-size:1rem;color:var(--text-muted);padding:.3rem .45rem;border-radius:6px}
    .close-btn:hover{background:var(--bg-alt)}
    .sidebar-search{display:flex;align-items:center;gap:.5rem;padding:.7rem 1rem;border-bottom:1px solid var(--border);flex-shrink:0}
    .sidebar-search-input{flex:1;border:none;outline:none;background:transparent;font-size:.86rem;color:var(--text);font-family:inherit}
    .sidebar-results{overflow-y:auto;flex:1;padding:.25rem 0}
    .result-item{display:flex;align-items:center;gap:.6rem;padding:.6rem 1rem;text-decoration:none;color:var(--text);font-size:.85rem;transition:background .12s}
    .result-item:hover{background:var(--bg-alt)}
    .no-res{padding:.75rem 1rem;color:var(--text-muted);font-size:.82rem}
    .sidebar-nav{overflow-y:auto;flex:1}
    .cat-group{border-bottom:1px solid var(--border)}
    .cat-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;background:none;border:none;cursor:pointer;color:var(--text);font-size:.88rem;font-weight:600;transition:background .12s;font-family:inherit}
    .cat-btn:hover,.cat-btn.open{background:var(--primary-light);color:var(--primary)}
    .cat-btn-l{display:flex;align-items:center;gap:.55rem}
    .cat-ic{font-size:1rem}
    .arr{color:var(--text-muted);font-size:1rem;transition:transform .2s;line-height:1}
    .arr.rot{transform:rotate(90deg)}
    .sub-tools{display:none;flex-direction:column;background:var(--bg-alt)}
    .sub-tools.open{display:flex}
    .sub-link{display:flex;align-items:center;justify-content:space-between;padding:.5rem 1rem .5rem 2.5rem;text-decoration:none;color:var(--text-muted);font-size:.82rem;transition:all .12s}
    .sub-link:hover{color:var(--primary);background:var(--primary-light)}
    .sub-link.active{color:var(--primary);font-weight:600;background:var(--primary-light)}
    .fire{font-size:.7rem}
    .view-all{padding:.55rem 1rem .55rem 2.5rem;color:var(--primary);font-size:.8rem;font-weight:600;text-decoration:none;display:block}
    .view-all:hover{text-decoration:underline}
    .sidebar-foot{padding:.85rem 1rem;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;flex-shrink:0}
    .sidebar-foot a{color:var(--text-muted);text-decoration:none;font-size:.8rem}
    .sidebar-foot a:hover{color:var(--primary)}
    .copy{margin-left:auto;font-size:.72rem;color:var(--text-muted)}
  `]
})
export class SidebarComponent implements OnInit {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  private cms = inject(CmsService);
  private router = inject(Router);
  categories = signal<Category[]>([]);
  toolsMap = signal<Record<string,Tool[]>>({});
  filtered = signal<Tool[]>([]);
  expanded = signal('');
  q = '';

  ngOnInit() {
    this.cms.getCategories().subscribe(c => this.categories.set(c));
    this.cms.getAllTools().subscribe(tools => {
      const m: Record<string,Tool[]> = {};
      tools.forEach(t => { if(!m[t.categorySlug]) m[t.categorySlug]=[]; m[t.categorySlug].push(t); });
      this.toolsMap.set(m);
    });
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e:any) => {
      const seg = e.url.split('/')[1];
      if(seg && seg!=='search') this.expanded.set(seg);
      this.close.emit();
    });
    const seg = this.router.url.split('/')[1];
    if(seg) this.expanded.set(seg);
  }

  icon(slug: string) { return CAT_ICONS[slug]??'🔧'; }
  toggle(slug: string) { this.expanded.set(this.expanded()===slug?'':slug); }
  filterTools() { if(!this.q.trim()){this.filtered.set([]);return;} this.cms.searchTools(this.q).subscribe(r=>this.filtered.set(r)); }
}
