import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CmsService } from '../../core/services/cms.service';
import { SeoService } from '../../core/services/seo.service';
import { BlogWithTool, BreadcrumbItem } from '../../core/models/tool.model';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { AdsenseComponent } from '../../shared/components/adsense/adsense.component';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage, BreadcrumbComponent, AdsenseComponent],
  template: `
    <ng-container *ngIf="blog(); else notFound">
      <article class="blog-detail py-4 py-md-5">
        <div class="container">
          <app-breadcrumb [items]="breadcrumbs()" />

          <div class="row g-4 g-xl-5">
            <main class="col-lg-8">
              <header class="blog-hero mb-4">
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <a [routerLink]="['/', blog()!.categorySlug]" class="badge text-bg-light text-decoration-none">
                    {{ blog()!.categoryName }}
                  </a>
                  <a [routerLink]="['/', blog()!.categorySlug, blog()!.toolSlug]" class="badge text-bg-primary text-decoration-none">
                    {{ blog()!.toolName }}
                  </a>
                </div>
                <h1 class="display-6 fw-bold mb-3">{{ blog()!.title }}</h1>
                <p class="lead text-muted mb-3">{{ blog()!.description }}</p>
                <time class="created-date" [attr.datetime]="blog()!.createdDate">
                  Published {{ blog()!.createdDate | date: 'longDate' }}
                </time>
              </header>

              <img
                [ngSrc]="blog()!.image"
                width="960"
                height="540"
                class="hero-image rounded-4 shadow-sm mb-4"
                [alt]="blog()!.title"
                loading="eager"
                fetchpriority="high"
              />

              <app-adsense slot="in-article" />

              <div class="content-card rounded-4 p-4 p-md-5 mt-4">
                <div class="blog-content" [innerHTML]="formattedContent()"></div>
              </div>
            </main>

            <aside class="col-lg-4">
              <div class="sticky-sidebar d-grid gap-3">
                <app-adsense slot="sidebar" />

                <section class="side-card rounded-4 p-4">
                  <h2 class="h5 fw-bold mb-3">Use this tool</h2>
                  <p class="text-muted small mb-3">Open the related {{ blog()!.toolName }} utility and apply this guide instantly.</p>
                  <a [routerLink]="['/', blog()!.categorySlug, blog()!.toolSlug]" class="btn btn-primary w-100">
                    Open {{ blog()!.toolName }} →
                  </a>
                </section>

                <section class="side-card rounded-4 p-4" *ngIf="relatedBlogs().length">
                  <h2 class="h5 fw-bold mb-3">Related blogs</h2>
                  <div class="related-list d-grid gap-3">
                    <a *ngFor="let item of relatedBlogs(); trackBy: trackByBlog" [routerLink]="item.url" class="related-blog text-decoration-none">
                      <span class="related-title">{{ item.title }}</span>
                      <span class="related-meta">{{ item.toolName }} · {{ item.createdDate | date: 'mediumDate' }}</span>
                    </a>
                  </div>
                </section>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </ng-container>

    <ng-template #notFound>
      <div class="container py-5 text-center">
        <div class="nf-icon mb-3">🔍</div>
        <h1 class="h3 fw-bold">Blog not found</h1>
        <p class="text-muted">This blog does not exist or may have moved.</p>
        <a routerLink="/blogs" class="btn btn-primary">Back to Blogs</a>
      </div>
    </ng-template>
  `,
  styles: [`
    .blog-detail { background: var(--bg); min-height: 70vh; }
    .text-bg-primary, .btn-primary { background: var(--primary) !important; border-color: var(--primary) !important; color: #fff !important; }
    .text-bg-light { background: var(--primary-light) !important; color: var(--primary) !important; border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent); }
    .created-date { color: var(--text-muted); font-size: .95rem; font-weight: 600; }
    .hero-image { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; background: var(--bg-alt); border: 1px solid var(--border); }
    .content-card, .side-card { background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
    .blog-content { color: var(--text-muted); font-size: 1rem; line-height: 1.9; }
    .blog-content :is(h2, h3) { color: var(--text); margin: 1.75rem 0 .75rem; font-weight: 800; }
    .blog-content p { margin-bottom: 1rem; }
    .sticky-sidebar { position: sticky; top: 76px; }
    .related-blog { display: grid; gap: .35rem; color: inherit; padding-bottom: .9rem; border-bottom: 1px solid var(--border); }
    .related-blog:last-child { padding-bottom: 0; border-bottom: 0; }
    .related-title { color: var(--text); font-weight: 700; line-height: 1.35; }
    .related-meta { color: var(--text-muted); font-size: .8rem; }
    .related-blog:hover .related-title { color: var(--primary); }
    .nf-icon { font-size: 3rem; }
    @media (max-width: 991.98px) { .sticky-sidebar { position: static; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cms = inject(CmsService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly blog = signal<BlogWithTool | undefined>(undefined);
  readonly relatedBlogs = signal<BlogWithTool[]>([]);
  readonly breadcrumbs = signal<BreadcrumbItem[]>([]);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params) => this.cms.getBlog(params.get('category')!, params.get('tool')!, params.get('blogSlug')!)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((blog) => {
      this.blog.set(blog);
      if (!blog) return;

      this.seo.setBlogMeta(blog);
      this.breadcrumbs.set([
        { label: 'Home', url: '/' },
        { label: 'Blogs', url: '/blogs' },
        { label: blog.categoryName, url: `/${blog.categorySlug}` },
        { label: blog.toolName, url: `/${blog.categorySlug}/${blog.toolSlug}` },
        { label: blog.title, url: blog.url },
      ]);

      this.cms.getRelatedBlogs(blog).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((blogs) => this.relatedBlogs.set(blogs));
    });
  }

  formattedContent(): string {
    return (this.blog()?.content ?? '')
      .split('\n\n')
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => this.formatBlock(block))
      .join('');
  }

  trackByBlog(_: number, blog: BlogWithTool): string {
    return `${blog.categorySlug}/${blog.toolSlug}/${blog.slug}`;
  }

  private formatBlock(block: string): string {
    if (block.startsWith('## ')) return `<h2>${block.replace('## ', '')}</h2>`;
    if (block.startsWith('### ')) return `<h3>${block.replace('### ', '')}</h3>`;
    return `<p>${block}</p>`;
  }
}
