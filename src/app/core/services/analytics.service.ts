import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router
  ) {
    // Only run on browser, not on server
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
    // Check if gtag exists and is a function
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: url
      });
    }
  }
}