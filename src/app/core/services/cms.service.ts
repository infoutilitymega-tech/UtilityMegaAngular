import { Injectable, PLATFORM_ID, inject, makeStateKey, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, shareReplay, tap } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { BlogWithTool, Category, Tool, ToolsData } from '../models/tool.model';

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


  getAllBlogs(): Observable<BlogWithTool[]> {
    return this.getData().pipe(map((d) => this.flattenBlogs(d.tools)));
  }

  getBlogsByTool(categorySlug: string, toolSlug: string): Observable<BlogWithTool[]> {
    return this.getData().pipe(
      map((d) => {
        const tool = d.tools.find((t) => t.categorySlug === categorySlug && t.slug === toolSlug);
        return tool ? this.mapToolBlogs(tool) : [];
      })
    );
  }

  getBlog(categorySlug: string, toolSlug: string, blogSlug: string): Observable<BlogWithTool | undefined> {
    return this.getBlogsByTool(categorySlug, toolSlug).pipe(
      map((blogs) => blogs.find((blog) => blog.slug === blogSlug))
    );
  }

  getRelatedBlogs(blog: BlogWithTool, limit = 3): Observable<BlogWithTool[]> {
    return this.getAllBlogs().pipe(
      map((blogs) =>
        blogs
          .filter((item) => item.slug !== blog.slug)
          .sort((a, b) => Number(b.toolSlug === blog.toolSlug) - Number(a.toolSlug === blog.toolSlug))
          .slice(0, limit)
      )
    );
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


  private flattenBlogs(tools: Tool[]): BlogWithTool[] {
    return tools.flatMap((tool) => this.mapToolBlogs(tool)).sort((a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  }

  private mapToolBlogs(tool: Tool): BlogWithTool[] {
    return (tool.blogs ?? []).map((blog) => ({
      ...blog,
      toolSlug: tool.slug,
      toolName: tool.name,
      categorySlug: tool.categorySlug,
      categoryName: tool.categoryName,
      url: `/${tool.categorySlug}/${tool.slug}/blog/${blog.slug}`,
    }));
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
