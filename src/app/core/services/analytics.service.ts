import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

type EventParams = Record<string, string | number | boolean | undefined>;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnalytics();
    }
  }

  private initAnalytics() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.pageView(event.urlAfterRedirects);
    });
  }

  private pageView(url: string) {
    this.track('page_view', { page_path: url });
  }

  track(eventName: string, params: EventParams = {}) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params);
    }
  }

  trackSearch(query: string, resultCount: number) {
    this.track('search', {
      search_term: query,
      results_count: resultCount,
    });
  }

  trackToolOpen(toolName: string, category: string) {
    this.track('select_content', {
      content_type: 'tool',
      item_id: toolName,
      item_category: category,
    });
  }
}
