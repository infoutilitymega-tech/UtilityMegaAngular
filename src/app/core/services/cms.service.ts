import { Injectable, PLATFORM_ID, inject, makeStateKey, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, shareReplay, tap } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { Category, Tool, ToolsData } from '../models/tool.model';

const TOOLS_DATA_KEY = makeStateKey<ToolsData>('tools-data');

@Injectable({ providedIn: 'root' })
export class CmsService {
  private readonly http = inject(HttpClient);
  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly dataUrl = '/assets/data/tools.json';
  private data$!: Observable<ToolsData>;

  private getData(): Observable<ToolsData> {
    if (!this.data$) {
      const transferStateData = this.transferState.get<ToolsData | null>(TOOLS_DATA_KEY, null);

      if (transferStateData) {
        this.data$ = of(transferStateData).pipe(shareReplay(1));
        this.transferState.remove(TOOLS_DATA_KEY);
        return this.data$;
      }

      this.data$ = this.http.get<ToolsData>(this.dataUrl).pipe(
        tap((data) => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(TOOLS_DATA_KEY, data);
          }
        }),
        shareReplay(1)
      );
    }

    return this.data$;
  }

  getCategories(): Observable<Category[]> {
    return this.getData().pipe(map((d) => d.categories));
  }

  getCategory(slug: string): Observable<Category | undefined> {
    return this.getData().pipe(map((d) => d.categories.find((c) => c.slug === slug)));
  }

  getAllTools(): Observable<Tool[]> {
    return this.getData().pipe(map((d) => d.tools));
  }

  getToolsByCategory(categorySlug: string): Observable<Tool[]> {
    return this.getData().pipe(map((d) => d.tools.filter((t) => t.categorySlug === categorySlug)));
  }

  getTool(categorySlug: string, toolSlug: string): Observable<Tool | undefined> {
    return this.getData().pipe(
      map((d) => d.tools.find((t) => t.categorySlug === categorySlug && t.slug === toolSlug))
    );
  }

  getToolBySlug(toolSlug: string): Observable<Tool | undefined> {
    return this.getData().pipe(map((d) => d.tools.find((t) => t.slug === toolSlug)));
  }

  getPopularTools(): Observable<Tool[]> {
    return this.getData().pipe(map((d) => d.tools.filter((t) => t.isPopular)));
  }

  getFeaturedTools(): Observable<Tool[]> {
    return this.getData().pipe(map((d) => d.tools.filter((t) => t.isFeatured)));
  }

  getRelatedTools(tool: Tool): Observable<Tool[]> {
    return this.getData().pipe(
      map((d) => d.tools.filter((t) => tool.relatedTools.includes(t.slug) && t.slug !== tool.slug).slice(0, 4))
    );
  }

  searchTools(keyword: string): Observable<Tool[]> {
    const kw = keyword.toLowerCase().trim();
    if (!kw) return of([]);
    return this.getData().pipe(
      map((d) =>
        d.tools.filter(
          (t) =>
            t.name.toLowerCase().includes(kw) ||
            t.shortDescription.toLowerCase().includes(kw) ||
            t.keywords.some((k) => k.toLowerCase().includes(kw)) ||
            t.categoryName.toLowerCase().includes(kw)
        )
      )
    );
  }
}
