import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, PLATFORM_ID, Type, ViewChild, ViewContainerRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { CmsService } from '../../core/services/cms.service';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { AdsenseComponent } from '../../shared/components/adsense/adsense.component';
import { Tool, BreadcrumbItem } from '../../core/models/tool.model';
import { TOOL_UI_LOADERS } from './tool-ui.loaders';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tool',
  standalone: true,
  imports: [RouterLink, CommonModule, BreadcrumbComponent, AdsenseComponent],
  template: `
    <div class="page-wrap" *ngIf="tool(); else notFound">

      <!-- Top Ad Strip -->
      <div class="top-ad-strip">
        <div class="container"><app-adsense slot="leaderboard" /></div>
      </div>

      <div class="container">

        <!-- Breadcrumb -->
        <app-breadcrumb [items]="breadcrumbs()" />

        <!-- Tool Header -->
        <div class="tool-header">
          <div class="th-meta">
            <a [routerLink]="['/', tool()!.categorySlug]" class="back-link">
              ← {{ tool()!.categoryName }}
            </a>
            <span class="badge-hot" *ngIf="tool()!.isPopular">🔥 Popular</span>
            <span class="badge-feat" *ngIf="tool()!.isFeatured">⭐ Featured</span>
          </div>
          <h1 class="tool-title">{{ tool()!.name }}</h1>
          <p class="tool-desc">{{ tool()!.shortDescription }}</p>
          <div class="kw-pills">
            <span class="kw-pill" *ngFor="let k of tool()!.keywords.slice(0, 6)">{{ k }}</span>
          </div>
        </div>

        <!-- TWO-COLUMN LAYOUT -->
        <div class="tool-layout">

          <!-- ─── MAIN ─── -->
          <main class="tool-main">

            <!-- 1️⃣  TOOL UI CARD — ALWAYS FIRST -->
            <div class="tool-ui-card">
              <div class="ui-card-header">
                <div class="ui-card-title-row">
                  <img src="favicon.ico" alt="" class="ui-favicon" />
                  <span class="ui-card-name">{{ tool()!.name }}</span>
                </div>
                <div class="ui-card-badges">
                  <span class="ui-badge green">🆓 100% Free</span>
                  <span class="ui-badge blue">⚡ Instant</span>
                  <span class="ui-badge gray">🔒 Private</span>
                </div>
              </div>

              <!-- Dynamic UI slot -->
              <ng-container #toolHost></ng-container>

              <!-- Placeholder for unimplemented tools -->
              <div class="tool-placeholder" *ngIf="!hasUI()">
                <div class="ph-icon">⚙️</div>
                <h3>{{ tool()!.name }}</h3>
                <p class="ph-desc">{{ tool()!.shortDescription }}</p>
                <div class="ph-features">
                  <div class="ph-feat" *ngFor="let k of tool()!.keywords.slice(0, 4)">
                    <span class="ph-check">✓</span> {{ k }}
                  </div>
                </div>
                <div class="ph-coming">
                  <span>🚀 Full interactive UI launching soon!</span>
                  <span class="ph-sub">Bookmark this page to be notified.</span>
                </div>
              </div>
            </div>

            <!-- 2️⃣  In-article ad -->
            <app-adsense slot="in-article" />

            <!-- 3️⃣  About / SEO Content -->
            <article class="tool-content">
              <h2>About {{ tool()!.name }}</h2>
              <div class="content-body" [innerHTML]="formattedContent()"></div>
            </article>

            <!-- 4️⃣  FAQ -->
            <div class="faq-section" *ngIf="tool()!.faq?.length">
              <h2>❓ Frequently Asked Questions</h2>
              <div class="faq-list">
                <div class="faq-item" *ngFor="let faq of tool()!.faq; let i = index"
                     [class.open]="openFaq() === i">
                  <button class="faq-q" (click)="toggleFaq(i)" [attr.aria-expanded]="openFaq()===i">
                    <span>{{ faq.question }}</span>
                    <span class="faq-icon">{{ openFaq()===i ? '−' : '+' }}</span>
                  </button>
                  <div class="faq-a" *ngIf="openFaq()===i">
                    <p>{{ faq.answer }}</p>
                  </div>
                </div>
              </div>
            </div>

          </main><!-- /tool-main -->

          <!-- ─── SIDEBAR ─── -->
          <aside class="tool-sidebar">

            <!-- Sidebar Ad -->
            <app-adsense slot="sidebar" />

            <!-- Related Tools -->
            <div class="sb-card" *ngIf="relatedTools().length">
              <h3 class="sb-title">🔗 Related Tools</h3>
              <div class="related-list">
                <a *ngFor="let t of relatedTools()" [routerLink]="['/', t.categorySlug, t.slug]" class="rel-item">
                  <div class="rel-body">
                    <div class="rel-name">{{ t.name }}</div>
                    <div class="rel-desc">{{ t.shortDescription }}</div>
                  </div>
                  <span class="rel-arrow">→</span>
                </a>
              </div>
            </div>

            <!-- More in category -->
            <div class="sb-card">
              <h3 class="sb-title">📂 More {{ tool()!.categoryName }}</h3>
              <div class="related-list">
                <a *ngFor="let t of categoryTools()"
                   [routerLink]="['/', t.categorySlug, t.slug]"
                   class="rel-item" [class.active]="t.slug === tool()!.slug">
                  <div class="rel-name">{{ t.name }}</div>
                  <span class="fire" *ngIf="t.isPopular">🔥</span>
                </a>
              </div>
              <a [routerLink]="['/', tool()!.categorySlug]" class="view-all-link">
                View all {{ tool()!.categoryName }} →
              </a>
            </div>

            <!-- Share -->
            <div class="sb-card">
              <h3 class="sb-title">📤 Share</h3>
              <div class="share-btns">
                <!-- <button class="sh-btn tw" (click)="share('twitter')">𝕏 Share on X</button>
                <button class="sh-btn wa" (click)="share('whatsapp')">💬 WhatsApp</button> -->
                <button class="sh-btn cp" (click)="copyLink()">
                  {{ copied() ? '✓ Copied!' : '📋 Copy Link' }}
                </button>
              </div>
            </div>

          </aside>
        </div><!-- /tool-layout -->

        <!-- Footer ad -->
        <app-adsense slot="footer" />

      </div><!-- /container -->
    </div>

    <ng-template #notFound>
      <div class="nf-wrap container">
        <div class="nf-icon">🔍</div>
        <h1>Tool not found</h1>
        <p>This tool doesn't exist or may have moved.</p>
        <a routerLink="/" class="nf-btn">← Back to Home</a>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .page-wrap { padding-bottom: 4rem; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.25rem; }
    .top-ad-strip { background: var(--bg-alt); border-bottom: 1px solid var(--border); }

    /* Breadcrumb spacing */
    app-breadcrumb { display: block; padding: .65rem 0; }

    /* Tool Header */
    .tool-header { margin: .5rem 0 1.25rem; }
    .th-meta { display: flex; align-items: center; gap: .55rem; margin-bottom: .6rem; flex-wrap: wrap; }
    .back-link { color: var(--primary); text-decoration: none; font-size: .83rem; font-weight: 600; display: inline-flex; align-items: center; gap: .3rem; }
    .back-link:hover { text-decoration: underline; }
    .badge-hot { font-size: .7rem; padding: .18rem .55rem; border-radius: 99px; background: #7c3aed22; color: #a78bfa; font-weight: 700; border: 1px solid #7c3aed44; }
    .badge-feat { font-size: .7rem; padding: .18rem .55rem; border-radius: 99px; background: #d9770622; color: var(--accent); font-weight: 700; border: 1px solid #d9770644; }
    .tool-title { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 900; margin-bottom: .4rem; letter-spacing: -.02em; }
    .tool-desc { color: var(--text-muted); font-size: .95rem; margin-bottom: .75rem; line-height: 1.6; }
    .kw-pills { display: flex; flex-wrap: wrap; gap: .3rem; }
    .kw-pill { font-size: .7rem; padding: .2rem .55rem; border-radius: 6px; background: var(--primary-light); color: var(--primary); font-weight: 600; border: 1px solid var(--primary)44; }

    /* Two-column layout */
    .tool-layout { display: grid; grid-template-columns: 1fr 300px; gap: 1.75rem; }

    /* Tool UI card */
    .tool-ui-card {
      background: var(--card-bg); border: 1.5px solid var(--border);
      border-radius: 16px; overflow: hidden; margin-bottom: 1.5rem;
      box-shadow: var(--shadow-sm);
    }
    .ui-card-header {
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem;
      padding: .85rem 1.25rem;
      background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #7c3aed 100%);
    }
    .ui-card-title-row { display: flex; align-items: center; gap: .55rem; }
    .ui-favicon { width: 22px; height: 22px; border-radius: 4px; }
    .ui-card-name { font-weight: 700; font-size: .92rem; color: #fff; }
    .ui-card-badges { display: flex; gap: .35rem; flex-wrap: wrap; }
    .ui-badge { font-size: .68rem; padding: .18rem .5rem; border-radius: 99px; font-weight: 700; }
    .ui-badge.green { background: rgba(16,185,129,.2); color: #6ee7b7; border: 1px solid rgba(16,185,129,.3); }
    .ui-badge.blue { background: rgba(96,165,250,.2); color: #93c5fd; border: 1px solid rgba(96,165,250,.3); }
    .ui-badge.gray { background: rgba(255,255,255,.15); color: rgba(255,255,255,.8); border: 1px solid rgba(255,255,255,.2); }

    /* Placeholder */
    .tool-placeholder { text-align: center; padding: 3rem 2rem; }
    .ph-icon { font-size: 3rem; margin-bottom: .75rem; }
    .tool-placeholder h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: .5rem; }
    .ph-desc { color: var(--text-muted); font-size: .9rem; max-width: 400px; margin: 0 auto 1.5rem; }
    .ph-features { display: grid; grid-template-columns: repeat(2,1fr); gap: .5rem; max-width: 340px; margin: 0 auto 1.5rem; text-align: left; }
    .ph-feat { display: flex; align-items: center; gap: .4rem; font-size: .83rem; color: var(--text-muted); }
    .ph-check { color: var(--green); font-weight: 700; }
    .ph-coming { display: flex; flex-direction: column; gap: .25rem; background: var(--primary-light); border: 1px solid var(--primary)44; border-radius: 10px; padding: .85rem 1rem; }
    .ph-coming span { font-size: .85rem; font-weight: 600; color: var(--primary); }
    .ph-sub { font-size: .75rem; font-weight: 400; color: var(--text-muted); }

    /* Content */
    .tool-content { background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem 1.75rem; margin-bottom: 1.5rem; }
    .tool-content h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem; padding-bottom: .65rem; border-bottom: 1px solid var(--border); }
    .content-body p { color: var(--text-muted); line-height: 1.85; font-size: .9rem; margin-bottom: .85rem; }
    .content-body p:last-child { margin-bottom: 0; }

    /* FAQ */
    .faq-section { background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem 1.75rem; }
    .faq-section h2 { font-size: 1.2rem; font-weight: 800; margin-bottom: 1rem; }
    .faq-list { display: flex; flex-direction: column; gap: .45rem; }
    .faq-item { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .faq-item.open { border-color: var(--primary); }
    .faq-q {
      width: 100%; display: flex; justify-content: space-between; align-items: center;
      padding: .9rem 1.1rem; background: none; border: none; cursor: pointer;
      text-align: left; font-size: .875rem; font-weight: 600; color: var(--text);
      gap: .75rem; font-family: var(--font); transition: background .12s;
    }
    .faq-q:hover { background: var(--bg-alt); }
    .faq-item.open .faq-q { background: var(--primary-light); color: var(--primary); }
    .faq-icon { flex-shrink: 0; font-size: 1.1rem; color: var(--primary); }
    .faq-a { padding: .25rem 1.1rem 1rem; }
    .faq-a p { font-size: .875rem; color: var(--text-muted); line-height: 1.75; margin: 0; }

    /* Sidebar */
    .tool-sidebar { display: flex; flex-direction: column; gap: 1rem; align-self: start; position: sticky; top: 68px; }
    .sb-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; }
    .sb-title { font-size: .87rem; font-weight: 800; margin-bottom: .7rem; color: var(--text); }
    .related-list { display: flex; flex-direction: column; }
    .rel-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: .5rem .55rem; border-radius: 8px; text-decoration: none; color: inherit;
      transition: background .12s; gap: .5rem;
    }
    .rel-item:hover, .rel-item.active { background: var(--primary-light); }
    .rel-body { flex: 1; min-width: 0; }
    .rel-name { font-size: .82rem; font-weight: 600; color: var(--text); }
    .rel-desc { font-size: .7rem; color: var(--text-muted); }
    .rel-arrow { color: var(--text-muted); font-size: .85rem; flex-shrink: 0; }
    .fire { font-size: .75rem; }
    .view-all-link { display: block; text-align: center; margin-top: .6rem; color: var(--primary); font-size: .8rem; font-weight: 700; text-decoration: none; padding: .4rem; border-radius: 8px; border: 1px solid var(--primary)44; }
    .view-all-link:hover { background: var(--primary-light); }
    .share-btns { display: flex; flex-direction: column; gap: .4rem; }
    .sh-btn { display: block; width: 100%; padding: .6rem; border-radius: 9px; border: none; cursor: pointer; font-size: .82rem; font-weight: 700; font-family: var(--font); transition: opacity .15s; }
    .sh-btn.tw { background: #000; color: #fff; }
    .sh-btn.wa { background: #25d366; color: #fff; }
    .sh-btn.cp { background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary)44; }
    .sh-btn:hover { opacity: .85; }

    /* Not found */
    .nf-wrap { padding: 5rem 1rem; text-align: center; }
    .nf-icon { font-size: 3.5rem; margin-bottom: 1rem; }
    .nf-wrap h1 { font-size: 1.75rem; margin-bottom: .5rem; }
    .nf-wrap p { color: var(--text-muted); margin-bottom: 1.5rem; }
    .nf-btn { display: inline-block; background: var(--primary); color: #fff; padding: .7rem 1.5rem; border-radius: 10px; text-decoration: none; font-weight: 700; }

    @media(max-width: 960px) {
      .tool-layout { grid-template-columns: 1fr; }
      .tool-sidebar { position: static; order: 3; }
    }
  `]
})
export class ToolComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cms = inject(CmsService);
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  //private vcr = inject(ViewContainerRef);
@ViewChild('toolHost', { read: ViewContainerRef })
private vcr!: ViewContainerRef;
  tool = signal<Tool | undefined>(undefined);
  relatedTools = signal<Tool[]>([]);
  categoryTools = signal<Tool[]>([]);
  breadcrumbs = signal<BreadcrumbItem[]>([]);
  openFaq = signal<number | null>(null);
  copied = signal(false);
  hasUI = signal(false);

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(p => this.cms.getTool(p.get('category')!, p.get('tool')!)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tool => {
      if (!tool) return;
      this.tool.set(tool);
      this.seo.setToolMeta(tool);
      this.breadcrumbs.set([
        { label: 'Home', url: '/' },
        { label: tool.categoryName, url: `/${tool.categorySlug}` },
        { label: tool.name, url: `/${tool.categorySlug}/${tool.slug}` }
      ]);
      this.cms.getRelatedTools(tool)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(r => this.relatedTools.set(r));
      this.cms.getToolsByCategory(tool.categorySlug)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(t => this.categoryTools.set(t.filter(x => x.slug !== tool.slug).slice(0, 8)));
      void this.loadUI(tool.slug);
    });
  }

  async loadUI(slug: string): Promise<void> {
    const loader = TOOL_UI_LOADERS[slug];
    this.hasUI.set(!!loader);

    // Avoid instantiating browser-only tool UIs during SSR/prerender.
    if (!isPlatformBrowser(this.platformId) || !loader) return;

    try {
      const componentToRender: Type<unknown> = await loader();
      this.vcr?.clear();
      this.vcr?.createComponent(componentToRender);
    } catch (error) {
      console.error(`[ToolComponent] Failed to lazy-load UI for ${slug}.`, error);
    }
  }

  formattedContent(): string {
    return (this.tool()?.content ?? '').split('\n\n').map(p => p.trim()).filter(Boolean).map(p => `<p>${p}</p>`).join('');
  }

  toggleFaq(i: number) { this.openFaq.set(this.openFaq() === i ? null : i); }

  share(platform: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent((this.tool()?.name ?? '') + ' - Free Online Tool');
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${text}%20${url}`);
  }

  copyLink() {
    if (!isPlatformBrowser(this.platformId)) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  }
}
