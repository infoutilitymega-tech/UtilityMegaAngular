import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CmsService } from '../../core/services/cms.service';
import { SeoService } from '../../core/services/seo.service';
import { BlogWithTool, BreadcrumbItem } from '../../core/models/tool.model';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { AdsenseComponent } from '../../shared/components/adsense/adsense.component';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage, BreadcrumbComponent, AdsenseComponent],
  template: `
    <section class="blogs-page py-4 py-md-5">
      <div class="container">
        <app-breadcrumb [items]="breadcrumbs" />

        <div class="row align-items-center g-4 mb-4 mb-lg-5">
          <div class="col-lg-8">
            <span class="badge rounded-pill text-bg-primary mb-3">Tool-wise guides</span>
            <h1 class="display-6 fw-bold mb-3">UtilityMega Blogs</h1>
            <p class="lead text-muted mb-0">
              Practical tutorials, tips, and best practices organized by each UtilityMega tool.
            </p>
          </div>
          <div class="col-lg-4">
            <app-adsense slot="leaderboard" />
          </div>
        </div>

        <div class="row g-4" *ngIf="blogs().length; else emptyState">
          <div class="col-12 col-md-6 col-xl-4" *ngFor="let blog of blogs(); trackBy: trackByBlog">
            <article class="blog-card card h-100 border-0 shadow-sm overflow-hidden">
              <a [routerLink]="blog.url" class="blog-image-link" [attr.aria-label]="blog.title">
                <img
                  [ngSrc]="blog.image"
                  width="640"
                  height="360"
                  class="blog-image card-img-top"
                  [alt]="blog.title"
                  loading="lazy"
                />
              </a>
              <div class="card-body d-flex flex-column p-4">
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <a [routerLink]="['/', blog.categorySlug]" class="badge text-bg-light text-decoration-none">
                    {{ blog.categoryName }}
                  </a>
                  <a [routerLink]="['/', blog.categorySlug, blog.toolSlug]" class="badge text-bg-primary text-decoration-none">
                    {{ blog.toolName }}
                  </a>
                </div>
                <h2 class="h5 fw-bold mb-2">
                  <a [routerLink]="blog.url" class="stretched-link text-decoration-none text-reset">{{ blog.title }}</a>
                </h2>
                <p class="text-muted small flex-grow-1 mb-3">{{ blog.description }}</p>
                <div class="d-flex justify-content-between align-items-center mt-auto small text-muted">
                  <time [attr.datetime]="blog.createdDate">{{ blog.createdDate | date: 'mediumDate' }}</time>
                  <span class="read-more">Read guide →</span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <ng-template #emptyState>
          <div class="empty-state text-center p-5 rounded-4 border">
            <div class="empty-icon mb-3">📝</div>
            <h2 class="h4 fw-bold">No blogs published yet</h2>
            <p class="text-muted mb-0">Tool-wise articles will appear here soon.</p>
          </div>
        </ng-template>
      </div>
    </section>
  `,
  styles: [`
    .blogs-page { background: var(--bg); min-height: 70vh; }
    .blog-card { background: var(--card-bg); border: 1px solid var(--border) !important; border-radius: 1rem; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
    .blog-card:hover { transform: translateY(-4px); border-color: var(--primary) !important; box-shadow: var(--shadow-lg) !important; }
    .blog-image-link { display: block; background: var(--bg-alt); }
    .blog-image { aspect-ratio: 16 / 9; object-fit: cover; transition: transform .25s ease; }
    .blog-card:hover .blog-image { transform: scale(1.03); }
    .text-bg-primary { background: var(--primary) !important; color: #fff !important; }
    .text-bg-light { background: var(--primary-light) !important; color: var(--primary) !important; border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent); }
    .read-more { color: var(--primary); font-weight: 700; }
    .empty-state { background: var(--card-bg); border-color: var(--border) !important; }
    .empty-icon { font-size: 3rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogsComponent implements OnInit {
  private readonly cms = inject(CmsService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly blogs = signal<BlogWithTool[]>([]);
  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Blogs', url: '/blogs' },
  ];

  ngOnInit(): void {
    this.seo.setBlogsMeta();
    this.cms.getAllBlogs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((blogs) => this.blogs.set(blogs));
  }

  trackByBlog(_: number, blog: BlogWithTool): string {
    return `${blog.categorySlug}/${blog.toolSlug}/${blog.slug}`;
  }
}
